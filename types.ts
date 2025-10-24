// types.ts
import { Node as ReactFlowNode, Edge as ReactFlowEdge } from 'reactflow';

export type RiskLevel = 'Low' | 'Medium' | 'High';
export type ABTestStatus = 'running' | 'completed';
export type NodeRunStatus = 'idle' | 'running' | 'success' | 'error';

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
  id:string;
  name: string;
  description: string;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  date: string;
}

export interface PromptTemplateVariable {
  name: string;
  type: 'string' | 'number' | 'boolean';
  defaultValue?: string;
}

export interface PromptTemplateVersion {
  version: string;
  name: string;
  description: string;
  date: string;
  comment: string;
  riskLevel: RiskLevel;
  content: string;
  variables: PromptTemplateVariable[];
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
  status: ABTestStatus;
  winner?: 'A' | 'B';
  trafficSplit: number; // Percentage for version A
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

export interface ExecutionEvent {
  templateId: string;
  version: string;
  success: boolean;
  userRating: number; // e.g., 1-5
  latencyMs: number;
  cost: number;
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
    };
}

// Workbench Types
export type NodeType = 'input' | 'output' | 'model' | 'tool';

export interface BaseNodeData {
    label: string;
}

export interface ModelNodeData extends BaseNodeData {
    systemInstruction: string;
    temperature: number;
    topP: number;
    topK: number;
}

export type AuthMethod = 'None' | 'API Key' | 'OAuth 2.0';

export interface ToolNodeData extends BaseNodeData {
    apiEndpoint: string;
    authMethod: AuthMethod;
    requestSchema: string;
    responseSchema: string;
}

export interface DefaultNodeData extends BaseNodeData {}

// A discriminated union for the node data based on the node type.
export type NodeData = ModelNodeData | ToolNodeData | DefaultNodeData;

// The application's definition of a node, extending React Flow's Node type.
export type Node = ReactFlowNode<NodeData, NodeType>;
// Re-export the Edge type for consistency.
export type Edge = ReactFlowEdge;