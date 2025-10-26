

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI, LiveSession, LiveServerMessage, Modality, Blob } from '@google/genai';
import { decode, encode, decodeAudioData } from '../../utils/helpers.ts';
// Fix: Corrected import path to be relative.
import { MicrophoneIcon, StopCircleIcon } from '../icons/Icons.tsx';

interface TranscriptionEntry {
    speaker: 'user' | 'model';
    text: string;
}

const LowLatencyChat: React.FC = () => {
    const [isRecording, setIsRecording] = useState(false);
    const [transcriptionHistory, setTranscriptionHistory] = useState<TranscriptionEntry[]>([]);
    const [error, setError] = useState<string | null>(null);

    const sessionPromiseRef = useRef<Promise<LiveSession> | null>(null);
    const currentInputTranscriptionRef = useRef('');
    const currentOutputTranscriptionRef = useRef('');
    
    const inputAudioContextRef = useRef<AudioContext | null>(null);
    const outputAudioContextRef = useRef<AudioContext | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);

    const cleanup = useCallback(() => {
        if (sessionPromiseRef.current) {
            sessionPromiseRef.current.then(session => session.close());
            sessionPromiseRef.current = null;
        }
        if (scriptProcessorRef.current) {
            scriptProcessorRef.current.disconnect();
            scriptProcessorRef.current = null;
        }
        if (sourceNodeRef.current) {
            sourceNodeRef.current.disconnect();
            sourceNodeRef.current = null;
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        setIsRecording(false);
    }, []);

    useEffect(() => {
        return () => cleanup();
    }, [cleanup]);

    const startConversation = async () => {
        setError(null);
        setIsRecording(true);
        setTranscriptionHistory([]);

        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        let nextStartTime = 0;
        const sources = new Set<AudioBufferSourceNode>();

        sessionPromiseRef.current = ai.live.connect({
            model: 'gemini-2.5-flash-native-audio-preview-09-2025',
            callbacks: {
                onopen: async () => {
                    inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
                    outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
                    
                    streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
                    sourceNodeRef.current = inputAudioContextRef.current.createMediaStreamSource(streamRef.current);
                    scriptProcessorRef.current = inputAudioContextRef.current.createScriptProcessor(4096, 1, 1);
                    
                    scriptProcessorRef.current.onaudioprocess = (audioProcessingEvent) => {
                        const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                        const pcmBlob: Blob = {
                            data: encode(new Uint8Array(new Int16Array(inputData.map(x => x * 32768)).buffer)),
                            mimeType: 'audio/pcm;rate=16000',
                        };
                        sessionPromiseRef.current?.then((session) => {
                            session.sendRealtimeInput({ media: pcmBlob });
                        });
                    };
                    sourceNodeRef.current.connect(scriptProcessorRef.current);
                    scriptProcessorRef.current.connect(inputAudioContextRef.current.destination);
                },
                onmessage: async (message: LiveServerMessage) => {
                    const outputAudioContext = outputAudioContextRef.current;
                    if (message.serverContent?.outputTranscription) {
                        currentOutputTranscriptionRef.current += message.serverContent.outputTranscription.text;
                    }
                    if (message.serverContent?.inputTranscription) {
                        currentInputTranscriptionRef.current += message.serverContent.inputTranscription.text;
                    }

                    if (message.serverContent?.turnComplete) {
                        const fullInput = currentInputTranscriptionRef.current;
                        const fullOutput = currentOutputTranscriptionRef.current;
                        setTranscriptionHistory(prev => [...prev, { speaker: 'user', text: fullInput }, { speaker: 'model', text: fullOutput }]);
                        currentInputTranscriptionRef.current = '';
                        currentOutputTranscriptionRef.current = '';
                    }

                    const base64EncodedAudioString = message.serverContent?.modelTurn?.parts[0]?.inlineData.data;
                    if (base64EncodedAudioString && outputAudioContext) {
                        nextStartTime = Math.max(nextStartTime, outputAudioContext.currentTime);
                        const audioBuffer = await decodeAudioData(decode(base64EncodedAudioString), outputAudioContext, 24000, 1);
                        const source = outputAudioContext.createBufferSource();
                        source.buffer = audioBuffer;
                        source.connect(outputAudioContext.destination);
                        source.addEventListener('ended', () => sources.delete(source));
                        source.start(nextStartTime);
                        nextStartTime = nextStartTime + audioBuffer.duration;
                        sources.add(source);
                    }
                },
                onerror: (e: ErrorEvent) => {
                    console.error('Live session error:', e);
                    setError('An error occurred with the live session.');
                    cleanup();
                },
                onclose: (e: CloseEvent) => {
                    console.debug('Live session closed');
                    cleanup();
                },
            },
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
                inputAudioTranscription: {},
                outputAudioTranscription: {},
            },
        });
    };

    const handleToggleRecording = () => {
        if (isRecording) {
            cleanup();
        } else {
            startConversation();
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
                    {isRecording ? <StopCircleIcon className="h-6 w-6 mr-2" /> : <MicrophoneIcon className="h-6 w-6 mr-2" />}
                    {isRecording ? 'Stop Conversation' : 'Start Conversation'}
                </button>
            </div>
            <div className="flex-1 bg-black/20 rounded-lg p-4 overflow-y-auto space-y-3">
                {transcriptionHistory.map((entry, index) => (
                    <div key={index} className={`flex ${entry.speaker === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-lg px-4 py-2 rounded-lg ${entry.speaker === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>
                           <p className="text-sm"><strong>{entry.speaker === 'user' ? 'You' : 'Model'}:</strong> {entry.text}</p>
                        </div>
                    </div>
                ))}
                {!isRecording && transcriptionHistory.length === 0 && (
                    <p className="text-center text-muted-foreground">Start a conversation to see the transcript.</p>
                )}
                {error && <p className="text-destructive text-center">{error}</p>}
            </div>
        </div>
    );
};

export default LowLatencyChat;