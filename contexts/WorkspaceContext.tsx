import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { Workspace, User, UserRole } from '../types.ts';
import { getWorkspacesByIds } from '../services/apiService.ts';

interface WorkspaceContextType {
    workspaces: Workspace[];
    currentWorkspace: Workspace | null;
    setCurrentWorkspace: (workspace: Workspace) => void;
    currentUserRole: UserRole | null;
    isLoading: boolean;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

interface WorkspaceProviderProps {
    children: ReactNode;
    user: User;
}

export const WorkspaceProvider: React.FC<WorkspaceProviderProps> = ({ children, user }) => {
    const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
    const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);
    const [currentUserRole, setCurrentUserRole] = useState<UserRole | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchUserWorkspaces = async () => {
            if (user && user.workspaces.length > 0) {
                const workspaceIds = user.workspaces.map(w => w.workspaceId);
                const fetchedWorkspaces = await getWorkspacesByIds(workspaceIds);
                setWorkspaces(fetchedWorkspaces);

                // Set initial workspace
                if (fetchedWorkspaces.length > 0) {
                    const initialWorkspace = fetchedWorkspaces[0];
                    setCurrentWorkspace(initialWorkspace);
                    const initialRole = user.workspaces.find(w => w.workspaceId === initialWorkspace.id)?.role || null;
                    setCurrentUserRole(initialRole);
                }
            }
            setIsLoading(false);
        };

        fetchUserWorkspaces();
    }, [user]);

    const handleSetCurrentWorkspace = (workspace: Workspace) => {
        setCurrentWorkspace(workspace);
        const role = user.workspaces.find(w => w.workspaceId === workspace.id)?.role || null;
        setCurrentUserRole(role);
    };

    const value = {
        workspaces,
        currentWorkspace,
        setCurrentWorkspace: handleSetCurrentWorkspace,
        currentUserRole,
        isLoading,
    };

    return (
        <WorkspaceContext.Provider value={value}>
            {children}
        </WorkspaceContext.Provider>
    );
};

export const useWorkspace = (): WorkspaceContextType => {
    const context = useContext(WorkspaceContext);
    if (context === undefined) {
        throw new Error('useWorkspace must be used within a WorkspaceProvider');
    }
    return context;
};
