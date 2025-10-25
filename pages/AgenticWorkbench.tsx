
import React, { useState, useCallback, useRef, useEffect } from 'react';
import NodeBasedEditor from '../components/workbench/NodeBasedEditor.tsx';
import WorkbenchSidebar from '../components/workbench/WorkbenchSidebar.tsx';
import WorkbenchConfigPanel from '../components/workbench/WorkbenchConfigPanel.tsx';
import LogPanel from '../components/workbench/LogPanel.tsx';
import RunHistoryPanel from '../components/workbench/RunHistoryPanel.tsx';
import { executeAgent } from '../services/agentExecutorService.ts';
import type { Node, Edge, NodeType, NodeRunStatus, Run, LogEntry, BaseNodeData, ModelNodeData, ToolNodeData, KnowledgeNodeData } from '../types.ts';
import { PlayIcon, StopCircleIcon } from '../components/icons/Icons.tsx';

const initialNodes: Node[] = [
  { id: 'input-1', type: 'input', position: { x: 50, y: 150 }, data: { label: 'User Query', initialValue: "What's the weather in Berlin?" } },
  { id: 'model-1', type: 'model', position: { x: 300, y: 150 }, data: { label: 'Extract City', systemInstruction: 'You are an expert at extracting city names from text.', temperature: 0.5, topP: 1, topK: 50 } as ModelNodeData },
  { id: 'tool-1', type: 'tool', position: { x: 550, y: 150 }, data: { label: 'Get Weather Data', toolId: 'tool-001', apiEndpoint: 'https://api.open-meteo.com/v1/forecast', authMethod: 'None', requestSchema: '{"latitude":52.52,"longitude":13.41,"current_weather":true}', responseSchema: '{}' } as ToolNodeData },
  { id: 'output-1', type: 'output', position: { x: 800, y: 150 }, data: { label: 'Final Answer' } },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: 'input-1', target: 'model-1', animated: true, style: { strokeWidth: 2 } },
  { id: 'e2-3', source: 'model-1', target: 'tool-1', animated: true, style: { strokeWidth: 2 } },
  { id: 'e3-4', source: 'tool-1', target: 'output-1', animated: true, style: { strokeWidth: 2 } },
];


const AgenticWorkbench: React.FC = () => {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  
  const [runs, setRuns] = useState<Run[]>([]);
  const [selectedRun, setSelectedRun] = useState<Run | null>(null);
  const [runStatus, setRunStatus] = useState<Record<string, NodeRunStatus>>({});
  const [isAgentRunning, setIsAgentRunning] = useState(false);
  const runCounter = useRef(1);
  const selectedRunRef = useRef(selectedRun);

  useEffect(() => {
    selectedRunRef.current = selectedRun;
  }, [selectedRun]);


  const addNode = useCallback((type: NodeType) => {
    const newNodeId = `${type}-${Date.now()}`;
    let data: BaseNodeData;
    switch (type) {
      case 'model':
        data = { label: 'Model Node', systemInstruction: '', temperature: 0.7, topP: 1, topK: 40 } as ModelNodeData;
        break;
      case 'tool':
        data = { label: 'Tool Node', apiEndpoint: '', authMethod: 'None', requestSchema: '{}', responseSchema: '{}' } as ToolNodeData;
        break;
      case 'knowledge':
        data = { label: 'Knowledge Source', sourceId: null } as KnowledgeNodeData;
        break;
      default:
        data = { label: `${type.charAt(0).toUpperCase() + type.slice(1)} Node` };
    }
    const newNode: Node = {
      id: newNodeId,
      type,
      position: { x: Math.random() * 400, y: Math.random() * 400 },
      data,
    };
    setNodes((nds) => nds.concat(newNode));
  }, []);

  const onUpdateNode = useCallback((nodeId: string, data: Partial<Node['data']>) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId ? { ...node, data: { ...node.data, ...data } } : node
      )
    );
  }, []);

  const logToRun = useCallback((message: string, status: LogEntry['status']) => {
    const newLogEntry: LogEntry = {
        timestamp: new Date().toISOString(),
        message,
        status,
    };
    setRuns(prevRuns => prevRuns.map(run => {
        if (selectedRunRef.current && run.id === selectedRunRef.current.id) {
            return { ...run, logs: [...run.logs, newLogEntry] };
        }
        return run;
    }));
  }, []);

  const handleRunAgent = useCallback(async () => {
    setIsAgentRunning(true);
    setRunStatus({});
    const runId = `run-${runCounter.current++}`;
    const newRun: Run = {
        id: runId,
        startTime: new Date(),
        status: 'running',
        logs: [],
    };
    setRuns(prev => [newRun, ...prev]);
    setSelectedRun(newRun);

    try {
        await executeAgent(nodes, edges, setRunStatus, logToRun);
        setRuns(prev => prev.map(r => r.id === runId ? { ...r, status: 'completed', endTime: new Date() } : r));
    } catch (error) {
        console.error("Agent execution failed:", error);
        setRuns(prev => prev.map(r => r.id === runId ? { ...r, status: 'failed', endTime: new Date() } : r));
    } finally {
        setIsAgentRunning(false);
    }
  }, [nodes, edges, logToRun]);

  const handleSelectRun = useCallback((run: Run) => {
    setSelectedRun(run);
    // In a real app, you might want to restore the node statuses from the run,
    // but for this mock, we'll just show the logs.
    setRunStatus({});
  }, []);
  
  const currentLogs = selectedRun ? selectedRun.logs : [];

  return (
    <div className="h-full flex flex-col gap-4">
      <div className="flex justify-between items-center flex-shrink-0">
        <div>
            <h1 className="text-2xl font-bold">Agentic Workbench</h1>
            <p className="text-muted-foreground text-sm">Design, test, and run multi-step AI agents.</p>
        </div>
        <button
            onClick={handleRunAgent}
            disabled={isAgentRunning}
            className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-md hover:bg-primary/90 disabled:opacity-50"
        >
            {isAgentRunning ? <StopCircleIcon className="h-5 w-5 mr-2 animate-pulse" /> : <PlayIcon className="h-5 w-5 mr-2" />}
            {isAgentRunning ? 'Running...' : 'Run Agent'}
        </button>
      </div>

      <div className="flex-1 flex gap-4 min-h-0">
        <WorkbenchSidebar addNode={addNode} />
        <div className="flex-1 flex flex-col gap-4 min-w-0">
            <NodeBasedEditor
                nodes={nodes}
                setNodes={setNodes}
                edges={edges}
                setEdges={setEdges}
                setSelectedNode={setSelectedNode}
                runStatus={runStatus}
                selectedNodeId={selectedNode?.id || null}
            />
            <div className="flex gap-4 h-1/3 max-h-64">
                <LogPanel logs={currentLogs} />
                <RunHistoryPanel runs={runs} selectedRunId={selectedRun?.id || null} onSelectRun={handleSelectRun} />
            </div>
        </div>
        <WorkbenchConfigPanel selectedNode={selectedNode} onUpdateNode={onUpdateNode} />
      </div>
    </div>
  );
};

export default AgenticWorkbench;
