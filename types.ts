// types.ts
// FIX: Import CSSProperties from react to resolve namespace error.
import type { CSSProperties } from 'react';

// From constants.ts and Profile.tsx
export interface User {
  id: string;
  name: string;
  email: string;
  title: string;
  avatarUrl: string;
  xp: number;
  level: number;
  achievements: Achievement[];
  certifications: Certification[];
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  date: string;
}

// From constants.ts, TemplateLibrary.tsx, TemplateEditor.tsx
export type RiskLevel = 'Low' | 'Medium' | 'High';

export interface PromptVariable {
  name: string;
  type: 'string' | 'number' | 'boolean';
  defaultValue?: string | number | boolean;
}

export interface PromptTemplateVersion {
  version: string;
  name: string;
  description: string;
  date: string;
  comment: string;
  riskLevel: RiskLevel;
  content: string;
  variables: PromptVariable[];
}

export interface PromptTemplateMetrics {
  totalRuns: number;
  successfulRuns: number;
  totalUserRating: number;
  avgUserRating: number;
  taskSuccessRate: number;
  efficiencyScore: number;
}

export interface ABTestMetrics {
    totalRuns: number;
    taskSuccessRate: number;
    avgUserRating: number;
}

export interface ABTest {
    id: string;
    name: string;
    status: 'running' | 'completed';
    winner?: 'A' | 'B';
    trafficSplit: number;
    versionA: string;
    versionB: string;
    metricsA: ABTestMetrics;
    metricsB: ABTestMetrics;
}


export interface PromptTemplate {
  id: string;
  domain: string;
  qualityScore: number;
  metrics: PromptTemplateMetrics;
  activeVersion: string;
  versions: PromptTemplateVersion[];
  abTests?: ABTest[];
}

// From constants.ts, TemplateEditor.tsx
export interface Evaluation {
  id: string;
  templateId: string;
  evaluator: {
    name: string;
    avatarUrl: string;
  };
  date: string;
  score: number;
  comment: string;
}

// From constants.ts, ToolLibrary.tsx
export type AuthMethod = 'None' | 'API Key' | 'OAuth 2.0';

export interface Tool {
  id: string;
  name: string;
  description: string;
  apiEndpoint: string;
  authMethod: AuthMethod;
  requestSchema: string; // JSON string
  responseSchema: string; // JSON string
}

export type ToolFormData = Omit<Tool, 'id'>;


// From constants.ts, KnowledgeLibrary.tsx
export type KnowledgeSourceType = 'PDF' | 'Website' | 'Text' | 'API';

export interface KnowledgeSource {
  id: string;
  name: string;
  type: KnowledgeSourceType;
  description: string;
  dateAdded: string;
}

export type KnowledgeSourceFormData = Omit<KnowledgeSource, 'id' | 'dateAdded'>;

// From geminiService.ts, Chatbot.tsx
export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

// From geminiService.ts, Search.tsx
export interface GroundingSource {
    web?: {
        uri: string;
        title: string;
    }
}

// From qualityService.ts
export interface ExecutionEvent {
    success: boolean;
    userRating: number; // e.g., 1-5
}

// From AgenticWorkbench and related components
export type NodeType = 'input' | 'output' | 'model' | 'tool' | 'knowledge';
export type NodeRunStatus = 'idle' | 'running' | 'success' | 'error';

export interface BaseNodeData {
    label: string;
    initialValue?: any;
}

export interface ModelNodeData extends BaseNodeData {
    systemInstruction: string;
    temperature: number;
    topP: number;
    topK: number;
}

export interface ToolNodeData extends BaseNodeData {
    toolId?: string;
    apiEndpoint: string;
    authMethod: AuthMethod;
    requestSchema: string;
    responseSchema: string;
}

export interface KnowledgeNodeData extends BaseNodeData {
    sourceId: string | null;
}

export type NodeData = BaseNodeData | ModelNodeData | ToolNodeData | KnowledgeNodeData;

// Using ReactFlow's types as a base but defining our own for app-specific data
export interface Node<T = NodeData> {
    id: string;
    position: { x: number; y: number };
    data: T;
    type?: NodeType;
}

export interface Edge {
    id: string;
    source: string;
    target: string;
    sourceHandle?: string | null;
    targetHandle?: string | null;
    animated?: boolean;
    // FIX: Changed React.CSSProperties to CSSProperties to fix namespace error.
    style?: CSSProperties;
}

export interface LogEntry {
    timestamp: string;
    message: string;
    status: 'info' | 'success' | 'error' | 'running';
}

export interface Run {
    id: string;
    startTime: Date;
    endTime?: Date;
    status: 'running' | 'completed' | 'failed';
    logs: LogEntry[];
}