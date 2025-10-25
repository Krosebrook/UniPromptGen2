
import React from 'react';
// FIX: Added file extension to fix module resolution error.
import { TerminalIcon, PlusIcon, KeyIcon } from '../components/icons/Icons.tsx';
import { MOCK_TOOLS } from '../constants.ts';
import { Tool, AuthMethod } from '../types.ts';

const authMethodStyles: Record<AuthMethod, { icon: React.ElementType, text: string }> = {
    'None': { icon: () => <span className="w-4 h-4" />, text: 'No Auth' },
    'API Key': { icon: KeyIcon, text: 'API Key' },
    'OAuth 2.0': { icon: KeyIcon, text: 'OAuth 2.0' },
};

const ToolCard: React.FC<{ tool: Tool }> = ({ tool }) => {
    const authInfo = authMethodStyles[tool.authMethod];
    return (
        <div className="bg-card shadow-card rounded-lg p-5 flex flex-col h-full">
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
        </div>
    );
};

const ToolLibrary: React.FC = () => {
  return (
    <div className="space-y-6">
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Tool Library</h1>
          <p className="text-muted-foreground">Register, secure, and manage external tools and APIs for your agents.</p>
        </div>
        <button className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background">
            <PlusIcon className="h-5 w-5 mr-2" />
            Register New Tool
          </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MOCK_TOOLS.map(tool => (
            <ToolCard key={tool.id} tool={tool} />
        ))}
      </div>
    </div>
  );
};

export default ToolLibrary;