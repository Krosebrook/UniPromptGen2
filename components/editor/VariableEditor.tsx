
import React, { useState } from 'react';
import { PromptVariable } from '../../types.ts';
import { PlusIcon, XCircleIcon, Bars3Icon } from '../icons/Icons.tsx';

interface VariableEditorProps {
  variables: PromptVariable[];
  variableErrors: Array<Record<string, string>>;
  canEdit: boolean;
  onVariableChange: (index: number, field: keyof PromptVariable, value: any) => void;
  onAddVariable: () => void;
  onRemoveVariable: (index: number) => void;
  onVariableReorder: (dragIndex: number, dropIndex: number) => void;
}

export const VariableEditor: React.FC<VariableEditorProps> = ({
  variables,
  variableErrors,
  canEdit,
  onVariableChange,
  onAddVariable,
  onRemoveVariable,
  onVariableReorder,
}) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) {
      return;
    }
    onVariableReorder(draggedIndex, dropIndex);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  return (
    <div className="bg-card shadow-card rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4">Variables</h3>
      <div className="space-y-3">
        {variables.map((v, index) => (
          <div
            key={v.name + index} // Using name + index for a more stable key during re-renders
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, index)}
          >
            <fieldset
              draggable={canEdit}
              onDragStart={(e) => handleDragStart(e, index)}
              onDragEnd={handleDragEnd}
              disabled={!canEdit}
              className={`p-3 bg-secondary rounded-md space-y-2 disabled:opacity-70 transition-opacity ${
                canEdit ? 'cursor-grab' : ''
              } ${draggedIndex === index ? 'opacity-40' : 'opacity-100'}`}
            >
              <div className="flex items-start gap-2">
                {canEdit && (
                  <div className="mt-5 p-1 text-muted-foreground" aria-hidden="true">
                    <Bars3Icon className="h-5 w-5" />
                  </div>
                )}
                <div className="flex-1">
                  <label className="text-xs font-medium text-muted-foreground">Name</label>
                  <input
                    type="text"
                    value={v.name}
                    onChange={(e) => onVariableChange(index, 'name', e.target.value)}
                    className={`w-full p-1.5 text-sm bg-input rounded-md text-foreground focus:outline-none focus:ring-2 ${
                      variableErrors[index]?.name ? 'ring-destructive' : 'focus:ring-ring'
                    }`}
                    placeholder="variable_name"
                  />
                  {variableErrors[index]?.name && <p className="text-xs text-destructive mt-1">{variableErrors[index].name}</p>}
                </div>
                <div className="flex-1">
                  <label className="text-xs font-medium text-muted-foreground">Type</label>
                  <select
                    value={v.type}
                    onChange={(e) => onVariableChange(index, 'type', e.target.value as PromptVariable['type'])}
                    className={`w-full p-1.5 text-sm bg-input rounded-md text-foreground focus:outline-none focus:ring-2 ${
                      variableErrors[index]?.type ? 'ring-destructive' : 'focus:ring-ring'
                    }`}
                  >
                    <option value="string">String</option>
                    <option value="number">Number</option>
                    <option value="boolean">Boolean</option>
                  </select>
                  {variableErrors[index]?.type && <p className="text-xs text-destructive mt-1">{variableErrors[index].type}</p>}
                </div>
                <button
                  onClick={() => onRemoveVariable(index)}
                  className="mt-5 p-1.5 text-muted-foreground hover:text-destructive"
                  aria-label="Remove variable"
                  disabled={!canEdit}
                >
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
               <div>
                <label className="text-xs font-medium text-muted-foreground">Description (optional)</label>
                <textarea
                  value={v.description || ''}
                  onChange={(e) => onVariableChange(index, 'description', e.target.value)}
                  className="w-full p-1.5 text-sm bg-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-y"
                  rows={2}
                  placeholder="What is this variable for?"
                />
              </div>
            </fieldset>
          </div>
        ))}
      </div>
      {canEdit && (
        <button
          onClick={onAddVariable}
          className="mt-4 w-full flex items-center justify-center gap-2 p-2 text-sm font-medium text-primary-foreground bg-primary rounded-md hover:bg-primary/90"
        >
          <PlusIcon className="h-5 w-5" />
          Add Variable
        </button>
      )}
    </div>
  );
};
