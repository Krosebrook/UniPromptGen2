import React from 'react';
import { PromptVariable } from '../../types.ts';
import { PlusIcon, XCircleIcon } from '../icons/Icons.tsx';

interface VariableEditorProps {
  variables: PromptVariable[];
  variableErrors: Array<Record<string, string>>;
  canEdit: boolean;
  onVariableChange: (index: number, field: keyof PromptVariable, value: any) => void;
  onAddVariable: () => void;
  onRemoveVariable: (index: number) => void;
}

export const VariableEditor: React.FC<VariableEditorProps> = ({
  variables,
  variableErrors,
  canEdit,
  onVariableChange,
  onAddVariable,
  onRemoveVariable
}) => {
  return (
    <div className="bg-card shadow-card rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4">Variables</h3>
      <div className="space-y-3">
        {variables.map((v, index) => (
          <fieldset key={index} disabled={!canEdit} className="p-3 bg-secondary rounded-md space-y-2 disabled:opacity-70">
            <div className="flex items-start gap-2">
              <div className="flex-1">
                <label className="text-xs font-medium text-muted-foreground">Name</label>
                <input
                  type="text"
                  value={v.name}
                  onChange={(e) => onVariableChange(index, 'name', e.target.value)}
                  className={`w-full p-1.5 text-sm bg-input rounded-md text-foreground focus:outline-none focus:ring-2 ${variableErrors[index]?.name ? 'ring-destructive' : 'focus:ring-ring'}`}
                  placeholder="variable_name"
                />
                {variableErrors[index]?.name && <p className="text-xs text-destructive mt-1">{variableErrors[index].name}</p>}
              </div>
              <div className="flex-1">
                <label className="text-xs font-medium text-muted-foreground">Type</label>
                <select
                  value={v.type}
                  onChange={(e) => onVariableChange(index, 'type', e.target.value as PromptVariable['type'])}
                  className={`w-full p-1.5 text-sm bg-input rounded-md text-foreground focus:outline-none focus:ring-2 ${variableErrors[index]?.type ? 'ring-destructive' : 'focus:ring-ring'}`}
                >
                  <option value="string">String</option>
                  <option value="number">Number</option>
                  <option value="boolean">Boolean</option>
                </select>
                {variableErrors[index]?.type && <p className="text-xs text-destructive mt-1">{variableErrors[index].type}</p>}
              </div>
              <button onClick={() => onRemoveVariable(index)} className="mt-5 p-1.5 text-muted-foreground hover:text-destructive" aria-label="Remove variable" disabled={!canEdit}>
                <XCircleIcon className="h-5 w-5" />
              </button>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Default Value (optional)</label>
              {v.type === 'boolean' ? (
                <select
                  value={String(v.defaultValue)}
                  onChange={(e) => onVariableChange(index, 'defaultValue', e.target.value === 'true')}
                  className="w-full p-1.5 text-sm bg-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="true">True</option>
                  <option value="false">False</option>
                </select>
              ) : (
                <input
                  type={v.type === 'number' ? 'number' : 'text'}
                  value={v.defaultValue as string | number}
                  onChange={(e) => onVariableChange(index, 'defaultValue', e.target.value)}
                  className="w-full p-1.5 text-sm bg-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              )}
            </div>
          </fieldset>
        ))}
      </div>
      {canEdit && (
        <button onClick={onAddVariable} className="mt-4 w-full flex items-center justify-center gap-2 p-2 text-sm font-medium text-primary bg-secondary rounded-md hover:bg-accent">
          <PlusIcon className="h-5 w-5" />
          Add Variable
        </button>
      )}
    </div>
  );
};
