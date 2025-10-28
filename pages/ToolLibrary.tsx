import React from 'react';
import { getTools, createFolder } from '../services/apiService.ts';
import LibraryShell from '../components/library/LibraryShell.tsx';
import ToolCard from '../components/ToolCard.tsx';
import { Tool } from '../types.ts';

const ToolLibrary: React.FC = () => {
  return (
    <LibraryShell
      libraryType="tool"
      title="Tool Library"
      description="Browse and manage tools for your agents."
      fetchDataFunction={getTools}
      createFolderFunction={(name, workspaceId, folderId) => createFolder(name, 'tool', workspaceId, folderId)}
      renderItem={(item, canEdit, onDragStart, onContextMenu) => (
        <ToolCard
          tool={item as Tool}
          canEdit={canEdit}
          onDragStart={onDragStart}
          onContextMenu={onContextMenu}
        />
      )}
    />
  );
};

export default ToolLibrary;