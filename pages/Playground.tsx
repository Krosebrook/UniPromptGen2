import React, { useState } from 'react';
import Chatbot from '../components/playground/Chatbot.tsx';
import ImageGenerator from '../components/playground/ImageGenerator.tsx';
import ImageEditor from '../components/playground/ImageEditor.tsx';
import VideoGenerator from '../components/playground/VideoGenerator.tsx';
import AudioTranscriber from '../components/playground/AudioTranscriber.tsx';
import TextToSpeech from '../components/playground/TextToSpeech.tsx';
import Search from '../components/playground/Search.tsx';
import {
  ChatBubbleLeftRightIcon, PhotoIcon, VideoCameraIcon, MicrophoneIcon, SpeakerWaveIcon, GlobeAltIcon, SparklesIcon
} from '../components/icons/Icons.tsx';

type TabId = 'chat' | 'image-gen' | 'image-edit' | 'video-gen' | 'audio-transcribe' | 'tts' | 'search';

const Playground: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('chat');

  const tabs = [
    { id: 'chat', label: 'Chatbot', icon: ChatBubbleLeftRightIcon, component: <Chatbot /> },
    { id: 'search', label: 'Search', icon: GlobeAltIcon, component: <Search /> },
    { id: 'image-gen', label: 'Image Generation', icon: PhotoIcon, component: <ImageGenerator /> },
    { id: 'image-edit', label: 'Image Editing', icon: SparklesIcon, component: <ImageEditor /> },
    { id: 'video-gen', label: 'Video Generation', icon: VideoCameraIcon, component: <VideoGenerator /> },
    { id: 'audio-transcribe', label: 'Audio Transcription', icon: MicrophoneIcon, component: <AudioTranscriber /> },
    { id: 'tts', label: 'Text-to-Speech', icon: SpeakerWaveIcon, component: <TextToSpeech /> },
  ];
  
  const ActiveComponent = tabs.find(t => t.id === activeTab)?.component;

  return (
    <div className="flex flex-col h-full">
      <div className="flex-shrink-0 mb-6">
        <h1 className="text-3xl font-bold text-foreground">AI Playground</h1>
        <p className="text-muted-foreground">Experiment with various Gemini capabilities.</p>
      </div>

      <div className="flex-1 flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-56 flex-shrink-0">
          <div className="space-y-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabId)}
                className={`w-full flex items-center px-4 py-2.5 text-sm font-medium rounded-md transition-colors text-left ${
                  activeTab === tab.id
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                }`}
              >
                <tab.icon className="h-5 w-5 mr-3" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1 bg-card shadow-card rounded-lg p-6">
          {ActiveComponent}
        </div>
      </div>
    </div>
  );
};

export default Playground;
