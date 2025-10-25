import React from 'react';
import { ClockIcon } from '../icons/Icons.tsx';

const RunHistoryPanel: React.FC = () => {
    // This is a placeholder component. In a real app, this data would come from an API.
    const history = [
        { id: 'run-1', time: '2 minutes ago', status: 'Success' },
        { id: 'run-2', time: '15 minutes ago', status: 'Error' },
        { id: 'run-3', time: '1 hour ago', status: 'Success' },
    ];

    return (
        <div className="w-64 bg-card shadow-card rounded-lg p-3 flex flex-col">
            <h3 className="text-sm font-semibold mb-2 flex-shrink-0">Run History</h3>
            <div className="flex-1 overflow-y-auto">
                <ul className="space-y-2">
                    {history.map(run => (
                        <li key={run.id} className="text-xs p-2 bg-secondary rounded">
                            <div className="flex justify-between font-medium">
                                <span>Run #{run.id.split('-')[1]}</span>
                                <span className={run.status === 'Success' ? 'text-success' : 'text-destructive'}>
                                    {run.status}
                                </span>
                            </div>
                            <div className="text-muted-foreground mt-1">
                                {run.time}
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default RunHistoryPanel;
