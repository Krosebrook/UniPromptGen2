import React, { useState } from 'react';
import { Folder } from '../../types.ts';
import { FolderIcon, EllipsisVerticalIcon } from '../icons/Icons.tsx';
import { usePermissions } from '../../hooks/usePermissions.ts';

interface FolderCardProps {
  folder: Folder;
  onDoubleClick: () => void;
  onDrop: (e: React.DragEvent) => void;
  onDragStart: (e: React.DragEvent, item: Folder) => void;
  onContextMenu: (e: React.MouseEvent, item: Folder) => void;
}

const FolderCard: React.FC<FolderCardProps> = ({ folder, onDoubleClick, onDrop, onDragStart, onContextMenu }) => {
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
      draggable={canEdit}
      onDragStart={(e) => onDragStart(e, folder)}
      onContextMenu={(e) => onContextMenu(e, folder)}
      className={`bg-card shadow-card rounded-lg p-4 flex flex-col justify-center items-center h-full group cursor-pointer transition-all relative ${ canEdit ? 'cursor-grab' : 'cursor-default'} ${
        isDragOver ? 'ring-2 ring-primary scale-105' : ''
      }`}
    >
      {canEdit && (
        <button
          onClick={(e) => { e.stopPropagation(); onContextMenu(e, folder); }}
          className="absolute top-2 right-2 p-1 rounded-full text-muted-foreground hover:bg-accent opacity-0 group-hover:opacity-100 transition-opacity z-10"
          aria-label="More options"
        >
          <EllipsisVerticalIcon className="h-5 w-5" />
        </button>
      )}
      <FolderIcon className="h-16 w-16 text-primary mb-2" />
      <h3 className="font-bold text-foreground text-center break-all">{folder.name}</h3>
      <p className="text-sm text-muted-foreground">{folder.itemCount} items</p>
    </div>
  );
};

export default FolderCard;