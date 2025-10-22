import React, { useState } from 'react';
import Chatbot from '../components/playground/Chatbot.tsx';
import ImageGenerator from '../components/playground/ImageGenerator.tsx';
import ImageEditor from '../components/playground/ImageEditor.tsx';
import VideoGenerator from '../components/playground/VideoGenerator.tsx';
import AudioTranscriber from '../components/playground/AudioTranscriber.tsx';
import TextToSpeech from '../components/playground/TextToSpeech.tsx';
import Search from '../components/playground/Search.tsx';
import ComplexReasoning from '../components/playground/ComplexReasoning.tsx';

type PlaygroundTab = 'chat' | 'image-gen' | 'image-edit' | 'video-gen' | 'audio-transcribe' | 'tts' | 'search' | 'reasoning';

const TABS: { id: PlaygroundTab; label: string; component: React.FC }[] = [
  { id: 'chat', label: 'Chatbot', component: Chatbot },
  { id: 'image-gen', label: 'Image Generation', component: ImageGenerator },
  { id: 'image-edit', label: 'Image Editing', component: ImageEditor },
  { id: 'video-gen', label: 'Video Generation', component: VideoGenerator },
  { id: 'audio-transcribe', label: 'Audio Transcription', component: AudioTranscriber },
  { id: 'tts', label: 'Text-to-Speech', component: TextToSpeech },
  { id: 'search', label: 'Grounded Search', component: Search },
  { id: 'reasoning', label: 'Complex Reasoning', component: ComplexReasoning },
];

const Playground: React.FC = () => {
  const [activeTab, setActiveTab] = useState<PlaygroundTab>('chat');

  const ActiveComponent = TABS.find(tab => tab.id === activeTab)?.component || Chatbot;

  return (
    <div className="flex flex-col h-full">
      <div>
        <h1 className="text-3xl font-bold text-foreground">AI Playground</h1>
        <p className="text-muted-foreground">Experiment with different generative AI capabilities.</p>
      </div>

      <div className="flex-1 flex flex-col md:flex-row gap-6 mt-6">
        <div className="w-full md:w-48 flex-shrink-0">
          <div className="flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full text-left px-3 py-2 text-sm font-medium rounded-md whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary hover:bg-accent'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 bg-card shadow-card rounded-lg p-6 min-h-[300px]">
          <ActiveComponent />
        </div>
      </div>
    </div>
  );
};

export default Playground;
