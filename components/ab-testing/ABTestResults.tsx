

import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { ABTest, PromptTemplate, ABTestChartData } from '../../types.ts';
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

interface AnalyticsData {
    summary: {
        versionA: TestMetrics;
        versionB: TestMetrics;
    };
    timeSeries: ABTestChartData[];
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

const ChartTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="p-2 bg-popover/80 backdrop-blur-sm border border-border rounded-md text-sm">
                <p className="font-semibold mb-1">{label}</p>
                {payload.map((p: any) => (
                    <p key={p.name} style={{ color: p.color }}>{`${p.name}: ${p.value}`}</p>
                ))}
            </div>
        );
    }
    return null;
};

const ABTestResults: React.FC<ABTestResultsProps> = ({ test, template, onClose, onDeclareWinner }) => {
    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            setIsLoading(true);
            try {
                const result = await getABTestAnalytics(test.id);
                setAnalytics(result);
            } catch (error) {
                console.error("Failed to load A/B test analytics", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchAnalytics();
    }, [test.id]);

    const renderContent = () => {
        if (isLoading || !analytics) {
            return <div className="flex justify-center items-center h-48"><SpinnerIcon className="h-6 w-6 text-primary" /></div>;
        }

        const { versionA, versionB } = analytics.summary;
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

                <div className="mt-6 space-y-6">
                    <h3 className="text-lg font-semibold border-t border-border pt-4">Performance Over Time</h3>
                    <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-2">Total Runs</h4>
                        <ResponsiveContainer width="100%" height={200}>
                            <LineChart data={analytics.timeSeries}>
                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(215 28% 17%)" />
                                <XAxis dataKey="time" stroke="hsl(215 15% 65%)" fontSize={12} />
                                <YAxis stroke="hsl(215 15% 65%)" fontSize={12}/>
                                <Tooltip content={<ChartTooltip />} />
                                <Legend />
                                <Line type="monotone" dataKey="versionA_runs" name={`v${test.versionA}`} stroke="hsl(217 91% 60%)" strokeWidth={2} />
                                <Line type="monotone" dataKey="versionB_runs" name={`v${test.versionB}`} stroke="hsl(142 71% 45%)" strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                    <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-2">Success Rate</h4>
                        <ResponsiveContainer width="100%" height={200}>
                            <LineChart data={analytics.timeSeries}>
                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(215 28% 17%)" />
                                <XAxis dataKey="time" stroke="hsl(215 15% 65%)" fontSize={12} />
                                <YAxis domain={[0, 1]} tickFormatter={(v) => `${v*100}%`} stroke="hsl(215 15% 65%)" fontSize={12}/>
                                <Tooltip formatter={(value: number) => `${(value * 100).toFixed(1)}%`} />
                                <Legend />
                                <Line type="monotone" dataKey="versionA_successRate" name={`v${test.versionA}`} stroke="hsl(217 91% 60%)" strokeWidth={2} />
                                <Line type="monotone" dataKey="versionB_successRate" name={`v${test.versionB}`} stroke="hsl(142 71% 45%)" strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                    <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-2">Average User Rating</h4>
                        <ResponsiveContainer width="100%" height={200}>
                            <LineChart data={analytics.timeSeries}>
                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(215 28% 17%)" />
                                <XAxis dataKey="time" stroke="hsl(215 15% 65%)" fontSize={12} />
                                <YAxis domain={[1, 5]} stroke="hsl(215 15% 65%)" fontSize={12}/>
                                <Tooltip formatter={(value: number) => value.toFixed(2)} />
                                <Legend />
                                <Line type="monotone" dataKey="versionA_avgRating" name={`v${test.versionA}`} stroke="hsl(217 91% 60%)" strokeWidth={2} />
                                <Line type="monotone" dataKey="versionB_avgRating" name={`v${test.versionB}`} stroke="hsl(142 71% 45%)" strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                
                {!isCompleted && (
                    <div className="mt-6 flex justify-end gap-2 border-t border-border pt-4">
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
            <div className="bg-popover w-full max-w-3xl rounded-lg shadow-xl relative" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-3 right-3 p-1 rounded-full hover:bg-accent z-10">
                    <XCircleIcon className="h-6 w-6 text-muted-foreground" />
                </button>
                <div className="p-6">
                    <h2 className="text-2xl font-bold mb-1">{test.name}</h2>
                    <p className="text-muted-foreground mb-4">Live results for v{test.versionA} vs v{test.versionB}</p>
                </div>
                <div className="max-h-[70vh] overflow-y-auto px-6 pb-6">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default ABTestResults;