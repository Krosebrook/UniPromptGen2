import React from 'react';
import { Node, ModelNodeData, ToolNodeData, KnowledgeNodeData } from '../../types.ts';
import { CogIcon } from '../icons/Icons.tsx';
import ModelNodeConfig from './ModelNodeConfig.tsx';
import ToolNodeConfig from './ToolNodeConfig.tsx';
import KnowledgeNodeConfig from './KnowledgeNodeConfig.tsx';

interface WorkbenchConfigPanelProps {
  selectedNode: Node | null;
  onUpdateNode: (nodeId: string, data: Partial<Node['data']>) => void;
}

const WorkbenchConfigPanel: React.FC<WorkbenchConfigPanelProps> = ({ selectedNode, onUpdateNode }) => {
  return (
    <aside className="w-64 bg-card shadow-card rounded-lg p-4 flex-shrink-0">
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <CogIcon className="h-5 w-5" />
        Configuration
      </h2>
      
      {!selectedNode ? (
        <div className="text-center text-muted-foreground pt-10">
            <p className="text-sm">Select a node to configure its parameters.</p>
        </div>
      ) : (
        <div>
            <div className="p-3 bg-secondary rounded-md mb-4">
                <p className="text-sm text-muted-foreground">Selected Node</p>
                <p className="font-semibold text-foreground truncate">{selectedNode.data.label}</p>
                <p className="text-xs text-primary capitalize">{selectedNode.type} Node</p>
            </div>
            
            {selectedNode.type === 'model' && (
                <ModelNodeConfig 
                    data={selectedNode.data as ModelNodeData}
                    onUpdate={(newData) => onUpdateNode(selectedNode.id, newData)}
                />
            )}

            {selectedNode.type === 'tool' && (
                <ToolNodeConfig 
                    data={selectedNode.data as ToolNodeData}
                    onUpdate={(newData) => onUpdateNode(selectedNode.id, newData)}
                />
            )}
            
            {selectedNode.type === 'knowledge' && (
                <KnowledgeNodeConfig 
                    data={selectedNode.data as KnowledgeNodeData}
                    onUpdate={(newData) => onUpdateNode(selectedNode.id, newData)}
                />
            )}
            
            {(selectedNode.type === 'input' || selectedNode.type === 'output') && (
                 <p className="text-center text-sm text-muted-foreground pt-4">No configuration available for this node type.</p>
            )}

        </div>
      )}
    </aside>
  );
};

export default WorkbenchConfigPanel;