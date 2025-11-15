import React, { useState, useMemo, useEffect } from 'react';
import { ShoppingCartIcon, MagnifyingGlassIcon, SparklesIcon } from '../components/icons/Icons.tsx';
import type { Gem } from '../types.ts';

// Import gem data
import codeAssistPro from '../src/data/gems/code_assist_pro.json' with { type: 'json' };
import googleDocAi from '../src/data/gems/google_doc_ai.json' with { type: 'json' };
import promptAuditor from '../src/data/gems/prompt_auditor.json' with { type: 'json' };
import customerServicePro from '../src/data/gems/customer_service_pro.json' with { type: 'json' };
import marketingMaestro from '../src/data/gems/marketing_maestro.json' with { type: 'json' };
import dataAnalystGpt from '../src/data/gems/data_analyst_gpt.json' with { type: 'json' };
import hrOnboarder from '../src/data/gems/hr_onboarder.json' with { type: 'json' };
import legalSummarizer from '../src/data/gems/legal_summarizer.json' with { type: 'json' };
import researchAssistant from '../src/data/gems/research_assistant.json' with { type: 'json' };
import tripPlanner from '../src/data/gems/trip_planner.json' with { type: 'json' };
import gameMasterAi from '../src/data/gems/game_master_ai.json' with { type: 'json' };
import fitnessCoach from '../src/data/gems/fitness_coach.json' with { type: 'json' };
import recipeGenerator from '../src/data/gems/recipe_generator.json' with { type: 'json' };


const GemCard: React.FC<{ gem: Gem }> = ({ gem }) => {
    return (
        <div className="bg-card shadow-card rounded-lg p-5 flex flex-col h-full border border-border hover:border-primary transition-colors">
            <div className="flex-grow">
                 <div className="flex items-start gap-4 mb-3">
                    <div className="p-2 bg-primary/20 rounded-md">
                        <SparklesIcon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <h3 className="font-bold text-foreground text-lg">{gem.name}</h3>
                        <p className="text-xs text-muted-foreground">by {gem.author_id}</p>
                    </div>
                </div>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{gem.description}</p>
            </div>
            <div className="flex-shrink-0">
                <div className="flex flex-wrap gap-1.5 mb-4">
                    {gem.tags.map(tag => (
                        <span key={tag} className="px-2 py-0.5 text-xs font-medium bg-secondary text-muted-foreground rounded-full capitalize">{tag}</span>
                    ))}
                </div>
                <button className="w-full px-4 py-2 text-sm font-semibold text-primary-foreground bg-primary rounded-md hover:bg-primary/90 disabled:opacity-50">
                    Install Gem
                </button>
            </div>
        </div>
    );
};

const Marketplace: React.FC = () => {
    const [gems, setGems] = useState<Gem[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    
    useEffect(() => {
        // In a real app, this would be an API call
        const allGems = [
            codeAssistPro, googleDocAi, promptAuditor, customerServicePro, marketingMaestro,
            dataAnalystGpt, hrOnboarder, legalSummarizer, researchAssistant, tripPlanner,
            gameMasterAi, fitnessCoach, recipeGenerator
        ];
        setGems(allGems as Gem[]);
    }, []);

    const allTags = useMemo(() => {
        const tagsSet = new Set<string>();
        gems.forEach(gem => gem.tags.forEach(tag => tagsSet.add(tag)));
        return Array.from(tagsSet).sort();
    }, [gems]);
    
    const filteredGems = useMemo(() => {
        return gems.filter(gem => {
            const matchesSearch = searchTerm.trim() === '' || 
                                  gem.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                  gem.description.toLowerCase().includes(searchTerm.toLowerCase());
            
            const matchesTags = selectedTags.length === 0 || 
                                selectedTags.every(tag => gem.tags.includes(tag));

            return matchesSearch && matchesTags;
        });
    }, [gems, searchTerm, selectedTags]);

    const toggleTag = (tag: string) => {
        setSelectedTags(prev => 
            prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
        );
    };

    return (
        <div className="flex flex-col md:flex-row gap-8 h-full">
            {/* Sidebar */}
            <aside className="w-full md:w-64 flex-shrink-0">
                <h2 className="text-xl font-bold mb-4">Filters</h2>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="search-gems" className="text-sm font-medium text-muted-foreground">Search</label>
                        <div className="relative mt-1">
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <input
                                id="search-gems"
                                type="text"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                placeholder="Search gems..."
                                className="w-full pl-10 pr-4 py-2 rounded-md bg-input text-foreground focus:ring-2 focus:ring-ring focus:outline-none"
                            />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-2">Categories</h3>
                        <div className="flex flex-wrap gap-2">
                            {allTags.map(tag => (
                                <button
                                    key={tag}
                                    onClick={() => toggleTag(tag)}
                                    className={`px-2.5 py-1 text-xs font-semibold rounded-full capitalize transition-colors ${
                                        selectedTags.includes(tag)
                                            ? 'bg-primary text-primary-foreground'
                                            : 'bg-secondary text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                                    }`}
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 min-h-0">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-foreground flex items-center gap-3"><ShoppingCartIcon className="h-8 w-8 text-primary" /> Gem Marketplace</h1>
                    <p className="text-muted-foreground">Discover powerful, pre-built agents ("Gems") to supercharge your workflows.</p>
                </div>
                
                <div className="overflow-y-auto h-[calc(100%-80px)] pr-2 -mr-2">
                    {filteredGems.length > 0 ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                            {filteredGems.map(gem => <GemCard key={gem.id} gem={gem} />)}
                        </div>
                    ) : (
                        <div className="text-center py-16 text-muted-foreground">
                            <p className="font-semibold">No Gems Found</p>
                            <p>Try adjusting your search or filters.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Marketplace;