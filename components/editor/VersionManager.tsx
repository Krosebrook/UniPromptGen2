import React from 'react';
import { PromptTemplate, PromptTemplateVersion } from '../../types.ts';
import { RocketLaunchIcon, DocumentDuplicateIcon, PencilIcon, ScaleIcon, ArrowUturnLeftIcon } from '../icons/Icons.tsx';

interface VersionManagerProps {
  template: PromptTemplate;
  selectedVersion: PromptTemplateVersion;
  onVersionChange: (version: PromptTemplateVersion) => void;
  onDeploy: (versionString: string) => void;
  onCreateNewVersion: (sourceVersion: PromptTemplateVersion) => void;
  onStartCompare: () => void;
  onRevert: (sourceVersion: PromptTemplateVersion) => void;
  canEdit: boolean;
}

const VersionItem: React.FC<{
    version: PromptTemplateVersion;
    isDeployed: boolean;
    isSelected: boolean;
    canEdit: boolean;
    onSelect: () => void;
    onDeploy: () => void;
    onRevert: () => void;
    onCreateNew: () => void;
}> = ({ version, isDeployed, isSelected, canEdit, onSelect, onDeploy, onRevert, onCreateNew }) => {
    
    const author = {name: `User (${version.authorId.slice(-4)})`}; 

    return (
        <li className={`p-3 rounded-md transition-colors flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 ${isSelected ? 'bg-primary/20' : 'bg-secondary'}`}>
            <div className="flex-1">
                <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground">Version {version.version}</span>
                    {isDeployed && <span className="text-xs font-semibold bg-success/20 text-success px-2 py-0.5 rounded-full">Live</span>}
                    {isSelected && <span className="text-xs font-semibold bg-primary/20 text-primary px-2 py-0.5 rounded-full">Editing</span>}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                    Updated on {new Date(version.date).toLocaleDateString()} by {author.name}
                </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
                {!isSelected && (
                    <button onClick={onSelect} className="inline-flex items-center justify-center gap-1.5 px-3 py-1 text-xs font-medium bg-background rounded-md hover:bg-accent" title="Edit this version">
                        <PencilIcon className="h-3 w-3" /> Edit
                    </button>
                )}
                {canEdit && (
                    <>
                        {!isSelected && (
                             <button onClick={onRevert} className="inline-flex items-center justify-center gap-1.5 px-3 py-1 text-xs font-medium bg-background rounded-md hover:bg-accent" title="Load this version into the editor">
                                <ArrowUturnLeftIcon className="h-3 w-3" /> Revert
                            </button>
                        )}
                        <button onClick={onCreateNew} className="inline-flex items-center justify-center gap-1.5 px-3 py-1 text-xs font-medium bg-background rounded-md hover:bg-accent" title="Create a new version based on this one">
                            <DocumentDuplicateIcon className="h-3 w-3" /> New from this
                        </button>
                        <button onClick={onDeploy} disabled={isDeployed} className="inline-flex items-center justify-center gap-1.5 px-3 py-1 text-xs font-medium text-success-foreground bg-success rounded-md hover:bg-success/90 disabled:opacity-50" title="Set this version as live">
                            <RocketLaunchIcon className="h-3 w-3" /> Deploy
                        </button>
                    </>
                )}
            </div>
        </li>
    );
};


export const VersionManager: React.FC<VersionManagerProps> = ({ template, selectedVersion, onVersionChange, onDeploy, onCreateNewVersion, onStartCompare, onRevert, canEdit }) => {
  const sortedVersions = [...template.versions].sort((a, b) => {
    const [aMajor, aMinor] = a.version.split('.').map(Number);
    const [bMajor, bMinor] = b.version.split('.').map(Number);
    if (aMajor !== bMajor) return bMajor - aMajor;
    return (bMinor || 0) - (aMinor || 0);
  });

  return (
    <div className="bg-card shadow-card rounded-lg p-4">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Version History</h2>
            <button
              onClick={onStartCompare}
              disabled={template.versions.length < 2}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-1 text-xs font-medium bg-secondary rounded-md hover:bg-accent disabled:opacity-50"
              title={template.versions.length < 2 ? "Need at least 2 versions to compare" : "Compare versions"}
            >
              <ScaleIcon className="h-4 w-4" /> Compare
            </button>
        </div>
        <ul className="space-y-2">
            {sortedVersions.map(v => (
                <VersionItem
                    key={v.version}
                    version={v}
                    isDeployed={v.version === template.deployedVersion}
                    isSelected={v.version === selectedVersion.version}
                    canEdit={canEdit}
                    onSelect={() => onVersionChange(v)}
                    onDeploy={() => onDeploy(v.version)}
                    onRevert={() => onRevert(v)}
                    onCreateNew={() => onCreateNewVersion(v)}
                />
            ))}
        </ul>
    </div>
  );
};
