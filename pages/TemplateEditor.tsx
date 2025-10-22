import React, { useState, useEffect } from 'react';
import { MOCK_TEMPLATES } from '../constants.ts';
import { PromptTemplate } from '../types.ts';
// FIX: Added file extension to fix module resolution error.
import { SaveIcon, ArrowLeftIcon } from '../components/icons/Icons.tsx';

interface TemplateEditorProps {
  templateId: string;
}

const TemplateEditor: React.FC<TemplateEditorProps> = ({ templateId }) => {
  const [template, setTemplate] = useState<Omit<PromptTemplate, 'id' | 'metrics' | 'qualityScore'> | null>(null);
  const [isNew, setIsNew] = useState(false);

  useEffect(() => {
    if (templateId === 'new') {
      setIsNew(true);
      setTemplate({
        name: '',
        description: '',
        domain: 'General',
        riskLevel: 'Low',
        version: '1.0',
        content: '',
        variables: [],
      });
    } else {
      setIsNew(false);
      const existingTemplate = MOCK_TEMPLATES.find(t => t.id === templateId);
      if (existingTemplate) {
        setTemplate(existingTemplate);
      }
    }
  }, [templateId]);

  const handleSave = () => {
    // In a real app, this would make an API call
    alert(`Template "${template?.name}" saved!`);
    window.location.hash = '#/templates';
  };

  if (!template) {
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
          {isNew ? 'Create New Template' : 'Edit Template'}
        </h1>
        <button
          onClick={handleSave}
          className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-md hover:bg-primary/90"
        >
          <SaveIcon className="h-5 w-5 mr-2" />
          Save Template
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4 bg-card p-6 rounded-lg shadow-card">
           <div>
              <label htmlFor="name" className="block text-sm font-medium text-muted-foreground mb-1">Template Name</label>
              <input type="text" id="name" value={template.name} onChange={e => setTemplate({...template, name: e.target.value})} className="w-full p-2 bg-input rounded-md"/>
           </div>
           <div>
              <label htmlFor="description" className="block text-sm font-medium text-muted-foreground mb-1">Description</label>
              <textarea id="description" value={template.description} onChange={e => setTemplate({...template, description: e.target.value})} rows={3} className="w-full p-2 bg-input rounded-md"/>
           </div>
           <div>
              <label htmlFor="content" className="block text-sm font-medium text-muted-foreground mb-1">Prompt Content</label>
              <textarea id="content" value={template.content} onChange={e => setTemplate({...template, content: e.target.value})} rows={10} className="w-full p-2 bg-input rounded-md font-mono text-sm"/>
           </div>
        </div>
        <div className="space-y-4 bg-card p-6 rounded-lg shadow-card">
          <div>
            <label htmlFor="domain" className="block text-sm font-medium text-muted-foreground mb-1">Domain</label>
            <select id="domain" value={template.domain} onChange={e => setTemplate({...template, domain: e.target.value})} className="w-full p-2 bg-input rounded-md">
              <option>Marketing</option>
              <option>Code Gen</option>
              <option>Support</option>
              <option>Content</option>
              <option>General</option>
            </select>
          </div>
          <div>
            <label htmlFor="risk" className="block text-sm font-medium text-muted-foreground mb-1">Risk Level</label>
            <select id="risk" value={template.riskLevel} onChange={e => setTemplate({...template, riskLevel: e.target.value as any})} className="w-full p-2 bg-input rounded-md">
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>
          </div>
          <div>
            <label htmlFor="version" className="block text-sm font-medium text-muted-foreground mb-1">Version</label>
            <input type="text" id="version" value={template.version} onChange={e => setTemplate({...template, version: e.target.value})} className="w-full p-2 bg-input rounded-md"/>
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Variables</h3>
            {/* FIX: Wrapped string in `{''}` to prevent JSX parser from misinterpreting `{{...}}` as an expression. */}
            <p className="text-xs text-muted-foreground">{'Define variables using `{{variableName}}` in the content.'}</p>
            {/* A full implementation would parse variables from content or allow adding them here */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateEditor;