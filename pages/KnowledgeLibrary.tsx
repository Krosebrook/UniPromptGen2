import React from 'react';
// FIX: Added file extension to fix module resolution error.
import { CollectionIcon } from '../components/icons/Icons.tsx';

const KnowledgeLibrary: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
      <CollectionIcon className="h-24 w-24 mb-6 text-purple-500" />
      <h1 className="text-4xl font-bold text-white mb-2">Knowledge Library</h1>
      <p className="max-w-xl text-lg">
        A repository for internal documents, data, and other knowledge sources that agents can securely access for grounding.
      </p>
      <p className="mt-4 text-sm text-gray-600">Coming Soon</p>
    </div>
  );
};

export default KnowledgeLibrary;
