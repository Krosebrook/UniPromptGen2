import React, { useState, useCallback, SetStateAction } from 'react';
import NodeBasedEditor from '../components/workbench/NodeBasedEditor.tsx';
import WorkbenchSidebar from '../components/workbench/WorkbenchSidebar.tsx';
import WorkbenchConfigPanel from '../components/workbench/WorkbenchConfigPanel.tsx';
import { NodeType, Node, Edge, NodeData, ModelNodeData, ToolNodeData, NodeRunStatus, DefaultNodeData } from '../types.ts';
import { executeAgent } from '../services/agentExecutorService.ts';
import { PlayIcon, SpinnerIcon } from '../components/icons/Icons.tsx';

const initialNodes: Node[] = [
  { id: '1', type: 'input', position: { x: 50, y: 200 }, data: { label: 'User Query' } },
  { 
    id: '2', 
    type: 'model', 
    position: { x: 300, y: 100 }, 
    data: { 
      label: 'Reasoning Model',
      systemInstruction: 'You are an expert logician. Reason step-by-step to arrive at the correct conclusion.',
      temperature: 0.7,
      topP: 1.0,
      topK: 40
    } as ModelNodeData
  },
  { 
    id: '3', 
    type: 'tool', 
    position: { x: 550, y: 200 }, 
    data: { 
      label: 'Add Product API',
      apiEndpoint: 'https://dummyjson.com/products/add',
      authMethod: 'None',
      requestSchema: JSON.stringify({ title: 'Perfume Oil', price: 13.99 }, null, 2),
      responseSchema: JSON.stringify({ id: 101, title: 'Perfume Oil', price: 13.99 }, null, 2)
    } as ToolNodeData
  },
  { id: '4', type: 'output', position: { x: 800, y: 100 }, data: { label: 'Final Response' } },
];

const initialEdges: Edge[] = [
    { id: 'e1-2', source: '1', target: '2', animated: true, style: { strokeWidth: 2 } },
    { id: 'e2-3', source: '2', target: '3', animated: true, style: { strokeWidth: 2 } },
    { id: 'e3-4', source: '3', target: '4', animated: true, style: { strokeWidth: 2 } },
];

let id = 5;
const getId = () => `${id++}`;

const AgenticWorkbench: React.FC = () => {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [runStatus, setRunStatus] = useState<Record<string, NodeRunStatus>>({});

  const addNode = useCallback((type: NodeType) => {
    const newNodeId = getId();
    let data: NodeData;

    switch (type) {
      case 'model':
        data = { label: 'New Model Node', systemInstruction: 'You are a helpful AI assistant.', temperature: 0.7, topP: 1, topK: 40 } as ModelNodeData;
        break;
      case 'tool':
        data = { label: 'New Tool Node', apiEndpoint: '', authMethod: 'None', requestSchema: '{}', responseSchema: '{}' } as ToolNodeData;
        break;
      default:
        data = { label: `New ${type} Node`} as DefaultNodeData;
    }

    const newNode: Node = {
      id: newNodeId,
      type,
      position: {
        x: Math.random() * 400 + 200,
        y: Math.random() * 300 + 50,
      },
      data,
    };
    setNodes((nds) => nds.concat(newNode));
  }, []);
  
  const onUpdateNode = useCallback((nodeId: string, data: Partial<Node['data']>) => {
    const updateAction: SetStateAction<Node[]> = (nds) => nds.map(node => {
        if (node.id === nodeId) {
            return { ...node, data: { ...node.data, ...data } };
        }
        return node;
    });
    setNodes(updateAction);
    
    setSelectedNode(curr => {
        if (curr && curr.id === nodeId) {
            const updatedData = { ...curr.data, ...data };
            return { ...curr, data: updatedData };
        }
        return curr;
    });

  }, []);

  const handleRunAgent = async () => {
    setIsExecuting(true);
    
    const initialStatuses: Record<string, NodeRunStatus> = {};
    nodes.forEach(node => {
        initialStatuses[node.id] = 'idle';
    });
    setRunStatus(initialStatuses);
    
    try {
        const onStatusUpdate = (nodeId: string, status: NodeRunStatus) => {
            setRunStatus(prev => ({ ...prev, [nodeId]: status }));
        };

        const result = await executeAgent(nodes, edges, onStatusUpdate);
        console.log("Agent execution finished:", result);

    } catch (error) {
        console.error("Agent execution failed:", error);
    } finally {
        setIsExecuting(false);
    }
  };

  return (
    <div className="flex flex-col h-full gap-6">
       <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Agentic Workbench</h1>
        <button 
            onClick={handleRunAgent}
            disabled={isExecuting}
            className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-wait"
        >
            {isExecuting ? (
                <>
                    <SpinnerIcon className="h-5 w-5 mr-2" />
                    Running...
                </>
            ) : (
                <>
                    <PlayIcon className="h-5 w-5 mr-2" />
                    Run Agent
                </>
            )}
        </button>
      </div>
      <div className="flex flex-1 h-full gap-6 min-h-0">
        <WorkbenchSidebar addNode={addNode} />
        <div className="flex-1 min-w-0">
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
        <WorkbenchConfigPanel selectedNode={selectedNode} onUpdateNode={onUpdateNode} />
      </div>
    </div>
  );
};

export default AgenticWorkbench;