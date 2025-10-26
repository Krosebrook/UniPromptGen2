import React, { useState } from 'react';
import { PromptTemplate } from '../types.ts';
import QualityScoreDisplay from './QualityScoreDisplay.tsx';
import { CodeBracketIcon, CheckCircleIcon } from './icons/Icons.tsx';

interface DeploymentCardProps {
  template: PromptTemplate;
}

const DeploymentCard: React.FC<DeploymentCardProps> = ({ template }) => {
    const [copied, setCopied] = useState(false);
    const deployedVersion = template.versions.find(v => v.version === template.deployedVersion);

    if (!deployedVersion) return null;

    const apiEndpoint = `https://prompt-platform.example.com/api/v1/run/template/${template.id}`;

    const variablesExample = deployedVersion.variables.reduce((acc, v) => {
        acc[v.name] = v.defaultValue ?? '...';
        return acc;
    }, {} as Record<string, any>);
    
    const curlSnippet = `curl -X POST ${apiEndpoint} \\
-H "Authorization: Bearer YOUR_PRODUCTION_API_KEY" \\
-H "Content-Type: application/json" \\
-d '${JSON.stringify({ variables: variablesExample }, null, 2)}'`;

    const handleCopy = () => {
        navigator.clipboard.writeText(curlSnippet);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="bg-card shadow-card rounded-lg p-6">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-lg font-bold text-foreground">{deployedVersion.name}</h3>
                    <p className="text-sm text-muted-foreground">{deployedVersion.description}</p>
                    <div className="mt-2 text-xs flex items-center gap-4 text-muted-foreground">
                        <span className="font-semibold bg-success/20 text-success px-2 py-0.5 rounded-full">
                            Live v{template.deployedVersion}
                        </span>
                        <div className="flex items-center">
                            <CodeBracketIcon className="h-4 w-4 mr-1" />
                            <span>{template.domain}</span>
                        </div>
                    </div>
                </div>
                <QualityScoreDisplay score={template.qualityScore} />
            </div>

            <div className="mt-4 pt-4 border-t border-border">
                <h4 className="text-sm font-semibold mb-2">API Integration</h4>
                <div className="bg-black/50 rounded-md">
                    <div className="px-4 py-2 border-b border-border/50 flex justify-between items-center">
                        <p className="text-xs font-semibold text-muted-foreground">PRODUCTION ENDPOINT</p>
                        <button onClick={handleCopy} className="text-xs font-semibold text-primary hover:text-primary/80">
                            {copied ? 'Copied!' : 'Copy cURL'}
                        </button>
                    </div>
                    <pre className="p-4 text-xs font-mono overflow-x-auto text-green-300">
                        <code>{curlSnippet}</code>
                    </pre>
                </div>
            </div>
        </div>
    );
};

export default DeploymentCard;