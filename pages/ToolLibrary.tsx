
import React from 'react';
// FIX: Added file extension to fix module resolution error.
import { TerminalIcon } from '../components/icons/Icons.tsx';

const ToolLibrary: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
      <TerminalIcon className="h-24 w-24 mb-6 text-green-500" />
      <h1 className="text-4xl font-bold text-white mb-2">Tool Library</h1>
      <p className="max-w-xl text-lg">
        A centralized, version-controlled library for registering, securing, and managing all external tools and APIs available to agents.
      </p>
      <p className="mt-4 text-sm text-gray-600">Coming Soon</p>
    </div>
  );
};

export default ToolLibrary;