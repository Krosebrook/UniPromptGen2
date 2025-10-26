import React, { useState, useRef } from 'react';
import { analyzeImage } from '../../services/geminiService.ts';
import { fileToBase64 } from '../../utils/helpers.ts';
import { SparklesIcon, UploadIcon, PhotoIcon } from '../icons/Icons.tsx';

const ImageAnalyzer: React.FC = () => {
  const [prompt, setPrompt] = useState('Describe what is in this image in detail.');
  const [image, setImage] = useState<{ file: File; url: string } | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage({ file, url: URL.createObjectURL(file) });
      setResult(null);
      setError(null);
    }
  };

  const handleAnalyze = async () => {
    if (!prompt || !image) return;
    setIsLoading(true);
    setResult(null);
    setError(null);

    try {
      const imageBase64 = await fileToBase64(image.file);
      const analysisResult = await analyzeImage(prompt, imageBase64, image.file.type);
      setResult(analysisResult);
    } catch (err) {
      console.error("Image analysis failed:", err);
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
       <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
            <div className="flex flex-col gap-4">
                <div className="flex-1 bg-black/20 rounded-lg p-2 flex flex-col items-center justify-center">
                    {image ? (
                        <img src={image.url} className="max-h-full max-w-full object-contain rounded-md" />
                    ) : (
                        <div className="text-center text-muted-foreground">
                            <PhotoIcon className="h-12 w-12 mx-auto mb-2"/>
                            <p>Upload an image to analyze.</p>
                        </div>
                    )}
                </div>
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-foreground bg-secondary rounded-md hover:bg-accent"
                >
                    <UploadIcon className="h-5 w-5 mr-2" />
                    Upload Image
                </button>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
            </div>
             <div className="flex flex-col gap-4">
                <div className="flex-1 flex flex-col">
                    <label htmlFor="analyze-prompt" className="block text-sm font-medium text-muted-foreground mb-1">Analysis Prompt</label>
                    <textarea
                        id="analyze-prompt"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="e.g., What is the breed of this dog?"
                        className="w-full h-24 p-2 bg-input rounded-md text-foreground focus:ring-2 focus:ring-ring focus:outline-none"
                    />
                    <button
                        onClick={handleAnalyze}
                        disabled={isLoading || !prompt.trim() || !image}
                        className="w-full mt-2 inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-md hover:bg-primary/90 disabled:opacity-50"
                    >
                        <SparklesIcon className="h-5 w-5 mr-2" />
                        {isLoading ? 'Analyzing...' : 'Analyze Image'}
                    </button>
                    <div className="flex-1 bg-input/50 rounded-lg p-4 mt-4 overflow-y-auto">
                        <h3 className="font-semibold text-muted-foreground mb-2">Result:</h3>
                        {isLoading && <p className="text-muted-foreground">Analyzing image...</p>}
                        {error && <p className="text-destructive text-sm">{error}</p>}
                        {result && <p className="text-foreground whitespace-pre-wrap text-sm">{result}</p>}
                        {!isLoading && !result && !error && <p className="text-muted-foreground text-sm">Analysis will appear here.</p>}
                    </div>
                </div>
            </div>
       </div>
    </div>
  );
};

export default ImageAnalyzer;
