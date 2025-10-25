import React, { useState, useCallback } from 'react';
import { produce } from 'immer';
import NodeBasedEditor from '../components/workbench/NodeBasedEditor.tsx';
import WorkbenchSidebar from '../components/workbench/WorkbenchSidebar.tsx';
import WorkbenchConfigPanel from '../components/workbench/WorkbenchConfigPanel.tsx';
import LogPanel from '../components/workbench/LogPanel.tsx';
import RunHistoryPanel from '../components/workbench/RunHistoryPanel.tsx';
import { executeAgent } from '../services/agentExecutorService.ts';
import { PlayIcon, BeakerIcon } from '../components/icons/Icons.tsx';
import type { Node, Edge, NodeType, NodeRunStatus, ModelNodeData, ToolNodeData, KnowledgeNodeData } from '../types.ts';


const initialNodes: Node[] = [
  { id: '1', type: 'input', position: { x: 50, y: 200 }, data: { label: 'User Query' } },
  { id: '2', type: 'output', position: { x: 750, y: 200 }, data: { label: 'Final Answer' } },
];

const AgenticWorkbench: React.FC = () => {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [runStatus, setRunStatus] = useState<Record<string, NodeRunStatus>>({});
  const [logs, setLogs] = useState<string[]>([]);

  const addNode = useCallback((type: NodeType) => {
    const newNodeId = `${nodes.length + 1}`;
    let newNode: Node;

    const baseNode = {
      id: newNodeId,
      type,
      position: { x: Math.random() * 400 + 200, y: Math.random() * 200 + 100 },
    };

    switch (type) {
        case 'model':
            newNode = { ...baseNode, data: { label: 'Model Node', systemInstruction: '', temperature: 0.7, topP: 1.0, topK: 40 } as ModelNodeData };
            break;
        case 'tool':
            newNode = { ...baseNode, data: { label: 'Tool Node', apiEndpoint: '', authMethod: 'None', requestSchema: '{}', responseSchema: '{}' } as ToolNodeData };
            break;
        case 'knowledge':
            newNode = { ...baseNode, data: { label: 'Knowledge Source', sourceId: null } as KnowledgeNodeData };
            break;
        default:
             newNode = { ...baseNode, data: { label: `${type.charAt(0).toUpperCase() + type.slice(1)} Node` } };
    }
    setNodes((nds) => nds.concat(newNode));
  }, [nodes]);
  
  const onUpdateNode = useCallback((nodeId: string, data: Partial<Node['data']>) => {
    setNodes(produce(draft => {
        const nodeToUpdate = draft.find(n => n.id === nodeId);
        if (nodeToUpdate) {
            nodeToUpdate.data = { ...nodeToUpdate.data, ...data };
        }
    }));
  }, []);

  const handleRun = async () => {
    setLogs(['Starting agent execution...']);
    await executeAgent(nodes, edges, setRunStatus, (log) => setLogs(prev => [...prev, log]));
    setLogs(prev => [...prev, 'Agent execution finished.']);
  };

  return (
    <div className="h-full flex flex-col gap-4 -m-6">
      <header className="flex-shrink-0 flex justify-between items-center bg-card px-4 py-2 border-b border-border">
          <div className="flex items-center gap-2">
            <BeakerIcon className="h-6 w-6" />
            <h1 className="text-xl font-bold">Agentic Workbench</h1>
          </div>
          <button 
            onClick={handleRun}
            className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-md hover:bg-primary/90"
            >
             <PlayIcon className="h-5 w-5 mr-2" />
            Run Agent
          </button>
      </header>
      <div className="flex-1 flex gap-4 px-4 pb-4 min-h-0">
        <WorkbenchSidebar addNode={addNode} />
        <div className="flex-1 flex flex-col gap-4 min-w-0">
            <div className="flex-1 min-h-0">
              <NodeBasedEditor 
                nodes={nodes}
                setNodes={setNodes}
                edges={edges}
                setEdges={setEdges}
                setSelectedNode={setSelectedNode}
                runStatus={runStatus}
                selectedNodeId={selectedNode?.id || null}
              />
            </div>
            <div className="flex-shrink-0 h-48 flex gap-4">
              <LogPanel logs={logs} />
              <RunHistoryPanel />
            </div>
        </div>
        <WorkbenchConfigPanel selectedNode={selectedNode} onUpdateNode={onUpdateNode} />
      </div>
    </div>
  );
};

export default AgenticWorkbench;