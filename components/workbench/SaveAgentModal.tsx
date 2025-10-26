import React, { useState } from 'react';

interface SaveAgentModalProps {
    onClose: () => void;
    onSave: (name: string, description: string) => void;
    initialName?: string;
    initialDescription?: string;
}

const SaveAgentModal: React.FC<SaveAgentModalProps> = ({ onClose, onSave, initialName = '', initialDescription = '' }) => {
    const [name, setName] = useState(initialName === 'New Untitled Agent' ? '' : initialName);
    const [description, setDescription] = useState(initialDescription);

    const handleSave = () => {
        if (name) {
            onSave(name, description);
        }
    };

    return (
         <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-popover w-full max-w-lg rounded-lg shadow-xl p-6 space-y-4" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold">Save Agent</h2>
                <div>
                    <label htmlFor="agentName" className="block text-sm font-medium text-muted-foreground mb-1">Agent Name</label>
                    <input
                        id="agentName"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full p-2 bg-input rounded-md text-foreground focus:ring-2 focus:ring-ring focus:outline-none"
                        placeholder="e.g., Customer Support Agent"
                    />
                </div>
                 <div>
                    <label htmlFor="agentDesc" className="block text-sm font-medium text-muted-foreground mb-1">Description (Optional)</label>
                    <textarea
                        id="agentDesc"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={3}
                        className="w-full p-2 bg-input rounded-md text-foreground"
                        placeholder="A brief description of what this agent does."
                    />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium bg-secondary rounded-md hover:bg-accent">Cancel</button>
                    <button onClick={handleSave} disabled={!name} className="px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-md hover:bg-primary/90 disabled:opacity-50">Save</button>
                </div>
            </div>
        </div>
    );
};

export default SaveAgentModal;
