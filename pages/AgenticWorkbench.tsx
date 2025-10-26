import React, { useState, useCallback, useEffect } from 'react';
import ReactFlow, { ReactFlowProvider } from 'reactflow';
import 'reactflow/dist/style.css';
import { Node, Edge, NodeType, NodeRunStatus, LogEntry, Run, ModelNodeData, ToolNodeData, InputNodeData, KnowledgeNodeData, AgentGraph } from '../types.ts';
import { executeAgent } from '../services/agentExecutorService.ts';
import { getAgentGraphs, saveAgentGraph } from '../services/apiService.ts';
import { useWorkspace } from '../contexts/WorkspaceContext.tsx';

import WorkbenchSidebar from '../components/workbench/WorkbenchSidebar.tsx';
import NodeBasedEditor from '../components/workbench/NodeBasedEditor.tsx';
import WorkbenchConfigPanel from '../components/workbench/WorkbenchConfigPanel.tsx';
import WorkbenchHeader from '../components/workbench/WorkbenchHeader.tsx';
import LogPanel from '../components/workbench/LogPanel.tsx';
import RunHistoryPanel from '../components/workbench/RunHistoryPanel.tsx';
import SaveAgentModal from '../components/workbench/SaveAgentModal.tsx';

const initialNodes: Node[] = [
  { id: '1', type: 'input', position: { x: 50, y: 200 }, data: { label: 'Start', initialValue: '{\n  "topic": "the future of AI"\n}' } as InputNodeData },
  { id: '2', type: 'output', position: { x: 800, y: 200 }, data: { label: 'End' } },
];

const AgenticWorkbench: React.FC = () => {
    const [nodes, setNodes] = useState<Node[]>(initialNodes);
    const [edges, setEdges] = useState<Edge[]>([]);
    const [selectedNode, setSelectedNode] = useState<Node | null>(null);
    const [agentName, setAgentName] = useState('New Untitled Agent');
    const [currentAgent, setCurrentAgent] = useState<AgentGraph | null>(null);
    const [savedAgents, setSavedAgents] = useState<AgentGraph[]>([]);

    const [runs, setRuns] = useState<Run[]>([]);
    const [selectedRun, setSelectedRun] = useState<Run | null>(null);
    const [runStatus, setRunStatus] = useState<Record<string, NodeRunStatus>>({});
    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
    
    const { currentWorkspace } = useWorkspace();

    const fetchSavedAgents = useCallback(async () => {
        if (currentWorkspace) {
            const agents = await getAgentGraphs(currentWorkspace.id);
            setSavedAgents(agents);
        }
    }, [currentWorkspace]);

    useEffect(() => {
        fetchSavedAgents();
    }, [fetchSavedAgents]);

    const handleNewAgent = () => {
        setCurrentAgent(null);
        setNodes(initialNodes);
        setEdges([]);
        setAgentName('New Untitled Agent');
        setSelectedNode(null);
    };

    const handleLoadAgent = (agentId: string) => {
        const agentToLoad = savedAgents.find(a => a.id === agentId);
        if (agentToLoad) {
            setCurrentAgent(agentToLoad);
            setNodes(agentToLoad.nodes);
            setEdges(agentToLoad.edges);
            setAgentName(agentToLoad.name);
        }
    };

    const onUpdateNode = useCallback((nodeId: string, data: Partial<Node['data']>) => {
        setNodes((nds) =>
            nds.map((node) =>
                node.id === nodeId ? { ...node, data: { ...node.data, ...data } } : node
            )
        );
        if (selectedNode && selectedNode.id === nodeId) {
            setSelectedNode(prev => prev ? { ...prev, data: { ...prev.data, ...data } } : null);
        }
    }, [selectedNode]);
    
    const addNode = (preset: { type: NodeType; data: Node['data'] }) => {
        const newNodeId = `node_${Date.now()}`;
        const newNode: Node = {
            id: newNodeId,
            type: preset.type,
            position: { x: Math.random() * 400, y: Math.random() * 400 },
            data: preset.data,
        };
        setNodes((nds) => nds.concat(newNode));
    };

    const handleRun = async () => {
        if (nodes.length <= 2) return; // Don't run an empty graph
        const runId = `run-${runs.length + 1}`;
        const newRun: Run = {
            id: runId,
            startTime: new Date(),
            status: 'running',
            logs: [],
            nodeOutputs: {},
            finalOutput: null
        };
        setRuns(prev => [newRun, ...prev]);
        setSelectedRun(newRun);
        setRunStatus({});

        try {
            await executeAgent(nodes, edges, setRunStatus, (message, status) => {
                setRuns(prev => prev.map(r => r.id === runId ? { ...r, logs: [...r.logs, { timestamp: new Date().toISOString(), message, status }] } : r));
            });
            setRuns(prev => prev.map(r => r.id === runId ? { ...r, status: 'completed' } : r));
        } catch (error) {
            console.error('Agent execution failed', error);
            setRuns(prev => prev.map(r => r.id === runId ? { ...r, status: 'failed' } : r));
        }
    };
    
    const handleSave = async () => {
        if (!currentAgent?.id) {
            setIsSaveModalOpen(true);
        } else {
            // Update existing agent
            if (!currentWorkspace) return;
            const updatedAgent = await saveAgentGraph({ ...currentAgent, name: agentName, nodes, edges }, currentWorkspace.id);
            setCurrentAgent(updatedAgent);
            await fetchSavedAgents(); // Refresh list
        }
    };
    
    const handleSaveNewAgent = async (name: string, description: string) => {
        if (!currentWorkspace) return;
        const newAgentData = { name, description, nodes, edges };
        const savedAgent = await saveAgentGraph(newAgentData, currentWorkspace.id);
        setCurrentAgent(savedAgent);
        setAgentName(savedAgent.name);
        setIsSaveModalOpen(false);
        await fetchSavedAgents();
    };

    const logsForSelectedRun = selectedRun ? selectedRun.logs : [];
    const isRunning = selectedRun?.status === 'running';

    return (
        <ReactFlowProvider>
            <div className="flex flex-col h-full gap-4">
                <WorkbenchHeader
                    agentName={agentName}
                    onAgentNameChange={setAgentName}
                    savedAgents={savedAgents}
                    onRun={handleRun}
                    onSave={handleSave}
                    onNew={handleNewAgent}
                    onLoad={handleLoadAgent}
                    isRunning={isRunning}
                />
                <div className="flex-1 flex gap-4 min-h-0">
                    <WorkbenchSidebar addNode={addNode} />
                    <div className="flex-1 flex flex-col gap-4">
                        <NodeBasedEditor
                            nodes={nodes} setNodes={setNodes}
                            edges={edges} setEdges={setEdges}
                            setSelectedNode={setSelectedNode}
                            runStatus={runStatus}
                            selectedNodeId={selectedNode?.id || null}
                        />
                        <LogPanel logs={logsForSelectedRun} />
                    </div>
                    <div className="flex flex-col gap-4">
                        <WorkbenchConfigPanel selectedNode={selectedNode} onUpdateNode={onUpdateNode} />
                        <RunHistoryPanel runs={runs} selectedRunId={selectedRun?.id || null} onSelectRun={setSelectedRun} />
                    </div>
                </div>
            </div>
            {isSaveModalOpen && (
                <SaveAgentModal 
                    onClose={() => setIsSaveModalOpen(false)}
                    onSave={handleSaveNewAgent}
                    initialName={agentName}
                />
            )}
        </ReactFlowProvider>
    );
};

export default AgenticWorkbench;