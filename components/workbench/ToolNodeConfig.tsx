import React from 'react';
import { ToolNodeData, AuthMethod } from '../../types.ts';

interface ToolNodeConfigProps {
  data: ToolNodeData;
  onUpdate: (data: Partial<ToolNodeData>) => void;
}

const ConfigInput: React.FC<{
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}> = ({ label, value, onChange, placeholder }) => (
    <div>
        <label className="block text-sm font-medium text-foreground mb-1">{label}</label>
        <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full p-2 text-sm bg-input rounded-md text-foreground focus:ring-2 focus:ring-ring focus:outline-none"
        />
    </div>
);

const ConfigSelect: React.FC<{
    label: string;
    value: AuthMethod;
    onChange: (value: AuthMethod) => void;
    options: AuthMethod[];
}> = ({ label, value, onChange, options }) => (
     <div>
        <label className="block text-sm font-medium text-foreground mb-1">{label}</label>
        <select
            value={value}
            onChange={(e) => onChange(e.target.value as AuthMethod)}
            className="w-full p-2 text-sm bg-input rounded-md text-foreground focus:ring-2 focus:ring-ring focus:outline-none"
        >
            {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
    </div>
);

const ConfigTextArea: React.FC<{
    label: string;
    value: string;
    onChange: (value: string) => void;
}> = ({ label, value, onChange }) => (
    <div>
        <label className="block text-sm font-medium text-foreground mb-1">{label}</label>
        <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full h-24 p-2 text-xs font-mono bg-input rounded-md text-foreground focus:ring-2 focus:ring-ring focus:outline-none resize-y"
        />
    </div>
);


const ToolNodeConfig: React.FC<ToolNodeConfigProps> = ({ data, onUpdate }) => {
  const authMethods: AuthMethod[] = ['None', 'API Key', 'OAuth 2.0'];
  
  return (
    <div className="space-y-4">
        <ConfigInput
            label="API Endpoint"
            value={data.apiEndpoint}
            onChange={(val) => onUpdate({ apiEndpoint: val })}
            placeholder="https://example.com/api/v1"
        />
        <ConfigSelect
            label="Authentication"
            value={data.authMethod}
            onChange={(val) => onUpdate({ authMethod: val })}
            options={authMethods}
        />
         <ConfigTextArea
            label="Request Schema (JSON)"
            value={data.requestSchema}
            onChange={(val) => onUpdate({ requestSchema: val })}
        />
         <ConfigTextArea
            label="Response Schema (JSON)"
            value={data.responseSchema}
            onChange={(val) => onUpdate({ responseSchema: val })}
        />
    </div>
  );
};

export default ToolNodeConfig;