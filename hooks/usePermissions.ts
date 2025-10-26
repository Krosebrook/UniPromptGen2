import { useWorkspace } from '../contexts/WorkspaceContext.tsx';
import { MOCK_LOGGED_IN_USER } from '../constants.ts';
import { LibraryItem } from '../types.ts';

export const usePermissions = (item: LibraryItem | null) => {
  const { currentUserRole } = useWorkspace();
  const userId = MOCK_LOGGED_IN_USER.id;

  if (!item) {
    return { canView: false, canEdit: false, canDelete: false, canShare: false };
  }

  // Admins can do anything
  if (currentUserRole === 'Admin') {
    return { canView: true, canEdit: true, canDelete: true, canShare: true };
  }

  // Owners can do anything to their own items
  const isOwner = item.ownerId === userId;
  if (isOwner) {
    return { canView: true, canEdit: true, canDelete: true, canShare: true };
  }

  // Check specific permissions
  const specificPermission = item.permissions.find(p => p.userId === userId);
  
  const canView = currentUserRole === 'Viewer' || currentUserRole === 'Editor' || !!specificPermission;
  const canEdit = specificPermission?.role === 'Editor';
  
  // Only owners and admins can delete/share
  const canDelete = false;
  const canShare = false;

  return { canView, canEdit, canDelete, canShare };
};