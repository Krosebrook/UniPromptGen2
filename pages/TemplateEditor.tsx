
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { getTemplateById, saveTemplate, getABTestsForTemplate, createABTest, declareWinner } from '../services/apiService.ts';
import { PromptTemplate, PromptTemplateVersion, PromptVariable, ABTest } from '../types.ts';
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
import { MOCK_LOGGED_IN_USER } from '../constants.ts';
import TemplatePreviewPanel from '../components/editor/TemplatePreviewPanel.tsx';

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
  const [actionInProgress, setActionInProgress] = useState<'none' | 'save' | 'deploy'>('none');
  
  // Undo/Redo state
  const [history, setHistory] = useState<PromptTemplateVersion[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // A/B Testing state
  const [abTests, setAbTests] = useState<ABTest[]>([]);
  const [isABTestModalOpen, setIsABTestModalOpen] = useState(false);
  const [selectedABTest, setSelectedABTest] = useState<ABTest | null>(null);
  
  const { canEdit } = usePermissions(template);

  const isNewTemplate = templateId === 'new' || !templateId;

  const fetchABTests = useCallback(async () => {
    if (templateId && !isNewTemplate) {
        const tests = await getABTestsForTemplate(templateId);
        setAbTests(tests);
    }
  }, [templateId, isNewTemplate]);

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
          fetchABTests();
        }
        setIsLoading(false);
      });
    }
  }, [templateId, isNewTemplate, setTemplate, fetchABTests]);
  
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
    const oldName = selectedVersion.variables[index]?.name;
    
    updateSelectedVersion(draft => {
      if (!draft.variables[index]) return;

      if (field === 'name') {
        draft.variables[index].name = value;

        if (oldName && oldName !== value && /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(oldName)) {
            const oldVarRegex = new RegExp(`\\{\\{\\s*${oldName}\\s*\\}\\}`, 'g');
            draft.content = draft.content.replace(oldVarRegex, `{{${value}}}`);
        }
      } else {
        (draft.variables[index] as any)[field] = value;
        
        if (field === 'type' && value === 'boolean' && typeof draft.variables[index].defaultValue !== 'boolean') {
            draft.variables[index].defaultValue = false;
        }
      }
    });
  }, [selectedVersion.variables, updateSelectedVersion]);

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
      setActionInProgress('save');
      
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
        // Reset history after save
        const newSelectedVersion = savedTemplate.versions.find(v => v.version === savedTemplate.activeVersion) || selectedVersion;
        setSelectedVersion(newSelectedVersion);
        setHistory([newSelectedVersion]);
        setHistoryIndex(0);
      }

      setActionInProgress('none');
  };

    const handleDeploy = async (versionString: string) => {
      if (!template) return;
      setActionInProgress('deploy');
      
      const templateToSave = {
          ...template,
          deployedVersion: versionString,
      };

      const savedTemplate = await saveTemplate(templateToSave);
      setTemplate(savedTemplate);
      setActionInProgress('none');
  };

  const handleSaveAndDeploy = async () => {
    if (!isVariablesValid || !template) return;
    setActionInProgress('deploy');

    // Step 1: Save the current content
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

    // Step 2: Set deployed version and save again
    const templateToDeploy = {
        ...savedTemplate,
        deployedVersion: savedTemplate.activeVersion,
    };
    const deployedTemplate = await saveTemplate(templateToDeploy);

    // Step 3: Update local state
    if (isNewTemplate) {
        window.location.hash = `#/templates/${deployedTemplate.id}`;
    } else {
      setTemplate(deployedTemplate);
      const newSelectedVersion = deployedTemplate.versions.find(v => v.version === deployedTemplate.activeVersion) || selectedVersion;
      setSelectedVersion(newSelectedVersion);
      setHistory([newSelectedVersion]);
      setHistoryIndex(0);
    }
    setActionInProgress('none');
  };

  const handleCreateNewVersion = useCallback((sourceVersion: PromptTemplateVersion) => {
    if (!template) return;

    const maxMajor = template.versions.reduce((max, v) => {
        const major = parseInt(v.version.split('.')[0], 10);
        return Math.max(max, major);
    }, 0);
    
    const newVersionNumber = `${maxMajor + 1}.0`;
    
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

    setSelectedVersion(newVersion);
    setHistory([newVersion]);
    setHistoryIndex(0);

  }, [template, setTemplate]);
  
  const handleCreateABTest = async (newTestData: Partial<ABTest>) => {
    if (!template) return;
    const testToSave: Partial<ABTest> = { ...newTestData, templateId: template.id };
    const savedTest = await createABTest(testToSave);
    setAbTests(prev => [...prev, savedTest]);
    setIsABTestModalOpen(false);
  };

  const handleDeclareWinner = async (testId: string, winner: 'A' | 'B') => {
      const winnerKey = winner === 'A' ? 'versionA' : 'versionB';
      const updatedTest = await declareWinner(testId, winnerKey);
      setAbTests(prev => prev.map(t => t.id === testId ? updatedTest : t));
      setSelectedABTest(updatedTest);
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
        actionInProgress={actionInProgress}
        isUndoable={historyIndex > 0}
        isRedoable={historyIndex < history.length - 1}
        canEdit={canEdit}
        isVariablesValid={isVariablesValid}
        isDeployed={selectedVersion.version === template.deployedVersion}
        onInputChange={handleInputChange}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onSave={handleSave}
        onSaveAndDeploy={handleSaveAndDeploy}
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
            <VersionManager
                template={template}
                selectedVersion={selectedVersion}
                onVersionChange={(v) => {
                    setSelectedVersion(v);
                    setHistory([v]);
                    setHistoryIndex(0);
                }}
                onDeploy={handleDeploy}
                onCreateNewVersion={handleCreateNewVersion}
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
        </div>
      </div>
      {isABTestModalOpen && template && <CreateABTestModal versions={template.versions} onClose={() => setIsABTestModalOpen(false)} onSave={handleCreateABTest} />}
      {selectedABTest && template && <ABTestResults test={selectedABTest} template={template} onClose={() => setSelectedABTest(null)} onDeclareWinner={handleDeclareWinner} />}
    </div>
  );
};

export default TemplateEditor;
