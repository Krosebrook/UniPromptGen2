import React, { useState } from 'react';
import { runGroundedSearch } from '../../services/geminiService.ts';
import { GroundingSource } from '../../types.ts';
import { GlobeAltIcon } from '../icons/Icons.tsx';

const Search: React.FC = () => {
  const [query, setQuery] = useState('Who won the most recent F1 race and what were the key moments?');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ text: string, sources: GroundingSource[] } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setIsLoading(true);
    setResult(null);
    setError(null);

    try {
      const searchResult = await runGroundedSearch(query);
      setResult(searchResult);
    } catch (err) {
      console.error("Grounded search failed:", err);
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="space-y-4 mb-4">
        <div>
          <label htmlFor="search-query" className="block text-sm font-medium text-muted-foreground mb-1">Search Query</label>
          <textarea
            id="search-query"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask a question that requires up-to-date information..."
            className="w-full h-24 p-2 bg-input rounded-md text-foreground focus:ring-2 focus:ring-ring focus:outline-none"
          />
        </div>
        <button
          onClick={handleSearch}
          disabled={isLoading || !query.trim()}
          className="w-full inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-md hover:bg-primary/90 disabled:opacity-50"
        >
          <GlobeAltIcon className="h-5 w-5 mr-2" />
          {isLoading ? 'Searching...' : 'Get Grounded Answer'}
        </button>
      </div>

      <div className="flex-1 bg-black/20 rounded-lg p-4 overflow-y-auto">
        {isLoading && <p className="text-muted-foreground">Searching the web for the latest information...</p>}
        {error && <p className="text-destructive">{error}</p>}
        {result && (
          <div className="space-y-4">
            <div>
                <h3 className="font-semibold text-foreground mb-2">Answer</h3>
                <p className="text-foreground whitespace-pre-wrap">{result.text}</p>
            </div>
            {result.sources.length > 0 && (
                <div>
                    <h3 className="font-semibold text-foreground mb-2">Sources</h3>
                    <ul className="space-y-3">
                        {result.sources.map((source, index) => source.web && (
                            <li key={index}>
                                <a 
                                    href={source.web.uri} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50 border border-border transition-all hover:border-primary/50 hover:bg-secondary"
                                >
                                    <div className="flex-shrink-0 pt-0.5">
                                        <GlobeAltIcon className="h-5 w-5 text-muted-foreground" />
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="text-sm font-medium text-primary leading-tight truncate">
                                            {source.web.title}
                                        </p>
                                        <p className="text-xs text-muted-foreground truncate">{source.web.uri}</p>
                                    </div>
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
          </div>
        )}
        {!isLoading && !result && !error && (
            <div className="text-center text-muted-foreground pt-10">
                <GlobeAltIcon className="h-12 w-12 mx-auto mb-2"/>
                <p>Answers to your questions will appear here.</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default Search;