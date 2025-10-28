

import React from 'react';
import { ABTest } from '../../types.ts';
import { PlusIcon } from '../icons/Icons.tsx';

interface ABTestManagerProps {
    tests: ABTest[];
    onStartTest: () => void;
    onSelectTest: (test: ABTest) => void;
    canCreateTest: boolean;
}

const ABTestManager: React.FC<ABTestManagerProps> = ({ tests, onStartTest, onSelectTest, canCreateTest }) => {
    return (
        <div className="bg-card shadow-card rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">A/B Tests</h3>
                <button 
                    onClick={onStartTest} 
                    disabled={!canCreateTest}
                    title={canCreateTest ? "Start a new A/B test" : "You need at least two versions to start an A/B test"}
                    className="inline-flex items-center gap-2 px-3 py-1 text-sm font-medium text-primary-foreground bg-primary rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <PlusIcon className="h-4 w-4" />
                    New Test
                </button>
            </div>
            {tests.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No A/B tests are running for this template.</p>
            ) : (
                <div className="space-y-2">
                    {tests.map(test => (
                         <button key={test.id} onClick={() => onSelectTest(test)} className="w-full text-left p-2 bg-secondary rounded-md hover:bg-accent">
                            <p className="font-semibold text-sm">{test.name}</p>
                            <p className="text-xs text-muted-foreground">v{test.versionA} vs v{test.versionB} ({test.status})</p>
                         </button>
                    ))}
                </div>
            )}
        </div>
    );
}

export default ABTestManager;