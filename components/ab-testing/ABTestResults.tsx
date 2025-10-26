import React from 'react';
import { ABTest } from '../../types.ts';
import { XCircleIcon, ChartBarIcon, StarIcon, TrophyIcon } from '../icons/Icons.tsx';
import QualityScoreDisplay from '../QualityScoreDisplay.tsx';
import { calculateQualityScore } from '../../services/qualityService.ts';

interface ABTestResultsProps {
    test: ABTest;
    onClose: () => void;
}

const MetricDisplay: React.FC<{ label: string, valueA: string, valueB: string, winner?: 'A' | 'B' | 'None' }> = ({ label, valueA, valueB, winner }) => {
    const isAWinner = winner === 'A';
    const isBWinner = winner === 'B';
    return (
        <div className="flex justify-between items-center py-2 border-b border-border">
            <span className="text-sm text-muted-foreground">{label}</span>
            <div className="flex gap-4 font-semibold text-sm">
                <span className={`w-20 text-center ${isAWinner ? 'text-success' : 'text-foreground'}`}>{valueA}</span>
                <span className={`w-20 text-center ${isBWinner ? 'text-success' : 'text-foreground'}`}>{valueB}</span>
            </div>
        </div>
    );
};


const ABTestResults: React.FC<ABTestResultsProps> = ({ test, onClose }) => {
    if (!test.results) {
        return (
             <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-40" onClick={onClose}>
                <div className="bg-popover w-full max-w-2xl rounded-lg shadow-xl p-6 relative" onClick={e => e.stopPropagation()}>
                    <p>No results available for this test yet.</p>
                </div>
             </div>
        )
    }
    
    const { versionA, versionB, confidence, winner } = test.results;
    const scoreA = calculateQualityScore(versionA);
    const scoreB = calculateQualityScore(versionB);
    const scoreWinner = scoreA > scoreB ? 'A' : scoreB > scoreA ? 'B' : 'None';
    const successRateWinner = versionA.taskSuccessRate > versionB.taskSuccessRate ? 'A' : versionB.taskSuccessRate > versionA.taskSuccessRate ? 'B' : 'None';
    const ratingWinner = versionA.avgUserRating > versionB.avgUserRating ? 'A' : versionB.avgUserRating > versionA.avgUserRating ? 'B' : 'None';

    const winnerText = winner === 'inconclusive' ? `Inconclusive with ${Math.round(confidence * 100)}% confidence` : `Version ${winner === 'versionA' ? test.versionA : test.versionB} is the winner with ${Math.round(confidence * 100)}% confidence.`;


    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-40" onClick={onClose}>
            <div className="bg-popover w-full max-w-2xl rounded-lg shadow-xl p-6 relative" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-3 right-3 p-1 rounded-full hover:bg-accent">
                    <XCircleIcon className="h-6 w-6 text-muted-foreground" />
                </button>

                <h2 className="text-2xl font-bold mb-1">{test.name}</h2>
                <p className="text-muted-foreground mb-4">Results for v{test.versionA} vs v{test.versionB}</p>
                
                <div className={`text-center p-3 rounded-md mb-6 ${winner === 'inconclusive' ? 'bg-warning/20' : 'bg-success/20'}`}>
                    <p className={`font-semibold ${winner === 'inconclusive' ? 'text-warning' : 'text-success'}`}><TrophyIcon className="h-5 w-5 inline-block mr-2" /> {winnerText}</p>
                </div>

                <div className="flex justify-between items-center py-2 mb-2">
                    <span className="text-sm font-semibold">Metric</span>
                     <div className="flex gap-4 font-semibold text-sm">
                        <span className="w-20 text-center">Version {test.versionA}</span>
                        <span className="w-20 text-center">Version {test.versionB}</span>
                    </div>
                </div>

                <MetricDisplay label="Quality Score" valueA={scoreA.toFixed(1)} valueB={scoreB.toFixed(1)} winner={scoreWinner} />
                <MetricDisplay label="Success Rate" valueA={`${(versionA.taskSuccessRate * 100).toFixed(1)}%`} valueB={`${(versionB.taskSuccessRate * 100).toFixed(1)}%`} winner={successRateWinner} />
                <MetricDisplay label="Avg. User Rating" valueA={versionA.avgUserRating.toFixed(2)} valueB={versionB.avgUserRating.toFixed(2)} winner={ratingWinner} />
                <MetricDisplay label="Total Runs" valueA={versionA.totalRuns.toLocaleString()} valueB={versionB.totalRuns.toLocaleString()} />
                
            </div>
        </div>
    );
};

export default ABTestResults;
