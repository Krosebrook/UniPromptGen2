import React, { useState, useMemo } from 'react';
import { PromptTemplateVersion, PromptVariable } from '../../types.ts';
import { XCircleIcon, ScaleIcon } from '../icons/Icons.tsx';
import { generateDiff, DiffLine } from '../../utils/diff.ts';

interface VersionComparisonModalProps {
  versions: PromptTemplateVersion[];
  onClose: () => void;
}

const DiffViewer: React.FC<{ diff: DiffLine[] }> = ({ diff }) => (
    <pre className="bg-black/50 p-4 rounded-md text-sm font-mono overflow-x-auto">
        {diff.map((item, index) => {
            let lineClass = 'text-foreground/70';
            let prefix = '  ';
            if (item.type === 'added') {
                lineClass = 'bg-success/20 text-success';
                prefix = '+ ';
            } else if (item.type === 'removed') {
                lineClass = 'bg-destructive/20 text-destructive';
                prefix = '- ';
            }
            return (
                <div key={index} className={lineClass}>
                    <span>{prefix}</span>
                    <span>{item.line}</span>
                </div>
            );
        })}
    </pre>
);

const MetaTable: React.FC<{ versionA: PromptTemplateVersion, versionB: PromptTemplateVersion }> = ({ versionA, versionB }) => {
    const renderVariables = (variables: PromptVariable[]) => (
        <ul className="list-disc pl-5">
            {variables.map(v => <li key={v.name}>{v.name} <span className="text-muted-foreground">({v.type})</span></li>)}
        </ul>
    );

    const rows = [
        { label: 'Name', valueA: versionA.name, valueB: versionB.name },
        { label: 'Description', valueA: versionA.description, valueB: versionB.description },
        { label: 'Date', valueA: new Date(versionA.date).toLocaleString(), valueB: new Date(versionB.date).toLocaleString() },
        { label: 'Author ID', valueA: versionA.authorId, valueB: versionB.authorId },
        { label: 'Variables', valueA: renderVariables(versionA.variables), valueB: renderVariables(versionB.variables) }
    ];
    
    return (
        <div className="border border-border rounded-md">
            <table className="w-full text-sm">
                <thead>
                    <tr className="bg-secondary">
                        <th className="p-2 text-left font-semibold">Attribute</th>
                        <th className="p-2 text-left font-semibold">Version {versionA.version}</th>
                        <th className="p-2 text-left font-semibold">Version {versionB.version}</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-border">
                    {rows.map(row => (
                        <tr key={row.label}>
                            <td className="p-2 font-medium text-muted-foreground align-top">{row.label}</td>
                            <td className="p-2 align-top">{row.valueA}</td>
                            <td className="p-2 align-top">{row.valueB}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const VersionComparisonModal: React.FC<VersionComparisonModalProps> = ({ versions, onClose }) => {
  const [versionAId, setVersionAId] = useState(versions[1]?.version || '');
  const [versionBId, setVersionBId] = useState(versions[0]?.version || '');

  const versionA = useMemo(() => versions.find(v => v.version === versionAId), [versions, versionAId]);
  const versionB = useMemo(() => versions.find(v => v.version === versionBId), [versions, versionBId]);

  const contentDiff = useMemo(() => {
    if (versionA && versionB) {
      return generateDiff(versionA.content, versionB.content);
    }
    return [];
  }, [versionA, versionB]);

  const availableVersionsForB = versions.filter(v => v.version !== versionAId);
  const availableVersionsForA = versions.filter(v => v.version !== versionBId);

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-40" onClick={onClose}>
      <div className="bg-popover w-full max-w-4xl rounded-lg shadow-xl relative" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-3 right-3 p-1 rounded-full hover:bg-accent z-10">
          <XCircleIcon className="h-6 w-6 text-muted-foreground" />
        </button>
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-1 flex items-center gap-2"><ScaleIcon className="h-6 w-6"/> Compare Versions</h2>
          <p className="text-muted-foreground mb-4">Select two versions to see their differences.</p>
        </div>
        <div className="max-h-[70vh] overflow-y-auto px-6 pb-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sticky top-0 bg-popover py-2">
                 <div>
                    <label htmlFor="versionA" className="block text-sm font-medium text-muted-foreground mb-1">Compare</label>
                    <select id="versionA" value={versionAId} onChange={(e) => setVersionAId(e.target.value)} className="w-full p-2 bg-input rounded-md text-foreground">
                       {availableVersionsForA.map(v => <option key={v.version} value={v.version}>Version {v.version}</option>)}
                    </select>
                </div>
                 <div>
                    <label htmlFor="versionB" className="block text-sm font-medium text-muted-foreground mb-1">With</label>
                    <select id="versionB" value={versionBId} onChange={(e) => setVersionBId(e.target.value)} className="w-full p-2 bg-input rounded-md text-foreground">
                        {availableVersionsForB.map(v => <option key={v.version} value={v.version}>Version {v.version}</option>)}
                    </select>
                </div>
            </div>
            {versionA && versionB ? (
                <div className="space-y-6">
                    <div>
                        <h3 className="text-lg font-semibold mb-2">Metadata</h3>
                        <MetaTable versionA={versionA} versionB={versionB} />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold mb-2">Prompt Content Diff</h3>
                        <DiffViewer diff={contentDiff} />
                    </div>
                </div>
            ) : (
                <p className="text-center text-muted-foreground py-10">Please select two valid versions to compare.</p>
            )}
        </div>
      </div>
    </div>
  );
};

export default VersionComparisonModal;
