


import React, { useRef, useEffect } from 'react';
import { LogEntry } from '../../types.ts';
import { BellIcon, CheckCircleIcon, XCircleIcon, SpinnerIcon } from '../icons/Icons.tsx';

interface LogPanelProps {
  logs: LogEntry[];
}

const getLogIcon = (status: LogEntry['status']) => {
    switch(status) {
        case 'info': return <BellIcon className="h-4 w-4 text-info" />;
        case 'success': return <CheckCircleIcon className="h-4 w-4 text-success" />;
        case 'error': return <XCircleIcon className="h-4 w-4 text-destructive" />;
        case 'running': return <SpinnerIcon className="h-4 w-4 text-primary" />;
    }
}

const getLogColor = (status: LogEntry['status']) => {
     switch(status) {
        case 'info': return 'text-muted-foreground';
        case 'success': return 'text-success';
        case 'error': return 'text-destructive';
        case 'running': return 'text-primary';
    }
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
            <div ref={logContainerRef} className="flex-1 overflow-y-auto font-mono text-xs pr-2 space-y-1">
                {logs.length === 0 ? (
                    <p className="text-muted-foreground text-center pt-8">Logs will appear here when an agent is run.</p>
                ) : (
                    logs.map((log, index) => (
                        <div key={index} className={`flex items-start gap-2 ${getLogColor(log.status)}`}>
                            <div className="flex-shrink-0 pt-0.5">{getLogIcon(log.status)}</div>
                            <span className="flex-shrink-0">{new Date(log.timestamp).toLocaleTimeString()}</span>
                            <span className="whitespace-pre-wrap break-words">{log.message}</span>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default LogPanel;