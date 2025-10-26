// services/agentExecutorService.ts
import { Node, Edge, NodeRunStatus, LogEntry, ModelNodeData, ToolNodeData, KnowledgeNodeData } from '../types.ts';
import { generateText } from './geminiService.ts';
import { getKnowledgeSourceContent } from './apiService.ts';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const executeAgent = async (
  nodes: Node[],
  edges: Edge[],
  setStatus: (updater: (prev: Record<string, NodeRunStatus>) => Record<string, NodeRunStatus>) => void,
  log: (message: string, status: LogEntry['status']) => void
): Promise<void> => {
  setStatus(() => ({}));
  log("Starting agent execution...", 'info');
  
  const executionOrder = topologicalSort(nodes, edges);
  const nodeOutputs: Record<string, any> = {};

  if (!executionOrder) {
    log("Error: Cycle detected in the graph. Cannot execute.", 'error');
    throw new Error("Cycle detected in graph.");
  }

  log(`Execution order determined: ${executionOrder.map(id => nodes.find(n => n.id === id)?.data.label || id).join(' -> ')}`, 'info');

  for (const nodeId of executionOrder) {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) continue;

    setStatus(prev => ({ ...prev, [nodeId]: 'running' }));
    log(`[${node.data.label}] - Executing...`, 'running');

    try {
      // Gather inputs from predecessors
      const dataIncomingEdges = edges.filter(e => e.target === nodeId && e.targetHandle === 'data_input');
      const knowledgeIncomingEdges = edges.filter(e => e.target === nodeId && e.targetHandle === 'knowledge_input');
      
      const dataInputs = dataIncomingEdges.map(e => nodeOutputs[e.source]);
      const singleDataInput = dataInputs.length > 0 ? dataInputs[0] : null;
      
      let output: any;

      // Execute node logic based on type
      switch (node.type) {
        case 'input':
          output = node.data.initialValue || '';
          log(`[${node.data.label}] - Provided initial input: "${String(output).substring(0, 100)}..."`, 'info');
          break;
          
        case 'model':
          const modelData = node.data as ModelNodeData;
          let prompt = singleDataInput;
          if (knowledgeIncomingEdges.length > 0) {
              const knowledgeSourceId = knowledgeIncomingEdges[0].source;
              const knowledgeContent = nodeOutputs[knowledgeSourceId];
              prompt = `CONTEXT:\n${knowledgeContent}\n\n---\n\nTASK:\n${singleDataInput}`;
              log(`[${node.data.label}] - Using knowledge from node ID ${knowledgeSourceId}.`, 'info');
          }
          
          log(`[${node.data.label}] - Sending prompt to Gemini API...`, 'info');
          output = await generateText(prompt, {
              systemInstruction: modelData.systemInstruction,
              temperature: modelData.temperature,
              topP: modelData.topP,
              topK: modelData.topK,
          });
          log(`[${node.data.label}] - Received response: "${output.substring(0, 100)}..."`, 'info');
          break;
          
        case 'tool':
          const toolData = node.data as ToolNodeData;
          log(`[${toolData.label}] - Preparing to call API endpoint: ${toolData.apiEndpoint}`, 'info');
          
          // Simple assumption: If input is a string, we use it as the body.
          // In a real scenario, this would involve more complex schema mapping.
          const body = typeof singleDataInput === 'string' ? singleDataInput : JSON.stringify(singleDataInput);

          const response = await fetch(toolData.apiEndpoint, {
            method: 'POST', // Assuming POST for this tool example
            headers: { 'Content-Type': 'application/json' },
            body: body,
          });

          if (!response.ok) {
            throw new Error(`API call failed with status ${response.status}: ${await response.text()}`);
          }
          
          output = await response.json();
          log(`[${toolData.label}] - API call successful. Response: ${JSON.stringify(output).substring(0, 100)}...`, 'info');
          break;
          
        case 'knowledge':
          const knowledgeData = node.data as KnowledgeNodeData;
          if (!knowledgeData.sourceId) throw new Error("Knowledge source not selected.");
          log(`[${knowledgeData.label}] - Fetching content for source ID ${knowledgeData.sourceId}`, 'info');
          output = await getKnowledgeSourceContent(knowledgeData.sourceId);
          break;

        case 'output':
          log(`[${node.data.label}] - Received final output: ${JSON.stringify(singleDataInput)}`, 'info');
          output = singleDataInput;
          break;
          
        default:
          output = singleDataInput;
      }
      
      nodeOutputs[nodeId] = output;
      setStatus(prev => ({ ...prev, [nodeId]: 'success' }));
      log(`[${node.data.label}] - Execution successful.`, 'success');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      setStatus(prev => ({ ...prev, [nodeId]: 'error' }));
      log(`[${node.data.label}] - Execution failed: ${errorMessage}`, 'error');
      log("Execution halted due to error.", 'error');
      throw error; // Propagate error to stop execution
    }
  }
  log("Agent execution finished successfully.", 'success');
};

// Simple topological sort to determine execution order
const topologicalSort = (nodes: Node[], edges: Edge[]): string[] | null => {
    const sorted: string[] = [];
    const inDegree: Record<string, number> = {};
    const adjList: Record<string, string[]> = {};

    for (const node of nodes) {
        inDegree[node.id] = 0;
        adjList[node.id] = [];
    }

    for (const edge of edges) {
        // Only consider data flow edges for topological sort
        if (edge.targetHandle !== 'knowledge_input') {
            adjList[edge.source] = adjList[edge.source] || [];
            adjList[edge.source].push(edge.target);
            inDegree[edge.target] = (inDegree[edge.target] || 0) + 1;
        }
    }

    const queue = nodes.filter(node => inDegree[node.id] === 0).map(node => node.id);

    while (queue.length > 0) {
        const u = queue.shift()!;
        sorted.push(u);

        for (const v of adjList[u] || []) {
            inDegree[v]--;
            if (inDegree[v] === 0) {
                queue.push(v);
            }
        }
    }
    
    // Check if there are nodes not included in the sort (part of a cycle or disconnected)
    const sortedSet = new Set(sorted);
    const allNodeIds = new Set(nodes.map(n => n.id));
    if (sortedSet.size !== allNodeIds.size) {
        // This is a simple check. For a more robust solution, you'd find the actual cycle.
        // For now, if sizes don't match, we assume a cycle or disconnected data path.
        const nonSortedNodes = [...allNodeIds].filter(id => !sortedSet.has(id));
        
        // Let's refine this: only nodes with in-degrees > 0 at the end are in cycles.
        const nodesInCycle = Object.keys(inDegree).filter(id => inDegree[id] > 0);
        if (nodesInCycle.length > 0) {
           return null; // Cycle detected
        }
    }

    return sorted;
};