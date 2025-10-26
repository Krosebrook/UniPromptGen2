import React from 'react';
import { PromptTemplateVersion } from '../../types.ts';
import { ArrowUturnLeftIcon, ArrowUturnRightIcon } from '../icons/Icons.tsx';

interface TemplateHeaderProps {
  version: PromptTemplateVersion;
  isNew: boolean;
  isSaving: boolean;
  isUndoable: boolean;
  isRedoable: boolean;
  canEdit: boolean;
  isVariablesValid: boolean;
  onInputChange: (field: keyof PromptTemplateVersion, value: any) => void;
  onUndo: () => void;
  onRedo: () => void;
  onSave: () => void;
}

export const TemplateHeader: React.FC<TemplateHeaderProps> = ({
  version,
  isNew,
  isSaving,
  isUndoable,
  isRedoable,
  canEdit,
  isVariablesValid,
  onInputChange,
  onUndo,
  onRedo,
  onSave
}) => {
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
            <button
              onClick={onSave}
              disabled={isSaving || !isVariablesValid}
              className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-success-foreground bg-success rounded-md hover:bg-success/90 disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : (isNew ? 'Create Template' : 'Save Changes')}
            </button>
          </>
        )}
      </div>
    </div>
  );
};
