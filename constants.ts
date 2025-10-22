import { PromptTemplate, ModelProfile, User, Evaluation, Comment, Achievement, Certification } from './types.ts';

export const QUALITY_SCORE_WEIGHTS = {
  USER_RATING: 0.4,
  TASK_SUCCESS_RATE: 0.3,
  EFFICIENCY_SCORE: 0.2,
  AUTO_GATE_SCORE: 0.1,
};

export const MOCK_TEMPLATES: PromptTemplate[] = [
  {
    id: 'api-builder-v1',
    name: 'Go REST API Builder',
    description: 'Generates a boilerplate for a new RESTful API endpoint in Go, including handler, model, and basic tests.',
    author: 'Dev Infra Team',
    version: '1.4.2',
    domain: 'CodeGen',
    riskLevel: 'Low',
    qualityScore: 92,
    abstractPrompt: `
{{instruction.role}}
You are an expert Go developer specializing in creating robust, production-ready microservices. Your generated code must be clean, idiomatic, and follow modern best practices.

{{instruction.task}}
Write a new API endpoint based on the following specification. The endpoint should handle POST requests to '/api/v1/users'. It must accept a JSON payload with 'username' (string) and 'email' (string), validate the input, and return a JSON response with a success message and the created user ID.

{{context.critical}}
The API must be RESTful and completely stateless. Do not use any session management. Include basic input validation to ensure username and email are not empty.

{{user_input.content}}
`,
    metrics: { totalRuns: 1258, successfulRuns: 1240, avgUserRating: 4.8, totalUserRating: 6038.4, taskSuccessRate: 0.98, efficiencyScore: 0.95 },
  },
  {
    id: 'data-analyzer-v2',
    name: 'SQL Query Generator',
    description: 'Analyzes a natural language query and generates an optimized SQL query for a PostgreSQL database.',
    author: 'Data Platform Team',
    version: '2.1.0',
    domain: 'Analysis',
    riskLevel: 'Medium',
    qualityScore: 85,
    abstractPrompt: `
{{instruction.role}}
You are a senior data analyst with deep expertise in SQL and database optimization. Your primary function is to translate natural language questions into accurate and performant PostgreSQL queries.

{{instruction.task}}
Given the following database schema and natural language question, generate the appropriate SQL query. Schema: users(id, name, email, signup_date), orders(id, user_id, amount, created_at). Question: "How many users who signed up last month made a purchase?"

{{context.critical}}
The query must be compatible with PostgreSQL 14. Ensure date comparisons are handled correctly for the "last month" requirement. The final output should be ONLY the SQL query, with no additional explanation.

{{user_input.content}}
`,
    metrics: { totalRuns: 432, successfulRuns: 390, avgUserRating: 4.5, totalUserRating: 1944, taskSuccessRate: 0.90, efficiencyScore: 0.88 },
  },
  {
    id: 'security-scanner-v1',
    name: 'Threat Model Generator',
    description: 'Generates a STRIDE threat model based on a system architecture description.',
    author: 'Security Engineering',
    version: '1.0.3',
    domain: 'Security',
    riskLevel: 'High',
    qualityScore: 78,
    abstractPrompt: `
{{instruction.role}}
You are a principal security engineer specializing in threat modeling and risk analysis. You use the STRIDE methodology to identify potential security threats.

{{instruction.task}}
Analyze the following system description and generate a threat model in Markdown format. The system is a web application with a React frontend, a Node.js backend API, and a PostgreSQL database. Users authenticate via a third-party OAuth provider.

{{context.critical}}
For each component (frontend, backend, database), identify potential threats for each category of STRIDE (Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service, Elevation of Privilege).

{{user_input.content}}
`,
    metrics: { totalRuns: 88, successfulRuns: 75, avgUserRating: 4.2, totalUserRating: 369.6, taskSuccessRate: 0.85, efficiencyScore: 0.81 },
  },
];

export const MOCK_MODEL_PROFILES: ModelProfile[] = [
    {
        id: 'gemini-pro',
        name: 'Gemini 2.5 Pro',
        vendor: 'Google',
        description: 'The most capable model for complex reasoning, coding, and creative tasks.',
        formatting_rules: {
            system_prompt: (content) => `<system_prompt>\n${content}\n</system_prompt>`,
            user_prompt: (content) => `<user_prompt>\n${content}\n</user_prompt>`,
            critical_context: (content) => `<critical_instruction>\n${content}\n</critical_instruction>`,
        },
    },
    {
        id: 'gemini-flash',
        name: 'Gemini 2.5 Flash',
        vendor: 'Google',
        description: 'A fast and efficient model for general-purpose tasks and quick responses.',
        formatting_rules: {
            system_prompt: (content) => `SYSTEM: ${content}`,
            user_prompt: (content) => `USER: ${content}`,
            critical_context: (content) => `CRITICAL: ${content}`,
        },
    },
];

export const MOCK_USER: User = {
  id: 'usr-123',
  name: 'Alex Rivera',
  email: 'alex.rivera@example.com',
  avatarUrl: 'https://i.pravatar.cc/150?u=alexrivera',
  title: 'Lead Context Engineer',
  xp: 1250,
  level: 14,
  achievements: [
      { id: 'ach-1', name: 'Master Evaluator', description: 'Completed 100 evaluations', date: '2024-05-10' },
      { id: 'ach-2', name: 'Prolific Publisher', description: 'Submitted 10 templates', date: '2024-04-22' },
      { id: 'ach-3', name: 'Community Pillar', description: 'Received 50 helpful comment reactions', date: '2024-05-15' },
  ],
  certifications: [
      { id: 'cert-1', name: 'Gold Certified Evaluator', issuer: 'Template Evaluation Academy', date: '2024-05-20' }
  ],
};

export const MOCK_EVALUATIONS: Evaluation[] = [
    {
        id: 'eval-1',
        evaluator: { name: 'Casey Lee', avatarUrl: 'https://i.pravatar.cc/150?u=caseylee' },
        date: '2024-05-21',
        scores: { codeQuality: 9, design: 8, functionality: 10 },
        feedback: 'Excellent implementation. The code is clean, well-documented, and follows best practices. The functionality is flawless. The design is good, but could be slightly more responsive on ultra-wide screens.'
    },
    {
        id: 'eval-2',
        evaluator: { name: 'Jordan Patel', avatarUrl: 'https://i.pravatar.cc/150?u=jordanpatel' },
        date: '2024-05-20',
        scores: { codeQuality: 8, design: 9, functionality: 9 },
        feedback: 'Solid template overall. The design is very modern and intuitive. Functionality works as expected, though I found one minor edge case with input validation. Code quality is high, but some functions could benefit from more detailed comments.'
    }
];

export const MOCK_COMMENTS: Comment[] = [
    {
        id: 'com-1',
        author: { name: 'Morgan Taylor', avatarUrl: 'https://i.pravatar.cc/150?u=morgantaylor' },
        date: '3 days ago',
        text: 'This is a fantastic starting point! Saved me at least a day of setup. Has anyone tried extending this to support gRPC as well?'
    },
    {
        id: 'com-2',
        author: { name: 'Alex Rivera', avatarUrl: 'https://i.pravatar.cc/150?u=alexrivera' },
        date: '2 days ago',
        text: 'Glad you found it useful, Morgan! I haven\'t added gRPC support yet, but it\'s a great idea for a v2. If you do it, feel free to submit it as a new version!'
    }
]
