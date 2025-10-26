import React from 'react';
import { getDeployedTemplates } from '../services/apiService.ts';
import { useLibraryData } from '../hooks/useLibraryData.ts';
import { SpinnerIcon, RocketLaunchIcon } from '../components/icons/Icons.tsx';
import DeploymentCard from '../components/DeploymentCard.tsx';

const Deployments: React.FC = () => {
  // FIX: Added null as the third argument to useLibraryData to match its function signature.
  const { data: templates, isLoading, error } = useLibraryData(getDeployedTemplates, 'deployed templates', null);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-64">
          <SpinnerIcon className="h-8 w-8 text-primary" />
          <span className="ml-2 text-muted-foreground">Loading Deployments...</span>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center text-destructive bg-destructive/10 p-4 rounded-md">
          <p className="font-semibold">An Error Occurred</p>
          <p>{error}</p>
        </div>
      );
    }
    
    if (templates.length === 0) {
        return (
            <div className="text-center py-16 text-muted-foreground">
                <RocketLaunchIcon className="h-16 w-16 mx-auto mb-4" />
                <p className="text-lg">No templates are currently deployed in this workspace.</p>
                <p className="text-sm">You can deploy a template from the Template Editor.</p>
            </div>
        );
    }
    
    return (
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {templates.map((template) => (
            <DeploymentCard key={template.id} template={template} />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Deployments</h1>
        <p className="text-muted-foreground">Manage and monitor your live, production-ready templates.</p>
      </div>
      {renderContent()}
    </div>
  );
};

export default Deployments;
