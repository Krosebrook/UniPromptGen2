// constants.ts

import type { User, PromptTemplate, Evaluation } from './types.ts';

export const MOCK_USER: User = {
  id: 'user-001',
  name: 'Alex Chen',
  email: 'alex.chen@example.com',
  title: 'Senior AI Engineer',
  avatarUrl: 'https://i.pravatar.cc/150?u=alexchen',
  xp: 12580,
  level: 14,
  achievements: [
    { id: 'ach-1', name: 'Prompt Pioneer', description: 'Create 10 successful prompt templates.' },
    { id: 'ach-2', name: 'Quality Champion', description: 'Achieve a 95+ quality score on a template.' },
    { id: 'ach-3', name: 'Collaborator', description: 'Contribute to 5 team templates.' },
  ],
  certifications: [
    { id: 'cert-1', name: 'Advanced Prompt Engineering', issuer: 'AI University', date: '2023-10-15' },
    { id: 'cert-2', name: 'Generative AI for Developers', issuer: 'Cloud Academy', date: '2023-05-20' },
  ]
};

export const MOCK_TEMPLATES: PromptTemplate[] = [
  {
    id: 'template-001',
    name: 'Marketing Copy Generator',
    description: 'Generates compelling marketing copy for social media campaigns based on product features and target audience.',
    domain: 'Marketing',
    qualityScore: 94.5,
    riskLevel: 'Low',
    version: '2.1',
    metrics: { totalRuns: 1204, successfulRuns: 1180, totalUserRating: 5719, avgUserRating: 4.75, taskSuccessRate: 0.98, efficiencyScore: 0.92 },
    content: 'Generate 3 variations of marketing copy for a new product.\n\nProduct Name: {{productName}}\nTarget Audience: {{targetAudience}}\nKey Features: {{keyFeatures}}\nTone: {{tone}}',
    variables: [
      { name: 'productName', type: 'string' },
      { name: 'targetAudience', type: 'string' },
      { name: 'keyFeatures', type: 'string' },
      { name: 'tone', type: 'string', defaultValue: 'Excited' },
    ]
  },
  {
    id: 'template-002',
    name: 'Python Code Refactoring',
    description: 'Analyzes a Python code snippet and suggests improvements for readability, performance, and adherence to PEP 8 standards.',
    domain: 'Code Gen',
    qualityScore: 88.2,
    riskLevel: 'Medium',
    version: '1.5',
    metrics: { totalRuns: 850, successfulRuns: 790, totalUserRating: 3825, avgUserRating: 4.5, taskSuccessRate: 0.93, efficiencyScore: 0.85 },
    content: 'Refactor the following Python code to improve its quality.\n\n```python\n{{codeSnippet}}\n```\n\nFocus on: {{focusAreas}}',
    variables: [
      { name: 'codeSnippet', type: 'string' },
      { name: 'focusAreas', type: 'string', defaultValue: 'Readability, Performance, PEP 8' }
    ]
  },
  {
    id: 'template-003',
    name: 'Customer Support Email Responder',
    description: 'Drafts a professional and empathetic email response to a customer support query.',
    domain: 'Support',
    qualityScore: 91.8,
    riskLevel: 'Low',
    version: '3.0',
    metrics: { totalRuns: 2500, successfulRuns: 2450, totalUserRating: 11875, avgUserRating: 4.75, taskSuccessRate: 0.98, efficiencyScore: 0.95 },
    content: 'Draft a support email response.\n\nCustomer Query: {{customerQuery}}\nSentiment: {{sentiment}}\nCompany Policy Notes: {{policyNotes}}',
    variables: [
        { name: 'customerQuery', type: 'string' },
        { name: 'sentiment', type: 'string', defaultValue: 'Neutral' },
        { name: 'policyNotes', type: 'string' },
    ]
  },
   {
    id: 'template-004',
    name: 'Technical Blog Post Outline',
    description: 'Generates a structured outline for a technical blog post, including introduction, key sections, and conclusion.',
    domain: 'Content',
    qualityScore: 85.0,
    riskLevel: 'Low',
    version: '1.0',
    metrics: { totalRuns: 450, successfulRuns: 405, totalUserRating: 1980, avgUserRating: 4.4, taskSuccessRate: 0.90, efficiencyScore: 0.88 },
    content: 'Create a blog post outline for the topic: "{{topic}}".\n\nThe target audience is {{audience}}.',
    variables: [
        { name: 'topic', type: 'string' },
        { name: 'audience', type: 'string', defaultValue: 'intermediate developers' },
    ]
  }
];

export const MOCK_EVALUATIONS: Evaluation[] = [
  { id: 'eval-1', templateId: 'template-001', evaluator: { name: 'Jane Doe', avatarUrl: 'https://i.pravatar.cc/150?u=janedoe' }, date: '2024-07-20', score: 95, comment: 'Excellent performance on recent campaigns.'},
  { id: 'eval-2', templateId: 'template-002', evaluator: { name: 'John Smith', avatarUrl: 'https://i.pravatar.cc/150?u=johnsmith' }, date: '2024-07-19', score: 88, comment: 'Good refactoring, but struggles with highly complex algorithms.'},
  { id: 'eval-3', templateId: 'template-003', evaluator: { name: 'Emily White', avatarUrl: 'https://i.pravatar.cc/150?u=emilywhite' }, date: '2024-07-18', score: 92, comment: 'Very consistent and reliable for standard queries.'},
];


export const QUALITY_SCORE_WEIGHTS = {
  USER_RATING: 0.4,       // 40%
  TASK_SUCCESS_RATE: 0.3, // 30%
  EFFICIENCY_SCORE: 0.2,  // 20% (latency, cost, etc.)
  AUTO_GATE_SCORE: 0.1,   // 10% (compliance, safety checks)
};
