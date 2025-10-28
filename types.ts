// types.ts
import React from 'react';

export type UserRole = 'Admin' | 'Editor' | 'Viewer';

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

export interface UserWorkspace {
  workspaceId: string;
  role: UserRole;
}

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
  workspaces: UserWorkspace[];
}

export interface Workspace {
    id: string;
    name: string;
    plan: 'Free' | 'Pro' | 'Enterprise';
    memberIds: string[];
}

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

// --- Prompt Template Types ---

export interface PromptVariable {
  name: string;
  type: 'string' | 'number' | 'boolean';
  defaultValue?: string | number | boolean;
  description?: string;
}

export interface PromptTemplateVersion {
  version: string;
  name: string;
  description: string;
  content: string;
  variables: PromptVariable[];
  date: string;
  authorId: string;
}

export interface PromptTemplateMetrics {
  totalRuns: number;
  successfulRuns: number;
  avgUserRating: number;
  totalUserRating: number;
  taskSuccessRate: number;
  efficiencyScore: number;
}

export type PermissionRole = 'Editor' | 'Viewer';

export interface Permission {
    userId: string;
    role: PermissionRole;
}

export interface PromptTemplate {
  id: string;
  folderId: string | null;
  domain: string;
  qualityScore: number;
  versions: PromptTemplateVersion[];
  activeVersion: string;
  deployedVersion: string | null;
  metrics: PromptTemplateMetrics;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  ownerId: string;
  permissions: Permission[];
  name: string; // Added name for LibraryItem compatibility
}

export interface ExecutionEvent {
    success: boolean;
    userRating: number; // 1-5
}

// --- Agentic Workbench Types ---
export type NodeType = 'input' | 'output' | 'model' | 'tool' | 'knowledge';
export type NodeRunStatus = 'idle' | 'running' | 'success' | 'error';

export interface InputNodeData {
  label: string;
  initialValue: string; // JSON string
}

export interface ModelNodeData {
  label: string;
  promptTemplate: string;
  temperature: number;
  topK: number;
  topP: number;
}

export interface ToolNodeData {
    label: string;
    // For library tools
    toolId?: string;
    apiEndpoint?: string;
    authMethod?: AuthMethod;
    requestSchema?: string; // JSON string
    responseSchema?: string; // JSON string
    // For preset tools
    subType?: 'HttpRequest' | 'SendEmail' | 'ReadGoogleSheet' | 'AppendGoogleSheet' | 'ExecuteCode' | 'TransformJson' | 'Wait';
    settings?: any;
}

export interface KnowledgeNodeData {
  label: string;
  sourceId: string | null;
}

export interface OutputNodeData {
  label: string;
}

export interface Node {
  id: string;
  type: NodeType;
  position: { x: number; y: number };
  data: InputNodeData | ModelNodeData | ToolNodeData | KnowledgeNodeData | OutputNodeData | { label: string };
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

export interface AgentGraph {
    id: string;
    name: string;
    description: string;
    nodes: Node[];
    edges: Edge[];
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
  finalOutput: any | null;
}

// --- Tool Library Types ---
export type AuthMethod = 'None' | 'API Key' | 'OAuth 2.0';

export interface Tool {
    id: string;
    folderId: string | null;
    name: string;
    description: string;
    apiEndpoint: string;
    authMethod: AuthMethod;
    requestSchema: string; // JSON
    responseSchema: string; // JSON
    createdBy: string;
    createdAt: string;
    updatedAt: string;
    ownerId: string;
    permissions: Permission[];
}

export interface ToolFormData extends Omit<Tool, 'id' | 'folderId' | 'createdBy' | 'createdAt' | 'updatedAt' | 'ownerId' | 'permissions'> {
    apiKeyLocation?: 'header' | 'query';
    apiKeyName?: string;
    oauthClientId?: string;
    oauthAuthorizationUrl?: string;
    oauthTokenUrl?: string;
    oauthScopes?: string;
}

// --- Knowledge Library Types ---
export type KnowledgeSourceType = 'PDF' | 'Website' | 'Text' | 'API';

export interface KnowledgeSource {
    id: string;
    folderId: string | null;
    name: string;
    description: string;
    type: KnowledgeSourceType;
    status: 'Pending' | 'Indexing' | 'Ready' | 'Error';
    createdBy: string;
    createdAt: string;
    updatedAt: string;
    ownerId: string;
    permissions: Permission[];
}

export interface KnowledgeSourceFormData extends Omit<KnowledgeSource, 'id' | 'folderId' | 'status' | 'createdBy' | 'createdAt' | 'updatedAt' | 'ownerId' | 'permissions'> {}

// --- Analytics ---
export interface AnalyticsChartData {
    time: string;
    calls: number;
}

// --- A/B Testing ---
export interface ABTest {
    id: string;
    templateId: string;
    name: string;
    status: 'running' | 'completed';
    versionA: string;
    versionB: string;
    trafficSplit: number; // Percentage for version A
    results?: {
        winner: 'versionA' | 'versionB';
        reason: string;
    }
}

export interface ABTestChartData {
  time: string;
  versionA_runs: number;
  versionB_runs: number;
  versionA_successRate: number;
  versionB_successRate: number;
  versionA_avgRating: number;
  versionB_avgRating: number;
}


// --- Library ---
export type LibraryType = 'template' | 'tool' | 'knowledge' | 'evaluation';

export interface Folder {
    id: string;
    name: string;
    type: 'template' | 'tool' | 'knowledge' | 'evaluation';
    itemCount: number;
    createdAt: string;
    ownerId: string;
    permissions: Permission[];
    folderId: string | null;
}

export type LibraryItem = PromptTemplate | Tool | KnowledgeSource | Folder;

// --- Task Management ---
export type TaskPriority = 'High' | 'Medium' | 'Low';

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  priority: TaskPriority;
  workspaceId: string;
}