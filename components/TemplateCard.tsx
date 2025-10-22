import React from 'react';
import { PromptTemplate, RiskLevel } from '../types.ts';
import QualityScoreDisplay from './QualityScoreDisplay.tsx';
import { CodeBracketIcon } from './icons/Icons.tsx';

interface TemplateCardProps {
  template: PromptTemplate;
}

const riskLevelStyles: Record<RiskLevel, string> = {
  Low: 'bg-success/20 text-success',
  Medium: 'bg-warning/20 text-warning',
  High: 'bg-destructive/20 text-destructive',
};

const TemplateCard: React.FC<TemplateCardProps> = ({ template }) => {
  return (
    <a href={`#/templates/${template.id}`} className="block bg-card rounded-lg shadow-card p-6 transition-transform hover:-translate-y-1">
      <div className="flex justify-between items-start">
        <div className="flex-1 pr-4">
          <h3 className="text-lg font-bold text-foreground truncate">{template.name}</h3>
          <p className="text-sm text-muted-foreground mt-1 h-10 overflow-hidden">{template.description}</p>
        </div>
        <QualityScoreDisplay score={template.qualityScore} />
      </div>
      <div className="mt-4 flex justify-between items-center text-xs text-muted-foreground">
        <div className="flex items-center gap-4">
            <div className="flex items-center">
                <CodeBracketIcon className="h-4 w-4 mr-1.5" />
                <span>{template.domain}</span>
            </div>
            <span className={`px-2 py-0.5 rounded-full font-medium ${riskLevelStyles[template.riskLevel]}`}>
                {template.riskLevel} Risk
            </span>
        </div>
        <span>v{template.version}</span>
      </div>
    </a>
  );
};

export default TemplateCard;
