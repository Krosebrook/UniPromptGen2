// services/agentExecutorService.ts
import { Node, Edge, NodeRunStatus, LogEntry, ModelNodeData, ToolNodeData } from '../types.ts';

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
      const incomingEdges = edges.filter(e => e.target === nodeId && e.targetHandle === 'data_input');
      const inputs = incomingEdges.map(e => nodeOutputs[e.source]);
      const singleInput = inputs.length > 0 ? inputs[0] : null;

      await sleep(500 + Math.random() * 500); // Simulate network latency/work
      
      let output: any;

      // Execute node logic based on type
      switch (node.type) {
        case 'input':
          output = node.data.initialValue || '';
          log(`[${node.data.label}] - Provided initial input: "${output}"`, 'info');
          break;
        case 'model':
          const modelData = node.data as ModelNodeData;
          output = `Extracted city: 'Berlin' from input '${singleInput}' with system instruction '${modelData.systemInstruction.substring(0,20)}...'`;
          break;
        case 'tool':
          const toolData = node.data as ToolNodeData;
          let requestBody = toolData.requestSchema;
          // Simple template replacement
          const matches = requestBody.match(/{{(.*?)}}/g);
          if (matches) {
            for(const match of matches) {
                const [nodeId, key] = match.replace(/{{|}}/g, '').split('.');
                const predecessorNode = nodes.find(n => n.id === nodeId);
                if (predecessorNode) {
                    const valueToInject = nodeOutputs[nodeId];
                    log(`[${toolData.label}] - Injecting output from '${predecessorNode.data.label}' into request.`, 'info');
                    requestBody = requestBody.replace(match, valueToInject.split("'")[1] || valueToInject);
                }
            }
          }
          output = { temperature: "18.3" }; // Mocked response
          log(`[${toolData.label}] - Executed with request: ${requestBody}. Got response: ${JSON.stringify(output)}`, 'info');
          break;
        case 'output':
          log(`[${node.data.label}] - Received final output: ${JSON.stringify(singleInput)}`, 'info');
          output = singleInput;
          break;
        default:
          output = singleInput;
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