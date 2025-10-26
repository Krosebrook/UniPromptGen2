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
    
    // State for auth details
    const [apiKeyLocation, setApiKeyLocation] = useState<'header' | 'query'>('header');
    const [apiKeyName, setApiKeyName] = useState('');
    const [oauthClientId, setOauthClientId] = useState('');
    const [oauthAuthUrl, setOauthAuthUrl] = useState('');
    const [oauthTokenUrl, setOauthTokenUrl] = useState('');
    const [oauthScopes, setOauthScopes] = useState('');


    const handleSave = () => {
        if (name && description && apiEndpoint) {
            const toolData: ToolFormData = {
                name,
                description,
                apiEndpoint,
                authMethod,
                requestSchema: '{}', // Default empty schema
                responseSchema: '{}', // Default empty schema
            };

            if (authMethod === 'API Key') {
                toolData.apiKeyLocation = apiKeyLocation;
                toolData.apiKeyName = apiKeyName;
            } else if (authMethod === 'OAuth 2.0') {
                toolData.oauthClientId = oauthClientId;
                toolData.oauthAuthorizationUrl = oauthAuthUrl;
                toolData.oauthTokenUrl = oauthTokenUrl;
                toolData.oauthScopes = oauthScopes;
            }

            onSave(toolData);
        }
    };

    const isFormValid = name.trim() && description.trim() && apiEndpoint.trim();

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-popover w-full max-w-lg rounded-lg shadow-xl p-6 space-y-4 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
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

                {authMethod === 'API Key' && (
                    <div className="p-3 bg-input/50 rounded-md space-y-3">
                        <h4 className="text-sm font-semibold">API Key Details</h4>
                        <div>
                            <label className="block text-xs font-medium text-muted-foreground mb-1">Key Location</label>
                            <select value={apiKeyLocation} onChange={e => setApiKeyLocation(e.target.value as 'header' | 'query')} className="w-full p-2 text-sm bg-input rounded-md text-foreground">
                                <option value="header">Header</option>
                                <option value="query">Query Parameter</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-muted-foreground mb-1">{apiKeyLocation === 'header' ? 'Header Name' : 'Query Parameter Name'}</label>
                            <input type="text" value={apiKeyName} onChange={e => setApiKeyName(e.target.value)} className="w-full p-2 text-sm bg-input rounded-md text-foreground" placeholder="e.g., X-API-Key" />
                        </div>
                    </div>
                )}

                {authMethod === 'OAuth 2.0' && (
                    <div className="p-3 bg-input/50 rounded-md space-y-3">
                        <h4 className="text-sm font-semibold">OAuth 2.0 Details</h4>
                        <div>
                            <label className="block text-xs font-medium text-muted-foreground mb-1">Client ID</label>
                            <input type="text" value={oauthClientId} onChange={e => setOauthClientId(e.target.value)} className="w-full p-2 text-sm bg-input rounded-md text-foreground" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-muted-foreground mb-1">Authorization URL</label>
                            <input type="text" value={oauthAuthUrl} onChange={e => setOauthAuthUrl(e.target.value)} className="w-full p-2 text-sm bg-input rounded-md text-foreground" />
                        </div>
                         <div>
                            <label className="block text-xs font-medium text-muted-foreground mb-1">Token URL</label>
                            <input type="text" value={oauthTokenUrl} onChange={e => setOauthTokenUrl(e.target.value)} className="w-full p-2 text-sm bg-input rounded-md text-foreground" />
                        </div>
                         <div>
                            <label className="block text-xs font-medium text-muted-foreground mb-1">Scopes (comma-separated)</label>
                            <input type="text" value={oauthScopes} onChange={e => setOauthScopes(e.target.value)} className="w-full p-2 text-sm bg-input rounded-md text-foreground" />
                        </div>
                    </div>
                )}

                <div className="flex justify-end gap-2 pt-4">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium bg-secondary rounded-md hover:bg-accent">Cancel</button>
                    <button onClick={handleSave} disabled={!isFormValid} className="px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-md hover:bg-primary/90 disabled:opacity-50">Save Tool</button>
                </div>
            </div>
        </div>
    );
};

export default CreateToolModal;