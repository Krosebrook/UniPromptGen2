

import React, { useState } from 'react';
import { PromptTemplateVersion, ABTest } from '../../types.ts';

interface CreateABTestModalProps {
  versions: PromptTemplateVersion[];
  onClose: () => void;
  onSave: (newTest: Partial<ABTest>) => void;
}

const CreateABTestModal: React.FC<CreateABTestModalProps> = ({ versions, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [versionA, setVersionA] = useState(versions[0]?.version || '');
  const [versionB, setVersionB] = useState(versions[1]?.version || '');
  const [trafficSplit, setTrafficSplit] = useState(50);

  const availableVersionsForB = versions.filter(v => v.version !== versionA);
  const availableVersionsForA = versions.filter(v => v.version !== versionB);

  const handleSave = () => {
    if (name && versionA && versionB && versionA !== versionB) {
      onSave({
        name,
        versionA,
        versionB,
        trafficSplit,
        status: 'running',
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-popover w-full max-w-lg rounded-lg shadow-xl p-6 space-y-4" onClick={e => e.stopPropagation()}>
        <h2 className="text-2xl font-bold">Create New A/B Test</h2>
        
        <div>
          <label htmlFor="testName" className="block text-sm font-medium text-muted-foreground mb-1">Test Name</label>
          <input
            id="testName"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 bg-input rounded-md text-foreground focus:ring-2 focus:ring-ring focus:outline-none"
            placeholder="e.g., Tone variable effectiveness"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="versionA" className="block text-sm font-medium text-muted-foreground mb-1">Version A</label>
            <select
              id="versionA"
              value={versionA}
              onChange={(e) => setVersionA(e.target.value)}
              className="w-full p-2 bg-input rounded-md text-foreground focus:ring-2 focus:ring-ring focus:outline-none"
            >
              {availableVersionsForA.map(v => <option key={v.version} value={v.version}>Version {v.version}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="versionB" className="block text-sm font-medium text-muted-foreground mb-1">Version B</label>
            <select
              id="versionB"
              value={versionB}
              onChange={(e) => setVersionB(e.target.value)}
              className="w-full p-2 bg-input rounded-md text-foreground focus:ring-2 focus:ring-ring focus:outline-none"
            >
              {availableVersionsForB.map(v => <option key={v.version} value={v.version}>Version {v.version}</option>)}
            </select>
          </div>
        </div>

        <div>
            <label htmlFor="trafficSplit" className="block text-sm font-medium text-muted-foreground mb-1">Traffic Split (A / B)</label>
            <div className="flex items-center gap-4">
                <span className="font-semibold">{trafficSplit}%</span>
                <input
                    id="trafficSplit"
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={trafficSplit}
                    onChange={(e) => setTrafficSplit(parseInt(e.target.value, 10))}
                    className="w-full h-2 bg-input rounded-lg appearance-none cursor-pointer"
                />
                <span className="font-semibold">{100 - trafficSplit}%</span>
            </div>
        </div>
        
        <div className="flex justify-end gap-2 pt-4">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium bg-secondary rounded-md hover:bg-accent">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!name || !versionA || !versionB || versionA === versionB}
            className="px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-md hover:bg-primary/90 disabled:opacity-50"
          >
            Start Test
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateABTestModal;