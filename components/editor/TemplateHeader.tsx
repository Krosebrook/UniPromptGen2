import React, { useState, useEffect, useRef } from 'react';
import { PromptTemplateVersion } from '../../types.ts';
import { ArrowUturnLeftIcon, ArrowUturnRightIcon, RocketLaunchIcon, DocumentDuplicateIcon, ChevronDownIcon } from '../icons/Icons.tsx';

interface TemplateHeaderProps {
  version: PromptTemplateVersion;
  isNew: boolean;
  actionInProgress: 'none' | 'save' | 'deploy';
  isUndoable: boolean;
  isRedoable: boolean;
  canEdit: boolean;
  isVariablesValid: boolean;
  isDeployed: boolean;
  onInputChange: (field: keyof PromptTemplateVersion, value: any) => void;
  onUndo: () => void;
  onRedo: () => void;
  onSave: () => void;
  onSaveAndDeploy: () => void;
  onSaveAsNewVersion: (bump: 'minor' | 'major') => void;
  nextVersionNumbers: { minor: string; major: string };
}

export const TemplateHeader: React.FC<TemplateHeaderProps> = ({
  version,
  isNew,
  actionInProgress,
  isUndoable,
  isRedoable,
  canEdit,
  isVariablesValid,
  isDeployed,
  onInputChange,
  onUndo,
  onRedo,
  onSave,
  onSaveAndDeploy,
  onSaveAsNewVersion,
  nextVersionNumbers,
}) => {
  const [isVersionMenuOpen, setIsVersionMenuOpen] = useState(false);
  const versionMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (versionMenuRef.current && !versionMenuRef.current.contains(event.target as Node)) {
            setIsVersionMenuOpen(false);
        }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
        document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [versionMenuRef]);

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div className="flex-1">
        <input
          type="text"
          value={version.name}
          onChange={(e) => onInputChange('name', e.target.value)}
          className="w-full text-3xl font-bold text-foreground bg-transparent focus:outline-none focus:ring-2 focus:ring-ring rounded-md px-2 -mx-2 disabled:cursor-not-allowed"
          disabled={!canEdit}
        />
        <textarea
          value={version.description}
          onChange={(e) => onInputChange('description', e.target.value)}
          className="w-full text-muted-foreground max-w-2xl bg-transparent focus:outline-none focus:ring-2 focus:ring-ring rounded-md px-2 -mx-2 mt-1 resize-none disabled:cursor-not-allowed"
          rows={2}
          disabled={!canEdit}
        />
      </div>
      <div className="flex items-center gap-2">
        {canEdit && (
          <>
            <button onClick={onUndo} disabled={!isUndoable} className="p-2 rounded-md bg-secondary hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed" aria-label="Undo">
              <ArrowUturnLeftIcon className="h-5 w-5" />
            </button>
            <button onClick={onRedo} disabled={!isRedoable} className="p-2 rounded-md bg-secondary hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed" aria-label="Redo">
              <ArrowUturnRightIcon className="h-5 w-5" />
            </button>
            
            <div className="relative" ref={versionMenuRef}>
              <button
                onClick={() => setIsVersionMenuOpen(prev => !prev)}
                disabled={!isUndoable}
                title={!isUndoable ? "Make a change to save as a new version" : "Save current changes as a new version"}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium bg-secondary rounded-md hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
              >
                  <DocumentDuplicateIcon className="h-5 w-5" />
                  Save as New Version
                  <ChevronDownIcon className="h-4 w-4" />
              </button>
              {isVersionMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-popover rounded-md shadow-lg ring-1 ring-border z-10 py-1">
                      <button
                          onClick={() => { onSaveAsNewVersion('minor'); setIsVersionMenuOpen(false); }}
                          className="w-full text-left flex flex-col px-3 py-2 text-sm text-popover-foreground hover:bg-accent"
                      >
                          <span>Save as Minor Version</span>
                          <span className="text-xs text-muted-foreground">Creates v{nextVersionNumbers.minor}</span>
                      </button>
                      <button
                          onClick={() => { onSaveAsNewVersion('major'); setIsVersionMenuOpen(false); }}
                          className="w-full text-left flex flex-col px-3 py-2 text-sm text-popover-foreground hover:bg-accent"
                      >
                          <span>Save as Major Version</span>
                          <span className="text-xs text-muted-foreground">Creates v{nextVersionNumbers.major}</span>
                      </button>
                  </div>
              )}
            </div>

            <button
              onClick={onSave}
              disabled={actionInProgress !== 'none' || !isVariablesValid}
              className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-success-foreground bg-success rounded-md hover:bg-success/90 disabled:opacity-50"
            >
              {actionInProgress === 'save' ? 'Saving...' : (isNew ? 'Create Template' : 'Save Changes')}
            </button>
             <button
              onClick={onSaveAndDeploy}
              disabled={actionInProgress !== 'none' || !isVariablesValid || (isDeployed && !isUndoable && !isRedoable)}
              className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-md hover:bg-primary/90 disabled:opacity-50"
            >
              <RocketLaunchIcon className="h-4 w-4 mr-2"/>
              {actionInProgress === 'deploy' ? 'Deploying...' : 'Save & Deploy'}
            </button>
          </>
        )}
      </div>
    </div>
  );
};