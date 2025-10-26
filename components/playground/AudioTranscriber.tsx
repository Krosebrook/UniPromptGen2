

import React, { useState, useRef } from 'react';
import { transcribeAudio } from '../../services/geminiService.ts';
import { fileToBase64 } from '../../utils/helpers.ts';
// Fix: Corrected import path to be relative.
import { MicrophoneIcon } from '../icons/Icons.tsx';

const AudioTranscriber: React.FC = () => {
  const [transcription, setTranscription] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        setIsLoading(true);
        setError(null);
        setTranscription('');
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        try {
            const audioBase64 = await fileToBase64(audioBlob);
            const result = await transcribeAudio(audioBase64, audioBlob.type);
            setTranscription(result);
        } catch(err) {
            console.error("Transcription failed:", err);
            setError(err instanceof Error ? err.message : "An unknown error occurred.");
        } finally {
            setIsLoading(false);
        }
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      setError("Could not access microphone. Please grant permission.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      // Get rid of the recording indicator on the browser tab
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  const handleToggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };
  
  return (
    <div className="flex flex-col h-full">
      <div className="mb-4 text-center">
        <button
          onClick={handleToggleRecording}
          className={`px-6 py-3 rounded-full font-semibold inline-flex items-center justify-center transition-colors ${
            isRecording ? 'bg-destructive text-destructive-foreground' : 'bg-primary text-primary-foreground'
          }`}
        >
          <MicrophoneIcon className="h-6 w-6 mr-2" />
          {isRecording ? 'Stop Recording' : 'Start Recording'}
        </button>
      </div>
      <div className="flex-1 bg-black/20 rounded-lg p-4">
        <h3 className="font-semibold text-muted-foreground mb-2">Transcription:</h3>
        {isLoading && <p className="text-muted-foreground">Transcribing audio...</p>}
        {error && <p className="text-destructive">{error}</p>}
        {transcription && <p className="text-foreground whitespace-pre-wrap">{transcription}</p>}
        {!isLoading && !transcription && !error && <p className="text-muted-foreground">Your transcription will appear here.</p>}
      </div>
    </div>
  );
};

export default AudioTranscriber;