import React, { useState } from 'react';
import { getTools, createFolder, createTool } from '../services/apiService.ts';
import LibraryShell from '../components/library/LibraryShell.tsx';
import ToolCard from '../components/ToolCard.tsx';
import { Tool, ToolFormData, Folder } from '../types.ts';
import { useWorkspace } from '../contexts/WorkspaceContext.tsx';
import CreateToolModal from '../components/modals/CreateToolModal.tsx';

const ToolLibrary: React.FC = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { currentWorkspace } = useWorkspace();
  const [refreshKey, setRefreshKey] = useState(0);
  const [modalFolderTarget, setModalFolderTarget] = useState<Folder | null>(null);

  const handleOpenCreateModal = (targetFolder: Folder | null) => {
    setModalFolderTarget(targetFolder);
    setIsCreateModalOpen(true);
  };

  const handleCreateTool = async (toolData: ToolFormData) => {
    if (!currentWorkspace) return;
    await createTool(toolData, currentWorkspace.id, modalFolderTarget?.id || null);
    setRefreshKey(k => k + 1); // Trigger a refresh
    setIsCreateModalOpen(false);
  };

  return (
    <>
      <LibraryShell
        libraryType="tool"
        title="Tool Library"
        description="Browse and manage tools for your agents."
        fetchDataFunction={getTools}
        createFolderFunction={(name, workspaceId, folderId) => createFolder(name, 'tool', workspaceId, folderId)}
        onNewItemClick={handleOpenCreateModal}
        refreshKey={refreshKey}
        renderItem={(item, canEdit, onDragStart, onContextMenu) => (
          <ToolCard
            tool={item as Tool}
            canEdit={canEdit}
            onDragStart={onDragStart}
            onContextMenu={onContextMenu}
          />
        )}
      />
      {isCreateModalOpen && (
        <CreateToolModal
          onClose={() => setIsCreateModalOpen(false)}
          onSave={handleCreateTool}
        />
      )}
    </>
  );
};

export default ToolLibrary;