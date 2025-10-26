import React from 'react';
import { ToolNodeData } from '../../types.ts';

interface PresetToolConfigProps {
  data: ToolNodeData;
  onUpdate: (data: Partial<ToolNodeData>) => void;
}

const ConfigInput: React.FC<{ label: string; value: string; onChange: (value: any) => void; type?: string; placeholder?: string; }> = ({ label, value, onChange, type = 'text', placeholder }) => (
    <div>
        <label className="block text-sm font-medium text-foreground mb-1">{label}</label>
        <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full p-2 text-sm bg-input rounded-md text-foreground focus:ring-2 focus:ring-ring focus:outline-none"
        />
    </div>
);

const ConfigTextArea: React.FC<{ label: string; value: string; onChange: (value: any) => void; rows?: number; }> = ({ label, value, onChange, rows = 3 }) => (
    <div>
        <label className="block text-sm font-medium text-foreground mb-1">{label}</label>
        <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            rows={rows}
            className="w-full p-2 text-sm font-mono bg-input rounded-md text-foreground focus:outline-none resize-y focus:ring-2 focus:ring-ring"
        />
    </div>
);

const ConfigSelect: React.FC<{ label: string; value: string; onChange: (value: any) => void; options: string[]; }> = ({ label, value, onChange, options }) => (
    <div>
        <label className="block text-sm font-medium text-foreground mb-1">{label}</label>
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full p-2 text-sm bg-input rounded-md text-foreground focus:ring-2 focus:ring-ring focus:outline-none"
        >
            {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
    </div>
);

const PresetToolConfig: React.FC<PresetToolConfigProps> = ({ data, onUpdate }) => {
    const handleSettingsChange = (field: string, value: any) => {
        onUpdate({ settings: { ...data.settings, [field]: value } });
    };

    const renderConfigUI = () => {
        switch (data.subType) {
            case 'HttpRequest':
                return (
                    <>
                        <ConfigSelect label="Method" value={data.settings.method} onChange={(v) => handleSettingsChange('method', v)} options={['GET', 'POST', 'PUT', 'DELETE']} />
                        <ConfigInput label="URL" value={data.settings.url} onChange={(v) => handleSettingsChange('url', v)} placeholder="https://api.example.com" />
                        <ConfigTextArea label="Headers (JSON)" value={data.settings.headers} onChange={(v) => handleSettingsChange('headers', v)} rows={2} />
                        <ConfigTextArea label="Body (JSON)" value={data.settings.body} onChange={(v) => handleSettingsChange('body', v)} rows={2} />
                    </>
                );
            case 'SendEmail':
                return (
                    <>
                        <ConfigInput label="To" value={data.settings.to} onChange={(v) => handleSettingsChange('to', v)} placeholder="recipient@example.com" />
                        <ConfigInput label="Subject" value={data.settings.subject} onChange={(v) => handleSettingsChange('subject', v)} placeholder="Agent Report" />
                        <ConfigTextArea label="Body" value={data.settings.body} onChange={(v) => handleSettingsChange('body', v)} rows={4} />
                    </>
                );
            case 'ReadGoogleSheet':
            case 'AppendGoogleSheet':
                 return (
                    <>
                        <ConfigInput label="Spreadsheet ID" value={data.settings.spreadsheetId} onChange={(v) => handleSettingsChange('spreadsheetId', v)} />
                        <ConfigInput label="Range" value={data.settings.range} onChange={(v) => handleSettingsChange('range', v)} placeholder="Sheet1!A1:C10" />
                        {data.subType === 'AppendGoogleSheet' && <ConfigTextArea label="Values (JSON array)" value={data.settings.values} onChange={(v) => handleSettingsChange('values', v)} rows={2} />}
                    </>
                );
            case 'ExecuteCode':
                return <ConfigTextArea label="Javascript Code" value={data.settings.code} onChange={(v) => handleSettingsChange('code', v)} rows={8} />;
            case 'TransformJson':
                 return (
                    <>
                        <ConfigInput label="JMESPath Expression" value={data.settings.expression} onChange={(v) => handleSettingsChange('expression', v)} placeholder="items[].name" />
                        <ConfigTextArea label="JSON Input" value={data.settings.jsonInput} onChange={(v) => handleSettingsChange('jsonInput', v)} rows={4} />
                    </>
                );
            case 'Wait':
                return (
                    <div className="flex gap-2">
                        <ConfigInput label="Duration" value={data.settings.duration} onChange={(v) => handleSettingsChange('duration', parseInt(v, 10) || 0)} type="number" />
                        <ConfigSelect label="Unit" value={data.settings.unit} onChange={(v) => handleSettingsChange('unit', v)} options={['seconds', 'minutes']} />
                    </div>
                );
            default:
                return <p className="text-sm text-muted-foreground">No configuration available for this node.</p>;
        }
    }

    return (
        <div className="space-y-4">
            {renderConfigUI()}
        </div>
    );
};

export default PresetToolConfig;