import React from 'react';
import { TerminalIcon, KeyIcon, TrashIcon } from './icons/Icons.tsx';
import { Tool, AuthMethod } from '../types.ts';

const authMethodStyles: Record<AuthMethod, { icon: React.ElementType, text: string }> = {
    'None': { icon: () => <span className="w-4 h-4" />, text: 'No Auth' },
    'API Key': { icon: KeyIcon, text: 'API Key' },
    'OAuth 2.0': { icon: KeyIcon, text: 'OAuth 2.0' },
};

interface ToolCardProps {
    tool: Tool;
    onDelete: (id: string, name: string) => void;
}

const ToolCard: React.FC<ToolCardProps> = ({ tool, onDelete }) => {
    const authInfo = authMethodStyles[tool.authMethod];
    
    const handleDelete = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onDelete(tool.id, tool.name);
    };

    return (
        <div className="bg-card shadow-card rounded-lg p-5 flex flex-col h-full relative group">
            <div className="flex items-start gap-4">
                <div className="p-2 bg-secondary rounded-md">
                    <TerminalIcon className="h-6 w-6 text-primary" />
                </div>
                <div>
                    <h3 className="font-bold text-foreground">{tool.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{tool.description}</p>
                </div>
            </div>
            <div className="mt-4 pt-3 border-t border-border flex-grow flex flex-col justify-end">
                <div className="text-xs text-muted-foreground space-y-2">
                    <p className="font-mono bg-input px-2 py-1 rounded truncate" title={tool.apiEndpoint}>
                        {tool.apiEndpoint}
                    </p>
                    <div className="flex items-center gap-2">
                        <authInfo.icon className="h-4 w-4 text-primary" />
                        <span>{authInfo.text}</span>
                    </div>
                </div>
            </div>
            <button
                onClick={handleDelete}
                className="absolute top-2 right-2 p-1.5 bg-card/50 text-muted-foreground rounded-full opacity-0 group-hover:opacity-100 hover:bg-destructive/20 hover:text-destructive transition-opacity"
                aria-label="Delete tool"
            >
                <TrashIcon className="h-4 w-4" />
            </button>
        </div>
    );
};

export default ToolCard;
