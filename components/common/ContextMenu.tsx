import React, { useEffect, useRef } from 'react';
import { PencilIcon, ShareIcon, TrashIcon } from '../icons/Icons.tsx';
import { usePermissions } from '../../hooks/usePermissions.ts';
import { LibraryItem } from '../../types.ts';

interface ContextMenuProps {
  menu: { x: number; y: number; item: LibraryItem };
  onClose: () => void;
  onRename: () => void;
  onShare: () => void;
  onDelete: () => void;
}

const ContextMenu: React.FC<ContextMenuProps> = ({ menu, onClose, onRename, onShare, onDelete }) => {
  const ref = useRef<HTMLDivElement>(null);
  const { canEdit, canDelete, canShare } = usePermissions(menu.item);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);
  
  const handleAction = (action: () => void) => {
      action();
      onClose();
  }

  return (
    <div
      ref={ref}
      style={{ top: menu.y, left: menu.x }}
      className="fixed bg-popover rounded-md shadow-lg ring-1 ring-border py-1 z-50 w-40"
    >
      {canEdit && <button onClick={() => handleAction(onRename)} className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-popover-foreground hover:bg-accent"><PencilIcon className="h-4 w-4" /> Rename</button>}
      {canShare && <button onClick={() => handleAction(onShare)} className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-popover-foreground hover:bg-accent"><ShareIcon className="h-4 w-4" /> Share</button>}
      {canDelete && <button onClick={() => handleAction(onDelete)} className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-destructive hover:bg-accent"><TrashIcon className="h-4 w-4" /> Delete</button>}
      {(!canEdit && !canShare && !canDelete) && <div className="px-3 py-1.5 text-sm text-muted-foreground">No actions available</div>}
    </div>
  );
};

export default ContextMenu;