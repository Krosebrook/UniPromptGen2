import React, { useState } from 'react';
import { useWorkspace } from '../contexts/WorkspaceContext.tsx';
import { ChevronDownIcon, CheckCircleIcon, UserGroupIcon } from './icons/Icons.tsx';

const WorkspaceSwitcher: React.FC = () => {
    const { workspaces, currentWorkspace, setCurrentWorkspace, isLoading } = useWorkspace();
    const [isOpen, setIsOpen] = useState(false);

    if (isLoading || !currentWorkspace) {
        return <div className="w-48 h-9 bg-secondary rounded-md animate-pulse" />;
    }

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 w-48 text-left p-2 bg-secondary rounded-md hover:bg-accent"
            >
                <div className="p-1 bg-primary/20 rounded">
                    <UserGroupIcon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-semibold text-foreground truncate">{currentWorkspace.name}</p>
                    <p className="text-xs text-muted-foreground">{currentWorkspace.plan} Plan</p>
                </div>
                <ChevronDownIcon className={`h-5 w-5 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute top-full mt-2 w-48 bg-popover rounded-md shadow-lg ring-1 ring-border z-10 py-1">
                    {workspaces.map(ws => (
                        <a
                            key={ws.id}
                            href="#"
                            onClick={(e) => {
                                e.preventDefault();
                                setCurrentWorkspace(ws);
                                setIsOpen(false);
                            }}
                            className="flex items-center justify-between px-3 py-2 text-sm text-popover-foreground hover:bg-accent"
                        >
                            <span>{ws.name}</span>
                            {currentWorkspace.id === ws.id && <CheckCircleIcon className="h-5 w-5 text-primary" />}
                        </a>
                    ))}
                </div>
            )}
        </div>
    );
};

export default WorkspaceSwitcher;
