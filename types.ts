export type RiskLevel = 'Low' | 'Medium' | 'High';

export interface PromptTemplateMetrics {
  totalRuns: number;
  successfulRuns: number;
  avgUserRating: number;
  totalUserRating: number;
  taskSuccessRate: number;
  efficiencyScore: number;
}

export interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  author: string;
  version: string;
  domain: string;
  riskLevel: RiskLevel;
  qualityScore: number;
  abstractPrompt: string;
  metrics: PromptTemplateMetrics;
}

export interface ModelProfile {
  id: string;
  name: string;
  vendor: string;
  description: string;
  formatting_rules: {
    system_prompt: (content: string) => string;
    user_prompt: (content: string) => string;
    critical_context: (content: string) => string;
  };
}

export interface ExecutionEvent {
  userRating: number; // 1-5
  success: boolean;
  latencyMs: number;
  cost: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  title: string;
  xp: number;
  level: number;
  achievements: Achievement[];
  certifications: Certification[];
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  date: string;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  date: string;
}

export interface Evaluation {
  id: string;
  evaluator: {
    name: string;
    avatarUrl: string;
  };
  date: string;
  scores: {
    codeQuality: number;
    design: number;
    functionality: number;
  };
  feedback: string;
}

export interface Comment {
    id: string;
    author: {
        name: string;
        avatarUrl: string;
    };
    date: string;
    text: string;
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
}
