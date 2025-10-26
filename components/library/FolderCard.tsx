import React, { useState } from 'react';
import { Folder } from '../../types.ts';
import { FolderIcon } from '../icons/Icons.tsx';
import { usePermissions } from '../../hooks/usePermissions.ts';

interface FolderCardProps {
  folder: Folder;
  onDoubleClick: () => void;
  onDrop: (e: React.DragEvent) => void;
  onContextMenu: (e: React.MouseEvent) => void;
}

const FolderCard: React.FC<FolderCardProps> = ({ folder, onDoubleClick, onDrop, onContextMenu }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const { canEdit } = usePermissions(folder);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (canEdit) {
      e.dataTransfer.dropEffect = 'move';
      setIsDragOver(true);
    } else {
      e.dataTransfer.dropEffect = 'none';
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };
  
  const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      onDrop(e);
  };

  return (
    <div
      onDoubleClick={onDoubleClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onContextMenu={onContextMenu}
      className={`bg-card shadow-card rounded-lg p-4 flex flex-col justify-center items-center h-full group cursor-pointer transition-all ${
        isDragOver ? 'ring-2 ring-primary scale-105' : ''
      }`}
    >
      <FolderIcon className="h-16 w-16 text-primary mb-2" />
      <h3 className="font-bold text-foreground text-center break-all">{folder.name}</h3>
      <p className="text-sm text-muted-foreground">{folder.itemCount} items</p>
    </div>
  );
};

export default FolderCard;