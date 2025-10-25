import React from 'react';
// FIX: Added file extension to fix module resolution error.
import { CollectionIcon, PlusIcon } from '../components/icons/Icons.tsx';
import { MOCK_KNOWLEDGE_SOURCES } from '../constants.ts';
import { KnowledgeSource, KnowledgeSourceType } from '../types.ts';

const typeStyles: Record<KnowledgeSourceType, { icon: string, color: string }> = {
    'PDF': { icon: '📄', color: 'text-red-400' },
    'Website': { icon: '🌐', color: 'text-blue-400' },
    'Text': { icon: '📝', color: 'text-gray-400' },
    'API': { icon: '🔗', color: 'text-green-400' },
};

const KnowledgeSourceCard: React.FC<{ source: KnowledgeSource }> = ({ source }) => {
    const style = typeStyles[source.type];
    return (
        <div className="bg-card shadow-card rounded-lg p-5 flex flex-col h-full">
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
        </div>
    );
};


const KnowledgeLibrary: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Knowledge Library</h1>
          <p className="text-muted-foreground">Manage internal documents and data sources for agent grounding.</p>
        </div>
        <button className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background">
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Knowledge Source
          </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MOCK_KNOWLEDGE_SOURCES.map(source => (
            <KnowledgeSourceCard key={source.id} source={source} />
        ))}
      </div>
    </div>
  );
};

export default KnowledgeLibrary;