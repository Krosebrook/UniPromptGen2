import React from 'react';
import { PromptTemplate } from '../types.ts';
import QualityScoreDisplay from './QualityScoreDisplay.tsx';
import { EllipsisVerticalIcon } from './icons/Icons.tsx';

interface TemplateCardProps {
  template: PromptTemplate;
  canEdit: boolean;
  onDragStart: (e: React.DragEvent, item: PromptTemplate) => void;
  onContextMenu: (e: React.MouseEvent, item: PromptTemplate) => void;
}

const TemplateCard: React.FC<TemplateCardProps> = ({ template, canEdit, onDragStart, onContextMenu }) => {
  const activeVersion = template.versions.find(v => v.version === template.activeVersion);

  return (
    <div
      draggable={canEdit}
      onDragStart={(e) => onDragStart(e, template)}
      onContextMenu={(e) => onContextMenu(e, template)}
      className={`bg-card shadow-card rounded-lg p-4 flex flex-col justify-between h-full group transition-shadow hover:shadow-lg relative ${canEdit ? 'cursor-grab' : 'cursor-default'}`}
    >
      <div>
        <div className="flex justify-between items-start">
            <a href={`#/templates/${template.id}`} className="flex-1 pr-8">
                <h3 className="font-bold text-foreground hover:text-primary transition-colors">{activeVersion?.name || 'Untitled Template'}</h3>
            </a>
            <div className="flex items-center gap-1">
                <QualityScoreDisplay score={template.qualityScore} />
                 {canEdit && (
                    <button
                        onClick={(e) => { e.stopPropagation(); onContextMenu(e, template); }}
                        className="p-1 rounded-full text-muted-foreground hover:bg-accent opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label="More options"
                    >
                        <EllipsisVerticalIcon className="h-5 w-5" />
                    </button>
                )}
            </div>
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