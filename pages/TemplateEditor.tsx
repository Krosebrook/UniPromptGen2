import React, { useState, useEffect } from 'react';
// FIX: Import MOCK_USER to be used in the discussion section.
import { MOCK_TEMPLATES, MOCK_MODEL_PROFILES, MOCK_EVALUATIONS, MOCK_COMMENTS, MOCK_USER } from '../constants.ts';
import { PromptTemplate, ModelProfile, ExecutionEvent } from '../types.ts';
import QualityScoreDisplay from '../components/QualityScoreDisplay.tsx';
import { compilePrompt } from '../services/modelCompilerService.ts';
import { runPrompt } from '../services/geminiService.ts';
import { ingestExecutionEvent } from '../services/qualityService.ts';
import {
  CodeBracketIcon, DocumentTextIcon, SparklesIcon, ChartBarIcon, PlayIcon, StarIcon, ChatBubbleBottomCenterTextIcon, PaperAirplaneIcon, HandThumbUpIcon, HandThumbDownIcon
} from '../components/icons/Icons.tsx';

interface TemplateEditorProps {
  templateId: string;
}

const TemplateEditor: React.FC<TemplateEditorProps> = ({ templateId }) => {
  const [template, setTemplate] = useState<PromptTemplate | null>(null);
  const [activeTab, setActiveTab] = useState('harness');
  
  // Test Harness State
  const [userInput, setUserInput] = useState('');
  const [selectedProfileId, setSelectedProfileId] = useState(MOCK_MODEL_PROFILES[0].id);
  const [compiledPrompt, setCompiledPrompt] = useState('');
  const [modelOutput, setModelOutput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [runFinished, setRunFinished] = useState(false);
  const [executionTime, setExecutionTime] = useState(0);

  useEffect(() => {
    const foundTemplate = MOCK_TEMPLATES.find(t => t.id === templateId);
    setTemplate(foundTemplate || null);
  }, [templateId]);

  const selectedProfile = MOCK_MODEL_PROFILES.find(p => p.id === selectedProfileId)!;

  useEffect(() => {
    if (template) {
      const newCompiledPrompt = compilePrompt(template.abstractPrompt, selectedProfile, { content: userInput });
      setCompiledPrompt(newCompiledPrompt);
    }
  }, [template, selectedProfile, userInput]);

  const handleRunPrompt = async () => {
    setIsLoading(true);
    setRunFinished(false);
    setModelOutput('');
    const startTime = Date.now();

    const output = await runPrompt(compiledPrompt);
    
    const endTime = Date.now();
    setExecutionTime(endTime - startTime);
    setModelOutput(output);
    setIsLoading(false);
    setRunFinished(true);
  };
  
  const handleRating = (rating: number, success: boolean) => {
      if (!template) return;
      const event: ExecutionEvent = {
          userRating: rating,
          success,
          latencyMs: executionTime,
          cost: 0.001 // Mock cost
      };
      const updatedTemplate = ingestExecutionEvent(template, event);
      setTemplate(updatedTemplate);
      setRunFinished(false); // Hide rating buttons after rating
  }

  if (!template) {
    return <div className="text-center py-10">Template not found.</div>;
  }

  const TabButton = ({ id, label, icon: Icon }: {id: string, label: string, icon: React.ElementType}) => (
      <button
        onClick={() => setActiveTab(id)}
        className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-ring ${
          activeTab === id
            ? 'bg-primary text-primary-foreground'
            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
        }`}
      >
        <Icon className="h-5 w-5 mr-2" />
        {label}
      </button>
  );

  return (
    <div className="space-y-6">
      <div className="bg-card shadow-card rounded-lg p-6">
        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{template.name}</h1>
            <p className="text-muted-foreground mt-1">{template.description}</p>
          </div>
          <div className="flex-shrink-0">
            <QualityScoreDisplay score={template.qualityScore} size="lg" />
          </div>
        </div>
      </div>
      
      <div className="flex items-center space-x-2 border-b border-border pb-2">
          <TabButton id="harness" label="Test Harness" icon={PlayIcon} />
          <TabButton id="evaluations" label="Evaluations" icon={StarIcon} />
          <TabButton id="discussion" label="Discussion" icon={ChatBubbleBottomCenterTextIcon} />
          <TabButton id="analytics" label="Analytics" icon={ChartBarIcon} />
      </div>

      {activeTab === 'harness' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* LEFT COLUMN */}
            <div className="space-y-6">
                <div className="bg-card shadow-card rounded-lg">
                    <div className="p-4 border-b border-border">
                        <h3 className="font-semibold text-foreground">User Input</h3>
                    </div>
                    <div className="p-4">
                        <textarea
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            placeholder="Provide any specific details or inputs for the prompt here..."
                            className="w-full h-32 p-2 bg-input rounded-md text-foreground focus:ring-2 focus:ring-ring focus:outline-none"
                        />
                    </div>
                </div>
                <div className="bg-card shadow-card rounded-lg">
                    <div className="p-4 border-b border-border">
                        <h3 className="font-semibold text-foreground">Configuration</h3>
                    </div>
                    <div className="p-4 space-y-4">
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">Model Profile</label>
                            <select
                                value={selectedProfileId}
                                onChange={(e) => setSelectedProfileId(e.target.value)}
                                className="w-full mt-1 p-2 bg-input rounded-md text-foreground focus:ring-2 focus:ring-ring focus:outline-none"
                            >
                                {MOCK_MODEL_PROFILES.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                        </div>
                         <button
                            onClick={handleRunPrompt}
                            disabled={isLoading}
                            className="w-full inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50"
                        >
                            <PlayIcon className="h-5 w-5 mr-2" />
                            {isLoading ? 'Running...' : 'Run Prompt'}
                        </button>
                    </div>
                </div>
            </div>
            
            {/* RIGHT COLUMN */}
             <div className="space-y-6">
                <div className="bg-card shadow-card rounded-lg">
                    <div className="p-4 border-b border-border flex items-center gap-2">
                        <SparklesIcon className="h-5 w-5 text-primary"/>
                        <h3 className="font-semibold text-foreground">Model Output</h3>
                    </div>
                    <div className="p-4 min-h-[18rem]">
                        {isLoading && <p className="text-muted-foreground">Generating response...</p>}
                        {modelOutput && <pre className="whitespace-pre-wrap text-sm text-foreground font-mono">{modelOutput}</pre>}
                        {runFinished && (
                            <div className="mt-4 p-3 bg-secondary rounded-lg">
                                <p className="text-sm text-center text-muted-foreground mb-2">How was this response? (Execution time: {executionTime}ms)</p>
                                <div className="flex justify-center gap-3">
                                    <button onClick={() => handleRating(5, true)} className="p-2 rounded-full hover:bg-accent"><HandThumbUpIcon className="h-5 w-5 text-success"/></button>
                                    <button onClick={() => handleRating(1, false)} className="p-2 rounded-full hover:bg-accent"><HandThumbDownIcon className="h-5 w-5 text-destructive"/></button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                <div className="bg-card shadow-card rounded-lg">
                    <div className="p-4 border-b border-border flex items-center gap-2">
                        <DocumentTextIcon className="h-5 w-5 text-primary"/>
                        <h3 className="font-semibold text-foreground">Compiled Prompt</h3>
                    </div>
                    <div className="p-4 bg-background rounded-b-lg">
                        <pre className="whitespace-pre-wrap text-xs text-muted-foreground font-mono">{compiledPrompt}</pre>
                    </div>
                </div>
            </div>
        </div>
      )}
      
      {activeTab === 'evaluations' && (
          <div className="bg-card shadow-card rounded-lg p-6 space-y-6">
              {MOCK_EVALUATIONS.map(e => (
                  <div key={e.id} className="border-b border-border pb-4 last:border-b-0 last:pb-0">
                      <div className="flex items-center mb-2">
                          <img src={e.evaluator.avatarUrl} className="h-8 w-8 rounded-full mr-3" alt={e.evaluator.name} />
                          <div>
                              <p className="font-semibold text-foreground">{e.evaluator.name}</p>
                              <p className="text-xs text-muted-foreground">{new Date(e.date).toLocaleDateString()}</p>
                          </div>
                      </div>
                      <p className="text-sm text-foreground mb-3">{e.feedback}</p>
                      <div className="flex items-center gap-4 text-sm">
                           <span className="font-medium">Code Quality: {e.scores.codeQuality}/10</span>
                           <span className="font-medium">Design: {e.scores.design}/10</span>
                           <span className="font-medium">Functionality: {e.scores.functionality}/10</span>
                      </div>
                  </div>
              ))}
          </div>
      )}

      {activeTab === 'discussion' && (
           <div className="bg-card shadow-card rounded-lg p-6">
               <div className="space-y-6">
                    {MOCK_COMMENTS.map(c => (
                        <div key={c.id} className="flex items-start space-x-4">
                            <img src={c.author.avatarUrl} className="h-10 w-10 rounded-full" alt={c.author.name} />
                            <div className="flex-1">
                                <div className="flex items-center">
                                    <p className="font-semibold text-foreground mr-2">{c.author.name}</p>
                                    <p className="text-xs text-muted-foreground">{c.date}</p>
                                </div>
                                <p className="text-sm text-foreground">{c.text}</p>
                            </div>
                        </div>
                    ))}
               </div>
                <div className="mt-6 flex items-start space-x-4">
                    <img src={MOCK_USER.avatarUrl} className="h-10 w-10 rounded-full" alt={MOCK_USER.name} />
                    <div className="flex-1">
                        <textarea placeholder="Add to the discussion..." className="w-full p-2 bg-input rounded-md text-foreground focus:ring-2 focus:ring-ring focus:outline-none"></textarea>
                        <button className="mt-2 inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-md hover:bg-primary/90">
                           <PaperAirplaneIcon className="h-4 w-4 mr-2" />
                           Post Comment
                        </button>
                    </div>
                </div>
           </div>
      )}

       {activeTab === 'analytics' && (
           <div className="bg-card shadow-card rounded-lg p-6">
                <div className="text-center text-muted-foreground">
                    <ChartBarIcon className="h-12 w-12 mx-auto mb-2"/>
                    <h3 className="text-lg font-semibold text-foreground">Analytics Coming Soon</h3>
                    <p>Detailed performance and usage metrics will be displayed here.</p>
                </div>
           </div>
       )}
    </div>
  );
};

export default TemplateEditor;