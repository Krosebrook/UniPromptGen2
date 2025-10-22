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

export interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  domain: string; // e.g., 'Marketing', 'Code Gen'
  qualityScore: number;
  riskLevel: RiskLevel;
  version: string;
  metrics: PromptTemplateMetrics;
  content: string; // The actual prompt content
  variables: { name: string, type: 'string' | 'number', defaultValue?: any }[];
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
