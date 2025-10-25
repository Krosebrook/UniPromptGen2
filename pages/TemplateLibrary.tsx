import React, { useState, useEffect, useCallback } from 'react';
import { getTemplates, deleteTemplate } from '../services/apiService.ts';
import { PromptTemplate } from '../types.ts';
import TemplateCard from '../components/TemplateCard.tsx';
import { MagnifyingGlassIcon, PlusIcon, SpinnerIcon } from '../components/icons/Icons.tsx';

const TemplateLibrary: React.FC = () => {
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTemplates = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getTemplates();
      setTemplates(data);
    } catch (err) {
      setError('Failed to load templates. Please try again later.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);
  
  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete the template "${name}"?`)) {
        try {
            await deleteTemplate(id);
            // Refetch templates to update the list
            await fetchTemplates();
        } catch (err) {
            setError(`Failed to delete template: ${name}. Please try again.`);
            console.error(err);
        }
    }
  };
  
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-64">
          <SpinnerIcon className="h-8 w-8 text-primary" />
          <span className="ml-2 text-muted-foreground">Loading Templates...</span>
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
    
    return (
       <div className="flex space-x-4 overflow-x-auto pb-4 -mx-6 px-6 md:mx-0 md:px-0 md:grid md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 md:gap-6 md:space-x-0">
        {templates.map((template) => (
          <div key={template.id} className="w-80 md:w-auto flex-shrink-0 md:flex-shrink">
            <TemplateCard template={template} onDelete={handleDelete} />
          </div>
        ))}
      </div>
    );
  };


  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Template Library</h1>
          <p className="text-muted-foreground">Browse, search, and manage your prompt templates.</p>
        </div>
        <div className="flex items-center gap-2">
           <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search templates..."
              className="w-full md:w-64 pl-10 pr-4 py-2 rounded-md bg-input text-foreground focus:ring-2 focus:ring-ring focus:outline-none"
            />
          </div>
          <a href="#/templates/new" className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background">
            <PlusIcon className="h-5 w-5 mr-2" />
            New Template
          </a>
        </div>
      </div>

      {renderContent()}
    </div>
  );
};

export default TemplateLibrary;