import React, { useState } from 'react';
import { KnowledgeSourceType, KnowledgeSourceFormData } from '../../types.ts';

interface CreateKnowledgeSourceModalProps {
    onClose: () => void;
    onSave: (sourceData: KnowledgeSourceFormData) => void;
}

const CreateKnowledgeSourceModal: React.FC<CreateKnowledgeSourceModalProps> = ({ onClose, onSave }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState<KnowledgeSourceType>('PDF');

    const handleSave = () => {
        if (name && description) {
            onSave({ name, description, type });
        }
    };
    
    const isFormValid = name.trim() && description.trim();

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-popover w-full max-w-lg rounded-lg shadow-xl p-6 space-y-4" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold">Add Knowledge Source</h2>
                <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">Source Name</label>
                    <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-2 bg-input rounded-md text-foreground" placeholder="e.g., Q4 Financial Report" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">Description</label>
                    <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full p-2 bg-input rounded-md text-foreground" placeholder="A short description of this data source." />
                </div>
                <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">Source Type</label>
                    <select value={type} onChange={e => setType(e.target.value as KnowledgeSourceType)} className="w-full p-2 bg-input rounded-md text-foreground">
                        <option value="PDF">PDF</option>
                        <option value="Website">Website</option>
                        <option value="Text">Text</option>
                        <option value="API">API</option>
                    </select>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium bg-secondary rounded-md hover:bg-accent">Cancel</button>
                    <button onClick={handleSave} disabled={!isFormValid} className="px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-md hover:bg-primary/90 disabled:opacity-50">Add Source</button>
                </div>
            </div>
        </div>
    );
};

export default CreateKnowledgeSourceModal;
