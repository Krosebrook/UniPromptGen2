import React from 'react';
import { ABTest } from '../../types.ts';

interface ABTestResultsProps {
    test: ABTest | null;
}

const ABTestResults: React.FC<ABTestResultsProps> = ({ test }) => {
    if (!test) {
        return null;
    }

    return (
        <div className="bg-card shadow-card rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">A/B Test Results: {test.name}</h3>
            <p className="text-sm text-muted-foreground text-center py-4">Detailed results and charts would be displayed here.</p>
            <div className="grid grid-cols-2 gap-4 text-center mt-4">
                <div>
                    <p className="text-xs text-muted-foreground">Version A (v{test.versionA})</p>
                    <p className="text-lg font-bold">{test.metricsA.successRate * 100}%</p>
                    <p className="text-sm">Success Rate</p>
                </div>
                 <div>
                    <p className="text-xs text-muted-foreground">Version B (v{test.versionB})</p>
                    <p className="text-lg font-bold">{test.metricsB.successRate * 100}%</p>
                    <p className="text-sm">Success Rate</p>
                </div>
            </div>
        </div>
    );
};

export default ABTestResults;
