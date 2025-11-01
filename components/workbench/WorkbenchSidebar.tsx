import React from 'react';
import type { Node, NodeType, ToolNodeData, InputNodeData, ModelNodeData, KnowledgeNodeData } from '../../types.ts';
import { 
    CpuChipIcon, WrenchScrewdriverIcon, ArrowRightStartOnRectangleIcon, ArrowLeftEndOnRectangleIcon,
    CollectionIcon, ShareIcon, EnvelopeIcon, TableCellsIcon, CodeBracketIcon, ArrowsPointingOutIcon,
    PauseIcon,
} from '../icons/Icons.tsx';

interface PresetNode {
    type: NodeType;
    label: string;
    icon: React.ElementType;
    description: string;
    data: Node['data'];
}

interface NodeCategory {
    name: string;
    items: PresetNode[];
}

const PRESET_NODES: NodeCategory[] = [
    {
        name: 'Core',
        items: [
            { type: 'input', label: 'Input Node', icon: ArrowRightStartOnRectangleIcon, description: 'Starting point for the agent.', data: { label: 'Input', initialValue: '{\n  "topic": "the future of AI"\n}' } as InputNodeData },
            { type: 'model', label: 'Flash Model', icon: CpuChipIcon, description: 'Calls Gemini 2.5 Flash.', data: { label: 'Flash Model', modelName: 'gemini-2.5-flash', promptTemplate: 'You are a helpful assistant. Write about {{topic}}.', temperature: 0.7, topK: 40, topP: 0.95, maxTokens: 1024, stopSequences: [] } as ModelNodeData },
            { type: 'model', label: 'LLM Model', icon: CpuChipIcon, description: 'Calls Gemini 2.5 Pro.', data: { label: 'LLM Model', modelName: 'gemini-2.5-pro', promptTemplate: 'You are an expert assistant. Respond to the following: {{topic}}.', temperature: 0.7, topK: 40, topP: 0.95, maxTokens: 2048, stopSequences: [] } as ModelNodeData },
            { type: 'knowledge', label: 'Knowledge', icon: CollectionIcon, description: 'Provides grounding data.', data: { label: 'Knowledge', sourceId: null } as KnowledgeNodeData },
            { type: 'output', label: 'Output Node', icon: ArrowLeftEndOnRectangleIcon, description: 'Final output from the agent.', data: { label: 'Output' } },
        ]
    },
    {
        name: 'Helpers',
        items: [
            { type: 'tool', label: 'Wait / Delay', icon: PauseIcon, description: 'Pause the workflow.', data: { label: 'Wait', subType: 'Wait', settings: { duration: 5, unit: 'seconds' } } as ToolNodeData },
            { type: 'tool', label: 'Execute Code', icon: CodeBracketIcon, description: 'Run custom Javascript code.', data: { label: 'Code', subType: 'ExecuteCode', settings: { code: 'return { result: "hello from code" };' } } as ToolNodeData },
            { type: 'tool', label: 'Code Snippet', icon: CodeBracketIcon, description: 'Runs a simple Javascript snippet.', data: { label: 'Code Snippet', subType: 'ExecuteCode', settings: { code: 'return { message: "This is a simple code snippet." };' } } as ToolNodeData },
            { type: 'tool', label: 'Transform JSON', icon: ArrowsPointingOutIcon, description: 'Restructure JSON data.', data: { label: 'Transform JSON', subType: 'TransformJson', settings: { expression: 'items[].name', jsonInput: '{{input}}' } } as ToolNodeData },
        ]
    },
    {
        name: 'Integrations',
        items: [
            { type: 'tool', label: 'HTTP Request', icon: ShareIcon, description: 'Call any API.', data: { label: 'HTTP Request', subType: 'HttpRequest', settings: { method: 'GET', url: 'https://jsonplaceholder.typicode.com/posts/1', headers: '{}', body: '{}' } } as ToolNodeData },
            { type: 'tool', label: 'Send Email', icon: EnvelopeIcon, description: 'Send an email.', data: { label: 'Send Email', subType: 'SendEmail', settings: { to: 'test@example.com', subject: 'Agent Result: {{topic}}', body: 'The result is: {{result}}' } } as ToolNodeData },
            { type: 'tool', label: 'Read Sheet', icon: TableCellsIcon, description: 'Read data from a Google Sheet.', data: { label: 'Read Sheet', subType: 'ReadGoogleSheet', settings: { spreadsheetId: '', range: 'A1:C10' } } as ToolNodeData },
            { type: 'tool', label: 'Append Sheet', icon: TableCellsIcon, description: 'Append a row to a Google Sheet.', data: { label: 'Append Sheet', subType: 'AppendGoogleSheet', settings: { spreadsheetId: '', range: 'A1', values: '{{input}}' } } as ToolNodeData },
            { type: 'tool', label: 'Manual Tool', icon: WrenchScrewdriverIcon, description: 'Connect to a library tool.', data: { label: 'Tool', apiEndpoint: '', authMethod: 'None', requestSchema: '{}', responseSchema: '{}' } as ToolNodeData },
        ]
    }
];


const WorkbenchSidebar: React.FC = () => {
    const onDragStart = (event: React.DragEvent, preset: PresetNode) => {
        event.dataTransfer.setData('application/reactflow', JSON.stringify(preset));
        event.dataTransfer.effectAllowed = 'move';
    };

  return (
    <aside className="w-64 bg-card shadow-card rounded-lg p-4 flex-shrink-0">
      <h2 className="text-lg font-semibold mb-4">Add Nodes</h2>
      <div className="space-y-4">
        {PRESET_NODES.map(category => (
            <div key={category.name}>
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">{category.name}</h3>
                <div className="space-y-1">
                    {category.items.map((preset) => (
                        <div
                            key={preset.label}
                            onDragStart={(event) => onDragStart(event, preset)}
                            draggable
                            className="w-full flex items-start text-left p-2 rounded-md hover:bg-accent transition-colors cursor-grab"
                        >
                            <div className="p-2 bg-secondary rounded-md mr-3">
                                <preset.icon className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <p className="font-medium text-sm text-foreground">{preset.label}</p>
                                <p className="text-xs text-muted-foreground">{preset.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        ))}
      </div>
    </aside>
  );
};

export default WorkbenchSidebar;