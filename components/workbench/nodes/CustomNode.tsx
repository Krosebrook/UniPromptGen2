

import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { NodeRunStatus } from '../../../types.ts';
import { SpinnerIcon, CheckCircleIcon, XCircleIcon } from '../../icons/Icons.tsx';

interface CustomNodeProps extends NodeProps {
    icon: React.ElementType;
    runStatus?: NodeRunStatus;
    isSelected: boolean;
}

const statusStyles: Record<NodeRunStatus, string> = {
    idle: 'border-border',
    running: 'border-primary animate-pulse',
    success: 'border-success',
    error: 'border-destructive',
};

const CustomNode: React.FC<CustomNodeProps> = ({ data, type, isConnectable, icon: Icon, runStatus = 'idle', isSelected }) => {
  const borderClass = statusStyles[runStatus];
  // Separate ring class for selection to coexist with status border
  const ringClass = isSelected ? 'ring-2 ring-ring ring-offset-card ring-offset-2' : '';
  
  const StatusIcon = () => {
    switch(runStatus) {
        case 'running':
            return <SpinnerIcon className="h-4 w-4 text-primary" />;
        case 'success':
            return <CheckCircleIcon className="h-4 w-4 text-success" />;
        case 'error':
            return <XCircleIcon className="h-4 w-4 text-destructive" />;
        default:
            return null;
    }
  }

  // Determine which handles to show based on node type
  const showDataInput = type === 'model' || type === 'tool' || type === 'output';
  const showDataOutput = type === 'model' || type === 'tool' || type === 'input' || type === 'knowledge';
  const showKnowledgeInput = type === 'model';

  return (
    <div className={`bg-secondary p-3 border-2 rounded-md w-48 transition-all ${borderClass} ${ringClass}`}>
      {showKnowledgeInput && (
        <Handle
            type="target"
            id="knowledge_input"
            position={Position.Top}
            isConnectable={isConnectable}
            style={{ background: '#9333ea', width: '10px', height: '10px' }}
            title="Knowledge Input"
        />
      )}
      {showDataInput && (
        <Handle
            type="target"
            id="data_input"
            position={Position.Left}
            isConnectable={isConnectable}
            style={{ background: '#555' }}
            title="Data Input"
        />
      )}
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 overflow-hidden">
            <div className="p-1 bg-primary/20 rounded-md flex-shrink-0">
               <Icon className="h-5 w-5 text-primary" />
            </div>
            <div className="font-semibold text-foreground truncate">{data.label}</div>
        </div>
        <div className="flex-shrink-0 ml-1 h-4 w-4">
            <StatusIcon />
        </div>
      </div>

      {showDataOutput && (
         <Handle
            type="source"
            id="data_output"
            position={Position.Right}
            isConnectable={isConnectable}
            style={{ background: '#555' }}
            title="Data Output"
        />
      )}
    </div>
  );
};

export default CustomNode;