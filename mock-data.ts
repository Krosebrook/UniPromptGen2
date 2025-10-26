// mock-data.ts
// FIX: Added AnalyticEvent to imports
import { PromptTemplate, User, Workspace, Tool, KnowledgeSource, ABTest, AgentGraph, AnalyticEvent } from './types.ts';
import { MOCK_LOGGED_IN_USER, MOCK_USERS } from './constants.ts';

// FIX: Added MOCK_INITIAL_ANALYTICS to provide data for the analyticsDB.
export const MOCK_INITIAL_ANALYTICS: AnalyticEvent[] = [
  {
    templateId: 'tmpl-1',
    workspaceId: 'ws-001',
    version: '1.0',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    latency: 310,
    success: true,
    userRating: 5,
  },
  {
    templateId: 'tmpl-2',
    workspaceId: 'ws-001',
    version: '2.0',
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    latency: 450,
    success: true,
    userRating: 4,
  },
  {
    templateId: 'tmpl-1',
    workspaceId: 'ws-001',
    version: '1.0',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
    latency: 280,
    success: false,
    userRating: 2,
  },
  {
    templateId: 'tmpl-1',
    workspaceId: 'ws-001',
    version: '1.0',
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
    latency: 330,
    success: true,
    userRating: 4,
    abTestVariant: 'A',
  },
  {
    templateId: 'tmpl-1',
    workspaceId: 'ws-001',
    version: '1.1',
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
    latency: 350,
    success: true,
    userRating: 5,
    abTestVariant: 'B',
  },
];

export const MOCK_WORKSPACES: Workspace[] = [
    { id: 'ws-001', name: 'Product Team', plan: 'Pro' },
    { id: 'ws-002', name: 'Marketing Dept.', plan: 'Pro' },
    { id: 'ws-003', name: 'R&D Sandbox', plan: 'Free' },
];


export let MOCK_TEMPLATES: PromptTemplate[] = [
    {
        id: 'tmpl-1',
        workspaceId: 'ws-001',
        domain: 'Customer Support',
        qualityScore: 92.5,
        activeVersion: '1.1',
        deployedVersion: '1.0',
        versions: [
            { version: '1.0', name: 'Customer Support Initial Response', description: 'Generates a polite and helpful initial response to a customer support query.', content: 'Hello {{customer_name}},\n\nThank you for reaching out to us about {{query_topic}}. We understand your concern and are here to help. Our team is looking into it, and we will get back to you shortly.\n\nBest,\nThe Support Team', variables: [{ name: 'customer_name', type: 'string' }, { name: 'query_topic', type: 'string' }], riskLevel: 'Low', date: '2023-10-01T10:00:00Z' },
            { version: '1.1', name: 'Customer Support Response v1.1', description: 'An updated version with a more empathetic tone.', content: 'Hi {{customer_name}},\n\nWe\'re so sorry to hear you\'re having trouble with {{query_topic}}. That sounds frustrating, and we want to get this sorted out for you right away. Our team is on the case and we will provide an update as soon as possible.\n\nSincerely,\nThe Support Team', variables: [{ name: 'customer_name', type: 'string' }, { name: 'query_topic', type: 'string' }], riskLevel: 'Low', date: '2023-11-05T14:30:00Z' },
        ],
        metrics: { totalRuns: 10520, successfulRuns: 10250, avgUserRating: 4.6, taskSuccessRate: 0.974, efficiencyScore: 0.92, totalUserRating: 48392 },
        abTests: [],
    },
    {
        id: 'tmpl-2',
        workspaceId: 'ws-001',
        domain: 'Marketing',
        qualityScore: 85.0,
        activeVersion: '2.0',
        deployedVersion: '2.0',
        versions: [
            { version: '2.0', name: 'Product Description Generator', description: 'Creates a compelling product description from a list of features.', content: 'Generate a short, exciting marketing description for a product named "{{product_name}}".\n\nFeatures:\n- {{feature_1}}\n- {{feature_2}}\n- {{feature_3}}\n\nTone: {{tone}}', variables: [{ name: 'product_name', type: 'string' }, { name: 'feature_1', type: 'string' }, { name: 'feature_2', type: 'string' }, { name: 'feature_3', type: 'string' }, { name: 'tone', type: 'string', defaultValue: 'Exciting' }], riskLevel: 'Medium', date: '2023-09-15T11:00:00Z' }
        ],
        metrics: { totalRuns: 512, successfulRuns: 460, avgUserRating: 4.1, taskSuccessRate: 0.898, efficiencyScore: 0.88, totalUserRating: 2099.2 },
        abTests: [],
    },
    {
        id: 'tmpl-3',
        workspaceId: 'ws-002',
        domain: 'Social Media',
        qualityScore: 78.2,
        activeVersion: '1.0',
        deployedVersion: null,
        versions: [
            { version: '1.0', name: 'Twitter Post Creator', description: 'Generates a tweet based on a given topic.', content: 'Write a tweet about {{topic}}. Include the hashtag #{{hashtag}}. Keep it under 280 characters.', variables: [{ name: 'topic', type: 'string' }, { name: 'hashtag', type: 'string' }], riskLevel: 'Low', date: '2023-11-20T18:00:00Z' }
        ],
        metrics: { totalRuns: 95, successfulRuns: 80, avgUserRating: 3.9, taskSuccessRate: 0.842, efficiencyScore: 0.81, totalUserRating: 370.5 },
        abTests: [],
    },
];


export let MOCK_TOOLS: Tool[] = [
    { id: 'tool-1', workspaceId: 'ws-001', name: 'Get Current Weather', description: 'Fetches the current weather for a given location.', apiEndpoint: 'https://api.weather.com/v1/current', authMethod: 'API Key', requestSchema: '{"location": "string"}', responseSchema: '{"temp_c": "number", "condition": "string"}' },
    { id: 'tool-2', workspaceId: 'ws-001', name: 'Create Product', description: 'Adds a new product to the database.', apiEndpoint: 'https://dummyjson.com/products/add', authMethod: 'None', requestSchema: '{"title": "string"}', responseSchema: '{"id": "number", "title": "string"}' },
    { id: 'tool-3', workspaceId: 'ws-002', name: 'Google Calendar API', description: 'Interacts with Google Calendar.', apiEndpoint: 'https://www.googleapis.com/calendar/v3', authMethod: 'OAuth 2.0', requestSchema: '{...}', responseSchema: '{...}' },
];

export let MOCK_KNOWLEDGE_SOURCES: KnowledgeSource[] = [
    { id: 'ks-1', workspaceId: 'ws-001', name: 'Internal API Docs', description: 'PDF documentation for our internal APIs.', type: 'PDF', dateAdded: '2023-10-10T10:00:00Z' },
    { id: 'ks-2', workspaceId: 'ws-001', name: 'Company Style Guide', description: 'Website with brand and tone guidelines.', type: 'Website', dateAdded: '2023-09-01T12:00:00Z' },
    { id: 'ks-3', workspaceId: 'ws-002', name: 'Marketing Swipe File', description: 'A plain text file with marketing copy examples.', type: 'Text', dateAdded: '2023-11-15T15:00:00Z' },
];

export const MOCK_AB_TESTS: ABTest[] = [
    {
        id: 'tmpl-1-test-1',
        name: 'Greeting Tone Test',
        versionA: '1.0',
        versionB: '1.1',
        trafficSplit: 50,
        status: 'running',
        results: {
            versionA: { totalRuns: 512, successfulRuns: 480, avgUserRating: 4.2, taskSuccessRate: 0.9375, efficiencyScore: 0.85, totalUserRating: 2150.4 },
            versionB: { totalRuns: 498, successfulRuns: 475, avgUserRating: 4.4, taskSuccessRate: 0.9538, efficiencyScore: 0.86, totalUserRating: 2191.2 },
            confidence: 0.98,
            winner: 'versionB',
        }
    }
];

export let MOCK_AGENT_GRAPHS: AgentGraph[] = [];

// Add the mock users from constants to this file for a single source of truth
export { MOCK_LOGGED_IN_USER, MOCK_USERS };