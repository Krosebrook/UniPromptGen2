import React, { useState } from 'react';
import Chatbot from '../components/playground/Chatbot.tsx';
import ImageGenerator from '../components/playground/ImageGenerator.tsx';
import ImageEditor from '../components/playground/ImageEditor.tsx';
import VideoGenerator from '../components/playground/VideoGenerator.tsx';
import AudioTranscriber from '../components/playground/AudioTranscriber.tsx';
import TextToSpeech from '../components/playground/TextToSpeech.tsx';
import Search from '../components/playground/Search.tsx';
import ComplexReasoning from '../components/playground/ComplexReasoning.tsx';
import LowLatencyChat from '../components/playground/LowLatencyChat.tsx';
import {
  ChatBubbleLeftRightIcon, PhotoIcon, ScissorsIcon, VideoCameraIcon,
  MicrophoneIcon, SpeakerWaveIcon, GlobeAltIcon, SparklesIcon, BoltIcon
} from '../components/icons/Icons.tsx';

type PlaygroundTab = 'chat' | 'image-generation' | 'image-editing' | 'video-generation' | 'audio-transcription' | 'text-to-speech' | 'grounded-search' | 'complex-reasoning' | 'low-latency-chat';

const TABS: { id: PlaygroundTab; label: string; icon: React.ElementType; component: React.ElementType }[] = [
  { id: 'low-latency-chat', label: 'Live Chat', icon: BoltIcon, component: LowLatencyChat },
  { id: 'chat', label: 'Chatbot', icon: ChatBubbleLeftRightIcon, component: Chatbot },
  { id: 'image-generation', label: 'Image Generation', icon: PhotoIcon, component: ImageGenerator },
  { id: 'image-editing', label: 'Image Editing', icon: ScissorsIcon, component: ImageEditor },
  { id: 'video-generation', label: 'Video Generation', icon: VideoCameraIcon, component: VideoGenerator },
  { id: 'audio-transcription', label: 'Audio Transcription', icon: MicrophoneIcon, component: AudioTranscriber },
  { id: 'text-to-speech', label: 'Text-to-Speech', icon: SpeakerWaveIcon, component: TextToSpeech },
  { id: 'grounded-search', label: 'Grounded Search', icon: GlobeAltIcon, component: Search },
  { id: 'complex-reasoning', label: 'Complex Reasoning', icon: SparklesIcon, component: ComplexReasoning },
];

const Playground: React.FC = () => {
  const [activeTab, setActiveTab] = useState<PlaygroundTab>('low-latency-chat');

  const ActiveComponent = TABS.find(tab => tab.id === activeTab)?.component;

  return (
    <div className="flex h-full flex-col md:flex-row gap-6">
      <aside className="w-full md:w-56 flex-shrink-0">
        <h1 className="text-2xl font-bold mb-4">AI Playground</h1>
        <nav className="flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0">
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center w-full text-left px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === tab.id
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            }`}>
              <tab.icon className="h-5 w-5 mr-3 flex-shrink-0" />
              {tab.label}
            </button>
          ))}
        </nav>
      </aside>
      <main className="flex-1 bg-card shadow-card rounded-lg p-6 min-h-0">
        {ActiveComponent && <ActiveComponent />}
      </main>
    </div>
  );
};

export default Playground;
