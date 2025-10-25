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
  NodeTypes,
  Connection,
  OnDelete,
} from 'reactflow';
import CustomNode from './nodes/CustomNode.tsx';
import { CpuChipIcon, WrenchScrewdriverIcon, ArrowRightStartOnRectangleIcon, ArrowLeftEndOnRectangleIcon, CollectionIcon } from '../icons/Icons.tsx';
import { NodeRunStatus, Node, Edge } from '../../types.ts';

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
    (params) => {
        const newEdge = { ...params, style: { strokeWidth: 2 } };
        if (params.targetHandle === 'knowledge_input') {
            newEdge.style = { ...newEdge.style, stroke: '#9333ea' };
        } else {
             newEdge.animated = true;
        }
        setEdges((eds) => addEdge(newEdge, eds))
    },
    [setEdges]
  );

  const onDelete: OnDelete = useCallback(({ nodes: nodesToDelete, edges: edgesToDelete }) => {
    const nodesToDeleteCount = nodesToDelete.length;
    const edgesToDeleteCount = edgesToDelete.length;

    if (nodesToDeleteCount === 0 && edgesToDeleteCount === 0) {
      return;
    }

    let message = 'Are you sure you want to delete ';
    const parts = [];
    if (nodesToDeleteCount > 0) {
        parts.push(`${nodesToDeleteCount} node${nodesToDeleteCount > 1 ? 's' : ''}`);
    }
    if (edgesToDeleteCount > 0) {
        parts.push(`${edgesToDeleteCount} edge${edgesToDeleteCount > 1 ? 's' : ''}`);
    }
    message += parts.join(' and ') + '?';

    if (window.confirm(message)) {
      const nodeIdsToDelete = new Set(nodesToDelete.map(n => n.id));
      const edgeIdsToDelete = new Set(edgesToDelete.map(e => e.id));

      setNodes((nds) => nds.filter(n => !nodeIdsToDelete.has(n.id)));
      setEdges((eds) => eds.filter(e => !edgeIdsToDelete.has(e.id)));
      setSelectedNode(null); // Deselect after deletion
    }
  }, [setNodes, setEdges, setSelectedNode]);
  
  const isValidConnection = useCallback(
    (connection: Connection) => {
      // Prevent connecting a node to itself
      if (connection.source === connection.target) return false;
      
      const sourceNode = nodes.find((node) => node.id === connection.source);
      const targetNode = nodes.find((node) => node.id === connection.target);

      if (!sourceNode || !targetNode) return false;

      // Rule 1: Knowledge nodes can only connect to the 'knowledge_input' handle of a model node.
      if (sourceNode.type === 'knowledge') {
          return targetNode.type === 'model' && connection.targetHandle === 'knowledge_input';
      }

      // Rule 2: 'knowledge_input' handle only accepts connections from knowledge nodes.
      if (connection.targetHandle === 'knowledge_input') {
          return sourceNode.type === 'knowledge';
      }
      
      // Rule 3: Enforce a single incoming connection per handle.
      const isTargetHandleAlreadyConnected = edges.some(
        (edge) => edge.target === connection.target && edge.targetHandle === connection.targetHandle
      );
      if (isTargetHandleAlreadyConnected) {
        return false;
      }

      return true;
    },
    [nodes, edges]
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
    knowledge: (props) => <CustomNode {...props} icon={CollectionIcon} runStatus={runStatus[props.id]} isSelected={props.id === selectedNodeId} />,
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
        isValidConnection={isValidConnection}
        deleteKeyCode={['Backspace', 'Delete']}
        onDelete={onDelete}
        fitView
      >
        <Controls />
        <Background />
      </ReactFlow>
    </div>
  );
};

export default NodeBasedEditor;