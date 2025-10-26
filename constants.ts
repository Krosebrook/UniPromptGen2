// constants.ts

// Fix: Corrected import path to be relative.
import type { User } from './types.ts';

export const MOCK_LOGGED_IN_USER: User = {
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

export const MOCK_USERS: User[] = [
    MOCK_LOGGED_IN_USER,
    {
        id: 'user-002', name: 'Jane Doe', email: 'jane.doe@example.com', title: 'Product Manager', avatarUrl: 'https://i.pravatar.cc/150?u=janedoe',
        xp: 9800, level: 11, achievements: [], certifications: [],
        workspaces: [ { workspaceId: 'ws-001', role: 'Editor' }, { workspaceId: 'ws-002', role: 'Admin' }]
    },
    {
        id: 'user-003', name: 'Mike Johnson', email: 'mike.j@example.com', title: 'Software Engineer', avatarUrl: 'https://i.pravatar.cc/150?u=mikejohnson',
        xp: 5400, level: 7, achievements: [], certifications: [],
        workspaces: [ { workspaceId: 'ws-001', role: 'Editor' }, { workspaceId: 'ws-003', role: 'Editor' }]
    },
    {
        id: 'user-004', name: 'Sarah Lee', email: 'sarah.lee@example.com', title: 'UX Designer', avatarUrl: 'https://i.pravatar.cc/150?u=sarahlee',
        xp: 2100, level: 4, achievements: [], certifications: [],
        workspaces: [ { workspaceId: 'ws-001', role: 'Viewer' }, { workspaceId: 'ws-002', role: 'Editor' }]
    },
];


export const QUALITY_SCORE_WEIGHTS = {
  USER_RATING: 0.4,       // 40%
  TASK_SUCCESS_RATE: 0.3, // 30%
  EFFICIENCY_SCORE: 0.2,  // 20% (latency, cost, etc.)
  AUTO_GATE_SCORE: 0.1,   // 10% (compliance, safety checks)
};