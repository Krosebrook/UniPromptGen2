import React from 'react';
import { KnowledgeSource } from '../types.ts';
import { CollectionIcon, CheckCircleIcon, SpinnerIcon } from './icons/Icons.tsx';

interface KnowledgeSourceCardProps {
  source: KnowledgeSource;
  canEdit: boolean;
  onDragStart: (e: React.DragEvent, item: KnowledgeSource) => void;
  onContextMenu: (e: React.MouseEvent, item: KnowledgeSource) => void;
}

const statusInfo = {
    Ready: { icon: CheckCircleIcon, color: 'text-success', label: 'Ready' },
    Indexing: { icon: SpinnerIcon, color: 'text-primary', label: 'Indexing' },
    Pending: { icon: SpinnerIcon, color: 'text-muted-foreground', label: 'Pending' },
    Error: { icon: CheckCircleIcon, color: 'text-destructive', label: 'Error' },
};

const KnowledgeSourceCard: React.FC<KnowledgeSourceCardProps> = ({ source, canEdit, onDragStart, onContextMenu }) => {
    const StatusIcon = statusInfo[source.status].icon;
    const statusColor = statusInfo[source.status].color;

  return (
    <div
      draggable={canEdit}
      onDragStart={(e) => onDragStart(e, source)}
      onContextMenu={(e) => onContextMenu(e, source)}
      className={`bg-card shadow-card rounded-lg p-4 flex flex-col justify-between h-full group transition-shadow hover:shadow-lg ${canEdit ? 'cursor-grab' : ''}`}
    >
        <div>
            <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-secondary rounded-md">
                    <CollectionIcon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-bold text-foreground">{source.name}</h3>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-3">{source.description}</p>
        </div>
        <div className="text-xs text-muted-foreground mt-3 flex justify-between items-center">
            <span>Type: {source.type}</span>
            <div className={`flex items-center gap-1 font-semibold ${statusColor}`}>
                <StatusIcon className={`h-4 w-4 ${source.status === 'Indexing' ? 'animate-spin' : ''}`} />
                <span>{source.status}</span>
            </div>
        </div>
    </div>
  );
};

export default KnowledgeSourceCard;