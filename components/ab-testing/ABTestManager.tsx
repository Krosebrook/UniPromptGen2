import React, { useState } from 'react';
import { PromptTemplate, ABTest } from '../../types.ts';
import { PlusIcon, ScaleIcon, CheckCircleIcon, ClockIcon } from '../icons/Icons.tsx';
import ABTestResults from './ABTestResults.tsx';
import CreateABTestModal from './CreateABTestModal.tsx';

interface ABTestManagerProps {
  template: PromptTemplate;
}

const ABTestManager: React.FC<ABTestManagerProps> = ({ template }) => {
  const [selectedTest, setSelectedTest] = useState<ABTest | null>(template.abTests?.[0] || null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  return (
    <div className="bg-card shadow-card rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
            <ScaleIcon className="h-6 w-6" />
            A/B Tests
        </h2>
        <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center justify-center px-3 py-1.5 text-sm font-medium text-primary-foreground bg-primary rounded-md hover:bg-primary/90"
        >
            <PlusIcon className="h-5 w-5 mr-1" />
            New Test
        </button>
      </div>

      {(!template.abTests || template.abTests.length === 0) ? (
        <div className="text-center py-8 text-muted-foreground">
            <p>No A/B tests have been created for this template yet.</p>
            <p className="text-sm">Click "New Test" to start comparing versions.</p>
        </div>
      ) : (
        <div className="flex flex-col md:flex-row gap-6">
            <nav className="w-full md:w-1/3 lg:w-1/4 space-y-2">
                 {template.abTests.map(test => (
                    <button
                        key={test.id}
                        onClick={() => setSelectedTest(test)}
                        className={`w-full text-left p-3 rounded-md transition-colors flex items-start gap-3 ${selectedTest?.id === test.id ? 'bg-primary/20' : 'hover:bg-accent'}`}
                    >
                        {test.status === 'running' ? (
                            <ClockIcon className="h-5 w-5 text-info mt-0.5 flex-shrink-0" />
                        ) : (
                            <CheckCircleIcon className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                        )}
                        <div>
                            <p className={`font-semibold ${selectedTest?.id === test.id ? 'text-primary' : 'text-foreground'}`}>{test.name}</p>
                            <p className="text-xs text-muted-foreground">
                                v{test.versionA} vs v{test.versionB} &middot; <span className="capitalize">{test.status}</span>
                            </p>
                        </div>
                    </button>
                 ))}
            </nav>
            <div className="w-full md:w-2/3 lg:w-3/4">
                {selectedTest && (
                    <ABTestResults 
                        test={selectedTest}
                        versionAContent={template.versions.find(v => v.version === selectedTest.versionA)?.content || ''}
                        versionBContent={template.versions.find(v => v.version === selectedTest.versionB)?.content || ''}
                    />
                )}
            </div>
        </div>
      )}

      {isCreateModalOpen && (
        <CreateABTestModal 
            versions={template.versions}
            onClose={() => setIsCreateModalOpen(false)}
            onSave={(newTest) => {
                // In a real app, this would be an API call
                console.log("Saving new A/B Test:", newTest);
                setIsCreateModalOpen(false);
            }}
        />
      )}
    </div>
  );
};

export default ABTestManager;
