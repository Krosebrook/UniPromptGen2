import React from 'react';
import { Tool } from '../types.ts';
import { WrenchScrewdriverIcon, KeyIcon } from './icons/Icons.tsx';

interface ToolCardProps {
  tool: Tool;
  canEdit: boolean;
  onDragStart: (e: React.DragEvent, item: Tool) => void;
  onContextMenu: (e: React.MouseEvent, item: Tool) => void;
}

const ToolCard: React.FC<ToolCardProps> = ({ tool, canEdit, onDragStart, onContextMenu }) => {
  return (
    <div
      draggable={canEdit}
      onDragStart={(e) => onDragStart(e, tool)}
      onContextMenu={(e) => onContextMenu(e, tool)}
      className={`bg-card shadow-card rounded-lg p-4 flex flex-col justify-between h-full group transition-shadow hover:shadow-lg ${canEdit ? 'cursor-grab' : ''}`}
    >
        <div>
            <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-secondary rounded-md">
                    <WrenchScrewdriverIcon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-bold text-foreground">{tool.name}</h3>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-3">{tool.description}</p>
        </div>
        <div className="text-xs text-muted-foreground mt-3 flex items-center gap-2">
            <KeyIcon className="h-4 w-4" />
            <span>{tool.authMethod}</span>
        </div>
    </div>
  );
};

export default ToolCard;