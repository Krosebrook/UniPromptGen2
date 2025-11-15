import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { getTemplateById, saveTemplate, addComment, updateComment } from '../services/apiService.ts';
import { PromptTemplate, PromptTemplateVersion, PromptVariable, ABTest, Comment } from '../types.ts';
import { SpinnerIcon } from '../components/icons/Icons.tsx';
import { useImmer } from 'use-immer';
import { TemplateHeader } from '../components/editor/TemplateHeader.tsx';
import { VariableEditor } from '../components/editor/VariableEditor.tsx';
import { VersionManager } from '../components/editor/VersionManager.tsx';
import PromptAnalysisPanel from '../components/editor/PromptAnalysisPanel.tsx';
import CommentsPanel from '../components/editor/CommentsPanel.tsx';
import { analyzePrompt } from '../services/promptAnalysisService.ts';
import ABTestManager from '../components/ab-testing/ABTestManager.tsx';
import ABTestResults from '../components/ab-testing/ABTestResults.tsx';
import CreateABTestModal from '../components/ab-testing/CreateABTestModal.tsx';
import { usePermissions } from '../hooks/usePermissions.ts';
import { MOCK_LOGGED_IN_USER } from '../constants.ts';
import TemplatePreviewPanel from '../components/editor/TemplatePreviewPanel.tsx';
import { useHistory } from '../hooks/useHistory.ts';
import { useABTesting } from '../hooks/useABTesting.ts';
import VersionComparisonModal from '../components/editor/VersionComparisonModal.tsx';

interface TemplateEditorProps {
  templateId?: string;
}

const NEW_TEMPLATE_VERSION: PromptTemplateVersion = {
  version: '1.0',
  name: 'New Untitled Template',
  description: 'A brief description of what this template does.',
  content: 'Please provide context about {{query}}.',
  variables: [{ name: 'query', type: 'string', defaultValue: '', description: 'The main input or question for the prompt.' }],
  date: new Date().toISOString(),
  authorId: 'user-001',
};

const TemplateEditor: React.FC<TemplateEditorProps> = ({ templateId }) => {
  const [template, setTemplate] = useImmer<PromptTemplate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actionInProgress, setActionInProgress] = useState<'none' | 'save' | 'deploy'>('none');
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  
  const isNewTemplate = templateId === 'new' || !templateId;

  const {
    state: selectedVersion,
    setState: updateSelectedVersion,
    undo: handleUndo,
    redo: handleRedo,
    reset: resetHistory,
    canUndo,
    canRedo,
  } = useHistory(NEW_TEMPLATE_VERSION);
  
  const {
    abTests,
    isABTestModalOpen,
    setIsABTestModalOpen,
    selectedABTest,
    setSelectedABTest,
    createTest: handleCreateABTest,
    declareWinner: handleDeclareWinner,
  } = useABTesting(isNewTemplate ? undefined : templateId);

  const { canEdit } = usePermissions(template);

  useEffect(() => {
    const loadTemplate = async () => {
        if (isNewTemplate) {
          const newTemplateObject: PromptTemplate = {
            id: 'new',
            folderId: null,
            domain: 'General',
            qualityScore: 0,
            versions: [NEW_TEMPLATE_VERSION],
            activeVersion: '1.0',
            deployedVersion: null,
            metrics: { totalRuns: 0, successfulRuns: 0, avgUserRating: 0, totalUserRating: 0, taskSuccessRate: 0, efficiencyScore: 0 },
            createdBy: 'user-001',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            ownerId: 'user-001',
            permissions: [],
            comments: [],
            name: 'New Untitled Template'
          };
          setTemplate(newTemplateObject);
          resetHistory(NEW_TEMPLATE_VERSION);
          setIsLoading(false);
        } else if (templateId) {
          const data = await getTemplateById(templateId);
          if (data) {
            setTemplate(data);
            const active = data.versions.find(v => v.version === data.activeVersion) || data.versions[0];
            resetHistory(active);
          }
          setIsLoading(false);
        }
    };
    loadTemplate();
  }, [templateId, isNewTemplate, setTemplate, resetHistory]);
  
  const handleInputChange = useCallback((field: keyof PromptTemplateVersion, value: any) => {
    updateSelectedVersion(draft => {
        (draft as any)[field] = value;
    });
  }, [updateSelectedVersion]);
  
  const handleVariableChange = useCallback((index: number, field: keyof PromptVariable, value: any) => {
    updateSelectedVersion(draft => {
      if (!draft.variables[index]) return;

      const oldName = draft.variables[index].name;
      (draft.variables[index] as any)[field] = value;

      if (field === 'name' && oldName && oldName !== value && /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(oldName)) {
        const oldVarRegex = new RegExp(`\\{\\{\\s*${oldName}\\s*\\}\\}`, 'g');
        draft.content = draft.content.replace(oldVarRegex, `{{${value}}}`);
      }
      
      if (field === 'type') {
          switch(value) {
              case 'boolean': draft.variables[index].defaultValue = false; break;
              case 'number': draft.variables[index].defaultValue = 0; break;
              case 'date': draft.variables[index].defaultValue = ''; break;
              case 'file': draft.variables[index].defaultValue = ''; break;
              default: draft.variables[index].defaultValue = ''; break;
          }
      }
    });
  }, [updateSelectedVersion]);

  const handleAddVariable = useCallback(() => {
    updateSelectedVersion(draft => {
      draft.variables.push({ name: 'new_variable', type: 'string', defaultValue: '', description: '' });
    });
  }, [updateSelectedVersion]);
  
  const handleRemoveVariable = useCallback((index: number) => {
    updateSelectedVersion(draft => {
      draft.variables.splice(index, 1);
    });
  }, [updateSelectedVersion]);
  
  const handleVariableReorder = useCallback((dragIndex: number, dropIndex: number) => {
      updateSelectedVersion(draft => {
          const [draggedItem] = draft.variables.splice(dragIndex, 1);
          draft.variables.splice(dropIndex, 0, draggedItem);
      });
  }, [updateSelectedVersion]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const isModifier = isMac ? event.metaKey : event.ctrlKey;

      if (isModifier && event.key.toLowerCase() === 'z') {
        event.preventDefault();
        if (event.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      }
      if (!isMac && isModifier && event.key.toLowerCase() === 'y') {
          event.preventDefault();
          handleRedo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo]);
  
  const handleSave = async () => {
      if (!isVariablesValid || !template) return;
      setActionInProgress('save');
      
      const versionExists = !isNewTemplate && template.versions.some(v => v.version === selectedVersion.version);
      const updatedVersions = versionExists
          ? template.versions.map(v => v.version === selectedVersion.version ? selectedVersion : v)
          : [...(template.versions || []), selectedVersion];

      const templateToSave: Partial<PromptTemplate> = {
        ...template,
        name: selectedVersion.name,
        versions: updatedVersions,
        activeVersion: selectedVersion.version,
      };
      
      const savedTemplate = await saveTemplate(templateToSave);
      
      if (isNewTemplate) {
          window.location.hash = `#/templates/${savedTemplate.id}`;
      } else {
        setTemplate(savedTemplate);
        const newSelectedVersion = savedTemplate.versions.find(v => v.version === savedTemplate.activeVersion) || selectedVersion;
        resetHistory(newSelectedVersion);
      }

      setActionInProgress('none');
  };

    const handleDeploy = async (versionString: string) => {
      if (!template) return;
      setActionInProgress('deploy');
      const savedTemplate = await saveTemplate({ ...template, deployedVersion: versionString });
      setTemplate(savedTemplate);
      setActionInProgress('none');
  };

  const handleSaveAndDeploy = async () => {
    if (!isVariablesValid || !template) return;
    setActionInProgress('deploy');

    const versionExists = !isNewTemplate && template.versions.some(v => v.version === selectedVersion.version);
    const updatedVersions = versionExists
        ? template.versions.map(v => v.version === selectedVersion.version ? selectedVersion : v)
        : [...(template.versions || []), selectedVersion];

    const templateToSave = {
      ...template,
      name: selectedVersion.name,
      versions: updatedVersions,
      activeVersion: selectedVersion.version,
    };
    
    const savedTemplate = await saveTemplate(templateToSave);
    const deployedTemplate = await saveTemplate({ ...savedTemplate, deployedVersion: savedTemplate.activeVersion });

    if (isNewTemplate) {
        window.location.hash = `#/templates/${deployedTemplate.id}`;
    } else {
      setTemplate(deployedTemplate);
      const newSelectedVersion = deployedTemplate.versions.find(v => v.version === deployedTemplate.activeVersion) || selectedVersion;
      resetHistory(newSelectedVersion);
    }
    setActionInProgress('none');
  };

  const handleCreateNewVersion = useCallback((sourceVersion: PromptTemplateVersion) => {
    if (!template) return;

    const [sourceMajor] = sourceVersion.version.split('.').map(Number);
    
    const maxMinor = Math.max(-1, ...template.versions
        .filter(v => parseInt(v.version.split('.')[0], 10) === sourceMajor)
        .map(v => parseInt(v.version.split('.')[1] || '0', 10))
    );
    const newVersionNumber = `${sourceMajor}.${maxMinor + 1}`;
    
    const newVersion: PromptTemplateVersion = {
        ...JSON.parse(JSON.stringify(sourceVersion)), // Deep copy
        version: newVersionNumber,
        date: new Date().toISOString(),
        authorId: MOCK_LOGGED_IN_USER.id,
    };
    
    setTemplate(draft => {
        if (draft) {
            draft.versions.push(newVersion);
            draft.activeVersion = newVersion.version;
        }
    });
    resetHistory(newVersion);
  }, [template, setTemplate, resetHistory]);

  const handleRevertToVersion = useCallback((sourceVersion: PromptTemplateVersion) => {
    if (!template) return;

    // This is a "soft" revert. It loads the state of the old version into the editor.
    // The user must then explicitly save to persist this change.
    const revertedState = JSON.parse(JSON.stringify(sourceVersion)); // Deep copy
    resetHistory(revertedState);
  }, [template, resetHistory]);
  
  const handleAddComment = useCallback(async (text: string) => {
    if (!template || isNewTemplate) return;
    
    const newCommentData = {
        version: selectedVersion.version,
        authorId: MOCK_LOGGED_IN_USER.id,
        text,
    };
    
    const addedComment = await addComment(template.id, newCommentData);
    
    setTemplate(draft => {
        if (draft) {
            draft.comments.push(addedComment);
        }
    });
  }, [template, isNewTemplate, selectedVersion, setTemplate]);

  const handleUpdateComment = useCallback(async (commentId: string, updates: Partial<Comment>) => {
    if (!template || isNewTemplate) return;

    const updatedComment = await updateComment(template.id, commentId, updates);
    
    setTemplate(draft => {
        if (draft) {
            const index = draft.comments.findIndex(c => c.id === commentId);
            if (index !== -1) {
                draft.comments[index] = updatedComment;
            }
        }
    });
  }, [template, isNewTemplate, setTemplate]);

  const variableErrors = useMemo(() => {
    const nameCounts = new Map<string, number>();
    selectedVersion.variables.forEach(v => nameCounts.set(v.name, (nameCounts.get(v.name) || 0) + 1));

    return selectedVersion.variables.map(variable => {
      const errors: Record<string, string> = {};
      if (!variable.name.trim()) errors.name = "Variable name cannot be empty.";
      else if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(variable.name)) errors.name = "Invalid name format.";
      else if ((nameCounts.get(variable.name) || 0) > 1) errors.name = "Variable names must be unique.";
      return errors;
    });
  }, [selectedVersion.variables]);

  const isVariablesValid = variableErrors.every(err => Object.keys(err).length === 0);
  const analysis = useMemo(() => analyzePrompt(selectedVersion.content, selectedVersion.variables), [selectedVersion.content, selectedVersion.variables]);

  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><SpinnerIcon className="h-8 w-8 text-primary" /></div>;
  }

  if (!selectedVersion || !template) {
    return <div className="text-center text-destructive">Could not load template data.</div>;
  }

  return (
    <div className="space-y-6">
      <TemplateHeader
        version={selectedVersion}
        isNew={isNewTemplate}
        actionInProgress={actionInProgress}
        isUndoable={canUndo}
        isRedoable={canRedo}
        canEdit={canEdit}
        isVariablesValid={isVariablesValid}
        isDeployed={selectedVersion.version === template.deployedVersion}
        onInputChange={handleInputChange}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onSave={handleSave}
        onSaveAndDeploy={handleSaveAndDeploy}
        onCreateNewVersion={() => handleCreateNewVersion(selectedVersion)}
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
            <VersionManager
                template={template}
                selectedVersion={selectedVersion}
                onVersionChange={resetHistory}
                onDeploy={handleDeploy}
                onCreateNewVersion={handleCreateNewVersion}
                onStartCompare={() => setIsCompareModalOpen(true)}
                onRevert={handleRevertToVersion}
                canEdit={canEdit}
            />
             <textarea
                value={selectedVersion.content}
                onChange={(e) => handleInputChange('content', e.target.value)}
                className="w-full h-96 p-4 bg-card shadow-card rounded-md text-foreground font-mono text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-ring resize-y disabled:opacity-70 disabled:cursor-not-allowed"
                placeholder="Enter your prompt template here..."
                disabled={!canEdit}
            />
            <TemplatePreviewPanel 
                variables={selectedVersion.variables}
                content={selectedVersion.content}
            />
        </div>
        <div className="space-y-6">
            <VariableEditor
                variables={selectedVersion.variables}
                variableErrors={variableErrors}
                canEdit={canEdit}
                onVariableChange={handleVariableChange}
                onAddVariable={handleAddVariable}
                onRemoveVariable={handleRemoveVariable}
                onVariableReorder={handleVariableReorder}
            />
            <PromptAnalysisPanel analysis={analysis} />
            <ABTestManager 
                tests={abTests}
                onStartTest={() => setIsABTestModalOpen(true)}
                onSelectTest={setSelectedABTest}
                canCreateTest={template.versions.length >= 2}
            />
            <CommentsPanel
                templateId={template.id}
                comments={template.comments}
                selectedVersionString={selectedVersion.version}
                onAddComment={handleAddComment}
                onUpdateComment={handleUpdateComment}
                canComment={!isNewTemplate && canEdit}
            />
        </div>
      </div>
      {isABTestModalOpen && template && <CreateABTestModal versions={template.versions} onClose={() => setIsABTestModalOpen(false)} onSave={handleCreateABTest} />}
      {selectedABTest && template && <ABTestResults test={selectedABTest} template={template} onClose={() => setSelectedABTest(null)} onDeclareWinner={handleDeclareWinner} />}
      {isCompareModalOpen && template && (
        <VersionComparisonModal versions={template.versions} onClose={() => setIsCompareModalOpen(false)} />
      )}
    </div>
  );
};

export default TemplateEditor;