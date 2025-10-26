import React from 'react';
import { UserRole } from '../../types.ts';
import { CheckCircleIcon, XCircleIcon } from '../icons/Icons.tsx';

type Permission = 'Create/Edit Assets' | 'Delete Assets' | 'Deploy Templates' | 'Manage Members' | 'Manage Billing';

const rolePermissions: Record<UserRole, Record<Permission, boolean>> = {
    Admin: {
        'Create/Edit Assets': true,
        'Delete Assets': true,
        'Deploy Templates': true,
        'Manage Members': true,
        'Manage Billing': true,
    },
    Editor: {
        'Create/Edit Assets': true,
        'Delete Assets': true,
        'Deploy Templates': true,
        'Manage Members': false,
        'Manage Billing': false,
    },
    Viewer: {
        'Create/Edit Assets': false,
        'Delete Assets': false,
        'Deploy Templates': false,
        'Manage Members': false,
        'Manage Billing': false,
    },
};

const RolesSettings: React.FC = () => {
    const permissions: Permission[] = ['Create/Edit Assets', 'Delete Assets', 'Deploy Templates', 'Manage Members', 'Manage Billing'];
    const roles: UserRole[] = ['Admin', 'Editor', 'Viewer'];

    return (
         <div className="space-y-4">
            <div>
                <h2 className="text-xl font-bold text-foreground">Roles & Permissions</h2>
                <p className="text-sm text-muted-foreground">Understand what each role can do within a workspace.</p>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-secondary">
                        <tr>
                            <th className="p-3 font-semibold">Permission</th>
                            {roles.map(role => <th key={role} className="p-3 font-semibold text-center">{role}</th>)}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {permissions.map(permission => (
                            <tr key={permission}>
                                <td className="p-3 text-muted-foreground">{permission}</td>
                                {roles.map(role => (
                                    <td key={role} className="p-3 text-center">
                                        {rolePermissions[role][permission] ? 
                                            <CheckCircleIcon className="h-5 w-5 text-success mx-auto" /> :
                                            <XCircleIcon className="h-5 w-5 text-muted-foreground/50 mx-auto" />
                                        }
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
         </div>
    );
};

export default RolesSettings;