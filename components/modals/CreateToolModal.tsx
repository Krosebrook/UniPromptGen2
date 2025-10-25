import React, { useState } from 'react';
import { AuthMethod, ToolFormData } from '../../types.ts';

interface CreateToolModalProps {
    onClose: () => void;
    onSave: (toolData: ToolFormData) => void;
}

const CreateToolModal: React.FC<CreateToolModalProps> = ({ onClose, onSave }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [apiEndpoint, setApiEndpoint] = useState('');
    const [authMethod, setAuthMethod] = useState<AuthMethod>('None');

    const handleSave = () => {
        if (name && description && apiEndpoint) {
            onSave({
                name,
                description,
                apiEndpoint,
                authMethod,
                requestSchema: '{}', // Default empty schema
                responseSchema: '{}', // Default empty schema
            });
        }
    };

    const isFormValid = name.trim() && description.trim() && apiEndpoint.trim();

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-popover w-full max-w-lg rounded-lg shadow-xl p-6 space-y-4" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold">Register New Tool</h2>
                <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">Tool Name</label>
                    <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-2 bg-input rounded-md text-foreground" placeholder="e.g., Get Weather Data" />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">Description</label>
                    <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full p-2 bg-input rounded-md text-foreground" placeholder="A short description of what this tool does." />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">API Endpoint</label>
                    <input type="text" value={apiEndpoint} onChange={e => setApiEndpoint(e.target.value)} className="w-full p-2 bg-input rounded-md text-foreground" placeholder="https://api.example.com/data" />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">Authentication Method</label>
                    <select value={authMethod} onChange={e => setAuthMethod(e.target.value as AuthMethod)} className="w-full p-2 bg-input rounded-md text-foreground">
                        <option value="None">None</option>
                        <option value="API Key">API Key</option>
                        <option value="OAuth 2.0">OAuth 2.0</option>
                    </select>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium bg-secondary rounded-md hover:bg-accent">Cancel</button>
                    <button onClick={handleSave} disabled={!isFormValid} className="px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-md hover:bg-primary/90 disabled:opacity-50">Save Tool</button>
                </div>
            </div>
        </div>
    );
};

export default CreateToolModal;
