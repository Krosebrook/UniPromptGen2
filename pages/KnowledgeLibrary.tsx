import React, { useState } from 'react';
import { getKnowledgeSources, createFolder, createKnowledgeSource } from '../services/apiService.ts';
import LibraryShell from '../components/library/LibraryShell.tsx';
import KnowledgeSourceCard from '../components/KnowledgeSourceCard.tsx';
import { KnowledgeSource, KnowledgeSourceFormData, Folder } from '../types.ts';
import { useWorkspace } from '../contexts/WorkspaceContext.tsx';
import CreateKnowledgeSourceModal from '../components/modals/CreateKnowledgeSourceModal.tsx';


const KnowledgeLibrary: React.FC = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { currentWorkspace } = useWorkspace();
  const [refreshKey, setRefreshKey] = useState(0);
  const [modalFolderTarget, setModalFolderTarget] = useState<Folder | null>(null);

  const handleOpenCreateModal = (targetFolder: Folder | null) => {
      setModalFolderTarget(targetFolder);
      setIsCreateModalOpen(true);
  };

  const handleCreateSource = async (sourceData: KnowledgeSourceFormData) => {
      if (!currentWorkspace) return;
      await createKnowledgeSource(sourceData, currentWorkspace.id, modalFolderTarget?.id || null);
      setRefreshKey(k => k + 1); // Trigger a refresh
      setIsCreateModalOpen(false);
  };

  return (
    <>
      <LibraryShell
        libraryType="knowledge"
        title="Knowledge Library"
        description="Manage knowledge sources for grounding."
        fetchDataFunction={getKnowledgeSources}
        createFolderFunction={(name, workspaceId, folderId) => createFolder(name, 'knowledge', workspaceId, folderId)}
        onNewItemClick={handleOpenCreateModal}
        refreshKey={refreshKey}
        renderItem={(item, canEdit, onDragStart, onContextMenu, isFavorite, onToggleFavorite) => (
          <KnowledgeSourceCard
            source={item as KnowledgeSource}
            canEdit={canEdit}
            onDragStart={onDragStart}
            onContextMenu={onContextMenu}
          />
        )}
      />
      {isCreateModalOpen && (
        <CreateKnowledgeSourceModal 
            onClose={() => setIsCreateModalOpen(false)}
            onSave={handleCreateSource}
        />
      )}
    </>
  );
};

export default KnowledgeLibrary;
