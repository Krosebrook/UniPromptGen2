import React from 'react';
import { PromptTemplate } from '../types.ts';
import QualityScoreDisplay from './QualityScoreDisplay.tsx';
import { EllipsisVerticalIcon, StarIcon } from './icons/Icons.tsx';

interface TemplateCardProps {
  template: PromptTemplate;
  canEdit: boolean;
  onDragStart: (e: React.DragEvent, item: PromptTemplate) => void;
  onContextMenu: (e: React.MouseEvent, item: PromptTemplate) => void;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
}

const TemplateCard: React.FC<TemplateCardProps> = ({ template, canEdit, onDragStart, onContextMenu, isFavorite, onToggleFavorite }) => {
  const activeVersion = template.versions.find(v => v.version === template.activeVersion);

  return (
    <div
      draggable={canEdit}
      onDragStart={(e) => onDragStart(e, template)}
      onContextMenu={(e) => onContextMenu(e, template)}
      className={`bg-card shadow-card rounded-lg p-4 flex flex-col justify-between h-full group transition-all duration-200 hover:shadow-lg relative ${canEdit ? 'cursor-grab' : 'cursor-default'} ${isFavorite ? 'ring-1 ring-yellow-400/60' : ''}`}
    >
      <div>
        <div className="flex justify-between items-start gap-2">
            <a href={`#/templates/${template.id}`} className="flex-1 pr-2">
                <h3 className="font-bold text-foreground hover:text-primary transition-colors">{activeVersion?.name || 'Untitled Template'}</h3>
            </a>
            <div className="flex items-center gap-0">
                <button
                    onClick={(e) => { e.stopPropagation(); onToggleFavorite(template.id); }}
                    className={`p-1 rounded-full transition-opacity ${isFavorite ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                    aria-label="Toggle favorite"
                >
                    <StarIcon className={`h-5 w-5 transition-colors ${isFavorite ? 'text-yellow-400' : 'text-muted-foreground hover:text-yellow-400'}`} />
                </button>
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