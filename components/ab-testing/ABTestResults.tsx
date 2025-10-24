import React from 'react';
import { ABTest, ABTestMetrics } from '../../types.ts';
import { TrophyIcon } from '../icons/Icons.tsx';

interface ABTestResultsProps {
  test: ABTest;
  versionAContent: string;
  versionBContent: string;
}

const MetricRow: React.FC<{ label: string; valueA: number; valueB: number; format: (v: number) => string; isHigherBetter?: boolean }> = ({ label, valueA, valueB, format, isHigherBetter = true }) => {
    const isAWinner = isHigherBetter ? valueA > valueB : valueA < valueB;
    const isBWinner = isHigherBetter ? valueB > valueA : valueB < valueA;
    const isTie = valueA === valueB;

    return (
        <div className="flex justify-between items-center py-2 border-b border-border/50">
            <span className="text-sm text-muted-foreground">{label}</span>
            <div className="flex items-center gap-4 text-right">
                <span className={`font-semibold ${isAWinner && 'text-success'}`}>{format(valueA)} {isAWinner && '🏆'}</span>
                <span className={`font-semibold ${isBWinner && 'text-success'}`}>{format(valueB)} {isBWinner && '🏆'}</span>
            </div>
        </div>
    );
};

const ABTestResults: React.FC<ABTestResultsProps> = ({ test, versionAContent, versionBContent }) => {
    return (
        <div className="bg-secondary p-4 rounded-lg">
            <div className="grid grid-cols-2 gap-4">
                {/* Version A Column */}
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <h4 className="font-bold text-lg">Version A <span className="text-base text-muted-foreground">(v{test.versionA})</span></h4>
                         {test.winner === 'A' && <TrophyIcon className="h-5 w-5 text-warning" />}
                    </div>
                    <textarea 
                        readOnly 
                        value={versionAContent}
                        className="w-full h-40 p-2 font-mono text-xs bg-input rounded-md resize-none"
                    />
                    <div className="mt-2 text-center text-sm">
                        <p className="text-muted-foreground">Traffic</p>
                        <p className="font-bold text-xl">{test.trafficSplit}%</p>
                    </div>
                    {test.status === 'running' && test.winner !== 'A' && (
                        <button className="w-full mt-2 px-3 py-1 text-sm bg-primary/80 text-primary-foreground rounded-md hover:bg-primary">
                            Declare Winner
                        </button>
                    )}
                </div>

                 {/* Version B Column */}
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <h4 className="font-bold text-lg">Version B <span className="text-base text-muted-foreground">(v{test.versionB})</span></h4>
                         {test.winner === 'B' && <TrophyIcon className="h-5 w-5 text-warning" />}
                    </div>
                    <textarea 
                        readOnly 
                        value={versionBContent}
                        className="w-full h-40 p-2 font-mono text-xs bg-input rounded-md resize-none"
                    />
                     <div className="mt-2 text-center text-sm">
                        <p className="text-muted-foreground">Traffic</p>
                        <p className="font-bold text-xl">{100 - test.trafficSplit}%</p>
                    </div>
                    {test.status === 'running' && test.winner !== 'B' && (
                        <button className="w-full mt-2 px-3 py-1 text-sm bg-primary/80 text-primary-foreground rounded-md hover:bg-primary">
                            Declare Winner
                        </button>
                    )}
                </div>
            </div>

            {/* Metrics Comparison */}
            <div className="mt-4 pt-4 border-t border-border">
                <div className="flex justify-between items-center mb-2 px-1">
                    <h4 className="font-semibold">Metric Comparison</h4>
                    <div className="flex items-center gap-4 text-right">
                        <span className="text-xs font-bold w-16 text-center">Version A</span>
                         <span className="text-xs font-bold w-16 text-center">Version B</span>
                    </div>
                </div>
                <MetricRow label="Total Runs" valueA={test.metricsA.totalRuns} valueB={test.metricsB.totalRuns} format={v => v.toLocaleString()} />
                <MetricRow label="Success Rate" valueA={test.metricsA.taskSuccessRate} valueB={test.metricsB.taskSuccessRate} format={v => `${(v * 100).toFixed(1)}%`} />
                <MetricRow label="Avg. User Rating" valueA={test.metricsA.avgUserRating} valueB={test.metricsB.avgUserRating} format={v => v.toFixed(2)} />
            </div>
        </div>
    );
};

export default ABTestResults;
