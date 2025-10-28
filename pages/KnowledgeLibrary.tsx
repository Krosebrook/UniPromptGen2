import React from 'react';
import { getKnowledgeSources, createFolder } from '../services/apiService.ts';
import LibraryShell from '../components/library/LibraryShell.tsx';
import KnowledgeSourceCard from '../components/KnowledgeSourceCard.tsx';
import { KnowledgeSource } from '../types.ts';

const KnowledgeLibrary: React.FC = () => {
  return (
    <LibraryShell
      libraryType="knowledge"
      title="Knowledge Library"
      description="Manage knowledge sources for grounding."
      fetchDataFunction={getKnowledgeSources}
      createFolderFunction={(name, workspaceId, folderId) => createFolder(name, 'knowledge', workspaceId, folderId)}
      renderItem={(item, canEdit, onDragStart, onContextMenu) => (
        <KnowledgeSourceCard
          source={item as KnowledgeSource}
          canEdit={canEdit}
          onDragStart={onDragStart}
          onContextMenu={onContextMenu}
        />
      )}
    />
  );
};

export default KnowledgeLibrary;