import React, { useCallback, useMemo } from 'react';
import ReactFlow, {
  Controls,
  Background,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  Node,
  Edge,
  NodeTypes,
} from 'reactflow';
import 'reactflow/dist/style.css';
// FIX: Added file extension to fix module resolution error.
import CustomNode from './nodes/CustomNode.tsx';
// FIX: Added file extension to fix module resolution error.
import { CpuChipIcon, WrenchScrewdriverIcon, ArrowRightStartOnRectangleIcon, ArrowLeftEndOnRectangleIcon } from '../icons/Icons.tsx';

interface NodeBasedEditorProps {
  nodes: Node[];
  setNodes: (nodes: Node[] | ((nodes: Node[]) => Node[])) => void;
  edges: Edge[];
  setEdges: (edges: Edge[] | ((edges: Edge[]) => Edge[])) => void;
  setSelectedNode: (node: Node | null) => void;
}

const NodeBasedEditor: React.FC<NodeBasedEditorProps> = ({ nodes, setNodes, edges, setEdges, setSelectedNode }) => {
  const onNodesChange: OnNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [setNodes]
  );
  
  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [setEdges]
  );

  const onConnect: OnConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );
  
  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, [setSelectedNode]);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, [setSelectedNode]);

  const nodeTypes: NodeTypes = useMemo(() => ({
    input: (props) => <CustomNode {...props} icon={ArrowRightStartOnRectangleIcon} />,
    output: (props) => <CustomNode {...props} icon={ArrowLeftEndOnRectangleIcon} />,
    model: (props) => <CustomNode {...props} icon={CpuChipIcon} />,
    tool: (props) => <CustomNode {...props} icon={WrenchScrewdriverIcon} />,
  }), []);


  return (
    <div className="w-full h-full bg-card shadow-card rounded-lg">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        fitView
      >
        <Controls />
        <Background />
      </ReactFlow>
    </div>
  );
};

export default NodeBasedEditor;
