import React from 'react';
import { PromptTemplate } from '../types.ts';
import QualityScoreDisplay from './QualityScoreDisplay.tsx';
import { usePermissions } from '../hooks/usePermissions.ts';

interface TemplateCardProps {
  template: PromptTemplate;
  canEdit: boolean;
  onDragStart: (e: React.DragEvent, item: PromptTemplate) => void;
  onContextMenu: (e: React.MouseEvent, item: PromptTemplate) => void;
}

const TemplateCard: React.FC<TemplateCardProps> = ({ template, onDragStart, onContextMenu }) => {
  const activeVersion = template.versions.find(v => v.version === template.activeVersion);
  const { canEdit } = usePermissions(template);

  return (
    <div
      draggable={canEdit}
      onDragStart={(e) => onDragStart(e, template)}
      onContextMenu={(e) => onContextMenu(e, template)}
      className={`bg-card shadow-card rounded-lg p-4 flex flex-col justify-between h-full group transition-shadow hover:shadow-lg ${canEdit ? 'cursor-grab' : ''}`}
    >
      <div>
        <div className="flex justify-between items-start">
            <a href={`#/templates/${template.id}`} className="flex-1">
                <h3 className="font-bold text-foreground hover:text-primary transition-colors">{activeVersion?.name || 'Untitled Template'}</h3>
            </a>
            <QualityScoreDisplay score={template.qualityScore} />
        </div>
        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{activeVersion?.description}</p>
      </div>
      <div className="text-xs text-muted-foreground mt-3 flex justify-between items-center">
        <span>{template.domain}</span>
        {template.deployedVersion && <span className="font-semibold bg-success/20 text-success px-2 py-0.5 rounded-full">v{template.deployedVersion} Live</span>}
      </div>
    </div>
  );
};

export default TemplateCard;