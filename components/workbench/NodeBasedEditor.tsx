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
  Edge,
  NodeTypes,
} from 'reactflow';
import 'reactflow/dist/style.css';
import CustomNode from './nodes/CustomNode.tsx';
import { CpuChipIcon, WrenchScrewdriverIcon, ArrowRightStartOnRectangleIcon, ArrowLeftEndOnRectangleIcon } from '../icons/Icons.tsx';
import { NodeRunStatus, Node } from '../../types.ts';

interface NodeBasedEditorProps {
  nodes: Node[];
  setNodes: (nodes: Node[] | ((nodes: Node[]) => Node[])) => void;
  edges: Edge[];
  setEdges: (edges: Edge[] | ((edges: Edge[]) => Edge[])) => void;
  setSelectedNode: (node: Node | null) => void;
  runStatus: Record<string, NodeRunStatus>;
  selectedNodeId: string | null;
}

const NodeBasedEditor: React.FC<NodeBasedEditorProps> = ({ nodes, setNodes, edges, setEdges, setSelectedNode, runStatus, selectedNodeId }) => {
  const onNodesChange: OnNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [setNodes]
  );
  
  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [setEdges]
  );

  const onConnect: OnConnect = useCallback(
    (params) => setEdges((eds) => addEdge({ ...params, animated: true, style: { strokeWidth: 2 } }, eds)),
    [setEdges]
  );
  
  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, [setSelectedNode]);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, [setSelectedNode]);

  const nodeTypes: NodeTypes = useMemo(() => ({
    input: (props) => <CustomNode {...props} icon={ArrowRightStartOnRectangleIcon} runStatus={runStatus[props.id]} isSelected={props.id === selectedNodeId} />,
    output: (props) => <CustomNode {...props} icon={ArrowLeftEndOnRectangleIcon} runStatus={runStatus[props.id]} isSelected={props.id === selectedNodeId} />,
    model: (props) => <CustomNode {...props} icon={CpuChipIcon} runStatus={runStatus[props.id]} isSelected={props.id === selectedNodeId} />,
    tool: (props) => <CustomNode {...props} icon={WrenchScrewdriverIcon} runStatus={runStatus[props.id]} isSelected={props.id === selectedNodeId} />,
  }), [runStatus, selectedNodeId]);


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