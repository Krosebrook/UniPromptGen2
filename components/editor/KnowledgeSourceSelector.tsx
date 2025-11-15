import React from 'react';
import { KnowledgeSource } from '../../types.ts';
import { CollectionIcon } from '../icons/Icons.tsx';

interface KnowledgeSourceSelectorProps {
    selectedSourceId: string | null | undefined;
    sources: KnowledgeSource[];
    onSelectSource: (sourceId: string | null) => void;
    canEdit: boolean;
}

const KnowledgeSourceSelector: React.FC<KnowledgeSourceSelectorProps> = ({
    selectedSourceId,
    sources,
    onSelectSource,
    canEdit,
}) => {
    const selectedSource = sources.find(s => s.id === selectedSourceId);

    return (
        <div className="bg-card shadow-card rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <CollectionIcon className="h-5 w-5 text-primary" />
                Knowledge Source (RAG)
            </h3>
            <p className="text-sm text-muted-foreground mb-3">
                Ground this prompt template with a knowledge source. This will provide additional context to the model at runtime.
            </p>
            <select
                value={selectedSourceId || ''}
                onChange={(e) => onSelectSource(e.target.value || null)}
                disabled={!canEdit}
                className="w-full p-2 bg-input rounded-md text-foreground focus:ring-2 focus:ring-ring focus:outline-none disabled:opacity-70"
            >
                <option value="">None</option>
                {sources.map(source => (
                    <option key={source.id} value={source.id}>
                        {source.name}
                    </option>
                ))}
            </select>
            {selectedSource && (
                <div className="mt-3 text-xs text-muted-foreground p-2 bg-secondary rounded-md">
                    <p className="font-semibold">{selectedSource.name}</p>
                    <p>{selectedSource.description}</p>
                </div>
            )}
        </div>
    );
};

export default KnowledgeSourceSelector;
