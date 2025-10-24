// services/agentExecutorService.ts
import { Node, Edge, NodeRunStatus, ToolNodeData } from '../types.ts';

type StatusUpdateCallback = (nodeId: string, status: NodeRunStatus) => void;

/**
 * Executes the logic for a single tool node by making an API call.
 */
async function executeToolNode(node: Node): Promise<any> {
    const data = node.data as ToolNodeData;
    if (!data.apiEndpoint) {
        throw new Error("API Endpoint is not configured for this tool node.");
    }

    const headers: HeadersInit = {
        'Content-Type': 'application/json',
    };

    if (data.authMethod === 'API Key') {
        // In a real app, the key would come from a secure store.
        headers['Authorization'] = `Bearer MOCK_API_KEY_12345`;
    }

    let body;
    try {
        body = JSON.parse(data.requestSchema || '{}');
    } catch (e) {
        throw new Error("Invalid Request Schema JSON.");
    }
    
    // For this demo, we assume a POST request.
    const response = await fetch(data.apiEndpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API call failed with status ${response.status}: ${errorText}`);
    }

    return await response.json();
}


/**
 * Simulates the execution of an agent graph.
 * Traverses the graph, executing the logic for each node.
 * Provides real-time status updates via a callback.
 */
export const executeAgent = async (
    nodes: Node[],
    edges: Edge[],
    onStatusUpdate: StatusUpdateCallback
): Promise<any> => {
  console.log("Executing agent graph...");
  
  // For now, we execute in the order of the nodes array. A real implementation would
  // use the edges to determine the correct topological sort.
  const executionOrder = nodes; 

  for (const node of executionOrder) {
    onStatusUpdate(node.id, 'running');
    
    try {
        let result;
        if (node.type === 'tool') {
            result = await executeToolNode(node);
            console.log(`Tool node ${node.id} executed successfully`, result);
        } else {
            // Simulate async work for other node types
            const randomDelay = Math.random() * 500 + 200;
            await new Promise(resolve => setTimeout(resolve, randomDelay));
            
            // Simulate potential failure for non-tool nodes for demonstration
            if (Math.random() < 0.1 && node.type !== 'input') {
                throw new Error(`Simulated failure for ${node.type} node.`);
            }
        }
        onStatusUpdate(node.id, 'success');
    } catch (error) {
        onStatusUpdate(node.id, 'error');
        console.error(`Execution failed at node ${node.id}:`, error);
        // Stop execution on failure
        throw new Error(`Node ${node.data.label} (${node.id}) failed.`);
    }
  }

  return {
    success: true,
    result: "Agent execution completed successfully.",
  };
};