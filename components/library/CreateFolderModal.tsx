import React, { useState } from 'react';

interface CreateFolderModalProps {
    onClose: () => void;
    onSave: (name: string) => void;
}

const CreateFolderModal: React.FC<CreateFolderModalProps> = ({ onClose, onSave }) => {
    const [name, setName] = useState('');

    const handleSave = () => {
        if (name.trim()) {
            onSave(name.trim());
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-popover w-full max-w-sm rounded-lg shadow-xl p-6 space-y-4" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold">Create New Folder</h2>
                <div>
                    <label htmlFor="folderName" className="block text-sm font-medium text-muted-foreground mb-1">Folder Name</label>
                    <input
                        id="folderName"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full p-2 bg-input rounded-md text-foreground focus:ring-2 focus:ring-ring focus:outline-none"
                        placeholder="e.g., Marketing Prompts"
                        autoFocus
                        onKeyPress={(e) => e.key === 'Enter' && handleSave()}
                    />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium bg-secondary rounded-md hover:bg-accent">
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={!name.trim()}
                        className="px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-md hover:bg-primary/90 disabled:opacity-50"
                    >
                        Create
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateFolderModal;