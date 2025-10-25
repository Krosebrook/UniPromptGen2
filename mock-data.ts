// mock-data.ts

import type { PromptTemplate, Evaluation, Tool, KnowledgeSource } from './types.ts';

// Renamed from MOCK_TEMPLATES to avoid confusion. This is the initial seed data.
export const MOCK_INITIAL_TEMPLATES: PromptTemplate[] = [
  {
    id: 'template-001',
    domain: 'Marketing',
    qualityScore: 94.5,
    metrics: { totalRuns: 1204, successfulRuns: 1180, totalUserRating: 5719, avgUserRating: 4.75, taskSuccessRate: 0.98, efficiencyScore: 0.92 },
    activeVersion: '2.1',
    versions: [
      {
        version: '2.1',
        name: 'Marketing Copy Generator',
        description: 'Generates compelling marketing copy for social media campaigns based on product features and target audience.',
        date: '2024-07-22T09:00:00Z',
        comment: 'Added Tone variable for better control.',
        riskLevel: 'Low',
        content: 'Generate 3 variations of marketing copy for a new product.\n\nProduct Name: {{productName}}\nTarget Audience: {{targetAudience}}\nKey Features: {{keyFeatures}}\nTone: {{tone}}',
        variables: [
          { name: 'productName', type: 'string' },
          { name: 'targetAudience', type: 'string' },
          { name: 'keyFeatures', type: 'string' },
          { name: 'tone', type: 'string', defaultValue: 'Excited' },
        ],
      },
      {
        version: '2.0',
        name: 'Marketing Copy Generator',
        description: 'Generates compelling marketing copy for social media campaigns.',
        date: '2024-07-10T14:30:00Z',
        comment: 'Added more variables for targeting.',
        riskLevel: 'Low',
        content: 'Generate 3 variations of marketing copy for a new product.\n\nProduct Name: {{productName}}\nTarget Audience: {{targetAudience}}\nKey Features: {{keyFeatures}}',
        variables: [
          { name: 'productName', type: 'string' },
          { name: 'targetAudience', type: 'string' },
          { name: 'keyFeatures', type: 'string' },
        ],
      },
      {
        version: '1.0',
        name: 'Marketing Copy Generator v1',
        description: 'Generates basic marketing copy.',
        date: '2024-06-15T10:00:00Z',
        comment: 'Initial version.',
        riskLevel: 'Low',
        content: 'Generate marketing copy for: {{productName}}.',
        variables: [{ name: 'productName', type: 'string' }],
      }
    ],
    abTests: [
      {
        id: 'ab-test-001',
        name: 'Tone Variable Efficacy Test',
        status: 'running',
        trafficSplit: 50,
        versionA: '2.1',
        versionB: '2.0',
        metricsA: { totalRuns: 350, taskSuccessRate: 0.99, avgUserRating: 4.8 },
        metricsB: { totalRuns: 345, taskSuccessRate: 0.97, avgUserRating: 4.6 },
      },
      {
        id: 'ab-test-002',
        name: 'Old vs New Comparison',
        status: 'completed',
        winner: 'B',
        trafficSplit: 50,
        versionA: '1.0',
        versionB: '2.0',
        metricsA: { totalRuns: 500, taskSuccessRate: 0.85, avgUserRating: 4.2 },
        metricsB: { totalRuns: 500, taskSuccessRate: 0.96, avgUserRating: 4.6 },
      }
    ]
  },
  {
    id: 'template-002',
    domain: 'Code Gen',
    qualityScore: 88.2,
    metrics: { totalRuns: 850, successfulRuns: 790, totalUserRating: 3825, avgUserRating: 4.5, taskSuccessRate: 0.93, efficiencyScore: 0.85 },
    activeVersion: '1.5',
    versions: [{
      version: '1.5',
      name: 'Python Code Refactoring',
      description: 'Analyzes a Python code snippet and suggests improvements for readability, performance, and adherence to PEP 8 standards.',
      date: '2024-07-18T11:00:00Z',
      comment: 'First release.',
      riskLevel: 'Medium',
      content: 'Refactor the following Python code to improve its quality.\n\n```python\n{{codeSnippet}}\n```\n\nFocus on: {{focusAreas}}',
      variables: [
        { name: 'codeSnippet', type: 'string' },
        { name: 'focusAreas', type: 'string', defaultValue: 'Readability, Performance, PEP 8' }
      ]
    }]
  },
  {
    id: 'template-003',
    domain: 'Support',
    qualityScore: 91.8,
    metrics: { totalRuns: 2500, successfulRuns: 2450, totalUserRating: 11875, avgUserRating: 4.75, taskSuccessRate: 0.98, efficiencyScore: 0.95 },
    activeVersion: '3.0',
    versions: [{
      version: '3.0',
      name: 'Customer Support Email Responder',
      description: 'Drafts a professional and empathetic email response to a customer support query.',
      date: '2024-07-20T16:45:00Z',
      comment: 'Initial stable release.',
      riskLevel: 'Low',
      content: 'Draft a support email response.\n\nCustomer Query: {{customerQuery}}\nSentiment: {{sentiment}}\nCompany Policy Notes: {{policyNotes}}',
      variables: [
          { name: 'customerQuery', type: 'string' },
          { name: 'sentiment', type: 'string', defaultValue: 'Neutral' },
          { name: 'policyNotes', type: 'string' },
      ]
    }]
  },
   {
    id: 'template-004',
    domain: 'Content',
    qualityScore: 85.0,
    metrics: { totalRuns: 450, successfulRuns: 405, totalUserRating: 1980, avgUserRating: 4.4, taskSuccessRate: 0.90, efficiencyScore: 0.88 },
    activeVersion: '1.0',
    versions: [{
      version: '1.0',
      name: 'Technical Blog Post Outline',
      description: 'Generates a structured outline for a technical blog post, including introduction, key sections, and conclusion.',
      date: '2024-07-11T08:00:00Z',
      comment: 'Initial release.',
      riskLevel: 'Low',
      content: 'Create a blog post outline for the topic: "{{topic}}".\n\nThe target audience is {{audience}}.',
      variables: [
          { name: 'topic', type: 'string' },
          { name: 'audience', type: 'string', defaultValue: 'intermediate developers' },
      ]
    }]
  }
];

export const MOCK_INITIAL_EVALUATIONS: Evaluation[] = [
  { id: 'eval-1', templateId: 'template-001', evaluator: { name: 'Jane Doe', avatarUrl: 'https://i.pravatar.cc/150?u=janedoe' }, date: '2024-07-20', score: 95, comment: 'Excellent performance on recent campaigns.'},
  { id: 'eval-2', templateId: 'template-002', evaluator: { name: 'John Smith', avatarUrl: 'https://i.pravatar.cc/150?u=johnsmith' }, date: '2024-07-19', score: 88, comment: 'Good refactoring, but struggles with highly complex algorithms.'},
  { id: 'eval-3', templateId: 'template-003', evaluator: { name: 'Emily White', avatarUrl: 'https://i.pravatar.cc/150?u=emilywhite' }, date: '2024-07-18', score: 92, comment: 'Very consistent and reliable for standard queries.'},
];

export const MOCK_INITIAL_TOOLS: Tool[] = [
    {
        id: 'tool-001',
        name: 'Get Weather Data',
        description: 'Fetches the current weather for a given city from a public API.',
        apiEndpoint: 'https://api.open-meteo.com/v1/forecast',
        authMethod: 'None',
        requestSchema: JSON.stringify({ latitude: 52.52, longitude: 13.41, current_weather: true }, null, 2),
        responseSchema: JSON.stringify({ current_weather: { temperature: 18.3, windspeed: 10.2 } }, null, 2)
    },
    {
        id: 'tool-002',
        name: 'Add Product API',
        description: 'Adds a new product to a dummy product database.',
        apiEndpoint: 'https://dummyjson.com/products/add',
        authMethod: 'None',
        requestSchema: JSON.stringify({ title: 'Perfume Oil', price: 13.99 }, null, 2),
        responseSchema: JSON.stringify({ id: 101, title: 'Perfume Oil' }, null, 2)
    },
    {
        id: 'tool-003',
        name: 'User Authentication',
        description: 'A mock tool that simulates authenticating a user with an API key.',
        apiEndpoint: 'https://api.example.com/auth/login',
        authMethod: 'API Key',
        requestSchema: JSON.stringify({ user: 'admin', pass: 'secret' }, null, 2),
        responseSchema: JSON.stringify({ token: 'xyz123', expires: '24h' }, null, 2)
    }
];

export const MOCK_INITIAL_KNOWLEDGE_SOURCES: KnowledgeSource[] = [
    {
        id: 'ks-001',
        name: 'Q3 2024 Financial Report',
        type: 'PDF',
        description: 'The complete financial report for the third quarter of 2024.',
        dateAdded: '2024-07-20'
    },
    {
        id: 'ks-002',
        name: 'Company Onboarding Guide',
        type: 'PDF',
        description: 'Internal documentation for new hires, covering company policies and procedures.',
        dateAdded: '2024-06-15'
    },
    {
        id: 'ks-003',
        name: 'Public Website Documentation',
        type: 'Website',
        description: 'A scrape of the public-facing documentation website for product information.',
        dateAdded: '2024-07-22'
    },
     {
        id: 'ks-004',
        name: 'Internal API Specs',
        type: 'API',
        description: 'OpenAPI specification for internal microservices.',
        dateAdded: '2024-07-18'
    }
];
