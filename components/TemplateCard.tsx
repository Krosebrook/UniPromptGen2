import React from 'react';
import { PromptTemplate, RiskLevel } from '../types.ts';
import QualityScoreDisplay from './QualityScoreDisplay.tsx';
import { CodeBracketIcon, TrashIcon } from './icons/Icons.tsx';

interface TemplateCardProps {
  template: PromptTemplate;
  onDelete: (id: string, name: string) => void;
}

const riskLevelStyles: Record<RiskLevel, string> = {
  Low: 'bg-success/20 text-success',
  Medium: 'bg-warning/20 text-warning',
  High: 'bg-destructive/20 text-destructive',
};

const TemplateCard: React.FC<TemplateCardProps> = ({ template, onDelete }) => {
  const activeVersion = template.versions.find(v => v.version === template.activeVersion);

  if (!activeVersion) {
    return (
      <div className="block bg-card rounded-lg shadow-card p-6 border border-destructive">
        <h3 className="text-lg font-bold text-destructive-foreground">Invalid Template</h3>
        <p className="text-sm text-muted-foreground mt-1">This template has no active version.</p>
      </div>
    );
  }
  
  const handleDelete = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      onDelete(template.id, activeVersion.name);
  };

  return (
    <div className="relative group">
        <a href={`#/templates/${template.id}`} className="block bg-card rounded-lg shadow-card p-6 transition-transform hover:-translate-y-1 h-full">
          <div className="flex justify-between items-start">
            <div className="flex-1 pr-4">
              <h3 className="text-lg font-bold text-foreground truncate">{activeVersion.name}</h3>
              <p className="text-sm text-muted-foreground mt-1 h-10 overflow-hidden">{activeVersion.description}</p>
            </div>
            <QualityScoreDisplay score={template.qualityScore} />
          </div>
          <div className="mt-4 flex justify-between items-center text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
                <div className="flex items-center">
                    <CodeBracketIcon className="h-4 w-4 mr-1.5" />
                    <span>{template.domain}</span>
                </div>
                <span className={`px-2 py-0.5 rounded-full font-medium ${riskLevelStyles[activeVersion.riskLevel]}`}>
                    {activeVersion.riskLevel} Risk
                </span>
            </div>
            <span>v{template.activeVersion}</span>
          </div>
        </a>
        <button
            onClick={handleDelete}
            className="absolute top-2 right-2 p-1.5 bg-card/50 text-muted-foreground rounded-full opacity-0 group-hover:opacity-100 hover:bg-destructive/20 hover:text-destructive transition-opacity"
            aria-label="Delete template"
        >
            <TrashIcon className="h-4 w-4" />
        </button>
    </div>
  );
};

export default TemplateCard;