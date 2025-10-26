import React, { useState } from 'react';
import { PlayIcon, DocumentPlusIcon, FolderOpenIcon, DocumentCheckIcon } from '../icons/Icons.tsx';
import { AgentGraph } from '../../types.ts';

interface WorkbenchHeaderProps {
  agentName: string;
  onAgentNameChange: (name: string) => void;
  savedAgents: AgentGraph[];
  onRun: () => void;
  onSave: () => void;
  onNew: () => void;
  onLoad: (agentId: string) => void;
  isRunning?: boolean;
}

const WorkbenchHeader: React.FC<WorkbenchHeaderProps> = ({
  agentName,
  onAgentNameChange,
  savedAgents,
  onRun,
  onSave,
  onNew,
  onLoad,
  isRunning,
}) => {
  const [isLoadMenuOpen, setIsLoadMenuOpen] = useState(false);

  const handleLoad = (agentId: string) => {
    onLoad(agentId);
    setIsLoadMenuOpen(false);
  }

  return (
    <div className="flex-shrink-0 flex items-center justify-between gap-4">
      <input
        type="text"
        value={agentName}
        onChange={(e) => onAgentNameChange(e.target.value)}
        className="text-2xl font-bold text-foreground bg-transparent focus:outline-none focus:ring-2 focus:ring-ring rounded-md px-2 -mx-2 flex-1"
        placeholder="Untitled Agent"
      />
      <div className="flex items-center gap-2">
        <button onClick={onNew} className="p-2 text-sm font-medium bg-secondary rounded-md hover:bg-accent" title="New Agent">
          <DocumentPlusIcon className="h-5 w-5" />
        </button>
        <div className="relative">
          <button onClick={() => setIsLoadMenuOpen(!isLoadMenuOpen)} className="p-2 text-sm font-medium bg-secondary rounded-md hover:bg-accent" title="Load Agent">
            <FolderOpenIcon className="h-5 w-5" />
          </button>
          {isLoadMenuOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-popover rounded-md shadow-lg ring-1 ring-border py-1 z-10">
              {savedAgents.length === 0 ? (
                <p className="px-3 py-2 text-sm text-muted-foreground">No saved agents.</p>
              ) : (
                savedAgents.map(agent => (
                  <a
                    key={agent.id}
                    href="#"
                    onClick={(e) => { e.preventDefault(); handleLoad(agent.id); }}
                    className="block px-3 py-2 text-sm text-popover-foreground hover:bg-accent"
                  >
                    {agent.name}
                  </a>
                ))
              )}
            </div>
          )}
        </div>
        <button
          onClick={onSave}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium bg-secondary rounded-md hover:bg-accent"
        >
          <DocumentCheckIcon className="h-5 w-5" />
          Save Agent
        </button>
        <button
          onClick={onRun}
          disabled={isRunning}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-md hover:bg-primary/90 disabled:opacity-50"
        >
          <PlayIcon className="h-5 w-5" />
          {isRunning ? 'Running...' : 'Run Agent'}
        </button>
      </div>
    </div>
  );
};

export default WorkbenchHeader;