// services/agentExecutorService.ts
import { Node, Edge, NodeRunStatus } from '../types.ts';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const executeAgent = async (
  nodes: Node[],
  edges: Edge[],
  setStatus: (updater: (prev: Record<string, NodeRunStatus>) => Record<string, NodeRunStatus>) => void,
  addLog: (log: string) => void
): Promise<void> => {
  // Reset all statuses to idle
  setStatus(() => ({}));
  
  const executionOrder = topologicalSort(nodes, edges);

  if (!executionOrder) {
    addLog("Error: Cycle detected in the graph. Cannot execute.");
    return;
  }

  addLog(`Execution order: ${executionOrder.join(' -> ')}`);

  for (const nodeId of executionOrder) {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) continue;
    
    addLog(`[${node.data.label}] - Running...`);
    setStatus(prev => ({ ...prev, [nodeId]: 'running' }));
    await sleep(1000 + Math.random() * 1000); // Simulate work

    // Simulate success/error
    const success = Math.random() > 0.15; 
    if (success) {
      addLog(`[${node.data.label}] - Success.`);
      setStatus(prev => ({ ...prev, [nodeId]: 'success' }));
    } else {
      addLog(`[${node.data.label}] - Error!`);
      setStatus(prev => ({ ...prev, [nodeId]: 'error' }));
      addLog("Execution halted due to error.");
      return; // Stop execution on error
    }
  }
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
        adjList[edge.source] = adjList[edge.source] || [];
        adjList[edge.source].push(edge.target);
        inDegree[edge.target] = (inDegree[edge.target] || 0) + 1;
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

    if (sorted.length !== nodes.length) {
        return null; // Cycle detected
    }

    return sorted;
};
