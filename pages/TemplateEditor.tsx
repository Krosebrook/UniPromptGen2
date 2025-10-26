import React, { useState, useCallback, useEffect } from 'react';
import { getTemplateById, getEvaluationsByTemplateId, createTemplate, updateTemplate } from '../services/apiService.ts';
import { PromptTemplate, PromptTemplateVersion, Evaluation, PromptVariable } from '../types.ts';
import QualityScoreDisplay from '../components/QualityScoreDisplay.tsx';
import { PlayIcon, StarIcon, ChevronDownIcon, ArrowUturnLeftIcon, ArrowUturnRightIcon, PlusIcon, XCircleIcon, SpinnerIcon } from '../components/icons/Icons.tsx';
import ABTestManager from '../components/ab-testing/ABTestManager.tsx';
import { useWorkspace } from '../contexts/WorkspaceContext.tsx';

interface TemplateEditorProps {
  templateId: string;
}

interface History<T> {
  past: T[];
  present: T;
  future: T[];
}

const getNewTemplateVersion = (): PromptTemplateVersion => ({
    version: '1.0',
    name: 'New Prompt Template',
    description: 'A brief description of what this template does.',
    date: new Date().toISOString(),
    comment: 'Initial version.',
    riskLevel: 'Low',
    content: 'Your prompt content with {{variables}} goes here.',
    variables: [{ name: 'variable', type: 'string', defaultValue: '' }],
});

const TemplateEditor: React.FC<TemplateEditorProps> = ({ templateId }) => {
  const { currentWorkspace, currentUserRole } = useWorkspace();
  const isNew = templateId === 'new';
  const canEdit = currentUserRole === 'Admin' || currentUserRole === 'Editor';

  const [template, setTemplate] = useState<PromptTemplate | null>(null);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [history, setHistory] = useState<History<PromptTemplateVersion> | null>(null);
  const [isVersionDropdownOpen, setIsVersionDropdownOpen] = useState(false);
  const [variableErrors, setVariableErrors] = useState<Array<Record<string, string>>>([]);
  const [isVariablesValid, setIsVariablesValid] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      setHistory(null);
      
      if (isNew) {
        setTemplate(null); // No existing template
        setEvaluations([]);
        setHistory({
            past: [],
            present: getNewTemplateVersion(),
            future: [],
        });
        setIsLoading(false);
        return;
      }
      
      try {
        const templateData = await getTemplateById(templateId);
        if (!templateData) {
          throw new Error('Template not found.');
        }
        // Basic security: check if template belongs to the current workspace
        if (templateData.workspaceId !== currentWorkspace?.id) {
          throw new Error("Access denied. This template does not belong to the current workspace.");
        }

        const evaluationsData = await getEvaluationsByTemplateId(templateId);
        
        setTemplate(templateData);
        setEvaluations(evaluationsData);

        const initialVersion = templateData.versions.find(v => v.version === templateData.activeVersion);
        if (initialVersion) {
            setHistory({
                past: [],
                present: initialVersion,
                future: []
            });
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load template data.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    if (currentWorkspace) {
        fetchData();
    }
  }, [templateId, isNew, currentWorkspace]);


  const validateVariables = useCallback((variables: PromptVariable[]) => {
    const errors: Array<Record<string, string>> = [];
    const names = new Set();
    variables.forEach((v, index) => {
        const error: Record<string, string> = {};
        if (!v.name.trim()) {
            error.name = 'Name cannot be empty.';
        } else if (!/^[a-zA-Z0-9_]+$/.test(v.name)) {
            error.name = 'Name can only contain letters, numbers, and underscores.';
        } else if (names.has(v.name)) {
            error.name = 'Variable names must be unique.';
        }
        names.add(v.name);

        if (!v.type) {
            error.type = 'Type must be selected.';
        }
        errors[index] = error;
    });
    setVariableErrors(errors);
    const isValid = errors.every(e => Object.keys(e).length === 0);
    setIsVariablesValid(isValid);
  }, []);

  useEffect(() => {
    if (history?.present.variables) {
        validateVariables(history.present.variables);
    }
  }, [history?.present.variables, validateVariables]);

  const handleUndo = () => {
    if (!canEdit) return;
    setHistory(currentHistory => {
      if (!currentHistory || currentHistory.past.length === 0) return currentHistory;
      const previous = currentHistory.past[currentHistory.past.length - 1];
      const newPast = currentHistory.past.slice(0, currentHistory.past.length - 1);
      return {
        past: newPast,
        present: previous,
        future: [currentHistory.present, ...currentHistory.future]
      };
    });
  };

  const handleRedo = () => {
    if (!canEdit) return;
    setHistory(currentHistory => {
      if (!currentHistory || currentHistory.future.length === 0) return currentHistory;
      const next = currentHistory.future[0];
      const newFuture = currentHistory.future.slice(1);
      return {
        past: [...currentHistory.past, currentHistory.present],
        present: next,
        future: newFuture
      };
    });
  };

  const handleInputChange = (field: keyof PromptTemplateVersion, value: any) => {
    if (!canEdit) return;
    setHistory(currentHistory => {
      if (!currentHistory) return null;
      const newPresent = { ...currentHistory.present, [field]: value };
      return {
        past: [...currentHistory.past, currentHistory.present],
        present: newPresent,
        future: [] 
      };
    });
  };
  
  const handleVersionChange = (version: PromptTemplateVersion) => {
    setHistory({
        past: [],
        present: version,
        future: []
    });
    setIsVersionDropdownOpen(false);
  }

  const handleVariableChange = (index: number, field: keyof PromptVariable, value: string | number | boolean) => {
    if (!canEdit) return;
    if (field === 'type' && !['string', 'number', 'boolean'].includes(value as string)) {
        return;
    }

    setHistory(currentHistory => {
        if (!currentHistory) return null;
        
        const newVariables = currentHistory.present.variables.map((v, i) => {
            if (i === index) {
                const newVar = { ...v, [field]: value };
                if (field === 'type') {
                    if (value === 'boolean') newVar.defaultValue = false;
                    else if (value === 'number') newVar.defaultValue = 0;
                    else newVar.defaultValue = '';
                }
                return newVar;
            }
            return v;
        });

        const newPresent = { ...currentHistory.present, variables: newVariables };
        return {
            past: [...currentHistory.past, currentHistory.present],
            present: newPresent,
            future: []
        };
    });
  };

  const handleAddVariable = () => {
      if (!canEdit) return;
      setHistory(currentHistory => {
          if (!currentHistory) return null;
          const existingNames = new Set(currentHistory.present.variables.map(v => v.name));
          let newName = 'new_variable';
          let counter = 1;
          while(existingNames.has(newName)) {
              newName = `new_variable_${counter++}`;
          }
          
          const newVariable: PromptVariable = { 
              name: newName,
              type: 'string', 
              defaultValue: '' 
          };
          const newVariables = [...currentHistory.present.variables, newVariable];
          const newPresent = { ...currentHistory.present, variables: newVariables };
          return {
              past: [...currentHistory.past, currentHistory.present],
              present: newPresent,
              future: []
          };
      });
  };

  const handleRemoveVariable = (index: number) => {
      if (!canEdit) return;
      setHistory(currentHistory => {
          if (!currentHistory) return null;
          const newVariables = currentHistory.present.variables.filter((_, i) => i !== index);
          const newPresent = { ...currentHistory.present, variables: newVariables };
          return {
              past: [...currentHistory.past, currentHistory.present],
              present: newPresent,
              future: []
          };
      });
  };

  const handleSave = async () => {
    if (!history || !isVariablesValid || !currentWorkspace) return;
    setIsSaving(true);
    setError(null);
    try {
        if (isNew) {
            await createTemplate(history.present, currentWorkspace.id);
        } else if (template) {
            // This is a simplified update. A real app would have more complex version management.
            const updatedTemplate = {
                ...template,
                versions: template.versions.map(v => v.version === history.present.version ? history.present : v)
            };
            await updateTemplate(updatedTemplate);
        }
        window.location.hash = '#/templates';
    } catch(err) {
        setError(err instanceof Error ? err.message : 'Failed to save template.');
        console.error(err);
        setIsSaving(false);
    }
  };


  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <SpinnerIcon className="h-8 w-8 text-primary" />
        <span className="ml-2 text-muted-foreground">Loading Template...</span>
      </div>
    );
  }

  if (error && !isSaving) { // Don't show generic load error if a save error occurs
    return (
      <div className="text-center p-8">
        <p className="text-destructive">{error}</p>
        <a href="#/templates" className="mt-4 inline-block text-primary hover:underline">Return to Library</a>
      </div>
    );
  }

  if (!history) {
    return <div className="text-center p-8">Template data could not be loaded. <a href="#/templates" className="text-primary hover:underline">Return to Library</a></div>;
  }
  
  const { present: selectedVersion } = history;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex-1">
          <input
             type="text"
             value={selectedVersion.name}
             onChange={(e) => handleInputChange('name', e.target.value)}
             className="w-full text-3xl font-bold text-foreground bg-transparent focus:outline-none focus:ring-2 focus:ring-ring rounded-md px-2 -mx-2 disabled:cursor-not-allowed"
             disabled={!canEdit}
           />
           <textarea
             value={selectedVersion.description}
             onChange={(e) => handleInputChange('description', e.target.value)}
             className="w-full text-muted-foreground max-w-2xl bg-transparent focus:outline-none focus:ring-2 focus:ring-ring rounded-md px-2 -mx-2 mt-1 resize-none disabled:cursor-not-allowed"
             rows={2}
             disabled={!canEdit}
           />
        </div>
        <div className="flex items-center gap-2">
            {canEdit && (
                <>
                <button onClick={handleUndo} disabled={history.past.length === 0} className="p-2 rounded-md bg-secondary hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed" aria-label="Undo">
                    <ArrowUturnLeftIcon className="h-5 w-5" />
                </button>
                 <button onClick={handleRedo} disabled={history.future.length === 0} className="p-2 rounded-md bg-secondary hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed" aria-label="Redo">
                    <ArrowUturnRightIcon className="h-5 w-5" />
                </button>
                <button 
                  onClick={handleSave} 
                  disabled={isSaving || !isVariablesValid}
                  className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-success-foreground bg-success rounded-md hover:bg-success/90 disabled:opacity-50"
                >
                    {isSaving ? 'Saving...' : (isNew ? 'Create Template' : 'Save Changes')}
                </button>
                </>
            )}
        </div>
      </div>
       {error && isSaving && (
            <div className="text-center text-destructive bg-destructive/10 p-2 rounded-md text-sm">
                <p>{error}</p>
            </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
            <div className="bg-card shadow-card rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Template Content</h2>
                    {!isNew && template && (
                        <div className="relative">
                            <button onClick={() => setIsVersionDropdownOpen(!isVersionDropdownOpen)} className="flex items-center gap-2 px-3 py-1.5 text-sm bg-secondary rounded-md hover:bg-accent">
                                Version {selectedVersion.version}
                                <ChevronDownIcon className={`h-4 w-4 transition-transform ${isVersionDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>
                            {isVersionDropdownOpen && (
                                 <div className="absolute right-0 mt-2 w-48 bg-popover rounded-md shadow-lg ring-1 ring-border py-1 z-10">
                                    {template.versions.map(v => (
                                        <a key={v.version} onClick={() => handleVersionChange(v)} className="block px-4 py-2 text-sm text-popover-foreground hover:bg-accent cursor-pointer">
                                            Version {v.version} {v.version === template.activeVersion && '(Active)'}
                                        </a>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
                 <textarea
                    value={selectedVersion.content}
                    onChange={(e) => handleInputChange('content', e.target.value)}
                    className="w-full h-80 p-4 font-mono text-sm bg-input rounded-md text-foreground focus:ring-2 focus:ring-ring focus:outline-none resize-y disabled:cursor-not-allowed"
                    disabled={!canEdit}
                />
            </div>
             {!isNew && template && (
                <>
                    <div className="bg-card shadow-card rounded-lg p-6">
                         <h2 className="text-xl font-semibold mb-4">Version History</h2>
                         <ul className="space-y-4">
                             {template.versions.map(v => (
                                 <li key={v.version} className="border-l-2 pl-4 border-border">
                                     <p className="font-semibold">Version {v.version} <span className="text-xs font-normal text-muted-foreground">- {new Date(v.date).toLocaleDateString()}</span></p>
                                     <p className="text-sm text-muted-foreground">{v.comment}</p>
                                 </li>
                             ))}
                         </ul>
                     </div>
                     <ABTestManager template={template} />
                </>
             )}

        </div>

        {/* Right Column */}
        <div className="space-y-6">
             {!isNew && template && (
                <div className="bg-card shadow-card rounded-lg p-6 text-center">
                    <h3 className="text-lg font-semibold mb-4">Quality Score</h3>
                    <QualityScoreDisplay score={template.qualityScore} size="lg" />
                    <p className="text-xs text-muted-foreground mt-2">Based on {template.metrics.totalRuns.toLocaleString()} runs</p>
                </div>
             )}
            <div className="bg-card shadow-card rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Variables</h3>
                <div className="space-y-3">
                    {selectedVersion.variables.map((v, index) => (
                        <fieldset key={index} disabled={!canEdit} className="p-3 bg-secondary rounded-md space-y-2 disabled:opacity-70">
                            <div className="flex items-start gap-2">
                                <div className="flex-1">
                                    <label className="text-xs font-medium text-muted-foreground">Name</label>
                                    <input
                                        type="text"
                                        value={v.name}
                                        onChange={(e) => handleVariableChange(index, 'name', e.target.value)}
                                        className={`w-full p-1.5 text-sm bg-input rounded-md text-foreground focus:outline-none focus:ring-2 ${variableErrors[index]?.name ? 'ring-destructive' : 'focus:ring-ring'}`}
                                        placeholder="variable_name"
                                    />
                                    {variableErrors[index]?.name && <p className="text-xs text-destructive mt-1">{variableErrors[index].name}</p>}
                                </div>
                                <div className="flex-1">
                                    <label className="text-xs font-medium text-muted-foreground">Type</label>
                                    <select
                                        value={v.type}
                                        onChange={(e) => handleVariableChange(index, 'type', e.target.value as PromptVariable['type'])}
                                        className={`w-full p-1.5 text-sm bg-input rounded-md text-foreground focus:outline-none focus:ring-2 ${variableErrors[index]?.type ? 'ring-destructive' : 'focus:ring-ring'}`}
                                    >
                                        <option value="string">String</option>
                                        <option value="number">Number</option>
                                        <option value="boolean">Boolean</option>
                                    </select>
                                    {variableErrors[index]?.type && <p className="text-xs text-destructive mt-1">{variableErrors[index].type}</p>}
                                </div>
                                <button onClick={() => handleRemoveVariable(index)} className="mt-5 p-1.5 text-muted-foreground hover:text-destructive" aria-label="Remove variable" disabled={!canEdit}>
                                    <XCircleIcon className="h-5 w-5" />
                                </button>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-muted-foreground">Default Value (optional)</label>
                                {v.type === 'boolean' ? (
                                    <select
                                        value={String(v.defaultValue)}
                                        onChange={(e) => handleVariableChange(index, 'defaultValue', e.target.value === 'true')}
                                        className="w-full p-1.5 text-sm bg-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                    >
                                        <option value="true">True</option>
                                        <option value="false">False</option>
                                    </select>
                                ) : (
                                    <input
                                        type={v.type === 'number' ? 'number' : 'text'}
                                        value={v.defaultValue as string | number}
                                        onChange={(e) => handleVariableChange(index, 'defaultValue', e.target.value)}
                                        className="w-full p-1.5 text-sm bg-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                    />
                                )}
                            </div>
                        </fieldset>
                    ))}
                </div>
                {canEdit && (
                    <button onClick={handleAddVariable} className="mt-4 w-full flex items-center justify-center gap-2 p-2 text-sm font-medium text-primary bg-secondary rounded-md hover:bg-accent">
                        <PlusIcon className="h-5 w-5" />
                        Add Variable
                    </button>
                )}
            </div>
            {!isNew && template && (
                <div className="bg-card shadow-card rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4">Recent Evaluations</h3>
                    {evaluations.length > 0 ? (
                        <ul className="space-y-3">
                            {evaluations.map(e => (
                                 <li key={e.id} className="flex items-start gap-3">
                                    <img src={e.evaluator.avatarUrl} alt={e.evaluator.name} className="h-8 w-8 rounded-full" />
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="font-semibold text-sm">{e.evaluator.name}</p>
                                            <div className="flex items-center text-xs text-warning">
                                                <StarIcon className="h-4 w-4 mr-0.5" />
                                                <span>{e.score}/100</span>
                                            </div>
                                        </div>
                                        <p className="text-sm text-muted-foreground italic">"{e.comment}"</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-muted-foreground text-center">No evaluations yet.</p>
                    )}
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default TemplateEditor;