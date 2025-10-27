



import React, { useState, useEffect } from 'react';
import type { KnowledgeNodeData, KnowledgeSource } from '../../types.ts';
import { getKnowledgeSources } from '../../services/apiService.ts';
import { useWorkspace } from '../../contexts/WorkspaceContext.tsx';
import { MOCK_LOGGED_IN_USER } from '../../constants.ts';

interface KnowledgeNodeConfigProps {
  data: KnowledgeNodeData;
  onUpdate: (data: Partial<KnowledgeNodeData>) => void;
}

const KnowledgeNodeConfig: React.FC<KnowledgeNodeConfigProps> = ({ data, onUpdate }) => {
  const { currentWorkspace } = useWorkspace();
  const [availableSources, setAvailableSources] = useState<KnowledgeSource[]>([]);
  
  useEffect(() => {
    if (currentWorkspace) {
        getKnowledgeSources(currentWorkspace.id, null, MOCK_LOGGED_IN_USER.id).then(setAvailableSources);
    }
  }, [currentWorkspace]);

  const handleSourceSelect = (sourceId: string) => {
    const selectedSource = availableSources.find(s => s.id === sourceId);
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
        <label htmlFor="knowledge-source" className="block text-sm font-medium text-foreground mb-1">Select Knowledge Source</label>
        <select
          id="knowledge-source"
          value={data.sourceId || ''}
          onChange={(e) => handleSourceSelect(e.target.value)}
          className="w-full p-2 text-sm bg-input rounded-md text-foreground focus:ring-2 focus:ring-ring focus:outline-none"
        >
          <option value="">-- Select a Source --</option>
          {availableSources.map(source => <option key={source.id} value={source.id}>{source.name}</option>)}
        </select>
      </div>
    </div>
  );
};

export default KnowledgeNodeConfig;