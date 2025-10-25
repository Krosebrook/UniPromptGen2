import React from 'react';
import { NodeType } from '../../types.ts';
import { 
    CpuChipIcon,
    WrenchScrewdriverIcon,
    ArrowRightStartOnRectangleIcon,
    ArrowLeftEndOnRectangleIcon,
    CollectionIcon
} from '../icons/Icons.tsx';

interface WorkbenchSidebarProps {
  addNode: (type: NodeType) => void;
}

const nodeTypes = [
    { type: 'input' as NodeType, label: 'Input Node', icon: ArrowRightStartOnRectangleIcon, description: 'Starting point for the agent.' },
    { type: 'model' as NodeType, label: 'Model Node', icon: CpuChipIcon, description: 'Calls a language model.' },
    { type: 'tool' as NodeType, label: 'Tool Node', icon: WrenchScrewdriverIcon, description: 'Connects to external tools or APIs.' },
    { type: 'knowledge' as NodeType, label: 'Knowledge Node', icon: CollectionIcon, description: 'Provides grounding data to models.' },
    { type: 'output' as NodeType, label: 'Output Node', icon: ArrowLeftEndOnRectangleIcon, description: 'Final output from the agent.' },
];

const WorkbenchSidebar: React.FC<WorkbenchSidebarProps> = ({ addNode }) => {
  return (
    <aside className="w-64 bg-card shadow-card rounded-lg p-4 flex-shrink-0">
      <h2 className="text-lg font-semibold mb-4">Add Nodes</h2>
      <div className="space-y-2">
        {nodeTypes.map(({ type, label, icon: Icon, description }) => (
            <button
                key={type}
                onClick={() => addNode(type)}
                className="w-full flex items-start text-left p-2 rounded-md hover:bg-accent transition-colors"
            >
                <div className="p-2 bg-secondary rounded-md mr-3">
                     <Icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                    <p className="font-medium text-sm text-foreground">{label}</p>
                    <p className="text-xs text-muted-foreground">{description}</p>
                </div>
            </button>
        ))}
      </div>
    </aside>
  );
};

export default WorkbenchSidebar;