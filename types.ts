// types.ts
import React from 'react';

// Basic Types
export type UserRole = 'Admin' | 'Editor' | 'Viewer';
export type RiskLevel = 'Low' | 'Medium' | 'High';

// User and Workspace
export interface User {
  id: string;
  name: string;
  email: string;
  title: string;
  avatarUrl: string;
  xp: number;
  level: number;
  achievements: { id: string; name: string; description: string }[];
  certifications: { id: string; name: string; issuer: string; date: string }[];
  workspaces: { workspaceId: string; role: UserRole }[];
}

export interface Workspace {
  id: string;
  name: string;
  plan: 'Free' | 'Pro' | 'Enterprise';
}

// Chat
export interface ChatMessage {
    id: string;
    role: 'user' | 'model';
    text: string;
    timestamp: Date;
}

// Grounding
export interface GroundingSource {
    web?: {
        uri: string;
        title: string;
    };
}

// Prompt Templates
export interface PromptVariable {
  name: string;
  type: 'string' | 'number' | 'boolean';
  defaultValue?: string | number | boolean;
}

export interface PromptTemplateVersion {
  version: string;
  name: string;
  description: string;
  content: string;
  variables: PromptVariable[];
  riskLevel: RiskLevel;
  date: string;
}

export interface PromptTemplateMetrics {
  totalRuns: number;
  successfulRuns: number;
  avgUserRating: number;
  totalUserRating: number; // to calculate avg
  taskSuccessRate: number;
  efficiencyScore: number;
}

export interface PromptTemplate {
  id: string;
  workspaceId: string;
  domain: string;
  qualityScore: number;
  activeVersion: string;
  deployedVersion: string | null;
  versions: PromptTemplateVersion[];
  metrics: PromptTemplateMetrics;
  abTests: ABTest[];
}

export interface ExecutionEvent {
    success: boolean;
    userRating: number; // e.g., 1-5
}

// A/B Testing
export interface ABTest {
  id: string;
  name: string;
  versionA: string;
  versionB:string;
  trafficSplit: number;
  status: 'running' | 'completed';
  results?: {
    versionA: PromptTemplateMetrics;
    versionB: PromptTemplateMetrics;
    confidence: number;
    winner: 'versionA' | 'versionB' | 'inconclusive';
  };
}

// Analytics
export interface AnalyticsChartData {
    time: string;
    calls: number;
}

// FIX: Added AnalyticEvent type to be used by apiService and mock-data.
export interface AnalyticEvent {
    templateId: string;
    workspaceId: string;
    version: string;
    timestamp: string;
    latency: number;
    success: boolean;
    userRating?: number;
    abTestVariant?: 'A' | 'B';
}


// Tools
export type AuthMethod = 'None' | 'API Key' | 'OAuth 2.0';

export interface Tool {
  id: string;
  workspaceId: string;
  name: string;
  description: string;
  apiEndpoint: string;
  authMethod: AuthMethod;
  requestSchema: string; // JSON string
  responseSchema: string; // JSON string
  apiKeyLocation?: 'header' | 'query';
  apiKeyName?: string;
  oauthClientId?: string;
  oauthAuthorizationUrl?: string;
  oauthTokenUrl?: string;
  oauthScopes?: string;
}

export type ToolFormData = Omit<Tool, 'id' | 'workspaceId'>;


// Knowledge Sources
export type KnowledgeSourceType = 'PDF' | 'Website' | 'Text' | 'API';

export interface KnowledgeSource {
  id: string;
  workspaceId: string;
  name: string;
  description: string;
  type: KnowledgeSourceType;
  dateAdded: string;
}

export type KnowledgeSourceFormData = Omit<KnowledgeSource, 'id' | 'workspaceId' | 'dateAdded'>;

// Agentic Workbench
export type NodeType = 'input' | 'output' | 'model' | 'tool' | 'knowledge';
export type NodeRunStatus = 'idle' | 'running' | 'success' | 'error';

export interface BaseNodeData {
    label: string;
}

export interface InputNodeData extends BaseNodeData {
    initialValue: string; // JSON string
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

export interface Node {
    id: string;
    type: NodeType;
    position: { x: number; y: number };
    data: BaseNodeData | InputNodeData | ModelNodeData | ToolNodeData | KnowledgeNodeData;
}

export interface Edge {
    id: string;
    source: string;
    target: string;
    sourceHandle?: string | null;
    targetHandle?: string | null;
    animated?: boolean;
    style?: React.CSSProperties;
}

export interface LogEntry {
    timestamp: string;
    message: string;
    status: 'info' | 'success' | 'error' | 'running';
}

export interface Run {
    id: string;
    startTime: Date;
    status: 'running' | 'completed' | 'failed';
    logs: LogEntry[];
    nodeOutputs: Record<string, any>;
    finalOutput: any;
}

export interface AgentGraph {
    id: string;
    workspaceId: string;
    name: string;
    description: string;
    nodes: Node[];
    edges: Edge[];
}