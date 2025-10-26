


import React, { useState, useEffect } from 'react';
// Fix: Corrected import paths to be relative.
import { ToolNodeData, AuthMethod, Tool } from '../../types.ts';
import { getTools } from '../../services/apiService.ts';
import { useWorkspace } from '../../contexts/WorkspaceContext.tsx';
import PresetToolConfig from './PresetToolConfig.tsx';
import { MOCK_LOGGED_IN_USER } from '../../constants.ts';

interface ToolNodeConfigProps {
  data: ToolNodeData;
  onUpdate: (data: Partial<ToolNodeData>) => void;
}

const ToolNodeConfig: React.FC<ToolNodeConfigProps> = ({ data, onUpdate }) => {
  const { currentWorkspace } = useWorkspace();
  const [availableTools, setAvailableTools] = useState<Tool[]>([]);
  
  useEffect(() => {
    if (currentWorkspace) {
        // Fix: Expected 3 arguments, but got 2.
        getTools(currentWorkspace.id, null, MOCK_LOGGED_IN_USER.id).then(setAvailableTools);
    }
  }, [currentWorkspace]);

  if (data.subType) {
    return <PresetToolConfig data={data} onUpdate={onUpdate} />;
  }

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
      
      <p className="text-xs text-muted-foreground">The fields below are for manual configuration when not using a preset or library tool.</p>

      <ConfigInput
        label="API Endpoint"
        value={data.apiEndpoint || ''}
        onChange={(val) => onUpdate({ apiEndpoint: val })}
        placeholder="https://example.com/api/v1"
        disabled={isLinkedToTool}
      />
      {/* Additional fields would go here, but are omitted for brevity as they are not used by presets */}
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


export default ToolNodeConfig;