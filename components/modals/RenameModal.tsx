import React, { useState } from 'react';
import { LibraryItem, LibraryType } from '../../types.ts';
import { updateFolder } from '../../services/apiService.ts'; // Assuming only folders are renameable for now

interface RenameModalProps {
    item: LibraryItem;
    itemType: LibraryType | 'folder';
    onClose: () => void;
    onRenamed: () => void;
}

const RenameModal: React.FC<RenameModalProps> = ({ item, itemType, onClose, onRenamed }) => {
    const [name, setName] = useState(item.name);
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        if (!name.trim() || name === item.name) {
            onClose();
            return;
        }

        setIsSaving(true);
        if (itemType === 'folder') {
            await updateFolder(item.id, { name });
        }
        // TODO: Add rename logic for other item types
        setIsSaving(false);
        onRenamed();
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-popover w-full max-w-sm rounded-lg shadow-xl p-6 space-y-4" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold">Rename</h2>
                <div>
                    <label htmlFor="itemName" className="block text-sm font-medium text-muted-foreground mb-1">New Name</label>
                    <input
                        id="itemName"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full p-2 bg-input rounded-md text-foreground focus:ring-2 focus:ring-ring focus:outline-none"
                        autoFocus
                        onKeyPress={(e) => e.key === 'Enter' && handleSave()}
                    />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium bg-secondary rounded-md hover:bg-accent">Cancel</button>
                    <button
                        onClick={handleSave}
                        disabled={!name.trim() || isSaving}
                        className="px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-md hover:bg-primary/90 disabled:opacity-50"
                    >
                        {isSaving ? 'Saving...' : 'Save'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RenameModal;