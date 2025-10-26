// types.ts

import type { Node as ReactFlowNode, Edge as ReactFlowEdge } from 'reactflow';

// ===== User & Workspace =====
export type UserRole = 'Admin' | 'Editor' | 'Viewer';

export interface User {
  id: string;
  name: string;
  email: string;
  title: string;
  avatarUrl: string;
  xp: number;
  level: number;
  achievements: { id: string, name: string, description: string }[];
  certifications: { id: string, name: string, issuer: string, date: string }[];
  workspaces: { workspaceId: string, role: UserRole }[];
}

export interface Workspace {
    id: string;
    name: string;
    plan: 'Free' | 'Pro' | 'Enterprise';
    memberCount: number;
}

// ===== Prompt Templates =====

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
  content: string;
  variables: PromptVariable[];
  riskLevel: RiskLevel;
  date: string; // ISO string
}

export interface PromptTemplateMetrics {
  totalRuns: number;
  successfulRuns: number;
  avgLatency: number; // in ms
  avgTokens: number;
  avgUserRating: number; // 1-5 scale
  taskSuccessRate: number; // 0-1
  efficiencyScore: number; // 0-1 (cost, speed)
  totalUserRating: number; // sum of all ratings
}

export interface ABTest {
  id: string;
  name: string;
  status: 'running' | 'paused' | 'completed';
  versionA: string;
  versionB: string;
  trafficSplit: number; // percentage for version A
  startDate: string; // ISO string
  metricsA: { successRate: number, avgRating: number, totalRuns: number };
  metricsB: { successRate: number, avgRating: number, totalRuns: number };
  winner?: 'A' | 'B';
}

export interface PromptTemplate {
  id: string;
  workspaceId: string;
  domain: 'Marketing' | 'Sales' | 'Support' | 'Engineering' | 'General';
  versions: PromptTemplateVersion[];
  activeVersion: string;
  deployedVersion: string | null;
  qualityScore: number;
  metrics: PromptTemplateMetrics;
  abTests: ABTest[];
}

export interface ExecutionEvent {
    success: boolean;
    userRating: number; // 1-5
}


// ===== AI Playground & Gemini Service =====

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface GroundingSource {
    web?: {
        uri: string;
        title: string;
    }
}

// ===== Agentic Workbench =====

export type NodeType = 'input' | 'output' | 'model' | 'tool' | 'knowledge';
export type NodeRunStatus = 'idle' | 'running' | 'success' | 'error';

export interface BaseNodeData {
    label: string;
    initialValue?: string;
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
    requestSchema: string; // JSON string
    responseSchema: string; // JSON string
}

export interface KnowledgeNodeData extends BaseNodeData {
    sourceId: string | null;
}

export type NodeData = BaseNodeData | ModelNodeData | ToolNodeData | KnowledgeNodeData;

export type Node = ReactFlowNode<NodeData, NodeType>;
export type Edge = ReactFlowEdge;

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


// ===== Tools & Knowledge =====

export type AuthMethod = 'None' | 'API Key' | 'OAuth 2.0';

export interface ToolFormData {
    name: string;
    description: string;
    apiEndpoint: string;
    authMethod: AuthMethod;
    requestSchema: string; // JSON string
    responseSchema: string; // JSON string
}

export interface Tool extends ToolFormData {
    id: string;
    workspaceId: string;
}

export type KnowledgeSourceType = 'PDF' | 'Website' | 'Text' | 'API';

export interface KnowledgeSourceFormData {
    name: string;
    description: string;
    type: KnowledgeSourceType;
}

export interface KnowledgeSource extends KnowledgeSourceFormData {
    id: string;
    workspaceId: string;
    dateAdded: string; // ISO string
    status: 'available' | 'indexing';
}

// ===== Analytics =====
export interface AnalyticsChartData {
    time: string;
    calls: number;
}

export interface DashboardAnalytics {
    totalDeployed: number;
    totalCalls: number;
    avgLatency: number;
    successRate: number;
    chartData: AnalyticsChartData[];
    runsByTemplate: Record<string, number>;
}

export interface AnalyticEvent {
  id: string;
  timestamp: string; // ISO string
  workspaceId: string;
  templateId: string;
  latency: number; // in ms
  success: boolean;
  abTestVariant?: 'A' | 'B';
  userRating?: number; // 1-5
}