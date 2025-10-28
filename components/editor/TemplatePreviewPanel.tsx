import React, { useState, useEffect } from 'react';
import { PromptVariable } from '../../types.ts';
import { generateText } from '../../services/geminiService.ts';
import { PlayIcon, SpinnerIcon } from '../icons/Icons.tsx';

interface TemplatePreviewPanelProps {
  variables: PromptVariable[];
  content: string;
}

const TemplatePreviewPanel: React.FC<TemplatePreviewPanelProps> = ({ variables, content }) => {
  const [variableValues, setVariableValues] = useState<Record<string, any>>({});
  const [previewOutput, setPreviewOutput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Initialize variableValues when variables change
  useEffect(() => {
    const initialValues: Record<string, any> = {};
    variables.forEach(v => {
      initialValues[v.name] = v.defaultValue ?? '';
    });
    setVariableValues(initialValues);
  }, [variables]);

  const handleValueChange = (name: string, value: any) => {
    setVariableValues(prev => ({ ...prev, [name]: value }));
  };

  const handleRunPreview = async () => {
    setIsLoading(true);
    setPreviewOutput('');
    setError('');

    let finalPrompt = content;
    for (const variable of variables) {
      const value = variableValues[variable.name];
      const regex = new RegExp(`{{${variable.name}}}`, 'g');
      finalPrompt = finalPrompt.replace(regex, String(value));
    }

    try {
      const result = await generateText(finalPrompt);
      setPreviewOutput(result);
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-card shadow-card rounded-lg">
      <div className="p-6">
        <h3 className="text-xl font-semibold mb-4">Live Preview</h3>
        <div className="space-y-4">
          {variables.map(variable => (
            <div key={variable.name}>
              <label htmlFor={`preview-${variable.name}`} className="block text-sm font-medium text-foreground">
                {variable.name} <span className="text-xs text-muted-foreground">({variable.type})</span>
              </label>
              {variable.description && (
                <p className="text-xs text-muted-foreground mb-1">{variable.description}</p>
              )}
              <input
                id={`preview-${variable.name}`}
                type={variable.type === 'number' ? 'number' : 'text'}
                value={variableValues[variable.name] || ''}
                onChange={(e) => handleValueChange(variable.name, e.target.value)}
                className="w-full p-2 bg-input rounded-md text-foreground focus:ring-2 focus:ring-ring focus:outline-none"
              />
            </div>
          ))}
          <button
            onClick={handleRunPreview}
            disabled={isLoading}
            className="w-full inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-md hover:bg-primary/90 disabled:opacity-50"
          >
            <PlayIcon className="h-5 w-5 mr-2" />
            {isLoading ? 'Running...' : 'Run Preview'}
          </button>
        </div>
      </div>

      <div className="bg-black/20 p-6 rounded-b-lg min-h-[200px]">
        <h4 className="text-sm font-semibold text-muted-foreground mb-2">Output</h4>
        {isLoading && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <SpinnerIcon className="h-5 w-5 text-primary" />
            <span>Generating response...</span>
          </div>
        )}
        {error && <p className="text-destructive text-sm">{error}</p>}
        {previewOutput && (
          <div className="text-sm text-foreground whitespace-pre-wrap prose prose-sm prose-invert max-w-none">
            {previewOutput}
          </div>
        )}
        {!isLoading && !error && !previewOutput && (
          <p className="text-sm text-muted-foreground">Preview output will appear here.</p>
        )}
      </div>
    </div>
  );
};

export default TemplatePreviewPanel;