import React, { useState } from 'react';
import { PromptTemplate, PromptTemplateVersion } from '../../types.ts';
import { ChevronDownIcon, RocketLaunchIcon } from '../icons/Icons.tsx';

interface VersionManagerProps {
  template: PromptTemplate;
  selectedVersion: PromptTemplateVersion;
  onVersionChange: (version: PromptTemplateVersion) => void;
  onDeploy: (version: string) => void;
  canEdit: boolean;
}

export const VersionManager: React.FC<VersionManagerProps> = ({ template, selectedVersion, onVersionChange, onDeploy, canEdit }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleSelect = (version: PromptTemplateVersion) => {
    onVersionChange(version);
    setIsDropdownOpen(false);
  }

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
      <h2 className="text-xl font-semibold">Template Content</h2>
      <div className="relative">
        <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="flex items-center gap-2 px-3 py-1.5 text-sm bg-secondary rounded-md hover:bg-accent w-full justify-between sm:w-auto">
          <span>Version {selectedVersion.version}</span>
          <ChevronDownIcon className={`h-4 w-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
        </button>
        {isDropdownOpen && (
          <div className="absolute right-0 mt-2 w-64 bg-popover rounded-md shadow-lg ring-1 ring-border py-1 z-10">
            {template.versions.map(v => (
              <div key={v.version} className="flex items-center justify-between px-4 py-2 text-sm text-popover-foreground hover:bg-accent group">
                <a onClick={() => handleSelect(v)} className="flex-1 cursor-pointer">
                  Version {v.version}
                  <span className="text-xs text-muted-foreground ml-2">{new Date(v.date).toLocaleDateString()}</span>
                </a>
                 {v.version === template.deployedVersion ? (
                     <span className="text-xs font-semibold bg-success/20 text-success px-2 py-0.5 rounded-full">Live</span>
                 ) : (
                    canEdit && (
                        <button onClick={() => onDeploy(v.version)} className="text-xs font-medium text-primary opacity-0 group-hover:opacity-100 flex items-center gap-1">
                            <RocketLaunchIcon className="h-3 w-3" />
                            Deploy
                        </button>
                    )
                 )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};