import React, { useState, useEffect } from 'react';
import { useWorkspace } from '../../contexts/WorkspaceContext.tsx';
import { getUsersForWorkspace } from '../../services/apiService.ts';
import { User, UserRole } from '../../types.ts';
import { SpinnerIcon, PlusIcon } from '../icons/Icons.tsx';

const roleColors: Record<UserRole, string> = {
    Admin: 'bg-primary/20 text-primary',
    Editor: 'bg-info/20 text-info',
    Viewer: 'bg-secondary text-muted-foreground'
};

const MembersSettings: React.FC = () => {
    const { currentWorkspace } = useWorkspace();
    const [members, setMembers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchMembers = async () => {
            if (currentWorkspace) {
                setIsLoading(true);
                const fetchedMembers = await getUsersForWorkspace(currentWorkspace.id);
                setMembers(fetchedMembers);
                setIsLoading(false);
            }
        };
        fetchMembers();
    }, [currentWorkspace]);

    const getRoleForUser = (user: User): UserRole | undefined => {
        return user.workspaces.find(ws => ws.workspaceId === currentWorkspace?.id)?.role;
    }

    if (isLoading) {
        return <div className="flex justify-center items-center h-48"><SpinnerIcon className="h-8 w-8 text-primary" /></div>;
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                 <div>
                    <h2 className="text-xl font-bold text-foreground">Workspace Members</h2>
                    <p className="text-sm text-muted-foreground">Manage who has access to the '{currentWorkspace?.name}' workspace.</p>
                </div>
                <button className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-md hover:bg-primary/90 disabled:opacity-50" disabled>
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Invite Member
                </button>
            </div>
           
            <div className="divide-y divide-border">
                {members.map(member => (
                    <div key={member.id} className="flex items-center justify-between py-3">
                        <div className="flex items-center gap-4">
                            <img src={member.avatarUrl} alt={member.name} className="h-10 w-10 rounded-full" />
                            <div>
                                <p className="font-semibold text-foreground">{member.name}</p>
                                <p className="text-sm text-muted-foreground">{member.title}</p>
                            </div>
                        </div>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${roleColors[getRoleForUser(member) || 'Viewer']}`}>
                            {getRoleForUser(member)}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MembersSettings;