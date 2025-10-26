// constants.ts

import type { User } from './types.ts';

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
  ],
  workspaces: [
    { workspaceId: 'ws-001', role: 'Admin' },
    { workspaceId: 'ws-002', role: 'Editor' },
    { workspaceId: 'ws-003', role: 'Viewer' },
  ]
};

export const QUALITY_SCORE_WEIGHTS = {
  USER_RATING: 0.4,       // 40%
  TASK_SUCCESS_RATE: 0.3, // 30%
  EFFICIENCY_SCORE: 0.2,  // 20% (latency, cost, etc.)
  AUTO_GATE_SCORE: 0.1,   // 10% (compliance, safety checks)
};