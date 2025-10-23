import React, { useState, useEffect } from 'react';
import { MOCK_TEMPLATES } from '../constants.ts';
import { PromptTemplate, PromptTemplateVersion } from '../types.ts';
import { SaveIcon, ArrowLeftIcon, ClockIcon } from '../components/icons/Icons.tsx';

interface TemplateEditorProps {
  templateId: string;
}

const TemplateEditor: React.FC<TemplateEditorProps> = ({ templateId }) => {
  const [template, setTemplate] = useState<PromptTemplate | null>(null);
  const [editorState, setEditorState] = useState<Omit<PromptTemplateVersion, 'date' | 'comment' | 'version'> | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [currentVersion, setCurrentVersion] = useState('');

  useEffect(() => {
    if (templateId === 'new') {
      setIsNew(true);
      const newTemplate: PromptTemplate = {
          id: `template-${Date.now()}`,
          domain: 'General',
          qualityScore: 0,
          metrics: { totalRuns: 0, successfulRuns: 0, totalUserRating: 0, avgUserRating: 0, taskSuccessRate: 0, efficiencyScore: 0 },
          versions: [],
          activeVersion: '1.0'
      };
      setTemplate(newTemplate);
      const newVersion: Omit<PromptTemplateVersion, 'date' | 'comment' | 'version'> = {
        name: 'New Template',
        description: '',
        riskLevel: 'Low',
        content: '',
        variables: [],
      };
      setEditorState(newVersion);
      setCurrentVersion('1.0');
    } else {
      setIsNew(false);
      const existingTemplate = MOCK_TEMPLATES.find(t => t.id === templateId);
      if (existingTemplate) {
        setTemplate(existingTemplate);
        const activeVersion = existingTemplate.versions.find(v => v.version === existingTemplate.activeVersion);
        if (activeVersion) {
            setEditorState(activeVersion);
            setCurrentVersion(activeVersion.version);
        }
      }
    }
  }, [templateId]);

  const handleInputChange = (field: keyof typeof editorState, value: any) => {
    if (editorState) {
        setEditorState({ ...editorState, [field]: value });
    }
  };
  
  const handleDomainChange = (value: string) => {
      if (template) {
          setTemplate({ ...template, domain: value });
      }
  };

  const handleViewVersion = (version: PromptTemplateVersion) => {
    setEditorState(version);
    setCurrentVersion(version.version);
  };

  const handleSetActiveVersion = (version: string) => {
    if (template) {
        setTemplate({ ...template, activeVersion: version });
        // In a real app, this would be an API call
        alert(`Version ${version} is now the active version.`);
    }
  };

  const getNextVersion = (): string => {
      if (!template || template.versions.length === 0) return '1.0';
      // Simple minor version bump
      const latestVersion = template.versions.reduce((latest, v) => parseFloat(v.version) > parseFloat(latest) ? v.version : latest, '0.0');
      const [major, minor] = latestVersion.split('.').map(Number);
      return `${major}.${minor + 1}`;
  };

  const handleSave = () => {
    if (!template || !editorState) return;

    const comment = window.prompt('Please enter a brief comment for this new version:', isNew ? 'Initial version.' : '');
    if (comment === null) return; // User cancelled

    const newVersionNumber = isNew ? '1.0' : getNextVersion();

    const newVersion: PromptTemplateVersion = {
        ...editorState,
        version: newVersionNumber,
        date: new Date().toISOString(),
        comment,
    };
    
    const updatedVersions = [...template.versions, newVersion].sort((a,b) => b.date.localeCompare(a.date));

    // In a real app, this would make an API call to save the new version
    console.log('Saving new version:', newVersion);
    alert(`Template saved as new version "${newVersion.version}"!`);
    
    // This part is a mock of updating the "database"
    const templateIndex = MOCK_TEMPLATES.findIndex(t => t.id === template.id);
    const updatedTemplate = { ...template, versions: updatedVersions, activeVersion: newVersion.version };
    if (templateIndex > -1) {
        MOCK_TEMPLATES[templateIndex] = updatedTemplate;
    } else {
        MOCK_TEMPLATES.push(updatedTemplate);
    }

    window.location.hash = '#/templates';
  };

  if (!template || !editorState) {
    return <div>Loading template...</div>;
  }

  return (
    <div className="space-y-6">
       <div className="flex items-center justify-between">
        <a href="#/templates" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Library
        </a>
        <h1 className="text-3xl font-bold text-foreground">
          {isNew ? 'Create New Template' : `Edit Template (Viewing v${currentVersion})`}
        </h1>
        <button
          onClick={handleSave}
          className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-md hover:bg-primary/90"
        >
          <SaveIcon className="h-5 w-5 mr-2" />
          Save as New Version
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4 bg-card p-6 rounded-lg shadow-card">
           <div>
              <label htmlFor="name" className="block text-sm font-medium text-muted-foreground mb-1">Template Name</label>
              <input type="text" id="name" value={editorState.name} onChange={e => handleInputChange('name', e.target.value)} className="w-full p-2 bg-input rounded-md"/>
           </div>
           <div>
              <label htmlFor="description" className="block text-sm font-medium text-muted-foreground mb-1">Description</label>
              <textarea id="description" value={editorState.description} onChange={e => handleInputChange('description', e.target.value)} rows={3} className="w-full p-2 bg-input rounded-md"/>
           </div>
            <div>
                <label htmlFor="risk" className="block text-sm font-medium text-muted-foreground mb-1">Risk Level</label>
                <select id="risk" value={editorState.riskLevel} onChange={e => handleInputChange('riskLevel', e.target.value as any)} className="w-full p-2 bg-input rounded-md">
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
                </select>
            </div>
           <div>
              <label htmlFor="content" className="block text-sm font-medium text-muted-foreground mb-1">Prompt Content</label>
              <textarea id="content" value={editorState.content} onChange={e => handleInputChange('content', e.target.value)} rows={15} className="w-full p-2 bg-input rounded-md font-mono text-sm"/>
           </div>
            <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Variables</h3>
            <p className="text-xs text-muted-foreground">{'Define variables using `{{variableName}}` in the content.'}</p>
          </div>
        </div>
        <div className="space-y-6 bg-card p-6 rounded-lg shadow-card">
          <div>
            <label htmlFor="domain" className="block text-sm font-medium text-muted-foreground mb-1">Domain</label>
            <select id="domain" value={template.domain} onChange={e => handleDomainChange(e.target.value)} className="w-full p-2 bg-input rounded-md">
              <option>Marketing</option>
              <option>Code Gen</option>
              <option>Support</option>
              <option>Content</option>
              <option>General</option>
            </select>
          </div>
          
          {!isNew && (
            <div>
                <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center">
                    <ClockIcon className="h-5 w-5 mr-2" />
                    Version History
                </h3>
                <ul className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                    {template.versions.map(v => (
                        <li key={v.version} className="bg-secondary p-3 rounded-md">
                            <div className="flex justify-between items-start">
                                <p className="font-bold text-foreground">
                                    v{v.version}
                                    {v.version === template.activeVersion && <span className="ml-2 text-xs font-medium bg-success text-success-foreground px-2 py-0.5 rounded-full">Active</span>}
                                </p>
                                <p className="text-xs text-muted-foreground">{new Date(v.date).toLocaleDateString()}</p>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1 italic">"{v.comment}"</p>
                            <div className="flex gap-2 mt-3">
                                <button onClick={() => handleViewVersion(v)} className="text-xs font-medium text-primary hover:underline">View</button>
                                {v.version !== template.activeVersion && (
                                    <button onClick={() => handleSetActiveVersion(v.version)} className="text-xs font-medium text-primary hover:underline">Set as Active</button>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TemplateEditor;