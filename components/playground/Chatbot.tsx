import React, { useState, useRef, useEffect } from 'react';
import { sendMessage, startChat } from '../../services/geminiService.ts';
import type { ChatMessage } from '../../types.ts';
import { PaperAirplaneIcon, UserCircleIcon, SparklesIcon } from '../icons/Icons.tsx';

const Chatbot: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  useEffect(() => {
    // Initialize with a welcome message
    setMessages([{ id: 'init', role: 'model', text: 'Hello! How can I help you today?' }]);
    startChat(); // Initialize the chat session
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = { id: `user-${Date.now()}`, role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const modelMessage = await sendMessage(input);
      setMessages(prev => [...prev, modelMessage]);
    } catch (error) {
      console.error("Failed to send message:", error);
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'model',
        text: 'Sorry, I encountered an error. Please try again.'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-12rem)]">
      <div className="flex-1 overflow-y-auto pr-4 space-y-4">
        {messages.map(msg => (
          <div key={msg.id} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
            {msg.role === 'model' && (
              <div className="p-2 bg-primary/20 rounded-full">
                <SparklesIcon className="h-5 w-5 text-primary" />
              </div>
            )}
            <div className={`max-w-lg px-4 py-2 rounded-lg ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>
              <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
            </div>
             {msg.role === 'user' && (
              <div className="p-2 bg-secondary rounded-full">
                 <UserCircleIcon className="h-5 w-5 text-muted-foreground" />
              </div>
            )}
          </div>
        ))}
         {isLoading && (
            <div className="flex items-start gap-3">
               <div className="p-2 bg-primary/20 rounded-full">
                <SparklesIcon className="h-5 w-5 text-primary animate-pulse" />
              </div>
               <div className="px-4 py-2 rounded-lg bg-secondary">
                  <p className="text-sm text-muted-foreground">Thinking...</p>
               </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="mt-4 flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Type your message..."
          className="flex-1 px-4 py-2 rounded-md bg-input text-foreground focus:ring-2 focus:ring-ring focus:outline-none"
          disabled={isLoading}
        />
        <button
          onClick={handleSend}
          disabled={isLoading || !input.trim()}
          className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-md hover:bg-primary/90 disabled:opacity-50"
        >
          <PaperAirplaneIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default Chatbot;
