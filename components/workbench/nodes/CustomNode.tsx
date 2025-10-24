import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';

interface CustomNodeProps extends NodeProps {
    icon: React.ElementType;
}

const CustomNode: React.FC<CustomNodeProps> = ({ data, isConnectable, icon: Icon }) => {
  return (
    <div className="bg-secondary p-3 border-2 border-border rounded-md w-48">
      <Handle type="target" position={Position.Left} isConnectable={isConnectable} />
      <div className="flex items-center gap-2">
        <div className="p-1 bg-primary/20 rounded-md">
           <Icon className="h-5 w-5 text-primary" />
        </div>
        <div className="font-semibold text-foreground truncate">{data.label}</div>
      </div>
      <Handle type="source" position={Position.Right} isConnectable={isConnectable} />
    </div>
  );
};

export default CustomNode;
