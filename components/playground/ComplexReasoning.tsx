

import React, { useState } from 'react';
import { runComplexReasoning } from '../../services/geminiService.ts';
import { SparklesIcon } from '../icons/Icons.tsx';

const ComplexReasoning: React.FC = () => {
  const [prompt, setPrompt] = useState('Given the following constraints: a red block cannot be on top of a green block, a blue block must be next to a yellow block, and there are 4 blocks in a single tower (red, green, blue, yellow), what are the possible valid arrangements of the tower from top to bottom?');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleRun = async () => {
    if (!prompt.trim()) return;
    setIsLoading(true);
    setResult('');
    setError(null);

    try {
      const responseText = await runComplexReasoning(prompt);
      setResult(responseText);
    } catch (err) {
      console.error("Complex reasoning failed:", err);
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="space-y-4 mb-4">
        <div>
          <label htmlFor="reasoning-prompt" className="block text-sm font-medium text-muted-foreground mb-1">Complex Prompt</label>
          <textarea
            id="reasoning-prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter a complex problem, logical puzzle, or a multi-step reasoning task..."
            className="w-full h-32 p-2 bg-input rounded-md text-foreground focus:ring-2 focus:ring-ring focus:outline-none"
          />
        </div>
        <button
          onClick={handleRun}
          disabled={isLoading || !prompt.trim()}
          className="w-full inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-md hover:bg-primary/90 disabled:opacity-50"
        >
          <SparklesIcon className="h-5 w-5 mr-2" />
          {isLoading ? 'Reasoning...' : 'Run Complex Reasoning'}
        </button>
      </div>

      <div className="flex-1 bg-black/20 rounded-lg p-4 overflow-y-auto">
        {isLoading && <p className="text-muted-foreground">The model is thinking...</p>}
        {error && <p className="text-destructive">{error}</p>}
        {result && (
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-foreground mb-2">Result</h3>
              <div className="text-foreground whitespace-pre-wrap prose prose-sm prose-invert max-w-none">
                {result}
              </div>
            </div>
          </div>
        )}
        {!isLoading && !result && !error && (
            <div className="text-center text-muted-foreground pt-10">
                <SparklesIcon className="h-12 w-12 mx-auto mb-2"/>
                <p>The result of the complex reasoning task will appear here.</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default ComplexReasoning;