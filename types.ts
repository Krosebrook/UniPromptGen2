// types.ts

export type RiskLevel = 'Low' | 'Medium' | 'High';

export interface PromptTemplateMetrics {
  totalRuns: number;
  successfulRuns: number;
  totalUserRating: number;
  avgUserRating: number;
  taskSuccessRate: number;
  efficiencyScore: number;
}

export interface PromptTemplateVersion {
  version: string;
  name: string;
  description: string;
  date: string;
  comment: string;
  content: string;
  variables: { name: string, type: 'string' | 'number', defaultValue?: any }[];
  riskLevel: RiskLevel;
}

export interface PromptTemplate {
  id: string;
  domain: string;
  qualityScore: number;
  metrics: PromptTemplateMetrics;
  versions: PromptTemplateVersion[];
  activeVersion: string;
}

export interface ExecutionEvent {
  success: boolean;
  userRating: number; // 1-5 scale
  // ... other event data like latency, cost, output, etc.
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

export interface Evaluation {
  id: string;
  templateId: string;
  evaluator: Pick<User, 'name' | 'avatarUrl'>;
  date: string;
  score: number;
  comment: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
}

export interface GroundingSource {
    web?: {
        uri: string;
        title: string;
    };
    maps?: {
        uri: string;
        title: string;
        placeAnswerSources?: {
            reviewSnippets: {
                uri: string,
                title: string
            }[];
        }
    };
}