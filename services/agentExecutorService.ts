

// Fix: Corrected import paths to be relative.
import type { Node, Edge, NodeRunStatus, LogEntry, ToolNodeData, InputNodeData, ModelNodeData, KnowledgeNodeData } from '../types.ts';
import { generateText } from './geminiService.ts';
import { getKnowledgeSourceContent, executeTool } from './apiService.ts';
import type { Dispatch, SetStateAction } from 'react';

// Helper to find connected nodes
const getSourceNode = (targetNodeId: string, edges: Edge[], nodes: Node[], handle: 'data_input' | 'knowledge_input'): Node | undefined => {
  const edge = edges.find(e => e.target === targetNodeId && e.targetHandle === handle);
  if (!edge) return undefined;
  return nodes.find(n => n.id === edge.source);
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const executeAgent = async (
  nodes: Node[],
  edges: Edge[],
  setRunStatus: Dispatch<SetStateAction<Record<string, NodeRunStatus>>>,
  log: (message: string, status: LogEntry['status']) => void
): Promise<void> => {
  
  const updateStatus = (nodeId: string, status: NodeRunStatus) => {
    setRunStatus(prev => ({ ...prev, [nodeId]: status }));
  };
  
  log('Agent execution started.', 'info');
  await delay(200);

  const inputNode = nodes.find(n => n.type === 'input');
  if (!inputNode) {
    log('Execution failed: No input node found.', 'error');
    throw new Error('No input node found.');
  }

  // --- Topological Sort to determine execution order ---
  const inDegree = new Map<string, number>();
  const adjList = new Map<string, string[]>();

  for (const node of nodes) {
      inDegree.set(node.id, 0);
      adjList.set(node.id, []);
  }

  for (const edge of edges) {
      // We only care about data flow edges for execution order
      if (edge.sourceHandle === 'data_output') {
          const sourceNeighbors = adjList.get(edge.source) || [];
          adjList.set(edge.source, [...sourceNeighbors, edge.target]);
          inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1);
      }
  }

  const queue: string[] = [];
  for (const [nodeId, degree] of inDegree.entries()) {
      if (degree === 0) {
          queue.push(nodeId);
      }
  }

  const executionOrder: Node[] = [];
  while (queue.length > 0) {
      const nodeId = queue.shift()!;
      const node = nodes.find(n => n.id === nodeId);
      if (node) {
          executionOrder.push(node);
      }
      
      for (const neighborId of adjList.get(nodeId)!) {
          inDegree.set(neighborId, (inDegree.get(neighborId) || 1) - 1);
          if (inDegree.get(neighborId) === 0) {
              queue.push(neighborId);
          }
      }
  }

  if (executionOrder.length !== nodes.length) {
      log('Execution failed: Could not determine a valid execution order. Check for cycles or disconnected data paths.', 'error');
      throw new Error('Could not determine valid execution order.');
  }
  // --- End of Topological Sort ---

  const nodeOutputs: Record<string, any> = {};
  nodeOutputs[inputNode.id] = JSON.parse((inputNode.data as InputNodeData).initialValue || '{}');
  
  for (const currentNode of executionOrder) {
    log(`Executing node: ${currentNode.data.label} (${currentNode.id})`, 'running');
    updateStatus(currentNode.id, 'running');
    await delay(800 + Math.random() * 500);

    // Aggregate inputs from all connected source nodes for data
    const inputEdges = edges.filter(e => e.target === currentNode.id && e.targetHandle === 'data_input');
    let currentData: any = {};
    for (const edge of inputEdges) {
        if(nodeOutputs[edge.source]) {
            currentData = { ...currentData, ...nodeOutputs[edge.source] };
        }
    }
    
    try {
        switch(currentNode.type) {
            case 'input':
                log(`Input data: ${JSON.stringify(nodeOutputs[currentNode.id], null, 2)}`, 'info');
                break;
            
            case 'tool': {
                const toolData = currentNode.data as ToolNodeData;
                let toolResult: any;

                if (toolData.subType) {
                    // Handle pre-configured tool nodes
                    log(`Executing preset tool: ${toolData.subType}`, 'info');
                    log(`Settings: ${JSON.stringify(toolData.settings, null, 2)}`, 'info');
                    log(`Input data: ${JSON.stringify(currentData, null, 2)}`, 'info');
                    
                    switch (toolData.subType) {
                        case 'Wait':
                            const duration = toolData.settings.duration || 1;
                            const unit = toolData.settings.unit || 'seconds';
                            const ms = duration * (unit === 'seconds' ? 1000 : 60000);
                            log(`Waiting for ${duration} ${unit}...`, 'info');
                            await delay(ms);
                            toolResult = { success: true, waited: `${duration} ${unit}` };
                            break;
                        case 'ExecuteCode':
                            log(`(Mock) Executing JS code...`, 'info');
                            toolResult = { success: true, message: "Mock code execution successful.", output: { result: "hello from mock code" } };
                            break;
                        case 'HttpRequest':
                             log(`(Mock) Making HTTP ${toolData.settings.method} request to ${toolData.settings.url}...`, 'info');
                             toolResult = { success: true, status: 200, data: { message: `Mock response from ${toolData.settings.url}` } };
                             break;
                        default:
                            log(`Mock execution for ${toolData.subType}.`, 'info');
                            toolResult = { success: true, message: `Mock response from ${toolData.label}`, received_input: currentData };
                    }
                    nodeOutputs[currentNode.id] = toolResult;
                } else {
                    // Handle library/manual tools (existing logic)
                    if (!toolData.toolId) {
                        throw new Error("Tool Node is not configured. Link a tool from the library or choose a preset.");
                    }
                    log(`Calling tool from library: ${toolData.label}`, 'info');
                    log(`Request Data: ${JSON.stringify(currentData, null, 2)}`, 'info');
                    
                    toolResult = await executeTool(toolData.toolId, currentData);
                    
                    log(`Tool Response: ${JSON.stringify(toolResult, null, 2)}`, 'info');
                    nodeOutputs[currentNode.id] = toolResult;
                }
                break;
            }
            
            case 'model': {
                const modelData = currentNode.data as ModelNodeData;
                
                // Check for knowledge input
                const knowledgeNode = getSourceNode(currentNode.id, edges, nodes, 'knowledge_input');
                let knowledgeContent = '';
                if (knowledgeNode && knowledgeNode.type === 'knowledge' && nodeOutputs[knowledgeNode.id]) {
                    knowledgeContent = nodeOutputs[knowledgeNode.id] as string;
                }
                
                let promptTemplate = modelData.promptTemplate;

                // Substitute variables from input data
                for (const key in currentData) {
                    const value = currentData[key];
                    const replacement = (typeof value === 'object' && value !== null) 
                        ? JSON.stringify(value, null, 2) 
                        : String(value);
                    
                    const regex = new RegExp(`{{${key}}}`, 'g');
                    promptTemplate = promptTemplate.replace(regex, replacement);
                }
                
                const remainingPlaceholders = promptTemplate.match(/{{([a-zA-Z_][a-zA-Z0-9_]*)}}/g);
                if (remainingPlaceholders) {
                    log(`Warning: The following variables were not filled: ${remainingPlaceholders.join(', ')}. Ensure parent nodes provide these outputs.`, 'info');
                }

                const finalPrompt = knowledgeContent 
                    ? `CONTEXT:\n${knowledgeContent}\n\n---\n\n${promptTemplate}`
                    : promptTemplate;

                log('Generating content with model...', 'info');
                const modelConfig = {
                    model: 'gemini-2.5-flash' as const,
                    temperature: modelData.temperature,
                    topP: modelData.topP,
                    topK: modelData.topK
                };
                const result = await generateText(finalPrompt, modelConfig);

                log(`Model output: ${result.substring(0, 100)}...`, 'info');
                try {
                    // Try to parse as JSON if possible
                    nodeOutputs[currentNode.id] = JSON.parse(result);
                } catch {
                    nodeOutputs[currentNode.id] = { result };
                }
                break;
            }

            case 'knowledge':
                // FIX: Cast currentNode.data to KnowledgeNodeData to access specific properties.
                const knowledgeData = currentNode.data as KnowledgeNodeData;
                log(`Accessing knowledge source: ${knowledgeData.label}`, 'info');
                if (!knowledgeData.sourceId) throw new Error("Knowledge node is not configured.");
                
                const content = await getKnowledgeSourceContent(knowledgeData.sourceId);
                nodeOutputs[currentNode.id] = content;
                break;

            case 'output':
                log(`Final output: ${JSON.stringify(currentData, null, 2)}`, 'success');
                nodeOutputs[currentNode.id] = currentData;
                break;
        }

        updateStatus(currentNode.id, 'success');
        log(`Node ${currentNode.data.label} completed successfully.`, 'success');
        
    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred';
        log(`Error at node ${currentNode.data.label}: ${errorMessage}`, 'error');
        updateStatus(currentNode.id, 'error');
        throw e;
    }

    await delay(300);
  }

  log('Agent execution finished.', 'success');
};