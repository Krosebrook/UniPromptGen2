import React from 'react';
import type { ModelNodeData } from '../../types.ts';

interface ModelNodeConfigProps {
  data: ModelNodeData;
  onUpdate: (data: Partial<ModelNodeData>) => void;
}

const ConfigSlider: React.FC<{
    label: string;
    description: string;
    value: number;
    min: number;
    max: number;
    step: number;
    onChange: (value: number) => void;
}> = ({ label, description, value, min, max, step, onChange }) => (
    <div>
        <div className="flex justify-between items-baseline">
            <label className="block text-sm font-medium text-foreground">{label}</label>
            <span className="text-sm font-mono text-primary">{value.toFixed(label === 'Temperature' || label === 'Top P' ? 2 : 0)}</span>
        </div>
        <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            className="w-full h-2 bg-input rounded-lg appearance-none cursor-pointer mt-1"
        />
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
    </div>
);

const ModelNodeConfig: React.FC<ModelNodeConfigProps> = ({ data, onUpdate }) => {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-foreground">Model</label>
        <select
          value={data.modelName}
          onChange={(e) => onUpdate({ modelName: e.target.value as ModelNodeData['modelName'] })}
          className="w-full mt-1 p-2 text-sm bg-input rounded-md text-foreground focus:ring-2 focus:ring-ring focus:outline-none"
        >
          <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
          <option value="gemini-2.5-pro">Gemini 2.5 Pro</option>
        </select>
      </div>
      <div>
        <label htmlFor="prompt-template" className="block text-sm font-medium text-foreground">Prompt Template</label>
        <textarea
          id="prompt-template"
          value={data.promptTemplate}
          onChange={(e) => onUpdate({ promptTemplate: e.target.value })}
          rows={4}
          className="w-full mt-1 p-2 text-sm bg-input rounded-md text-foreground focus:ring-2 focus:ring-ring focus:outline-none resize-y"
          placeholder={'e.g., Summarize the following text: {{text_from_previous_node}}'}
        />
        <p className="text-xs text-muted-foreground mt-1">{'Use `{{variable}}` to insert data from connected nodes. The variable name must match a key in the output JSON of a parent node.'}</p>
      </div>
      <ConfigSlider
        label="Temperature"
        description="Controls randomness. Lower is more deterministic."
        value={data.temperature}
        min={0}
        max={1}
        step={0.01}
        onChange={(val) => onUpdate({ temperature: val })}
      />
      <ConfigSlider
        label="Top P"
        description="Nucleus sampling. Considers tokens with probability mass."
        value={data.topP}
        min={0}
        max={1}
        step={0.01}
        onChange={(val) => onUpdate({ topP: val })}
      />
       <ConfigSlider
        label="Top K"
        description="Considers the top K most likely tokens."
        value={data.topK}
        min={1}
        max={100}
        step={1}
        onChange={(val) => onUpdate({ topK: val })}
      />
      <ConfigSlider
        label="Max Tokens"
        description="Maximum number of tokens to generate."
        value={data.maxTokens}
        min={1}
        max={8192}
        step={1}
        onChange={(val) => onUpdate({ maxTokens: val })}
      />
       <div>
        <label htmlFor="stop-sequences" className="block text-sm font-medium text-foreground">Stop Sequences</label>
        <input
          id="stop-sequences"
          type="text"
          value={data.stopSequences.join(', ')}
          onChange={(e) => onUpdate({ stopSequences: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
          className="w-full mt-1 p-2 text-sm bg-input rounded-md text-foreground focus:ring-2 focus:ring-ring focus:outline-none"
          placeholder="e.g., ###, ---"
        />
        <p className="text-xs text-muted-foreground mt-1">Comma-separated list of strings to stop generation.</p>
      </div>
    </div>
  );
};

export default ModelNodeConfig;