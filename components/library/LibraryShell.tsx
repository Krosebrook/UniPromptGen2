import React, { useState, useCallback } from 'react';
import { useLibraryData } from '../../hooks/useLibraryData.ts';
import { SpinnerIcon, FolderIcon, PlusIcon, FolderPlusIcon, ArrowRightIcon, HomeIcon } from '../icons/Icons.tsx';
import FolderCard from './FolderCard.tsx';
import CreateFolderModal from './CreateFolderModal.tsx';
import { LibraryType, Folder, LibraryItem } from '../../types.ts';
import { useWorkspace } from '../../contexts/WorkspaceContext.tsx';
import { getFolders, moveItemToFolder, updateFolder, deleteFolder } from '../../services/apiService.ts';
import ContextMenu from '../common/ContextMenu.tsx';
import PermissionsModal from '../modals/PermissionsModal.tsx';
import RenameModal from '../modals/RenameModal.tsx';
import { usePermissions } from '../../hooks/usePermissions.ts';

interface LibraryShellProps<T extends LibraryItem> {
  libraryType: LibraryType;
  title: string;
  description: string;
  fetchDataFunction: (workspaceId: string, folderId: string | null, userId: string) => Promise<T[]>;
  createFolderFunction: (name: string, workspaceId: string, folderId: string | null) => Promise<Folder>;
  newItemLink?: string;
  renderItem: (
    item: T,
    canEdit: boolean,
    onDragStart: (e: React.DragEvent, item: T) => void,
    onContextMenu: (e: React.MouseEvent, item: T) => void
  ) => React.ReactNode;
}

const LibraryShell = <T extends LibraryItem>({
  libraryType,
  title,
  description,
  fetchDataFunction,
  createFolderFunction,
  newItemLink,
  renderItem,
}: LibraryShellProps<T>) => {
  const [currentFolder, setCurrentFolder] = useState<Folder | null>(null);
  const { currentWorkspace } = useWorkspace();
  const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false);
  const [draggedItem, setDraggedItem] = useState<LibraryItem | null>(null);

  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, item: LibraryItem } | null>(null);
  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<LibraryItem | null>(null);
  
  const { data, isLoading, error, refreshData } = useLibraryData(fetchDataFunction, libraryType, currentFolder?.id || null);
  const { data: folders, isLoading: foldersLoading, refreshData: refreshFolders } = useLibraryData(
    (wsId, folderId, userId) => getFolders(wsId, libraryType, folderId, userId),
    `${libraryType} folders`,
    currentFolder?.id || null
  );

  const { canEdit: canEditInCurrentFolder } = usePermissions(currentFolder);

  const handleCreateFolder = async (name: string) => {
    if (currentWorkspace) {
      await createFolderFunction(name, currentWorkspace.id, currentFolder?.id || null);
      refreshFolders();
      setIsCreateFolderModalOpen(false);
    }
  };

  const handleDragStart = (e: React.DragEvent, item: LibraryItem) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = 'move';
  };
  
  const handleDropOnFolder = async (e: React.DragEvent, targetFolder: Folder) => {
    e.preventDefault();
    if (draggedItem && draggedItem.id !== targetFolder.id && draggedItem.folderId !== targetFolder.id) {
      await moveItemToFolder(draggedItem.id, targetFolder.id, libraryType);
      refreshData();
      refreshFolders();
      setDraggedItem(null);
    }
  };
  
  const handleDropOnRoot = async (e: React.DragEvent) => {
      e.preventDefault();
      if (draggedItem && draggedItem.folderId !== null) {
          await moveItemToFolder(draggedItem.id, null, libraryType);
          refreshData();
          refreshFolders();
          setDraggedItem(null);
      }
  }

  const handleContextMenu = (e: React.MouseEvent, item: LibraryItem) => {
      e.preventDefault();
      setSelectedItem(item);
      setContextMenu({ x: e.pageX, y: e.pageY, item });
  };
  
  const closeContextMenu = () => {
    setContextMenu(null);
    setSelectedItem(null);
  };

  const handleDelete = async () => {
      if (!selectedItem || !('itemCount' in selectedItem)) return; // Only delete folders for now
      if (window.confirm(`Are you sure you want to delete the folder "${selectedItem.name}"? Items inside will be moved to the root.`)) {
          await deleteFolder(selectedItem.id);
          refreshFolders();
          if (currentFolder?.id === selectedItem.id) {
              setCurrentFolder(null); // Go to root if we deleted the folder we were in
          }
      }
  }

  const renderContent = () => {
    if (isLoading || foldersLoading) {
      return (
        <div className="flex justify-center items-center h-64">
          <SpinnerIcon className="h-8 w-8 text-primary" />
          <span className="ml-2 text-muted-foreground">Loading {title}...</span>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center text-destructive bg-destructive/10 p-4 rounded-md">
          <p className="font-semibold">An Error Occurred</p>
          <p>{error}</p>
        </div>
      );
    }

    const allItems = [...folders, ...data];

    if (allItems.length === 0) {
      return (
        <div className="text-center py-16 text-muted-foreground">
          <FolderIcon className="h-16 w-16 mx-auto mb-4" />
          <p className="text-lg">This folder is empty.</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {folders.map(folder => (
            <FolderCard 
                key={folder.id} 
                folder={folder} 
                onDoubleClick={() => setCurrentFolder(folder)}
                onDrop={(e) => handleDropOnFolder(e, folder)}
                onDragStart={(e) => handleDragStart(e, folder)}
                onContextMenu={(e) => handleContextMenu(e, folder)}
            />
        ))}
        {data.map(item => {
            const { canEdit: canEditItem } = usePermissions(item);
            return renderItem(item as T, canEditItem, handleDragStart, handleContextMenu);
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6" onDragOver={(e) => e.preventDefault()} onDrop={handleDropOnRoot}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <h1 className="text-3xl font-bold text-foreground">{title}</h1>
                <p className="text-muted-foreground">{description}</p>
            </div>
            <div className="flex items-center gap-2">
              {canEditInCurrentFolder && (
                <>
                  <button onClick={() => setIsCreateFolderModalOpen(true)} className="inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium bg-secondary rounded-md hover:bg-accent">
                      <FolderPlusIcon className="h-5 w-5" />
                      New Folder
                  </button>
                  {newItemLink && (
                      <a href={newItemLink} className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-md hover:bg-primary/90">
                          <PlusIcon className="h-5 w-5" />
                          New {libraryType.charAt(0).toUpperCase() + libraryType.slice(1)}
                      </a>
                  )}
                </>
              )}
            </div>
        </div>
        
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <HomeIcon className="h-5 w-5"/>
            <button onClick={() => setCurrentFolder(null)} className="hover:text-foreground">Root</button>
            {currentFolder && (
                <>
                    <ArrowRightIcon className="h-4 w-4" />
                    <span className="text-foreground">{currentFolder.name}</span>
                </>
            )}
        </div>

        {renderContent()}

        {isCreateFolderModalOpen && (
            <CreateFolderModal onClose={() => setIsCreateFolderModalOpen(false)} onSave={handleCreateFolder} />
        )}
        {contextMenu && <ContextMenu menu={contextMenu} onClose={closeContextMenu} onRename={() => setIsRenameModalOpen(true)} onShare={() => setIsPermissionsModalOpen(true)} onDelete={handleDelete} />}
        {isPermissionsModalOpen && selectedItem && <PermissionsModal item={selectedItem} itemType={ 'itemCount' in selectedItem ? 'folder' : libraryType} onClose={() => setIsPermissionsModalOpen(false)} />}
        {isRenameModalOpen && selectedItem && <RenameModal item={selectedItem} itemType={'itemCount' in selectedItem ? 'folder' : libraryType} onClose={() => setIsRenameModalOpen(false)} onRenamed={() => { refreshFolders(); refreshData(); }} />}
    </div>
  );
};

export default LibraryShell;