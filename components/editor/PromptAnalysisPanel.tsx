import React from 'react';
import { AnalysisResult, AnalysisWarning } from '../../services/promptAnalysisService.ts';
import { SparklesIcon, BellIcon } from '../icons/Icons.tsx';

interface PromptAnalysisPanelProps {
    analysis: AnalysisResult;
}

const WarningItem: React.FC<{ warning: AnalysisWarning }> = ({ warning }) => {
    return (
        <div className="flex items-start gap-2 p-2 bg-secondary rounded-md">
            <BellIcon className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground">{warning.message}</p>
        </div>
    );
};

const PromptAnalysisPanel: React.FC<PromptAnalysisPanelProps> = ({ analysis }) => {
    return (
        <div className="bg-card shadow-card rounded-lg p-6">
            <div className="flex items-center mb-4">
                <SparklesIcon className="h-5 w-5 text-primary mr-2" />
                <h3 className="text-lg font-semibold">Prompt Analysis</h3>
            </div>

            <div className="mb-4">
                <p className="text-sm font-medium text-muted-foreground">Estimated Token Count</p>
                <p className="text-2xl font-bold text-foreground">{analysis.tokenCount}</p>
            </div>
            
            {analysis.warnings.length > 0 && (
                <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Suggestions</p>
                    <div className="space-y-2">
                        {analysis.warnings.map((warning, index) => (
                            <WarningItem key={index} warning={warning} />
                        ))}
                    </div>
                </div>
            )}
            
            {analysis.warnings.length === 0 && (
                 <p className="text-sm text-center text-muted-foreground py-4">No issues detected. Looking good!</p>
            )}
        </div>
    );
};

export default PromptAnalysisPanel;