import React, { useState, useRef } from 'react';
import { generateSpeech } from '../../services/geminiService.ts';
import { decode, decodeAudioData } from '../../utils/helpers.ts';
import { SpeakerWaveIcon } from '../icons/Icons.tsx';

const TextToSpeech: React.FC = () => {
  const [text, setText] = useState('Hello! I am a helpful AI assistant. I can turn text into natural-sounding speech.');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const handleGenerateAndPlay = async () => {
    if (!text.trim()) return;
    setIsLoading(true);
    setError(null);

    try {
      const base64Audio = await generateSpeech(text);
      
      if (!audioContextRef.current) {
         audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }
      const audioContext = audioContextRef.current;
      const audioBytes = decode(base64Audio);
      const audioBuffer = await decodeAudioData(audioBytes, audioContext, 24000, 1);
      
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      source.start();

    } catch (err) {
      console.error("TTS generation failed:", err);
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="space-y-4">
        <div>
          <label htmlFor="tts-text" className="block text-sm font-medium text-muted-foreground mb-1">Text to Synthesize</label>
          <textarea
            id="tts-text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full h-32 p-2 bg-input rounded-md text-foreground focus:ring-2 focus:ring-ring focus:outline-none"
          />
        </div>
        <button
          onClick={handleGenerateAndPlay}
          disabled={isLoading || !text.trim()}
          className="w-full inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-md hover:bg-primary/90 disabled:opacity-50"
        >
          <SpeakerWaveIcon className="h-5 w-5 mr-2" />
          {isLoading ? 'Generating...' : 'Generate and Play Audio'}
        </button>
        {error && <p className="text-destructive text-sm text-center">{error}</p>}
      </div>
    </div>
  );
};

export default TextToSpeech;
