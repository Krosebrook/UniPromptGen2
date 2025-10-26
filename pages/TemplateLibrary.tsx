import React from 'react';
import { getTemplates, createFolder } from '../services/apiService.ts';
import LibraryShell from '../components/library/LibraryShell.tsx';
import TemplateCard from '../components/TemplateCard.tsx';
import { PromptTemplate } from '../types.ts';

const TemplateLibrary: React.FC = () => {
  return (
    <LibraryShell
      libraryType="template"
      title="Template Library"
      description="Browse and manage prompt templates."
      fetchDataFunction={getTemplates}
      createFolderFunction={(name, workspaceId) => createFolder(name, 'template', workspaceId)}
      newItemLink="/templates/new"
      renderItem={(item, canEdit, onDragStart, onContextMenu) => (
        <TemplateCard
          template={item as PromptTemplate}
          canEdit={canEdit}
          onDragStart={onDragStart}
          onContextMenu={onContextMenu}
        />
      )}
    />
  );
};

export default TemplateLibrary;