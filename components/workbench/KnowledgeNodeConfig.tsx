import React from 'react';
import { KnowledgeNodeData } from '../../types.ts';
import { MOCK_KNOWLEDGE_SOURCES } from '../../constants.ts';

interface KnowledgeNodeConfigProps {
  data: KnowledgeNodeData;
  onUpdate: (data: Partial<KnowledgeNodeData>) => void;
}

const KnowledgeNodeConfig: React.FC<KnowledgeNodeConfigProps> = ({ data, onUpdate }) => {
  
  const handleSourceSelect = (sourceId: string) => {
    const selectedSource = MOCK_KNOWLEDGE_SOURCES.find(s => s.id === sourceId);
    if (selectedSource) {
      onUpdate({
        sourceId: selectedSource.id,
        label: selectedSource.name,
      });
    } else {
        onUpdate({
            sourceId: null,
            label: 'Knowledge Source'
        });
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="knowledge-source" className="block text-sm font-medium text-foreground mb-1">Knowledge Source</label>
        <select
          id="knowledge-source"
          value={data.sourceId || ''}
          onChange={(e) => handleSourceSelect(e.target.value)}
          className="w-full p-2 text-sm bg-input rounded-md text-foreground focus:ring-2 focus:ring-ring focus:outline-none"
        >
          <option value="">-- Select a Source --</option>
          {MOCK_KNOWLEDGE_SOURCES.map(source => (
            <option key={source.id} value={source.id}>
              {source.name} ({source.type})
            </option>
          ))}
        </select>
        <p className="text-xs text-muted-foreground mt-1">
            Select a document or data source from the library to ground the model.
        </p>
      </div>
    </div>
  );
};

export default KnowledgeNodeConfig;