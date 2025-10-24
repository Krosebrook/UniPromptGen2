import React, { useState, useCallback } from 'react';
import { Node as ReactFlowNode, Edge } from 'reactflow';
// FIX: Added file extension to fix module resolution error.
import NodeBasedEditor from '../components/workbench/NodeBasedEditor.tsx';
// FIX: Added file extension to fix module resolution error.
import WorkbenchSidebar from '../components/workbench/WorkbenchSidebar.tsx';
// FIX: Added file extension to fix module resolution error.
import WorkbenchConfigPanel from '../components/workbench/WorkbenchConfigPanel.tsx';
// FIX: Added file extension to fix module resolution error.
import { NodeType, Node as AppNode, ModelNodeData, ToolNodeData } from '../types.ts';

const initialNodes: ReactFlowNode[] = [
  { id: '1', type: 'input', position: { x: 50, y: 200 }, data: { label: 'User Query' } },
  { id: '2', type: 'output', position: { x: 650, y: 200 }, data: { label: 'Final Response' } },
];

const initialEdges: Edge[] = [];
let id = 3;
const getId = () => `${id++}`;

const AgenticWorkbench: React.FC = () => {
  const [nodes, setNodes] = useState<ReactFlowNode[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);
  const [selectedNode, setSelectedNode] = useState<ReactFlowNode | null>(null);

  const addNode = useCallback((type: NodeType) => {
    const newNodeId = getId();
    let data: AppNode['data'];

    switch (type) {
      case 'model':
        data = { label: 'New Model Node', temperature: 0.7, topP: 1, topK: 40 } as ModelNodeData;
        break;
      case 'tool':
        data = { label: 'New Tool Node', apiEndpoint: '', authMethod: 'None', requestSchema: '{}', responseSchema: '{}' } as ToolNodeData;
        break;
      default:
        data = { label: `New ${type} Node`};
    }

    const newNode: ReactFlowNode = {
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
  
  const onUpdateNode = useCallback((nodeId: string, data: Partial<AppNode['data']>) => {
    setNodes(nds => nds.map(node => {
        if (node.id === nodeId) {
            return { ...node, data: { ...node.data, ...data } };
        }
        return node;
    }));
    // also update selected node if it's the one being changed
    setSelectedNode(curr => curr && curr.id === nodeId ? { ...curr, data: { ...curr.data, ...data } } as ReactFlowNode : curr);
  }, []);

  return (
    <div className="flex h-full gap-6">
      <WorkbenchSidebar addNode={addNode} />
      <div className="flex-1 min-w-0">
          <NodeBasedEditor 
            nodes={nodes} 
            setNodes={setNodes} 
            edges={edges} 
            setEdges={setEdges}
            setSelectedNode={setSelectedNode} 
          />
      </div>
      <WorkbenchConfigPanel selectedNode={selectedNode as AppNode | null} onUpdateNode={onUpdateNode} />
    </div>
  );
};

export default AgenticWorkbench;
