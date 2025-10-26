import React, { useState, useEffect } from 'react';
import { LibraryItem, User, Permission, PermissionRole } from '../../types.ts';
import { useWorkspace } from '../../contexts/WorkspaceContext.tsx';
import { getUsersForWorkspace, updatePermissions } from '../../services/apiService.ts';
import { MOCK_LOGGED_IN_USER } from '../../constants.ts';

interface PermissionsModalProps {
    item: LibraryItem;
    itemType: 'template' | 'tool' | 'knowledge' | 'folder';
    onClose: () => void;
}

const PermissionsModal: React.FC<PermissionsModalProps> = ({ item, itemType, onClose }) => {
    const { currentWorkspace } = useWorkspace();
    const [permissions, setPermissions] = useState<Permission[]>(item.permissions);
    const [workspaceMembers, setWorkspaceMembers] = useState<User[]>([]);
    const [search, setSearch] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (currentWorkspace) {
            getUsersForWorkspace(currentWorkspace.id).then(setWorkspaceMembers);
        }
    }, [currentWorkspace]);

    const handleRoleChange = (userId: string, role: PermissionRole) => {
        setPermissions(current => {
            const existing = current.find(p => p.userId === userId);
            if (existing) {
                return current.map(p => p.userId === userId ? { ...p, role } : p);
            }
            return [...current, { userId, role }];
        });
    };

    const handleRemovePermission = (userId: string) => {
        setPermissions(current => current.filter(p => p.userId !== userId));
    };

    const handleSave = async () => {
        setIsSaving(true);
        await updatePermissions(item.id, itemType, permissions);
        setIsSaving(false);
        onClose();
    };
    
    const owner = workspaceMembers.find(m => m.id === item.ownerId);
    const permittedUsers = permissions.map(p => ({
        user: workspaceMembers.find(m => m.id === p.userId),
        role: p.role
    })).filter(p => p.user);

    const availableUsers = workspaceMembers.filter(member => 
        member.id !== item.ownerId &&
        !permissions.some(p => p.userId === member.id) &&
        (member.name.toLowerCase().includes(search.toLowerCase()) || member.email.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-popover w-full max-w-lg rounded-lg shadow-xl p-6 space-y-4" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold">Share "{item.name}"</h2>

                <input
                    type="text"
                    placeholder="Invite people by name or email..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full p-2 bg-input rounded-md text-foreground"
                />

                <div className="max-h-64 overflow-y-auto space-y-2 pr-2">
                    {/* Owner */}
                    {owner && (
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <img src={owner.avatarUrl} className="h-8 w-8 rounded-full" />
                                <div>
                                    <p className="text-sm font-semibold">{owner.name}</p>
                                    <p className="text-xs text-muted-foreground">{owner.email}</p>
                                </div>
                            </div>
                            <span className="text-sm text-muted-foreground">Owner</span>
                        </div>
                    )}
                    {/* Permitted Users */}
                    {permittedUsers.map(({ user, role }) => user && (
                        <div key={user.id} className="flex items-center justify-between">
                             <div className="flex items-center gap-3">
                                <img src={user.avatarUrl} className="h-8 w-8 rounded-full" />
                                <div>
                                    <p className="text-sm font-semibold">{user.name}</p>
                                    <p className="text-xs text-muted-foreground">{user.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <select value={role} onChange={e => handleRoleChange(user.id, e.target.value as PermissionRole)} className="p-1 text-xs bg-secondary rounded-md">
                                    <option value="Editor">Editor</option>
                                    <option value="Viewer">Viewer</option>
                                </select>
                                <button onClick={() => handleRemovePermission(user.id)} className="text-xs text-destructive hover:underline">Remove</button>
                            </div>
                        </div>
                    ))}
                    {/* Available Users */}
                     {search && availableUsers.map(user => (
                        <div key={user.id} className="flex items-center justify-between">
                             <div className="flex items-center gap-3">
                                <img src={user.avatarUrl} className="h-8 w-8 rounded-full" />
                                <div>
                                    <p className="text-sm font-semibold">{user.name}</p>
                                    <p className="text-xs text-muted-foreground">{user.email}</p>
                                </div>
                            </div>
                             <button onClick={() => handleRoleChange(user.id, 'Viewer')} className="px-3 py-1 text-xs bg-primary text-primary-foreground rounded-md">Add</button>
                        </div>
                    ))}
                </div>

                <div className="flex justify-end gap-2 pt-4">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium bg-secondary rounded-md hover:bg-accent">Cancel</button>
                    <button onClick={handleSave} disabled={isSaving} className="px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-md hover:bg-primary/90 disabled:opacity-50">
                        {isSaving ? 'Saving...' : 'Save'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PermissionsModal;