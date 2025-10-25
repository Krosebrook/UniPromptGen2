import React, { useRef, useEffect } from 'react';

interface LogPanelProps {
    logs: string[];
}

const LogPanel: React.FC<LogPanelProps> = ({ logs }) => {
    const logContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (logContainerRef.current) {
            logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
        }
    }, [logs]);
    
    return (
        <div className="flex-1 bg-card shadow-card rounded-lg p-3 flex flex-col">
            <h3 className="text-sm font-semibold mb-2 flex-shrink-0">Execution Logs</h3>
            <div ref={logContainerRef} className="flex-1 bg-input/50 rounded p-2 overflow-y-auto text-xs font-mono">
                {logs.map((log, index) => (
                    <div key={index} className="whitespace-pre-wrap">{log}</div>
                ))}
            </div>
        </div>
    );
};

export default LogPanel;
