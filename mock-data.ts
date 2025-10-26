import type { Workspace, PromptTemplate, Tool, KnowledgeSource, AnalyticEvent } from './types.ts';

export const MOCK_WORKSPACES: Workspace[] = [
    { id: 'ws-001', name: 'Personal Workspace', plan: 'Free', memberCount: 1 },
    { id: 'ws-002', name: 'Marketing Team', plan: 'Pro', memberCount: 12 },
    { id: 'ws-003', name: 'R&D Department', plan: 'Enterprise', memberCount: 45 },
];

export const MOCK_TEMPLATES: PromptTemplate[] = [
    {
        id: 'tmpl-001',
        workspaceId: 'ws-002',
        domain: 'Marketing',
        qualityScore: 92,
        activeVersion: '2',
        deployedVersion: '1',
        versions: [
            {
                version: '1',
                name: 'Social Media Ad Copy Generator',
                description: 'Generates compelling ad copy for various social media platforms.',
                content: `Generate ad copy for a {{platform}} post. The product is "{{product_name}}" and the target audience is {{target_audience}}. The key message should be: "{{key_message}}". Keep it under {{word_count}} words.`,
                variables: [
                    { name: 'platform', type: 'string', defaultValue: 'Facebook' },
                    { name: 'product_name', type: 'string' },
                    { name: 'target_audience', type: 'string' },
                    { name: 'key_message', type: 'string' },
                    { name: 'word_count', type: 'number', defaultValue: 50 },
                ],
                riskLevel: 'Low',
                date: '2023-10-20T10:00:00Z',
            },
            {
                version: '2',
                name: 'Enhanced Ad Copy Generator (A/B Test)',
                description: 'Generates 3 variations of compelling ad copy for social media platforms.',
                content: `Generate 3 distinct ad copy variations for a {{platform}} post. The product is "{{product_name}}" and the target audience is {{target_audience}}. The key message should be: "{{key_message}}". Each variation should be under {{word_count}} words and have a different emotional tone (e.g., urgent, inspirational, humorous).`,
                variables: [
                    { name: 'platform', type: 'string', defaultValue: 'Instagram' },
                    { name: 'product_name', type: 'string' },
                    { name: 'target_audience', type: 'string' },
                    { name: 'key_message', type: 'string' },
                    { name: 'word_count', type: 'number', defaultValue: 40 },
                ],
                riskLevel: 'Low',
                date: '2023-11-05T14:30:00Z',
            },
        ],
        metrics: { totalRuns: 1520, successfulRuns: 1480, avgLatency: 450, avgTokens: 250, avgUserRating: 4.6, taskSuccessRate: 0.97, efficiencyScore: 0.9, totalUserRating: 6992 },
        abTests: [
            {
                id: 'ab-001',
                name: 'Ad Copy Tone Test',
                status: 'running',
                versionA: '1',
                versionB: '2',
                trafficSplit: 50,
                startDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
                metricsA: { successRate: 0.95, avgRating: 4.5, totalRuns: 150 },
                metricsB: { successRate: 0.91, avgRating: 4.2, totalRuns: 145 },
            }
        ],
    },
    {
        id: 'tmpl-002',
        workspaceId: 'ws-003',
        domain: 'Engineering',
        qualityScore: 85,
        activeVersion: '1',
        deployedVersion: '1',
        versions: [
            {
                version: '1',
                name: 'SQL Query Generator from Natural Language',
                description: 'Converts a natural language request into a functional SQL query.',
                content: `Given the database schema:\n\`\`\`\n{{db_schema}}\n\`\`\`\n\nConvert the following request into a valid SQL query:\n"{{user_request}}"`,
                variables: [
                    { name: 'db_schema', type: 'string' },
                    { name: 'user_request', type: 'string' },
                ],
                riskLevel: 'Medium',
                date: '2023-09-15T09:00:00Z',
            },
        ],
        metrics: { totalRuns: 850, successfulRuns: 780, avgLatency: 800, avgTokens: 500, avgUserRating: 4.2, taskSuccessRate: 0.92, efficiencyScore: 0.8, totalUserRating: 3570 },
        abTests: [],
    },
    {
        id: 'tmpl-003',
        workspaceId: 'ws-001',
        domain: 'General',
        qualityScore: 78,
        activeVersion: '1',
        deployedVersion: null,
        versions: [
            {
                version: '1',
                name: 'Meeting Summarizer',
                description: 'Summarizes a meeting transcript into key points and action items.',
                content: `Summarize the following meeting transcript into a list of key discussion points and a separate list of action items with owners.\n\nTranscript:\n{{transcript}}`,
                variables: [{ name: 'transcript', type: 'string' }],
                riskLevel: 'Low',
                date: '2023-11-10T11:00:00Z',
            },
        ],
        metrics: { totalRuns: 50, successfulRuns: 45, avgLatency: 1200, avgTokens: 1000, avgUserRating: 4.0, taskSuccessRate: 0.9, efficiencyScore: 0.7, totalUserRating: 200 },
        abTests: [],
    },
];

export const MOCK_TOOLS: Tool[] = [
    { id: 'tool-001', workspaceId: 'ws-003', name: 'Get Current Weather', description: 'Fetches real-time weather data for a given location.', apiEndpoint: 'https://api.weather.com/v3/weather', authMethod: 'API Key', requestSchema: '{"location": "string"}', responseSchema: '{"temp_c": "number", "condition": "string"}' },
    { id: 'tool-002', workspaceId: 'ws-002', name: 'Add Product to Catalog', description: 'Adds a new product to the e-commerce database.', apiEndpoint: 'https://dummyjson.com/products/add', authMethod: 'None', requestSchema: '{"title":"string", "description":"string", "price": "number"}', responseSchema: '{"id":"number", "title":"string"}' },
];

export const MOCK_KNOWLEDGE_SOURCES: KnowledgeSource[] = [
    { id: 'ks-001', workspaceId: 'ws-002', name: '2023 Marketing Strategy', description: 'Internal PDF document outlining the marketing strategy for 2023.', type: 'PDF', dateAdded: '2023-10-01T10:00:00Z', status: 'available' },
    { id: 'ks-002', workspaceId: 'ws-003', name: 'Internal API Documentation', description: 'Confluence page detailing the company\'s internal APIs.', type: 'Website', dateAdded: '2023-09-01T12:00:00Z', status: 'available' },
];

export const MOCK_INITIAL_ANALYTICS: AnalyticEvent[] = Array.from({ length: 5000 }).map((_, i) => {
    const randomTemplate = MOCK_TEMPLATES[i % 2]; // cycle between the first two templates
    const randomDate = new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000));
    const abTest = randomTemplate.abTests[0];
    
    let abTestVariant: 'A' | 'B' | undefined = undefined;
    if (abTest && abTest.status === 'running' && randomDate > new Date(abTest.startDate)) {
        abTestVariant = Math.random() < (abTest.trafficSplit / 100) ? 'A' : 'B';
    }

    return {
        id: `evt-${Date.now() - i}`,
        timestamp: randomDate.toISOString(),
        workspaceId: randomTemplate.workspaceId,
        templateId: randomTemplate.id,
        latency: Math.floor(Math.random() * 800) + 200,
        success: Math.random() < 0.97,
        abTestVariant,
        userRating: Math.floor(Math.random() * 2) + 4,
    };
});