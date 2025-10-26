import React, { useState } from 'react';
import { PlusIcon, SpinnerIcon } from '../components/icons/Icons.tsx';
import { getKnowledgeSources, deleteKnowledgeSource, addKnowledgeSource } from '../services/apiService.ts';
import { KnowledgeSourceFormData } from '../types.ts';
import KnowledgeSourceCard from '../components/KnowledgeSourceCard.tsx';
import CreateKnowledgeSourceModal from '../components/modals/CreateKnowledgeSourceModal.tsx';
import { useWorkspace } from '../contexts/WorkspaceContext.tsx';
import { useLibraryData } from '../hooks/useLibraryData.ts';

const KnowledgeLibrary: React.FC = () => {
  const { currentWorkspace, currentUserRole } = useWorkspace();
  const { data: sources, isLoading, error, refetch } = useLibraryData(getKnowledgeSources, 'knowledge sources');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [mutationError, setMutationError] = useState<string | null>(null);

  const canEdit = currentUserRole === 'Admin' || currentUserRole === 'Editor';

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete the knowledge source "${name}"?`)) {
        try {
            setMutationError(null);
            await deleteKnowledgeSource(id);
            await refetch();
        } catch (err) {
            setMutationError(`Failed to delete "${name}".`);
            console.error(err);
        }
    }
  };

  const handleCreate = async (sourceData: KnowledgeSourceFormData) => {
    if (!currentWorkspace) return;
    try {
        setMutationError(null);
        await addKnowledgeSource(sourceData, currentWorkspace.id);
        setIsCreateModalOpen(false);
        await refetch();
    } catch(err) {
        setMutationError('Failed to add the new knowledge source.');
        console.error(err);
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-64">
          <SpinnerIcon className="h-8 w-8 text-primary" />
          <span className="ml-2 text-muted-foreground">Loading Sources...</span>
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
    
    if (sources.length === 0) {
        return (
            <div className="text-center py-16 text-muted-foreground">
                <p>No knowledge sources found in this workspace.</p>
                {canEdit && <p className="text-sm">Click "Add Knowledge Source" to get started.</p>}
            </div>
        );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sources.map(source => (
            <KnowledgeSourceCard key={source.id} source={source} onDelete={handleDelete} />
        ))}
      </div>
    );
  };


  return (
    <>
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Knowledge Library</h1>
              <p className="text-muted-foreground">Manage internal documents and data sources for agent grounding.</p>
            </div>
            {canEdit && (
                <button 
                    onClick={() => setIsCreateModalOpen(true)}
                    className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
                >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Add Knowledge Source
                </button>
            )}
          </div>
          {mutationError && <div className="text-center text-destructive bg-destructive/10 p-2 rounded-md text-sm"><p>{mutationError}</p></div>}
          {renderContent()}
        </div>

        {isCreateModalOpen && (
            <CreateKnowledgeSourceModal 
                onClose={() => setIsCreateModalOpen(false)}
                onSave={handleCreate}
            />
        )}
    </>
  );
};

export default KnowledgeLibrary;
