import React from 'react';
import { ModelNodeData } from '../../types.ts';

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
    </div>
  );
};

export default ModelNodeConfig;