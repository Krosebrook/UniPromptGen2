import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { getTemplateById, saveTemplate, addTemplate, deployVersion } from '../services/apiService.ts';
import type { PromptTemplate, PromptTemplateVersion, PromptVariable } from '../types.ts';
import { useWorkspace } from '../contexts/WorkspaceContext.tsx';
import { SpinnerIcon } from '../components/icons/Icons.tsx';
import { TemplateHeader } from '../components/editor/TemplateHeader.tsx';
import { VersionManager } from '../components/editor/VersionManager.tsx';
import { VariableEditor } from '../components/editor/VariableEditor.tsx';
import ABTestManager from '../components/ab-testing/ABTestManager.tsx';
import ABTestResults from '../components/ab-testing/ABTestResults.tsx';
import CreateABTestModal from '../components/ab-testing/CreateABTestModal.tsx';

// A simple undo/redo hook
const useUndoRedo = <T,>(initialState: T) => {
  const [state, setState] = useState({
    past: [] as T[],
    present: initialState,
    future: [] as T[],
  });

  const canUndo = state.past.length > 0;
  const canRedo = state.future.length > 0;

  const set = useCallback((newState: T) => {
    setState(s => ({
      past: [...s.past, s.present],
      present: newState,
      future: [],
    }));
  }, []);

  const undo = useCallback(() => {
    if (!canUndo) return;
    setState(s => {
      const newPresent = s.past[s.past.length - 1];
      const newPast = s.past.slice(0, s.past.length - 1);
      return {
        past: newPast,
        present: newPresent,
        future: [s.present, ...s.future],
      };
    });
  }, [canUndo]);

  const redo = useCallback(() => {
    if (!canRedo) return;
    setState(s => {
      const newPresent = s.future[0];
      const newFuture = s.future.slice(1);
      return {
        past: [...s.past, s.present],
        present: newPresent,
        future: newFuture,
      };
    });
  }, [canRedo]);
  
  const reset = useCallback((newState: T) => {
      setState({ past: [], present: newState, future: [] });
  }, []);

  return { state: state.present, set, undo, redo, reset, canUndo, canRedo };
};


const NEW_TEMPLATE_VERSION: PromptTemplateVersion = {
  version: '1',
  name: 'New Prompt Template',
  description: 'A brief description of what this template does.',
  content: 'Your prompt content with {{variables}} goes here.',
  variables: [{ name: 'variable', type: 'string', defaultValue: '' }],
  riskLevel: 'Low',
  date: new Date().toISOString(),
};

const TemplateEditor: React.FC<{ templateId: string }> = ({ templateId }) => {
  const { currentWorkspace, currentUserRole } = useWorkspace();
  const [template, setTemplate] = useState<PromptTemplate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedVersion, setSelectedVersion] = useState<PromptTemplateVersion | null>(null);
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const selectedTest = template?.abTests[0] ?? null;

  const {
    state: editorState,
    set: setEditorState,
    undo,
    redo,
    reset: resetEditorState,
    canUndo,
    canRedo,
  } = useUndoRedo<PromptTemplateVersion>(NEW_TEMPLATE_VERSION);

  const isNewTemplate = templateId === 'new';
  const canEdit = currentUserRole === 'Admin' || currentUserRole === 'Editor';

  useEffect(() => {
    const loadTemplate = async () => {
      if (isNewTemplate) {
        setTemplate(null);
        setSelectedVersion(NEW_TEMPLATE_VERSION);
        resetEditorState(NEW_TEMPLATE_VERSION);
        setIsLoading(false);
      } else {
        try {
          const fetchedTemplate = await getTemplateById(templateId);
          if (fetchedTemplate) {
            setTemplate(fetchedTemplate);
            const activeVersion = fetchedTemplate.versions.find(v => v.version === fetchedTemplate.activeVersion) || fetchedTemplate.versions[0];
            setSelectedVersion(activeVersion);
            resetEditorState(activeVersion);
          } else {
            setError('Template not found.');
          }
        } catch (err) {
          setError('Failed to load template.');
        } finally {
          setIsLoading(false);
        }
      }
    };
    loadTemplate();
  }, [templateId, isNewTemplate, resetEditorState]);

  const handleVersionChange = (version: PromptTemplateVersion) => {
    setSelectedVersion(version);
    resetEditorState(version);
  };
  
  const handleEditorInputChange = (field: keyof PromptTemplateVersion, value: any) => {
    setEditorState({ ...editorState, [field]: value });
  };
  
  // Variable validation logic
  const variableErrors = useMemo(() => {
      const errors: Array<Record<string, string>> = [];
      const names = new Set<string>();
      editorState.variables.forEach((v, i) => {
          const currentErrors: Record<string, string> = {};
          if (!v.name) {
              currentErrors.name = "Name is required.";
          } else if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(v.name)) {
              currentErrors.name = "Invalid name format.";
          } else if (names.has(v.name)) {
              currentErrors.name = "Variable names must be unique.";
          }
          names.add(v.name);
          errors[i] = currentErrors;
      });
      return errors;
  }, [editorState.variables]);

  const isVariablesValid = variableErrors.every(e => Object.keys(e).length === 0);

  const handleSave = async () => {
    if (!isVariablesValid) {
        alert("Please fix variable errors before saving.");
        return;
    }
    setIsSaving(true);
    try {
        if (isNewTemplate) {
            if (!currentWorkspace) throw new Error("No workspace selected");
            const newTemplateData = {
                workspaceId: currentWorkspace.id,
                domain: 'General',
                versions: [editorState],
                activeVersion: '1',
                deployedVersion: null,
            };
            // @ts-ignore
            const created = await addTemplate(newTemplateData, currentWorkspace.id);
            window.location.hash = `#/templates/${created.id}`;
        } else if (template) {
            const newVersionNumber = String(Math.max(...template.versions.map(v => parseInt(v.version))) + 1);
            const newVersion = { ...editorState, version: newVersionNumber, date: new Date().toISOString() };
            const updatedTemplate = {
                ...template,
                versions: [...template.versions, newVersion],
                activeVersion: newVersionNumber, // Make new version active
            };
            const saved = await saveTemplate(updatedTemplate);
            setTemplate(saved);
            setSelectedVersion(newVersion);
            resetEditorState(newVersion);
        }
    } catch (err) {
        setError('Failed to save template.');
    } finally {
        setIsSaving(false);
    }
  };
  
  const handleDeploy = async (version: string) => {
      if (!template) return;
      if (window.confirm(`Are you sure you want to deploy Version ${version} to production?`)) {
          setIsSaving(true);
          try {
              const updated = await deployVersion(template.id, version);
              setTemplate(updated);
          } catch (e) {
              setError("Failed to deploy version.");
          } finally {
              setIsSaving(false);
          }
      }
  };
  
  const handleVariableChange = (index: number, field: keyof PromptVariable, value: any) => {
      const newVariables = [...editorState.variables];
      newVariables[index] = { ...newVariables[index], [field]: value };
      handleEditorInputChange('variables', newVariables);
  };
  
  const handleAddVariable = () => {
      const newVar = { name: `var${editorState.variables.length + 1}`, type: 'string', defaultValue: '' };
      handleEditorInputChange('variables', [...editorState.variables, newVar]);
  };
  
  const handleRemoveVariable = (index: number) => {
      handleEditorInputChange('variables', editorState.variables.filter((_, i) => i !== index));
  };

  if (isLoading) return <div className="flex justify-center items-center h-64"><SpinnerIcon className="h-8 w-8 text-primary" /><span className="ml-2">Loading...</span></div>;
  if (error) return <div className="text-destructive text-center">{error}</div>;

  return (
    <div className="space-y-6">
      <TemplateHeader 
          version={editorState}
          isNew={isNewTemplate}
          isSaving={isSaving}
          isUndoable={canUndo}
          isRedoable={canRedo}
          canEdit={canEdit}
          isVariablesValid={isVariablesValid}
          onInputChange={handleEditorInputChange}
          onUndo={undo}
          onRedo={redo}
          onSave={handleSave}
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
            {!isNewTemplate && template && selectedVersion && (
                <VersionManager 
                    template={template}
                    selectedVersion={selectedVersion}
                    onVersionChange={handleVersionChange}
                    onDeploy={handleDeploy}
                    canEdit={canEdit}
                />
            )}
            <textarea
              value={editorState.content}
              onChange={(e) => handleEditorInputChange('content', e.target.value)}
              disabled={!canEdit}
              className="w-full h-96 font-mono text-sm p-4 bg-card shadow-card rounded-lg border border-border focus:ring-2 focus:ring-ring focus:outline-none resize-y disabled:opacity-70"
            />
        </div>
        <div className="space-y-6">
           <VariableEditor 
             variables={editorState.variables}
             variableErrors={variableErrors}
             canEdit={canEdit}
             onVariableChange={handleVariableChange}
             onAddVariable={handleAddVariable}
             onRemoveVariable={handleRemoveVariable}
           />
           {!isNewTemplate && template && (
             <>
                <ABTestManager 
                    tests={template.abTests}
                    onStartTest={() => setIsTestModalOpen(true)}
                    onSelectTest={() => {}}
                />
                <ABTestResults test={selectedTest} />
             </>
           )}
        </div>
      </div>
      
      {isTestModalOpen && template && (
        <CreateABTestModal 
            versions={template.versions}
            onClose={() => setIsTestModalOpen(false)}
            onSave={(newTest) => { console.log('New test:', newTest); setIsTestModalOpen(false); }}
        />
      )}
    </div>
  );
};

export default TemplateEditor;
