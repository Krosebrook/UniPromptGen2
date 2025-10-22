
import React from 'react';
// FIX: Added file extension to fix module resolution error.
import { BeakerIcon } from '../components/icons/Icons.tsx';

const AgenticWorkbench: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
      <BeakerIcon className="h-24 w-24 mb-6 text-blue-500" />
      <h1 className="text-4xl font-bold text-white mb-2">Agentic Workbench</h1>
      <p className="max-w-xl text-lg">
        This is where you'll build, test, and deploy complex, multi-step agents using a node-based graph editor.
      </p>
       <p className="mt-4 text-sm text-gray-600">Coming in Phase 2</p>
    </div>
  );
};

export default AgenticWorkbench;