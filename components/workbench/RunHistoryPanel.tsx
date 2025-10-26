

import React from 'react';
// Fix: Corrected import paths to be relative.
import { Run } from '../../types.ts';
import { CheckCircleIcon, XCircleIcon, SpinnerIcon } from '../icons/Icons.tsx';

interface RunHistoryPanelProps {
    runs: Run[];
    selectedRunId: string | null;
    onSelectRun: (run: Run) => void;
}

const getStatusIcon = (status: Run['status']) => {
    switch(status) {
        case 'completed': return <CheckCircleIcon className="h-4 w-4 text-success" />;
        case 'failed': return <XCircleIcon className="h-4 w-4 text-destructive" />;
        case 'running': return <SpinnerIcon className="h-4 w-4 text-primary" />;
    }
}

const RunHistoryPanel: React.FC<RunHistoryPanelProps> = ({ runs, selectedRunId, onSelectRun }) => {
    return (
        <div className="w-64 bg-card shadow-card rounded-lg p-3 flex flex-col">
            <h3 className="text-sm font-semibold mb-2 flex-shrink-0">Run History</h3>
            <div className="flex-1 overflow-y-auto">
                {runs.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center pt-8">No runs yet. Click "Run Agent" to start.</p>
                ) : (
                    <ul className="space-y-2">
                        {runs.map(run => (
                            <li key={run.id}>
                                <button
                                    onClick={() => onSelectRun(run)}
                                    className={`w-full text-left text-xs p-2 rounded transition-colors ${selectedRunId === run.id ? 'bg-primary/20' : 'bg-secondary hover:bg-accent'}`}
                                >
                                    <div className="flex justify-between font-medium items-center">
                                        <span className={selectedRunId === run.id ? 'text-primary' : 'text-foreground'}>
                                            {run.id}
                                        </span>
                                        <div className="flex items-center gap-1 capitalize">
                                            {getStatusIcon(run.status)}
                                            <span className={run.status === 'completed' ? 'text-success' : run.status === 'failed' ? 'text-destructive' : 'text-primary'}>
                                                {run.status}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-muted-foreground mt-1">
                                        {run.startTime.toLocaleString()}
                                    </div>
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default RunHistoryPanel;