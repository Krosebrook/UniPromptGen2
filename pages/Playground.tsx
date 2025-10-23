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
import { PhotoIcon, VideoCameraIcon, MicrophoneIcon, SpeakerWaveIcon, GlobeAltIcon, SparklesIcon } from '../components/icons/Icons.tsx';

// Add placeholder icons if they dont exist in Icons.tsx to prevent crashes
const ChatBubbleLeftRightIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193l-3.722.537a59.731 59.731 0 0 1-1.04 1.04l-1.04-1.04a1.5 1.5 0 0 1 0-2.121l4.242-4.242a1.5 1.5 0 0 0 0-2.121l-4.242-4.242a1.5 1.5 0 0 1 0-2.121l1.04 1.04a59.735 59.735 0 0 1 1.04 1.04l3.722.537ZM3.75 8.511c-.884.284-1.5 1.128-1.5 2.097v4.286c0 1.136.847 2.1 1.98 2.193l3.722.537a59.731 59.731 0 0 0 1.04 1.04l1.04-1.04a1.5 1.5 0 0 0 0-2.121l-4.242-4.242a1.5 1.5 0 0 1 0-2.121l4.242-4.242a1.5 1.5 0 0 0 0-2.121L8.25 4.755a59.735 59.735 0 0 0-1.04 1.04l-3.722.537Z" /></svg>;
const ScissorsIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M7.848 8.25l1.536.887M7.848 8.25a3 3 0 1 1-5.196-3 3 3 0 0 1 5.196 3Zm1.536.887a2.167 2.167 0 0 1-2.481 2.481M9.384 9.137l6.072 3.506m-6.072-3.506a2.167 2.167 0 0 1 2.481 2.481m-2.481-2.481 2.481 2.481m6.072 3.506a3 3 0 1 1-5.196 3 3 3 0 0 1 5.196-3Zm-3-3.001 1.536.887m-1.536-.887a2.167 2.167 0 0 1 2.481-2.481m2.481 2.481 2.481-2.481m-2.481 2.481-2.481 2.481m0 0-2.481 2.481" /></svg>;
const BoltIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" /></svg>;

const TABS = [
  { name: 'Chatbot', component: Chatbot, icon: ChatBubbleLeftRightIcon },
  { name: 'Low-Latency Chat', component: LowLatencyChat, icon: BoltIcon },
  { name: 'Image Generation', component: ImageGenerator, icon: PhotoIcon },
  { name: 'Image Editing', component: ImageEditor, icon: ScissorsIcon },
  { name: 'Video Generation', component: VideoGenerator, icon: VideoCameraIcon },
  { name: 'Audio Transcription', component: AudioTranscriber, icon: MicrophoneIcon },
  { name: 'Text-to-Speech', component: TextToSpeech, icon: SpeakerWaveIcon },
  { name: 'Grounded Search', component: Search, icon: GlobeAltIcon },
  { name: 'Complex Reasoning', component: ComplexReasoning, icon: SparklesIcon },
];

const Playground: React.FC = () => {
  const [activeTab, setActiveTab] = useState(TABS[0].name);

  const ActiveComponent = TABS.find(tab => tab.name === activeTab)?.component || Chatbot;

  return (
    <div className="flex flex-col h-full">
      <div className="flex-shrink-0 mb-6">
        <h1 className="text-3xl font-bold text-foreground">AI Playground</h1>
        <p className="text-muted-foreground">Experiment with different generative AI capabilities.</p>
      </div>

      <div className="flex flex-grow gap-6 overflow-hidden">
        <aside className="w-64 flex-shrink-0 bg-card p-4 rounded-lg flex flex-col">
          <nav className="flex-1 space-y-2">
            {TABS.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.name;
              return (
                <button
                  key={tab.name}
                  onClick={() => setActiveTab(tab.name)}
                  className={`w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </aside>
        <main className="flex-1 bg-card p-6 rounded-lg overflow-y-auto">
          <ActiveComponent />
        </main>
      </div>
    </div>
  );
};

export default Playground;