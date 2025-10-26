import React, { useState, useEffect } from 'react';
import { ABTest, PromptTemplate } from '../../types.ts';
import { XCircleIcon, TrophyIcon, SpinnerIcon } from '../icons/Icons.tsx';
import { getABTestAnalytics } from '../../services/apiService.ts';

interface ABTestResultsProps {
    test: ABTest;
    template: PromptTemplate;
    onClose: () => void;
    onDeclareWinner: (testId: string, winner: 'A' | 'B') => void;
}

interface TestMetrics {
    runs: number;
    successRate: number;
    avgRating: number;
}

const MetricDisplay: React.FC<{ label: string, valueA: string, valueB: string, winner?: 'A' | 'B' | 'None' }> = ({ label, valueA, valueB, winner }) => {
    const isAWinner = winner === 'A';
    const isBWinner = winner === 'B';
    return (
        <div className="flex justify-between items-center py-2 border-b border-border">
            <span className="text-sm text-muted-foreground">{label}</span>
            <div className="flex gap-4 font-semibold text-sm">
                <span className={`w-24 text-center ${isAWinner ? 'text-success' : 'text-foreground'}`}>{valueA}</span>
                <span className={`w-24 text-center ${isBWinner ? 'text-success' : 'text-foreground'}`}>{valueB}</span>
            </div>
        </div>
    );
};

const ABTestResults: React.FC<ABTestResultsProps> = ({ test, template, onClose, onDeclareWinner }) => {
    const [metrics, setMetrics] = useState<{versionA: TestMetrics, versionB: TestMetrics} | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            setIsLoading(true);
            try {
                const result = await getABTestAnalytics(test.id);
                setMetrics(result);
            } catch (error) {
                console.error("Failed to load A/B test analytics", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchAnalytics();
    }, [test.id]);

    const renderContent = () => {
        if (isLoading || !metrics) {
            return <div className="flex justify-center items-center h-48"><SpinnerIcon className="h-6 w-6 text-primary" /></div>;
        }

        const { versionA, versionB } = metrics;
        const totalRuns = versionA.runs + versionB.runs;
        
        if (totalRuns === 0) {
            return <p className="text-center text-muted-foreground py-10">Waiting for data. No runs have been recorded for this test yet.</p>;
        }
        
        const successRateWinner = versionA.successRate > versionB.successRate ? 'A' : versionB.successRate > versionA.successRate ? 'B' : 'None';
        const ratingWinner = versionA.avgRating > versionB.avgRating ? 'A' : versionB.avgRating > versionA.avgRating ? 'B' : 'None';
        const isCompleted = test.status === 'completed';
        const winner = test.results?.winner === 'versionA' ? 'A' : test.results?.winner === 'versionB' ? 'B' : null;

        return (
            <>
                {isCompleted && winner && (
                    <div className="text-center p-3 rounded-md mb-6 bg-success/20">
                        <p className="font-semibold text-success"><TrophyIcon className="h-5 w-5 inline-block mr-2" /> Version {winner === 'A' ? test.versionA : test.versionB} was declared the winner.</p>
                    </div>
                )}
                 <div className="flex justify-between items-center py-2 mb-2">
                    <span className="text-sm font-semibold">Metric</span>
                     <div className="flex gap-4 font-semibold text-sm">
                        <span className="w-24 text-center">Version {test.versionA}</span>
                        <span className="w-24 text-center">Version {test.versionB}</span>
                    </div>
                </div>
                <MetricDisplay label="Total Runs" valueA={versionA.runs.toLocaleString()} valueB={versionB.runs.toLocaleString()} />
                <MetricDisplay label="Success Rate" valueA={`${(versionA.successRate * 100).toFixed(1)}%`} valueB={`${(versionB.successRate * 100).toFixed(1)}%`} winner={successRateWinner} />
                <MetricDisplay label="Avg. User Rating" valueA={versionA.avgRating.toFixed(2)} valueB={versionB.avgRating.toFixed(2)} winner={ratingWinner} />
                
                {!isCompleted && (
                    <div className="mt-6 flex justify-end gap-2">
                        <button 
                            onClick={() => onDeclareWinner(test.id, 'A')}
                            className="px-4 py-2 text-sm font-medium text-primary-foreground bg-success rounded-md hover:bg-success/90"
                        >
                            Declare v{test.versionA} as Winner
                        </button>
                        <button 
                             onClick={() => onDeclareWinner(test.id, 'B')}
                            className="px-4 py-2 text-sm font-medium text-primary-foreground bg-success rounded-md hover:bg-success/90"
                        >
                             Declare v{test.versionB} as Winner
                        </button>
                    </div>
                )}
            </>
        )
    }

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-40" onClick={onClose}>
            <div className="bg-popover w-full max-w-2xl rounded-lg shadow-xl p-6 relative" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-3 right-3 p-1 rounded-full hover:bg-accent">
                    <XCircleIcon className="h-6 w-6 text-muted-foreground" />
                </button>
                <h2 className="text-2xl font-bold mb-1">{test.name}</h2>
                <p className="text-muted-foreground mb-4">Live results for v{test.versionA} vs v{test.versionB}</p>
                {renderContent()}
            </div>
        </div>
    );
};

export default ABTestResults;