import React, { useState } from 'react';
import ProfileSettings from '../components/settings/ProfileSettings.tsx';
import MembersSettings from '../components/settings/MembersSettings.tsx';
import RolesSettings from '../components/settings/RolesSettings.tsx';
import BillingSettings from '../components/settings/BillingSettings.tsx';
import { UserCircleIcon, UserGroupIcon, ScaleIcon, CreditCardIcon } from '../components/icons/Icons.tsx';

type SettingsTab = 'profile' | 'members' | 'roles' | 'billing';

const TABS = [
  { id: 'profile', label: 'My Profile', icon: UserCircleIcon, component: ProfileSettings },
  { id: 'members', label: 'Workspace Members', icon: UserGroupIcon, component: MembersSettings },
  { id: 'roles', label: 'Roles & Permissions', icon: ScaleIcon, component: RolesSettings },
  { id: 'billing', label: 'Billing & Usage', icon: CreditCardIcon, component: BillingSettings },
];

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');

  const ActiveComponent = TABS.find(tab => tab.id === activeTab)?.component;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">Manage your personal and workspace settings.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-1/4">
          <nav className="flex flex-row md:flex-col gap-2">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as SettingsTab)}
                className={`flex items-center w-full text-left px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === tab.id
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                }`}
              >
                <tab.icon className="h-5 w-5 mr-3 flex-shrink-0" />
                {tab.label}
              </button>
            ))}
          </nav>
        </aside>

        <main className="flex-1">
          <div className="bg-card shadow-card rounded-lg p-6 min-h-[400px]">
            {ActiveComponent && <ActiveComponent />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Settings;