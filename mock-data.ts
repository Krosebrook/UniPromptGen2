// mock-data.ts

import { PromptTemplate, Tool, KnowledgeSource, AgentGraph, Workspace, Folder } from './types.ts';
import { MOCK_USERS } from './constants.ts';

const MAIN_USER_ID = 'user-001';

export const MOCK_FOLDERS: Folder[] = [
    // Fix: Added missing `folderId` property to conform to the updated Folder type.
    { id: 'folder-temp-1', name: 'Marketing Prompts', type: 'template', itemCount: 2, createdAt: new Date().toISOString(), ownerId: MAIN_USER_ID, permissions: [], folderId: null },
    // Fix: Added missing `folderId` property to conform to the updated Folder type.
    { id: 'folder-temp-2', name: 'Support Prompts', type: 'template', itemCount: 1, createdAt: new Date().toISOString(), ownerId: MAIN_USER_ID, permissions: [], folderId: null },
    // Fix: Added missing `folderId` property to conform to the updated Folder type.
    { id: 'folder-tool-1', name: 'Internal APIs', type: 'tool', itemCount: 1, createdAt: new Date().toISOString(), ownerId: MAIN_USER_ID, permissions: [{ userId: 'user-002', role: 'Viewer'}], folderId: null },
    // Fix: Added missing `folderId` property to conform to the updated Folder type.
    { id: 'folder-ks-1', name: 'Q4 Financials', type: 'knowledge', itemCount: 1, createdAt: new Date().toISOString(), ownerId: 'user-002', permissions: [{ userId: MAIN_USER_ID, role: 'Editor'}], folderId: null },
];

export const MOCK_TEMPLATES: PromptTemplate[] = [
  {
    id: 'template-001',
    folderId: 'folder-temp-1',
    domain: 'Marketing',
    qualityScore: 92,
    versions: [
      { version: '1.0', name: 'Standard Ad Copy', description: "Generates ad copy for social media.", content: 'Generate ad copy for a {{product}} targeting {{audience}}.', variables: [{ name: 'product', type: 'string' }, { name: 'audience', type: 'string' }], date: '2023-10-01', authorId: 'user-001' },
      { version: '1.1', name: 'Ad Copy with Emojis', description: "Adds emojis for more engagement.", content: 'Generate an engaging ad copy with emojis for a {{product}} targeting {{audience}}.', variables: [{ name: 'product', type: 'string' }, { name: 'audience', type: 'string' }], date: '2023-10-15', authorId: 'user-002' },
    ],
    activeVersion: '1.1',
    deployedVersion: '1.1',
    metrics: { totalRuns: 1500, successfulRuns: 1450, avgUserRating: 4.5, totalUserRating: 6750, taskSuccessRate: 0.96, efficiencyScore: 0.88 },
    createdBy: 'user-001',
    createdAt: '2023-10-01',
    updatedAt: '2023-10-15',
    ownerId: MAIN_USER_ID,
    permissions: [],
    // Fix: Added missing `name` property.
    name: 'Ad Copy with Emojis',
  },
  {
    id: 'template-002',
    folderId: 'folder-temp-2',
    domain: 'Support',
    qualityScore: 88,
    versions: [
      { version: '1.0', name: 'Customer Support Response', description: "Drafts a response to a customer query.", content: 'Draft a polite response to a customer about their issue: {{issue_summary}}.', variables: [{ name: 'issue_summary', type: 'string' }], date: '2023-09-20', authorId: 'user-001' },
    ],
    activeVersion: '1.0',
    deployedVersion: null,
    metrics: { totalRuns: 800, successfulRuns: 760, avgUserRating: 4.2, totalUserRating: 3360, taskSuccessRate: 0.95, efficiencyScore: 0.92 },
    createdBy: 'user-001',
    createdAt: '2023-09-20',
    updatedAt: '2023-09-20',
    ownerId: MAIN_USER_ID,
    permissions: [{ userId: 'user-002', role: 'Editor' }],
    // Fix: Added missing `name` property.
    name: 'Customer Support Response',
  },
  {
    id: 'template-003',
    folderId: null, // In root
    domain: 'Engineering',
    qualityScore: 95,
    versions: [
      { version: '1.0', name: 'Generate Unit Tests', description: "Generates unit tests for a given function.", content: 'Write a comprehensive suite of unit tests for the following {{language}} function:\n\n```\n{{code_block}}\n```', variables: [{ name: 'language', type: 'string' }, { name: 'code_block', type: 'string' }], date: '2023-11-05', authorId: 'user-003' },
    ],
    activeVersion: '1.0',
    deployedVersion: '1.0',
    metrics: { totalRuns: 300, successfulRuns: 295, avgUserRating: 4.8, totalUserRating: 1440, taskSuccessRate: 0.98, efficiencyScore: 0.95 },
    createdBy: 'user-003',
    createdAt: '2023-11-05',
    updatedAt: '2023-11-05',
    ownerId: 'user-003',
    permissions: [{ userId: MAIN_USER_ID, role: 'Viewer' }],
    // Fix: Added missing `name` property.
    name: 'Generate Unit Tests',
  },
   {
    id: 'template-004',
    folderId: 'folder-temp-1',
    domain: 'Marketing',
    qualityScore: 85,
    versions: [
      { version: '1.0', name: 'Blog Post Idea Generator', description: "Generates blog post ideas.", content: 'Generate 5 blog post ideas about {{topic}}.', variables: [{ name: 'topic', type: 'string' }], date: '2023-11-10', authorId: 'user-002' },
    ],
    activeVersion: '1.0',
    deployedVersion: null,
    metrics: { totalRuns: 250, successfulRuns: 220, avgUserRating: 4.1, totalUserRating: 1025, taskSuccessRate: 0.88, efficiencyScore: 0.85 },
    createdBy: 'user-002',
    createdAt: '2023-11-10',
    updatedAt: '2023-11-10',
    ownerId: 'user-002',
    permissions: [],
    // Fix: Added missing `name` property.
    name: 'Blog Post Idea Generator',
  },
];

export const MOCK_TOOLS: Tool[] = [
  {
    id: 'tool-001',
    folderId: 'folder-tool-1',
    name: 'Get Weather Data',
    description: 'Fetches the current weather for a given location.',
    apiEndpoint: 'https://api.weather.com/v1/current',
    authMethod: 'API Key',
    requestSchema: '{ "location": "string" }',
    responseSchema: '{ "temperature": "number", "conditions": "string" }',
    createdBy: 'user-001',
    createdAt: '2023-10-05',
    updatedAt: '2023-10-05',
    ownerId: MAIN_USER_ID,
    permissions: [],
  },
   {
    id: 'tool-002',
    folderId: null,
    name: 'CRM User Lookup',
    description: 'Finds user details in the company CRM.',
    apiEndpoint: 'https://internal.mycompany.com/api/crm/users',
    authMethod: 'OAuth 2.0',
    requestSchema: '{ "email": "string" }',
    responseSchema: '{ "userId": "string", "name": "string", "signupDate": "string" }',
    createdBy: 'user-003',
    createdAt: '2023-11-01',
    updatedAt: '2023-11-01',
    ownerId: 'user-003',
    permissions: [],
  }
];

export const MOCK_KNOWLEDGE_SOURCES: KnowledgeSource[] = [
    {
        id: 'ks-001',
        folderId: 'folder-ks-1',
        name: 'Q4 2023 Financial Report',
        description: 'The complete financial report for the fourth quarter of 2023.',
        type: 'PDF',
        status: 'Ready',
        createdBy: 'user-002',
        createdAt: '2023-11-01',
        updatedAt: '2023-11-02',
        ownerId: 'user-002',
        permissions: [],
    },
    {
        id: 'ks-002',
        folderId: null,
        name: 'Onboarding Documentation',
        description: 'Public documentation for new employee onboarding.',
        type: 'Website',
        status: 'Ready',
        createdBy: MAIN_USER_ID,
        createdAt: '2023-10-20',
        updatedAt: '2023-10-28',
        ownerId: MAIN_USER_ID,
        permissions: [],
    }
];

export const MOCK_AGENTS: AgentGraph[] = [
    {
        id: 'agent-001',
        name: 'Customer Support Triage Agent',
        description: 'An agent that analyzes a customer support ticket, gets user details from the CRM, and drafts a response.',
        nodes: [],
        edges: [],
    }
];

export const MOCK_WORKSPACES: Workspace[] = [
    { id: 'ws-001', name: 'Main Production', plan: 'Enterprise', memberIds: ['user-001', 'user-002', 'user-003', 'user-004'] },
    { id: 'ws-002', name: 'Marketing Team', plan: 'Pro', memberIds: ['user-001', 'user-002', 'user-004'] },
    { id: 'ws-003', name: 'Personal Dev', plan: 'Free', memberIds: ['user-001', 'user-003'] },
];

export const MOCK_ANALYTICS_DB = {
    // ...
};

export const MOCK_AB_TESTS = [
    // ...
];