import type { Node, Edge, NodeRunStatus, LogEntry, ModelNodeData, ToolNodeData } from '../types.ts';
import { generateText } from './geminiService.ts';
import type { Dispatch, SetStateAction } from 'react';

// Helper to find connected nodes
const getTargetNode = (sourceNodeId: string, edges: Edge[], nodes: Node[]): Node | undefined => {
  const edge = edges.find(e => e.source === sourceNodeId);
  if (!edge) return undefined;
  return nodes.find(n => n.id === edge.target);
};

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

  // Find the input node to start execution
  let currentNode = nodes.find(n => n.type === 'input');
  if (!currentNode) {
    log('Execution failed: No input node found.', 'error');
    throw new Error('No input node found.');
  }
  
  let currentData: any = JSON.parse(currentNode.data.initialValue || '{}');

  while(currentNode) {
    log(`Executing node: ${currentNode.data.label} (${currentNode.id})`, 'running');
    updateStatus(currentNode.id, 'running');
    await delay(800 + Math.random() * 500);

    try {
        switch(currentNode.type) {
            case 'input':
                log(`Input data: ${JSON.stringify(currentData, null, 2)}`, 'info');
                break;
            
            case 'tool':
                const toolData = currentNode.data as ToolNodeData;
                log(`Calling tool API: ${toolData.apiEndpoint}`, 'info');
                // Simulate API call based on input
                if (toolData.apiEndpoint.includes('dummyjson.com/products/add')) {
                    log(`Request Body: ${JSON.stringify(currentData, null, 2)}`, 'info');
                    currentData = { id: Math.floor(Math.random() * 100) + 1, ...currentData };
                    log(`Response: ${JSON.stringify(currentData, null, 2)}`, 'info');
                } else {
                    log('Tool execution mocked.', 'info');
                    currentData = { success: true, from: toolData.label, input: currentData };
                }
                break;
            
            case 'model':
                const modelData = currentNode.data as ModelNodeData;
                const prompt = `System: ${modelData.systemInstruction}\n\nData: ${JSON.stringify(currentData, null, 2)}\n\n---\nPlease process the data.`;
                log('Generating content with model...', 'info');
                const result = await generateText(prompt, { model: 'gemini-2.5-flash', ...modelData });
                log(`Model output: ${result.substring(0, 100)}...`, 'info');
                currentData = { result };
                break;

            case 'knowledge':
                log(`Accessing knowledge source: ${currentNode.data.label}`, 'info');
                // In a real scenario, this would fetch data and inject it into context.
                // For the mock, we just pass through.
                break;

            case 'output':
                log(`Final output: ${JSON.stringify(currentData, null, 2)}`, 'success');
                break;
        }

        updateStatus(currentNode.id, 'success');
        log(`Node ${currentNode.data.label} completed successfully.`, 'success');
        
        // Move to the next node
        currentNode = getTargetNode(currentNode.id, edges, nodes);

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
