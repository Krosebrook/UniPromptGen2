import React, { useState, useEffect } from 'react';
import { getDeployedTemplates } from '../services/apiService.ts';
import { SpinnerIcon, RocketLaunchIcon } from '../components/icons/Icons.tsx';
import DeploymentCard from '../components/DeploymentCard.tsx';
import { useWorkspace } from '../contexts/WorkspaceContext.tsx';
import { MOCK_LOGGED_IN_USER } from '../constants.ts';
import { PromptTemplate } from '../types.ts';

const Deployments: React.FC = () => {
  const { currentWorkspace } = useWorkspace();
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!currentWorkspace) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        const fetchedTemplates = await getDeployedTemplates(currentWorkspace.id, MOCK_LOGGED_IN_USER.id);
        setTemplates(fetchedTemplates);
      } catch (err) {
        console.error("Failed to load deployments:", err);
        setError("Could not load deployments. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [currentWorkspace]);


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
