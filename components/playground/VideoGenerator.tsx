
import React, { useState, useRef, useEffect } from 'react';
import { generateVideoFromImage } from '../../services/geminiService.ts';
import { fileToBase64 } from '../../utils/helpers.ts';
import { VideoCameraIcon, UploadIcon, KeyIcon, XCircleIcon } from '../icons/Icons.tsx';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_IMAGE_SIZE_MB = 10;
const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;

const VideoGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('A neon hologram of a cat driving a car at top speed.');
  const [image, setImage] = useState<{ file: File; url: string } | null>(null);
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiKeySelected, setApiKeySelected] = useState(false);
  const [isCheckingApiKey, setIsCheckingApiKey] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const checkApiKey = async () => {
      if (window.aistudio && await window.aistudio.hasSelectedApiKey()) {
        setApiKeySelected(true);
      }
      setIsCheckingApiKey(false);
    };
    checkApiKey();
  }, []);

  const handleSelectKey = async () => {
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
      setApiKeySelected(true); // Assume success to avoid race conditions
      setError(null); // Clear previous errors
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setError(null);
    setImage(null);
    setGeneratedVideo(null);

    if (!file) {
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setError(`Invalid file type. Please upload a JPEG, PNG, or WebP image.`);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      setError(`File is too large. Maximum size is ${MAX_IMAGE_SIZE_MB} MB.`);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setImage({ file, url: URL.createObjectURL(file) });
  };
  
  const handleRemoveImage = () => {
      setImage(null);
      if (fileInputRef.current) {
          fileInputRef.current.value = "";
      }
  }

  const handleGenerate = async () => {
    if (!image) return;
    setIsLoading(true);
    setGeneratedVideo(null);
    setError(null);

    try {
        const imageBase64 = await fileToBase64(image.file);
        const videoUrl = await generateVideoFromImage(prompt, imageBase64, image.file.type, aspectRatio);
        setGeneratedVideo(videoUrl);
    } catch (err) {
      console.error("Video generation failed:", err);
      if (err instanceof Error && err.message.includes('Requested entity was not found')) {
          setError("API Key error. Please re-select your API key.");
          setApiKeySelected(false);
      } else {
        setError(err instanceof Error ? err.message : "An unknown error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isCheckingApiKey) {
    return (
        <div className="text-center text-muted-foreground p-8">
            <p>Verifying API key status...</p>
        </div>
    );
  }

  if (!apiKeySelected) {
    return (
        <div className="text-center">
            <KeyIcon className="h-12 w-12 mx-auto mb-4 text-warning" />
            <h3 className="text-lg font-semibold text-foreground">API Key Required for Veo</h3>
            <p className="text-muted-foreground my-2">Video generation models require you to select an API key.</p>
            {error && <p className="text-destructive my-2 font-semibold">{error}</p>}
            <p className="text-xs text-muted-foreground/80 mb-4">You can learn more about billing at <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="text-primary underline">ai.google.dev/gemini-api/docs/billing</a>.</p>
            <button onClick={handleSelectKey} className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-md hover:bg-primary/90">
                Select API Key
            </button>
        </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="space-y-4 mb-4">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., A cinematic shot of a panda skateboarding."
          className="w-full h-24 p-2 bg-input rounded-md text-foreground focus:ring-2 focus:ring-ring focus:outline-none"
        />
        
        <div className="bg-input/50 p-3 rounded-md">
            <label className="block text-sm font-medium text-muted-foreground mb-2">Starting Image</label>
            {image ? (
                <div className="relative group w-32">
                    <img src={image.url} alt="Uploaded preview" className="w-32 h-auto object-contain rounded-md" />
                    <button onClick={handleRemoveImage} className="absolute -top-2 -right-2 p-0.5 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                        <XCircleIcon className="h-5 w-5"/>
                    </button>
                </div>
            ) : (
                <button onClick={() => fileInputRef.current?.click()} className="w-full inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-foreground bg-secondary rounded-md hover:bg-accent border-2 border-dashed border-border">
                    <UploadIcon className="h-5 w-5 mr-2" /> Upload Image
                </button>
            )}
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/png, image/jpeg, image/webp" className="hidden" />
        </div>

        <div className="grid grid-cols-2 gap-2">
            <select value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value as '16:9' | '9:16')} className="w-full p-2 bg-input rounded-md text-foreground focus:ring-2 focus:ring-ring focus:outline-none">
                <option value="16:9">16:9 (Landscape)</option>
                <option value="9:16">9:16 (Portrait)</option>
            </select>

            <button onClick={handleGenerate} disabled={isLoading || !image} className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-md hover:bg-primary/90 disabled:opacity-50">
                <VideoCameraIcon className="h-5 w-5 mr-2" /> {isLoading ? 'Generating...' : 'Generate Video'}
            </button>
        </div>
        {error && <p className="text-destructive text-sm text-center">{error}</p>}
      </div>
      <div className="flex-1 flex items-center justify-center bg-black/20 rounded-lg">
        {isLoading && <p className="text-muted-foreground">Generating video, this may take a few minutes...</p>}
        {generatedVideo && <video src={generatedVideo} controls autoPlay loop className="max-h-full max-w-full object-contain rounded-md" />}
        {!isLoading && !generatedVideo && !error && (
            <div className="text-center text-muted-foreground">
                <VideoCameraIcon className="h-12 w-12 mx-auto mb-2"/>
                 <p>Your generated video will appear here.</p>
                 <p className="text-xs">Upload a starting image to begin.</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default VideoGenerator;
