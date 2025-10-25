import React from 'react';
import { KnowledgeSource, KnowledgeSourceType } from '../types.ts';
import { TrashIcon } from './icons/Icons.tsx';

const typeStyles: Record<KnowledgeSourceType, { icon: string, color: string }> = {
    'PDF': { icon: '📄', color: 'text-red-400' },
    'Website': { icon: '🌐', color: 'text-blue-400' },
    'Text': { icon: '📝', color: 'text-gray-400' },
    'API': { icon: '🔗', color: 'text-green-400' },
};

interface KnowledgeSourceCardProps {
    source: KnowledgeSource;
    onDelete: (id: string, name: string) => void;
}

const KnowledgeSourceCard: React.FC<KnowledgeSourceCardProps> = ({ source, onDelete }) => {
    const style = typeStyles[source.type];
    
    const handleDelete = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onDelete(source.id, source.name);
    };

    return (
        <div className="bg-card shadow-card rounded-lg p-5 flex flex-col h-full relative group">
            <div className="flex items-start gap-4">
                 <div className={`text-2xl ${style.color}`}>{style.icon}</div>
                 <div className="flex-1">
                    <h3 className="font-bold text-foreground">{source.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{source.description}</p>
                 </div>
            </div>
             <div className="mt-4 pt-3 border-t border-border text-xs text-muted-foreground flex justify-between items-center">
                <span className="font-semibold px-2 py-0.5 bg-secondary rounded">{source.type}</span>
                <span>Added on {new Date(source.dateAdded).toLocaleDateString()}</span>
            </div>
             <button
                onClick={handleDelete}
                className="absolute top-2 right-2 p-1.5 bg-card/50 text-muted-foreground rounded-full opacity-0 group-hover:opacity-100 hover:bg-destructive/20 hover:text-destructive transition-opacity"
                aria-label="Delete knowledge source"
            >
                <TrashIcon className="h-4 w-4" />
            </button>
        </div>
    );
};

export default KnowledgeSourceCard;
