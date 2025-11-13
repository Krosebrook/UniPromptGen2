# API Documentation

## Overview

This document describes the services and APIs available in Universal Prompt Generator Pro.

## Table of Contents

- [Gemini Service](#gemini-service)
- [Quality Service](#quality-service)
- [Agent Executor Service](#agent-executor-service)
- [Model Compiler Service](#model-compiler-service)
- [Prompt Analysis Service](#prompt-analysis-service)

---

## Gemini Service

The Gemini Service provides integration with Google's Gemini AI models.

### Location
`services/geminiService.ts`

### Configuration
Set your API key in `.env.local`:
```
GEMINI_API_KEY=your_api_key_here
```

### Available Functions

#### `startChat()`
Initializes a new chat session with Gemini 2.5 Flash model.

**Returns:** `void`

**Example:**
```typescript
import { startChat } from './services/geminiService';

startChat();
```

---

#### `sendMessage(message: string)`
Sends a message in the current chat session.

**Parameters:**
- `message` (string): The message to send

**Returns:** `Promise<ChatMessage>`

**Example:**
```typescript
const response = await sendMessage("Hello, how can you help me?");
console.log(response.text);
```

---

#### `runImageGeneration(prompt: string, aspectRatio?: string)`
Generates an image using Imagen 3.

**Parameters:**
- `prompt` (string): Description of the image to generate
- `aspectRatio` (string, optional): Aspect ratio (default: "1:1")

**Returns:** `Promise<Blob>`

**Example:**
```typescript
const imageBlob = await runImageGeneration("A sunset over mountains", "16:9");
```

---

#### `runGroundedSearch(query: string)`
Performs a grounded search using Google Search integration.

**Parameters:**
- `query` (string): Search query

**Returns:** `Promise<{ text: string, sources: GroundingSource[] }>`

**Example:**
```typescript
const result = await runGroundedSearch("Latest AI developments");
console.log(result.text);
console.log(result.sources);
```

---

#### `runComplexReasoning(prompt: string)`
Uses Gemini 2.0 Flash Thinking mode for complex reasoning tasks.

**Parameters:**
- `prompt` (string): The reasoning problem or question

**Returns:** `Promise<string>`

**Example:**
```typescript
const answer = await runComplexReasoning("Explain quantum entanglement");
```

---

## Quality Service

Evaluates and scores prompt quality based on multiple criteria.

### Location
`services/qualityService.ts`

### Available Functions

#### `calculateQualityScore(metrics: PromptTemplateMetrics)`
Calculates an overall quality score from 0-100.

**Parameters:**
- `metrics` (PromptTemplateMetrics): Metrics object containing:
  - `avgUserRating` (number): Average user rating (0-5)
  - `taskSuccessRate` (number): Success rate (0-1)
  - `efficiencyScore` (number): Efficiency score (0-100)

**Returns:** `number` (0-100)

**Weights:**
- User Rating: 40%
- Task Success Rate: 30%
- Efficiency Score: 20%
- Auto-gate Score: 10%

**Example:**
```typescript
const score = calculateQualityScore({
  avgUserRating: 4.5,
  taskSuccessRate: 0.92,
  efficiencyScore: 85,
  totalRuns: 100,
  successfulRuns: 92,
  totalUserRating: 450
});
```

---

## Agent Executor Service

Executes agent workflows in the Agentic Workbench.

### Location
`services/agentExecutorService.ts`

### Available Functions

#### `executeAgentGraph(graph: AgentGraph, initialInputs: Record<string, any>)`
Executes a complete agent workflow graph.

**Parameters:**
- `graph` (AgentGraph): The workflow graph to execute
- `initialInputs` (Record<string, any>): Initial input values

**Returns:** `Promise<Run>`

**Example:**
```typescript
const run = await executeAgentGraph(myGraph, { 
  userQuery: "Analyze this data" 
});
console.log(run.finalOutput);
```

---

## Model Compiler Service

Compiles prompts for specific LLM models.

### Location
`services/modelCompilerService.ts`

### Available Functions

#### `compilePromptForModel(template: string, variables: Record<string, any>, modelName: string)`
Compiles a prompt template with variables for a specific model.

**Parameters:**
- `template` (string): Prompt template with variable placeholders
- `variables` (Record<string, any>): Variable values to substitute
- `modelName` (string): Target model name

**Returns:** `string`

**Example:**
```typescript
const compiled = compilePromptForModel(
  "Hello {{name}}, today's topic is {{topic}}",
  { name: "Alice", topic: "AI Ethics" },
  "gemini-2.5-flash"
);
```

---

## Prompt Analysis Service

Analyzes prompts for quality, clarity, and potential issues.

### Location
`services/promptAnalysisService.ts`

### Available Functions

#### `analyzePrompt(content: string)`
Performs comprehensive prompt analysis.

**Parameters:**
- `content` (string): Prompt text to analyze

**Returns:** `Promise<AnalysisResult>`

**Analysis Includes:**
- Clarity score
- Specificity score
- Potential ambiguities
- Suggested improvements
- Token count estimate

**Example:**
```typescript
const analysis = await analyzePrompt("Explain quantum computing");
console.log(analysis.clarityScore);
console.log(analysis.suggestions);
```

---

## Types Reference

### ChatMessage
```typescript
interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}
```

### GroundingSource
```typescript
interface GroundingSource {
  web?: {
    uri: string;
    title: string;
  }
}
```

### PromptTemplateMetrics
```typescript
interface PromptTemplateMetrics {
  totalRuns: number;
  successfulRuns: number;
  avgUserRating: number;
  totalUserRating: number;
  taskSuccessRate: number;
  efficiencyScore: number;
}
```

### AgentGraph
```typescript
interface AgentGraph {
  id: string;
  name: string;
  description: string;
  nodes: Node[];
  edges: Edge[];
}
```

### Run
```typescript
interface Run {
  id: string;
  startTime: Date;
  status: 'running' | 'completed' | 'failed';
  logs: LogEntry[];
  nodeOutputs: Record<string, any>;
  finalOutput: any | null;
}
```

---

## Error Handling

All async functions may throw errors. Always wrap calls in try-catch blocks:

```typescript
try {
  const response = await sendMessage("Hello");
  console.log(response.text);
} catch (error) {
  console.error("Error sending message:", error);
}
```

---

## Rate Limits

When using Gemini API, be aware of rate limits:
- Free tier: 15 requests per minute
- Paid tier: Varies based on plan

Implement exponential backoff for production applications.

---

## Best Practices

1. **API Key Security**: Never commit API keys to version control
2. **Error Handling**: Always handle potential errors gracefully
3. **Rate Limiting**: Implement rate limiting for production use
4. **Caching**: Cache responses when appropriate to reduce API calls
5. **Monitoring**: Track API usage and costs

---

## Support

For issues or questions:
- Open an issue on GitHub
- Check the [main documentation](README.md)
- Review the [contribution guidelines](CONTRIBUTING.md)
