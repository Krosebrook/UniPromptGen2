import React, { useState } from 'react';
import { MOCK_TEMPLATES, MOCK_EVALUATIONS } from '../constants.ts';
import { PromptTemplate, PromptTemplateVersion, Evaluation } from '../types.ts';
import QualityScoreDisplay from '../components/QualityScoreDisplay.tsx';
import { PlayIcon, StarIcon, ChevronDownIcon, ArrowUturnLeftIcon, ArrowUturnRightIcon } from '../components/icons/Icons.tsx';
import ABTestManager from '../components/ab-testing/ABTestManager.tsx';

interface TemplateEditorProps {
  templateId: string;
}

interface History<T> {
  past: T[];
  present: T;
  future: T[];
}

const TemplateEditor: React.FC<TemplateEditorProps> = ({ templateId }) => {
  const template = MOCK_TEMPLATES.find(t => t.id === templateId);
  const evaluations = MOCK_EVALUATIONS.filter(e => e.templateId === templateId);

  const initialVersion = template?.versions.find(v => v.version === template.activeVersion);

  const [history, setHistory] = useState<History<PromptTemplateVersion> | null>(initialVersion ? {
    past: [],
    present: initialVersion,
    future: []
  } : null);

  const [isVersionDropdownOpen, setIsVersionDropdownOpen] = useState(false);

  const handleUndo = () => {
    setHistory(currentHistory => {
      if (!currentHistory || currentHistory.past.length === 0) return currentHistory;
      const previous = currentHistory.past[currentHistory.past.length - 1];
      const newPast = currentHistory.past.slice(0, currentHistory.past.length - 1);
      return {
        past: newPast,
        present: previous,
        future: [currentHistory.present, ...currentHistory.future]
      };
    });
  };

  const handleRedo = () => {
    setHistory(currentHistory => {
      if (!currentHistory || currentHistory.future.length === 0) return currentHistory;
      const next = currentHistory.future[0];
      const newFuture = currentHistory.future.slice(1);
      return {
        past: [...currentHistory.past, currentHistory.present],
        present: next,
        future: newFuture
      };
    });
  };

  const handleInputChange = (field: keyof PromptTemplateVersion, value: any) => {
    setHistory(currentHistory => {
      if (!currentHistory) return null;
      // To prevent excessive history entries for single character changes,
      // you might add debouncing or more complex logic here in a real app.
      const newPresent = { ...currentHistory.present, [field]: value };
      return {
        past: [...currentHistory.past, currentHistory.present],
        present: newPresent,
        future: [] // Clear future on new edit
      };
    });
  };
  
  const handleVersionChange = (version: PromptTemplateVersion) => {
    setHistory({
        past: [],
        present: version,
        future: []
    });
    setIsVersionDropdownOpen(false);
  }

  if (!template || !history) {
    return <div className="text-center p-8">Template not found. <a href="#/templates" className="text-primary hover:underline">Return to Library</a></div>;
  }
  
  const { present: selectedVersion } = history;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex-1">
          <input
             type="text"
             value={selectedVersion.name}
             onChange={(e) => handleInputChange('name', e.target.value)}
             className="w-full text-3xl font-bold text-foreground bg-transparent focus:outline-none focus:ring-2 focus:ring-ring rounded-md px-2 -mx-2"
           />
           <textarea
             value={selectedVersion.description}
             onChange={(e) => handleInputChange('description', e.target.value)}
             className="w-full text-muted-foreground max-w-2xl bg-transparent focus:outline-none focus:ring-2 focus:ring-ring rounded-md px-2 -mx-2 mt-1 resize-none"
             rows={2}
           />
        </div>
        <div className="flex items-center gap-2">
            <button onClick={handleUndo} disabled={history.past.length === 0} className="p-2 rounded-md bg-secondary hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed" aria-label="Undo">
                <ArrowUturnLeftIcon className="h-5 w-5" />
            </button>
             <button onClick={handleRedo} disabled={history.future.length === 0} className="p-2 rounded-md bg-secondary hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed" aria-label="Redo">
                <ArrowUturnRightIcon className="h-5 w-5" />
            </button>
            <a href="#/playground" className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-md hover:bg-primary/90">
                <PlayIcon className="h-5 w-5 mr-2" />
                Run in Playground
            </a>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
            <div className="bg-card shadow-card rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Template Content</h2>
                    <div className="relative">
                        <button onClick={() => setIsVersionDropdownOpen(!isVersionDropdownOpen)} className="flex items-center gap-2 px-3 py-1.5 text-sm bg-secondary rounded-md hover:bg-accent">
                            Version {selectedVersion.version}
                            <ChevronDownIcon className={`h-4 w-4 transition-transform ${isVersionDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {isVersionDropdownOpen && (
                             <div className="absolute right-0 mt-2 w-48 bg-popover rounded-md shadow-lg ring-1 ring-border py-1 z-10">
                                {template.versions.map(v => (
                                    <a key={v.version} onClick={() => handleVersionChange(v)} className="block px-4 py-2 text-sm text-popover-foreground hover:bg-accent cursor-pointer">
                                        Version {v.version} {v.version === template.activeVersion && '(Active)'}
                                    </a>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
                 <textarea
                    value={selectedVersion.content}
                    onChange={(e) => handleInputChange('content', e.target.value)}
                    className="w-full h-80 p-4 font-mono text-sm bg-input rounded-md text-foreground focus:ring-2 focus:ring-ring focus:outline-none resize-y"
                />
            </div>
             <div className="bg-card shadow-card rounded-lg p-6">
                 <h2 className="text-xl font-semibold mb-4">Version History</h2>
                 <ul className="space-y-4">
                     {template.versions.map(v => (
                         <li key={v.version} className="border-l-2 pl-4 border-border">
                             <p className="font-semibold">Version {v.version} <span className="text-xs font-normal text-muted-foreground">- {new Date(v.date).toLocaleDateString()}</span></p>
                             <p className="text-sm text-muted-foreground">{v.comment}</p>
                         </li>
                     ))}
                 </ul>
             </div>
             
             <ABTestManager template={template} />

        </div>

        {/* Right Column */}
        <div className="space-y-6">
             <div className="bg-card shadow-card rounded-lg p-6 text-center">
                <h3 className="text-lg font-semibold mb-4">Quality Score</h3>
                <QualityScoreDisplay score={template.qualityScore} size="lg" />
                <p className="text-xs text-muted-foreground mt-2">Based on {template.metrics.totalRuns.toLocaleString()} runs</p>
            </div>
            <div className="bg-card shadow-card rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Variables</h3>
                <ul className="space-y-2">
                    {selectedVersion.variables.map(v => (
                        <li key={v.name} className="flex justify-between items-center text-sm p-2 bg-secondary rounded-md">
                            <span className="font-mono text-primary">{`{{${v.name}}}`}</span>
                            <span className="text-muted-foreground capitalize">{v.type}</span>
                        </li>
                    ))}
                </ul>
            </div>
            <div className="bg-card shadow-card rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Recent Evaluations</h3>
                {evaluations.length > 0 ? (
                    <ul className="space-y-3">
                        {evaluations.map(e => (
                             <li key={e.id} className="flex items-start gap-3">
                                <img src={e.evaluator.avatarUrl} alt={e.evaluator.name} className="h-8 w-8 rounded-full" />
                                <div>
                                    <div className="flex items-center gap-2">
                                        <p className="font-semibold text-sm">{e.evaluator.name}</p>
                                        <div className="flex items-center text-xs text-warning">
                                            <StarIcon className="h-4 w-4 mr-0.5" />
                                            <span>{e.score}/100</span>
                                        </div>
                                    </div>
                                    <p className="text-sm text-muted-foreground italic">"{e.comment}"</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-sm text-muted-foreground text-center">No evaluations yet.</p>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateEditor;
