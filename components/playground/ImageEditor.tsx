

import React, { useState, useRef } from 'react';
import { editImage } from '../../services/geminiService.ts';
import { fileToBase64 } from '../../utils/helpers.ts';
import { SparklesIcon, UploadIcon } from '../icons/Icons.tsx';

const ImageEditor: React.FC = () => {
  const [prompt, setPrompt] = useState('Add a retro, grainy film filter to the image.');
  const [originalImage, setOriginalImage] = useState<{ file: File; url: string } | null>(null);
  const [editedImage, setEditedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setOriginalImage({ file, url: URL.createObjectURL(file) });
      setEditedImage(null);
    }
  };

  const handleEdit = async () => {
    if (!prompt || !originalImage) return;
    setIsLoading(true);
    setEditedImage(null);
    setError(null);

    try {
      const imageBase64 = await fileToBase64(originalImage.file);
      const resultUrl = await editImage(prompt, imageBase64, originalImage.file.type);
      setEditedImage(resultUrl);
    } catch (err) {
      console.error("Image editing failed:", err);
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="space-y-4 mb-4">
        <div>
          <label htmlFor="edit-prompt" className="block text-sm font-medium text-muted-foreground mb-1">Editing Prompt</label>
          <textarea
            id="edit-prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., Make the sky purple."
            className="w-full h-20 p-2 bg-input rounded-md text-foreground focus:ring-2 focus:ring-ring focus:outline-none"
          />
        </div>
        <div className="flex gap-2">
            <button
                onClick={() => fileInputRef.current?.click()}
                className="w-1/2 inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-foreground bg-secondary rounded-md hover:bg-accent"
            >
                <UploadIcon className="h-5 w-5 mr-2" />
                Upload Image
            </button>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
            
            <button
                onClick={handleEdit}
                disabled={isLoading || !prompt.trim() || !originalImage}
                className="w-1/2 inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-md hover:bg-primary/90 disabled:opacity-50"
            >
                <SparklesIcon className="h-5 w-5 mr-2" />
                {isLoading ? 'Editing...' : 'Apply Edit'}
            </button>
        </div>
      </div>

       <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-black/20 rounded-lg p-2 flex flex-col items-center justify-center">
                <h3 className="text-sm font-semibold text-muted-foreground mb-2">Original</h3>
                {originalImage ? <img src={originalImage.url} className="max-h-full max-w-full object-contain rounded-md" /> : <p className="text-muted-foreground">Upload an image</p>}
            </div>
            <div className="bg-black/20 rounded-lg p-2 flex flex-col items-center justify-center">
                <h3 className="text-sm font-semibold text-muted-foreground mb-2">Edited</h3>
                {isLoading && <p className="text-muted-foreground">Applying edit...</p>}
                {error && <p className="text-destructive text-sm">{error}</p>}
                {editedImage ? <img src={editedImage} className="max-h-full max-w-full object-contain rounded-md" /> : <p className="text-muted-foreground">Edited image will appear here</p>}
            </div>
       </div>
    </div>
  );
};

export default ImageEditor;