import React, { useState, useEffect, useCallback } from 'react';
// FIX: Imported getABTestsForTemplate to resolve missing function error.
import { getTemplateById, saveTemplate, deployTemplateVersion, createABTest, declareABTestWinner, getABTestsForTemplate } from '../services/apiService.ts';
import { PromptTemplate, PromptTemplateVersion, PromptVariable, ABTest } from '../types.ts';
import { SpinnerIcon } from '../components/icons/Icons.tsx';
import { TemplateHeader } from '../components/editor/TemplateHeader.tsx';
import { VariableEditor } from '../components/editor/VariableEditor.tsx';
import { VersionManager } from '../components/editor/VersionManager.tsx';
import ABTestManager from '../components/ab-testing/ABTestManager.tsx';
import CreateABTestModal from '../components/ab-testing/CreateABTestModal.tsx';
import ABTestResults from '../components/ab-testing/ABTestResults.tsx';
import { useWorkspace } from '../contexts/WorkspaceContext.tsx';
import { analyzePrompt, AnalysisResult } from '../services/promptAnalysisService.ts';
import PromptAnalysisPanel from '../components/editor/PromptAnalysisPanel.tsx';

const NEW_TEMPLATE_VERSION: PromptTemplateVersion = {
  version: '1.0',
  name: 'New Untitled Template',
  description: 'A brief description of what this template does.',
  content: 'Your prompt content goes here. Use {{variable_name}} for variables.',
  variables: [{ name: 'variable_name', type: 'string', defaultValue: '' }],
  riskLevel: 'Low',
  date: new Date().toISOString(),
};

const TemplateEditor: React.FC<{ templateId?: string }> = ({ templateId }) => {
  const { currentWorkspace, currentUserRole } = useWorkspace();
  const [template, setTemplate] = useState<PromptTemplate | null>(null);
  const [currentVersion, setCurrentVersion] = useState<PromptTemplateVersion | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [variableErrors, setVariableErrors] = useState<Array<Record<string, string>>>([]);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  const [abTests, setABTests] = useState<ABTest[]>([]);
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [selectedTest, setSelectedTest] = useState<ABTest | null>(null);

  const isNew = templateId === 'new';
  const canEdit = currentUserRole === 'Admin' || currentUserRole === 'Editor';

  const refetchData = useCallback(async () => {
      if (templateId && !isNew) {
          try {
              const fetchedTemplate = await getTemplateById(templateId);
              if (fetchedTemplate) {
                  setTemplate(fetchedTemplate);
                  const activeVer = fetchedTemplate.versions.find(v => v.version === fetchedTemplate.activeVersion) || fetchedTemplate.versions[0];
                  setCurrentVersion(activeVer);
                  const tests = await getABTestsForTemplate(templateId);
                  setABTests(tests);
              } else {
                  setError('Template not found.');
              }
          } catch (err) {
              setError('Failed to reload template data.');
          }
      }
  }, [templateId, isNew]);

  useEffect(() => {
    const fetchTemplate = async () => {
      if (isNew) {
        setCurrentVersion(NEW_TEMPLATE_VERSION);
        setIsLoading(false);
      } else if (templateId) {
        setIsLoading(true);
        try {
          const fetchedTemplate = await getTemplateById(templateId);
          if (fetchedTemplate) {
            setTemplate(fetchedTemplate);
            const activeVer = fetchedTemplate.versions.find(v => v.version === fetchedTemplate.activeVersion) || fetchedTemplate.versions[0];
            setCurrentVersion(activeVer);
            const tests = await getABTestsForTemplate(templateId);
            setABTests(tests);
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
    fetchTemplate();
  }, [templateId, isNew]);

  const handleInputChange = (field: keyof PromptTemplateVersion, value: any) => {
    if (currentVersion) {
      setCurrentVersion({ ...currentVersion, [field]: value });
    }
  };

  const handleVariableChange = (index: number, field: keyof PromptVariable, value: any) => {
    if (currentVersion) {
      const newVariables = [...currentVersion.variables];
      newVariables[index] = { ...newVariables[index], [field]: value };
      setCurrentVersion({ ...currentVersion, variables: newVariables });
    }
  };

  const addVariable = () => {
    if (currentVersion) {
      const newVar = { name: `var${currentVersion.variables.length + 1}`, type: 'string' as const, defaultValue: '' };
      setCurrentVersion({ ...currentVersion, variables: [...currentVersion.variables, newVar] });
    }
  };

  const removeVariable = (index: number) => {
    if (currentVersion) {
      const newVariables = currentVersion.variables.filter((_, i) => i !== index);
      setCurrentVersion({ ...currentVersion, variables: newVariables });
    }
  };

  const validateVariables = useCallback(() => {
    if (!currentVersion) return false;
    const errors: Array<Record<string, string>> = [];
    const nameSet = new Set<string>();
    let isValid = true;

    currentVersion.variables.forEach((v, index) => {
      const varErrors: Record<string, string> = {};
      if (!v.name) {
        varErrors.name = 'Name is required.';
        isValid = false;
      } else if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(v.name)) {
        varErrors.name = 'Invalid format. Use letters, numbers, and underscores, and start with a letter or underscore.';
        isValid = false;
      } else if (nameSet.has(v.name)) {
        varErrors.name = 'Name must be unique.';
        isValid = false;
      }
      nameSet.add(v.name);
      errors[index] = varErrors;
    });

    setVariableErrors(errors);
    return isValid;
  }, [currentVersion]);
  
  useEffect(() => {
    validateVariables();
    if (currentVersion) {
      const results = analyzePrompt(currentVersion.content, currentVersion.variables);
      setAnalysisResult(results);
    }
  }, [currentVersion?.variables, currentVersion?.content, validateVariables]);

  const handleSave = async () => {
    if (!currentVersion || !validateVariables() || !currentWorkspace) return;
    setIsSaving(true);
    try {
      let templateToSave: PromptTemplate;
      if (isNew || !template) {
        templateToSave = {
          id: '',
          workspaceId: currentWorkspace.id,
          domain: 'General',
          qualityScore: 75, // Starting score
          activeVersion: '1.0',
          deployedVersion: null,
          versions: [currentVersion],
          metrics: { totalRuns: 0, successfulRuns: 0, avgUserRating: 0, taskSuccessRate: 0, efficiencyScore: 0.8, totalUserRating: 0 },
          abTests: [],
        };
      } else {
        const versionExists = template.versions.some(v => v.version === currentVersion.version);
        const updatedVersions = versionExists
          ? template.versions.map(v => v.version === currentVersion.version ? currentVersion : v)
          : [...template.versions, currentVersion];
        
        templateToSave = { ...template, versions: updatedVersions, activeVersion: currentVersion.version };
      }
      
      const saved = await saveTemplate(templateToSave);
      setTemplate(saved);
      // Redirect or show success
      if (isNew) {
        window.location.hash = `#/templates/${saved.id}`;
      }
      
    } catch (err) {
      setError('Failed to save template.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeploy = async (version: string) => {
      if (!template) return;
      if (window.confirm(`Are you sure you want to deploy version ${version} to production?`)) {
          setIsSaving(true);
          try {
              const updatedTemplate = await deployTemplateVersion(template.id, version);
              setTemplate(updatedTemplate);
          } catch(err) {
              setError("Failed to deploy version.");
          } finally {
              setIsSaving(false);
          }
      }
  };
  
  const handleCreateTest = async (testData: Partial<ABTest>) => {
      if (!template) return;
      setIsSaving(true);
      try {
        const newTest = await createABTest(template.id, testData);
        setABTests(prev => [...prev, newTest]);
        setIsTestModalOpen(false);
      } catch (err) {
        setError('Failed to create A/B test.');
      } finally {
        setIsSaving(false);
      }
  };
  
  const handleDeclareWinner = async (testId: string, winner: 'A' | 'B') => {
      setIsSaving(true);
      try {
          await declareABTestWinner(testId, winner);
          await refetchData(); // Refetch all data to update status and active version
          setSelectedTest(null);
      } catch (err) {
          setError('Failed to declare winner.');
      } finally {
          setIsSaving(false);
      }
  };

  if (isLoading) return <div className="flex justify-center items-center h-64"><SpinnerIcon className="h-8 w-8 text-primary" /></div>;
  if (error) return <div className="text-destructive text-center">{error}</div>;
  if (!currentVersion) return <div className="text-center">No version selected.</div>;
  
  return (
    <div className="space-y-6">
      <TemplateHeader
        version={currentVersion}
        isNew={isNew}
        isSaving={isSaving}
        isUndoable={false}
        isRedoable={false}
        canEdit={canEdit}
        isVariablesValid={!variableErrors.some(e => Object.keys(e).length > 0)}
        onInputChange={handleInputChange}
        onUndo={() => {}}
        onRedo={() => {}}
        onSave={handleSave}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {template && (
            <VersionManager
                template={template}
                selectedVersion={currentVersion}
                onVersionChange={setCurrentVersion}
                onDeploy={handleDeploy}
                canEdit={canEdit}
            />
           )}
          <textarea
            value={currentVersion.content}
            onChange={(e) => handleInputChange('content', e.target.value)}
            className="w-full h-96 p-4 font-mono text-sm bg-card shadow-card rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-ring resize-y disabled:opacity-70"
            placeholder="Enter your prompt template here..."
            disabled={!canEdit}
          />
        </div>

        <div className="space-y-6">
          <VariableEditor
            variables={currentVersion.variables}
            variableErrors={variableErrors}
            canEdit={canEdit}
            onVariableChange={handleVariableChange}
            onAddVariable={addVariable}
            onRemoveVariable={removeVariable}
          />
          {analysisResult && <PromptAnalysisPanel analysis={analysisResult} />}
          {template && canEdit && (
            <ABTestManager 
              tests={abTests}
              onStartTest={() => setIsTestModalOpen(true)}
              onSelectTest={setSelectedTest}
            />
          )}
        </div>
      </div>
      
      {selectedTest && template && (
        <ABTestResults 
          test={selectedTest} 
          template={template}
          onClose={() => setSelectedTest(null)}
          onDeclareWinner={handleDeclareWinner}
        />
      )}

      {isTestModalOpen && template && (
        <CreateABTestModal 
          versions={template.versions}
          onClose={() => setIsTestModalOpen(false)}
          onSave={handleCreateTest}
        />
      )}
    </div>
  );
};

export default TemplateEditor;