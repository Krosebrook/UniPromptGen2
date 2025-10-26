import React, { useState, useEffect } from 'react';
import { ToolNodeData, AuthMethod, Tool } from '../../types.ts';
import { getTools } from '../../services/apiService.ts';
import { useWorkspace } from '../../contexts/WorkspaceContext.tsx';

interface ToolNodeConfigProps {
  data: ToolNodeData;
  onUpdate: (data: Partial<ToolNodeData>) => void;
}

const ToolNodeConfig: React.FC<ToolNodeConfigProps> = ({ data, onUpdate }) => {
  const { currentWorkspace } = useWorkspace();
  const [availableTools, setAvailableTools] = useState<Tool[]>([]);
  
  useEffect(() => {
    if (currentWorkspace) {
        getTools(currentWorkspace.id).then(setAvailableTools);
    }
  }, [currentWorkspace]);

  const authMethods: AuthMethod[] = ['None', 'API Key', 'OAuth 2.0'];
  const isLinkedToTool = !!data.toolId;

  const handleToolSelect = (toolId: string) => {
    const selectedTool = availableTools.find(t => t.id === toolId);
    if (selectedTool) {
      onUpdate({
        toolId: selectedTool.id,
        label: selectedTool.name,
        apiEndpoint: selectedTool.apiEndpoint,
        authMethod: selectedTool.authMethod,
        requestSchema: selectedTool.requestSchema,
        responseSchema: selectedTool.responseSchema,
      });
    }
  };
  
  const handleDetachTool = () => {
    onUpdate({
        toolId: undefined, // Using undefined to remove the key
        label: "Detached Tool Node",
    });
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">Select from Library</label>
        <select
          value={data.toolId || ''}
          onChange={(e) => handleToolSelect(e.target.value)}
          className="w-full p-2 text-sm bg-input rounded-md text-foreground focus:ring-2 focus:ring-ring focus:outline-none"
        >
          <option value="">-- Manual Configuration --</option>
          {availableTools.map(tool => <option key={tool.id} value={tool.id}>{tool.name}</option>)}
        </select>
         {isLinkedToTool && (
            <button onClick={handleDetachTool} className="text-xs text-primary hover:underline mt-1">
                Detach from library
            </button>
        )}
      </div>

      <hr className="border-border" />
      
      <ConfigInput
        label="API Endpoint"
        value={data.apiEndpoint}
        onChange={(val) => onUpdate({ apiEndpoint: val })}
        placeholder="https://example.com/api/v1"
        disabled={isLinkedToTool}
      />
      <ConfigSelect
        label="Authentication"
        value={data.authMethod}
        onChange={(val) => onUpdate({ authMethod: val })}
        options={authMethods}
        disabled={isLinkedToTool}
      />
      <ConfigTextArea
        label="Request Schema (JSON)"
        value={data.requestSchema}
        onChange={(val) => onUpdate({ requestSchema: val })}
        disabled={isLinkedToTool}
      />
      <ConfigTextArea
        label="Response Schema (JSON)"
        value={data.responseSchema}
        onChange={(val) => onUpdate({ responseSchema: val })}
        disabled={isLinkedToTool}
      />
    </div>
  );
};

// Sub-components for different config field types

const ConfigInput: React.FC<{ label: string; value: string; onChange: (value: string) => void; placeholder?: string; disabled?: boolean; }> = ({ label, value, onChange, placeholder, disabled }) => (
    <div>
        <label className="block text-sm font-medium text-foreground mb-1">{label}</label>
        <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            className="w-full p-2 text-sm bg-input rounded-md text-foreground focus:ring-2 focus:ring-ring focus:outline-none disabled:opacity-70 disabled:cursor-not-allowed"
        />
    </div>
);

const ConfigSelect: React.FC<{ label: string; value: AuthMethod; onChange: (value: AuthMethod) => void; options: AuthMethod[]; disabled?: boolean; }> = ({ label, value, onChange, options, disabled }) => (
     <div>
        <label className="block text-sm font-medium text-foreground mb-1">{label}</label>
        <select
            value={value}
            onChange={(e) => onChange(e.target.value as AuthMethod)}
            disabled={disabled}
            className="w-full p-2 text-sm bg-input rounded-md text-foreground focus:ring-2 focus:ring-ring focus:outline-none disabled:opacity-70 disabled:cursor-not-allowed"
        >
            {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
    </div>
);

const ConfigTextArea: React.FC<{ label: string; value: string; onChange: (value: string) => void; disabled?: boolean; }> = ({ label, value, onChange, disabled }) => {
    const [isValidJson, setIsValidJson] = useState(true);

    useEffect(() => {
        if (value.trim() === '') {
            setIsValidJson(true);
            return;
        }
        try {
            JSON.parse(value);
            setIsValidJson(true);
        } catch (e) {
            setIsValidJson(false);
        }
    }, [value]);

    const ringClass = value.trim() === '' 
        ? 'focus:ring-ring' 
        : isValidJson 
            ? 'focus:ring-success' 
            : 'focus:ring-destructive';

    return (
        <div>
            <label className="block text-sm font-medium text-foreground mb-1">{label}</label>
            <textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled}
                className={`w-full h-24 p-2 text-xs font-mono bg-input rounded-md text-foreground focus:outline-none resize-y transition-shadow focus:ring-2 ${ringClass} disabled:opacity-70 disabled:cursor-not-allowed`}
            />
            {value.trim() !== '' && !isValidJson && (
                <p className="text-xs text-destructive mt-1">Invalid JSON format.</p>
            )}
        </div>
    );
};

export default ToolNodeConfig;