

import React, { useState, useEffect, useCallback } from 'react';
import { PlusIcon, SpinnerIcon } from '../components/icons/Icons.tsx';
import { getTools, deleteTool, addTool } from '../services/apiService.ts';
import { Tool, ToolFormData } from '../types.ts';
import ToolCard from '../components/ToolCard.tsx';
import CreateToolModal from '../components/modals/CreateToolModal.tsx';
import { useWorkspace } from '../contexts/WorkspaceContext.tsx';

const ToolLibrary: React.FC = () => {
  const { currentWorkspace, currentUserRole } = useWorkspace();
  const [tools, setTools] = useState<Tool[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const canEdit = currentUserRole === 'Admin' || currentUserRole === 'Editor';

  const fetchTools = useCallback(async () => {
      if (!currentWorkspace) return;
      setIsLoading(true);
      setError(null);
      try {
          const data = await getTools(currentWorkspace.id);
          setTools(data);
      } catch(err) {
          setError('Failed to load tools. Please try again later.');
          console.error(err);
      } finally {
          setIsLoading(false);
      }
  }, [currentWorkspace]);

  useEffect(() => {
    fetchTools();
  }, [fetchTools]);
  
  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete the tool "${name}"?`)) {
        try {
            await deleteTool(id);
            await fetchTools();
        } catch (err) {
            setError(`Failed to delete tool "${name}".`);
            console.error(err);
        }
    }
  };

  const handleCreate = async (toolData: ToolFormData) => {
    if (!currentWorkspace) return;
    try {
        await addTool(toolData, currentWorkspace.id);
        setIsCreateModalOpen(false);
        await fetchTools();
    } catch (err) {
        setError('Failed to create the new tool.');
        console.error(err);
    }
  };
  
  const renderContent = () => {
    if (isLoading || !currentWorkspace) {
      return (
        <div className="flex justify-center items-center h-64">
          <SpinnerIcon className="h-8 w-8 text-primary" />
          <span className="ml-2 text-muted-foreground">Loading Tools...</span>
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
    
    if (tools.length === 0) {
        return (
            <div className="text-center py-16 text-muted-foreground">
                <p>No tools found in this workspace.</p>
                {canEdit && <p className="text-sm">Click "Register New Tool" to get started.</p>}
            </div>
        );
    }
    
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tools.map(tool => (
                <ToolCard key={tool.id} tool={tool} onDelete={handleDelete} />
            ))}
        </div>
    );
  };

  return (
    <>
        <div className="space-y-6">
           <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Tool Library</h1>
              <p className="text-muted-foreground">Register, secure, and manage external tools and APIs for your agents.</p>
            </div>
            {canEdit && (
              <button 
                  onClick={() => setIsCreateModalOpen(true)}
                  className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
              >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Register New Tool
                </button>
            )}
          </div>
          {renderContent()}
        </div>
        
        {isCreateModalOpen && (
            <CreateToolModal 
                onClose={() => setIsCreateModalOpen(false)}
                onSave={handleCreate}
            />
        )}
    </>
  );
};

export default ToolLibrary;