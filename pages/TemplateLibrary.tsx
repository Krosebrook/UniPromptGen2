import React, { useState, useMemo } from 'react';
import { deleteTemplate, getTemplates } from '../services/apiService.ts';
import TemplateCard from '../components/TemplateCard.tsx';
import { MagnifyingGlassIcon, PlusIcon, SpinnerIcon } from '../components/icons/Icons.tsx';
import { useWorkspace } from '../contexts/WorkspaceContext.tsx';
import { useLibraryData } from '../hooks/useLibraryData.ts';

const TemplateLibrary: React.FC = () => {
  const { currentUserRole } = useWorkspace();
  const { data: templates, isLoading, error, refetch } = useLibraryData(getTemplates, 'templates');
  const [searchQuery, setSearchQuery] = useState('');
  
  // New state for sorting
  const [sortOption, setSortOption] = useState('date-desc');

  const canEdit = currentUserRole === 'Admin' || currentUserRole === 'Editor';
  
  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete the template "${name}"?`)) {
        try {
            await deleteTemplate(id);
            await refetch();
        } catch (err) {
            alert(`Failed to delete template: ${name}. Please try again.`);
            console.error(err);
        }
    }
  };

  const processedTemplates = useMemo(() => {
    let processed = [...templates];

    // 1. Filter by Search Query
    if (searchQuery) {
        processed = processed.filter(template => {
            const activeVersion = template.versions.find(v => v.version === template.activeVersion);
            if (!activeVersion) return false;
            
            const query = searchQuery.toLowerCase();
            const nameMatch = activeVersion.name.toLowerCase().includes(query);
            const descriptionMatch = activeVersion.description.toLowerCase().includes(query);
        
            return nameMatch || descriptionMatch;
        });
    }

    // 2. Sort
    processed.sort((a, b) => {
        const aVersion = a.versions.find(v => v.version === a.activeVersion);
        const bVersion = b.versions.find(v => v.version === b.activeVersion);
        if (!aVersion || !bVersion) return 0;

        switch (sortOption) {
            case 'name-asc':
                return aVersion.name.localeCompare(bVersion.name);
            case 'name-desc':
                return bVersion.name.localeCompare(aVersion.name);
            case 'score-desc':
                return b.qualityScore - a.qualityScore;
            case 'score-asc':
                return a.qualityScore - b.qualityScore;
            case 'date-desc':
                 // Assuming the first version's date is the creation date
                return new Date(b.versions[0].date).getTime() - new Date(a.versions[0].date).getTime();
            case 'date-asc':
                return new Date(a.versions[0].date).getTime() - new Date(b.versions[0].date).getTime();
            default:
                return 0;
        }
    });

    return processed;
  }, [templates, searchQuery, sortOption]);
  
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
    
    if (templates.length === 0) {
        return (
            <div className="text-center py-16 text-muted-foreground">
                <p>No templates found in this workspace.</p>
                {canEdit && <p className="text-sm">Click "New Template" to get started.</p>}
            </div>
        );
    }
    
    if (processedTemplates.length === 0) {
        return (
            <div className="text-center py-16 text-muted-foreground">
                <p>No templates match your search criteria.</p>
                <p className="text-sm">Try a different search term.</p>
            </div>
        );
    }
    
    return (
       <div className="flex space-x-4 overflow-x-auto pb-4 -mx-6 px-6 md:mx-0 md:px-0 md:grid md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 md:gap-6 md:space-x-0">
        {processedTemplates.map((template) => (
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
        {canEdit && (
            <a href="#/templates/new" className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background">
                <PlusIcon className="h-5 w-5 mr-2" />
                New Template
            </a>
        )}
      </div>

      {/* Control Bar for Search and Sort */}
      <div className="bg-card shadow-card p-4 rounded-lg flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-grow w-full md:w-auto">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
                type="search"
                placeholder="Search by name or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-md bg-input text-foreground focus:ring-2 focus:ring-ring focus:outline-none"
            />
        </div>
        <div className="flex-shrink-0 w-full md:w-56">
            <label htmlFor="sort-options" className="sr-only">Sort by</label>
            <select
                id="sort-options"
                value={sortOption}
                onChange={e => setSortOption(e.target.value)}
                className="w-full px-4 py-2 rounded-md bg-input text-foreground focus:ring-2 focus:ring-ring focus:outline-none"
            >
                <option value="date-desc">Date Created (Newest)</option>
                <option value="date-asc">Date Created (Oldest)</option>
                <option value="score-desc">Quality Score (High-Low)</option>
                <option value="score-asc">Quality Score (Low-High)</option>
                <option value="name-asc">Name (A-Z)</option>
                <option value="name-desc">Name (Z-A)</option>
            </select>
        </div>
      </div>

      {renderContent()}
    </div>
  );
};

export default TemplateLibrary;
