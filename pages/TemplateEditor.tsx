import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { getTemplateById, saveTemplate } from '../services/apiService.ts';
import { PromptTemplate, PromptTemplateVersion, PromptVariable } from '../types.ts';
import { SpinnerIcon } from '../components/icons/Icons.tsx';
import { useImmer } from 'use-immer';
import { TemplateHeader } from '../components/editor/TemplateHeader.tsx';
import { VariableEditor } from '../components/editor/VariableEditor.tsx';
import { VersionManager } from '../components/editor/VersionManager.tsx';
import PromptAnalysisPanel from '../components/editor/PromptAnalysisPanel.tsx';
import { analyzePrompt } from '../services/promptAnalysisService.ts';
import ABTestManager from '../components/ab-testing/ABTestManager.tsx';
import ABTestResults from '../components/ab-testing/ABTestResults.tsx';
import CreateABTestModal from '../components/ab-testing/CreateABTestModal.tsx';
import { usePermissions } from '../hooks/usePermissions.ts';

interface TemplateEditorProps {
  templateId?: string;
}

const NEW_TEMPLATE_VERSION: PromptTemplateVersion = {
  version: '1.0',
  name: 'New Untitled Template',
  description: 'A brief description of what this template does.',
  content: 'Please provide context about {{query}}.',
  variables: [{ name: 'query', type: 'string', defaultValue: '' }],
  date: new Date().toISOString(),
  authorId: 'user-001',
};

const TemplateEditor: React.FC<TemplateEditorProps> = ({ templateId }) => {
  const [template, setTemplate] = useImmer<PromptTemplate | null>(null);
  const [selectedVersion, setSelectedVersion] = useState<PromptTemplateVersion>(NEW_TEMPLATE_VERSION);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Undo/Redo state
  const [history, setHistory] = useState<PromptTemplateVersion[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // A/B Testing state
  const [isABTestModalOpen, setIsABTestModalOpen] = useState(false);
  const [selectedABTest, setSelectedABTest] = useState<any | null>(null);
  
  const { canEdit } = usePermissions(template);

  const isNewTemplate = templateId === 'new' || !templateId;

  useEffect(() => {
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
        name: 'New Untitled Template'
      };
      setTemplate(newTemplateObject);
      setSelectedVersion(NEW_TEMPLATE_VERSION);
      setHistory([NEW_TEMPLATE_VERSION]);
      setHistoryIndex(0);
      setIsLoading(false);
    } else if (templateId) {
      getTemplateById(templateId).then(data => {
        if (data) {
          setTemplate(data);
          const active = data.versions.find(v => v.version === data.activeVersion) || data.versions[0];
          setSelectedVersion(active);
          setHistory([active]);
          setHistoryIndex(0);
        }
        setIsLoading(false);
      });
    }
  }, [templateId, isNewTemplate, setTemplate]);
  
  const updateSelectedVersion = useCallback((updater: (draft: PromptTemplateVersion) => void) => {
      const newVersion = JSON.parse(JSON.stringify(selectedVersion));
      updater(newVersion);

      // Add to history
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(newVersion);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);

      setSelectedVersion(newVersion);
  }, [selectedVersion, history, historyIndex]);
  
  const handleInputChange = useCallback((field: keyof PromptTemplateVersion, value: any) => {
    updateSelectedVersion(draft => {
        (draft as any)[field] = value;
    });
  }, [updateSelectedVersion]);
  
  const handleVariableChange = useCallback((index: number, field: keyof PromptVariable, value: any) => {
    updateSelectedVersion(draft => {
        (draft.variables[index] as any)[field] = value;
    });
  }, [updateSelectedVersion]);

  const handleAddVariable = useCallback(() => {
    updateSelectedVersion(draft => {
      draft.variables.push({ name: 'new_variable', type: 'string', defaultValue: '' });
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

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setSelectedVersion(history[newIndex]);
      setHistoryIndex(newIndex);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setSelectedVersion(history[newIndex]);
      setHistoryIndex(newIndex);
    }
  };
  
  const handleSave = async () => {
      if (!isVariablesValid || !template) return;
      setIsSaving(true);
      
      let templateToSave: Partial<PromptTemplate>;
      
      if (isNewTemplate) {
          templateToSave = {
            ...template,
            name: selectedVersion.name,
            versions: [selectedVersion],
            activeVersion: selectedVersion.version,
          };
      } else {
          const versionExists = template.versions.some(v => v.version === selectedVersion.version);
          const updatedVersions = versionExists
              ? template.versions.map(v => v.version === selectedVersion.version ? selectedVersion : v)
              : [...template.versions, selectedVersion];

          templateToSave = {
            ...template,
            name: selectedVersion.name,
            versions: updatedVersions,
            activeVersion: selectedVersion.version,
          };
      }
      
      const savedTemplate = await saveTemplate(templateToSave);
      
      if (isNewTemplate) {
          window.location.hash = `#/templates/${savedTemplate.id}`;
      } else {
        setTemplate(savedTemplate);
      }

      setIsSaving(false);
  };
  
  const variableErrors = useMemo(() => {
    return selectedVersion.variables.map(variable => {
      const errors: Record<string, string> = {};
      if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(variable.name)) {
        errors.name = "Invalid name format. Use letters, numbers, and underscores. Cannot start with a number.";
      }
      if (selectedVersion.variables.filter(v => v.name === variable.name).length > 1) {
          errors.name = "Variable names must be unique.";
      }
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
        isSaving={isSaving}
        isUndoable={historyIndex > 0}
        isRedoable={historyIndex < history.length - 1}
        canEdit={canEdit}
        isVariablesValid={isVariablesValid}
        onInputChange={handleInputChange}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onSave={handleSave}
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
            <VersionManager 
                template={template}
                selectedVersion={selectedVersion}
                onVersionChange={setSelectedVersion}
                onDeploy={() => {}} // TODO: Implement deploy
                canEdit={canEdit}
            />
             <textarea
                value={selectedVersion.content}
                onChange={(e) => handleInputChange('content', e.target.value)}
                className="w-full h-96 p-4 bg-card shadow-card rounded-md text-foreground font-mono text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-ring resize-y disabled:opacity-70 disabled:cursor-not-allowed"
                placeholder="Enter your prompt template here..."
                disabled={!canEdit}
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
                tests={[]}
                onStartTest={() => setIsABTestModalOpen(true)}
                onSelectTest={setSelectedABTest}
            />
        </div>
      </div>
      {isABTestModalOpen && template && <CreateABTestModal versions={template.versions} onClose={() => setIsABTestModalOpen(false)} onSave={() => {}} />}
      {selectedABTest && template && <ABTestResults test={selectedABTest} template={template} onClose={() => setSelectedABTest(null)} onDeclareWinner={() => {}} />}
    </div>
  );
};

export default TemplateEditor;