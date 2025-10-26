// services/apiService.ts
import { MOCK_WORKSPACES, MOCK_INITIAL_TEMPLATES, MOCK_INITIAL_EVALUATIONS, MOCK_INITIAL_TOOLS, MOCK_INITIAL_KNOWLEDGE_SOURCES } from '../mock-data.ts';
import type { PromptTemplate, Evaluation, Tool, KnowledgeSource, PromptTemplateVersion, ToolFormData, KnowledgeSourceFormData, Workspace } from '../types.ts';

// --- In-Memory Database ---
let workspacesDB: Workspace[] = MOCK_WORKSPACES;
let templatesDB: PromptTemplate[] = MOCK_INITIAL_TEMPLATES;
let evaluationsDB: Evaluation[] = MOCK_INITIAL_EVALUATIONS;
let toolsDB: Tool[] = MOCK_INITIAL_TOOLS;
let knowledgeSourcesDB: KnowledgeSource[] = MOCK_INITIAL_KNOWLEDGE_SOURCES;

// Simulate a network request
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));
const generateId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

// --- Workspace APIs ---
export const getWorkspacesByIds = async (ids: string[]): Promise<Workspace[]> => {
    await delay(100);
    const workspaces = workspacesDB.filter(w => ids.includes(w.id));
    return JSON.parse(JSON.stringify(workspaces));
};

// --- Template APIs ---
export const getTemplates = async (workspaceId: string): Promise<PromptTemplate[]> => {
    await delay(500);
    const results = templatesDB.filter(t => t.workspaceId === workspaceId);
    return JSON.parse(JSON.stringify(results)); // Return deep copy
};

export const getTemplateById = async (id: string): Promise<PromptTemplate | undefined> => {
    await delay(300);
    const template = templatesDB.find(t => t.id === id);
    return template ? JSON.parse(JSON.stringify(template)) : undefined;
};

export const createTemplate = async (newVersionData: PromptTemplateVersion, workspaceId: string): Promise<PromptTemplate> => {
    await delay(400);
    const newTemplate: PromptTemplate = {
        id: generateId('template'),
        workspaceId: workspaceId,
        domain: 'Uncategorized',
        qualityScore: 75, // Starting score
        metrics: { totalRuns: 0, successfulRuns: 0, totalUserRating: 0, avgUserRating: 0, taskSuccessRate: 0, efficiencyScore: 0.8 },
        activeVersion: newVersionData.version,
        versions: [newVersionData],
    };
    templatesDB.push(newTemplate);
    return JSON.parse(JSON.stringify(newTemplate));
};

export const updateTemplate = async (updatedTemplate: PromptTemplate): Promise<PromptTemplate> => {
    await delay(400);
    const index = templatesDB.findIndex(t => t.id === updatedTemplate.id);
    if (index !== -1) {
        templatesDB[index] = updatedTemplate;
        return JSON.parse(JSON.stringify(updatedTemplate));
    }
    throw new Error("Template not found for update.");
};

export const deleteTemplate = async (id: string): Promise<void> => {
    await delay(500);
    templatesDB = templatesDB.filter(t => t.id !== id);
};


// --- Evaluation APIs ---
export const getEvaluationsByTemplateId = async (templateId: string): Promise<Evaluation[]> => {
    await delay(200);
    const evaluations = evaluationsDB.filter(e => e.templateId === templateId);
    return JSON.parse(JSON.stringify(evaluations));
};

// --- Tool APIs ---
export const getTools = async (workspaceId: string): Promise<Tool[]> => {
    await delay(400);
    const results = toolsDB.filter(t => t.workspaceId === workspaceId);
    return JSON.parse(JSON.stringify(results));
}

export const addTool = async (toolData: ToolFormData, workspaceId: string): Promise<Tool> => {
    await delay(400);
    const newTool: Tool = {
        ...toolData,
        id: generateId('tool'),
        workspaceId: workspaceId,
    };
    toolsDB.push(newTool);
    return JSON.parse(JSON.stringify(newTool));
};

export const deleteTool = async (id: string): Promise<void> => {
    await delay(500);
    toolsDB = toolsDB.filter(t => t.id !== id);
};


// --- Knowledge Source APIs ---
export const getKnowledgeSources = async (workspaceId: string): Promise<KnowledgeSource[]> => {
    await delay(450);
    const results = knowledgeSourcesDB.filter(ks => ks.workspaceId === workspaceId);
    return JSON.parse(JSON.stringify(results));
}

export const addKnowledgeSource = async (sourceData: KnowledgeSourceFormData, workspaceId: string): Promise<KnowledgeSource> => {
    await delay(400);
    const newSource: KnowledgeSource = {
        ...sourceData,
        id: generateId('ks'),
        dateAdded: new Date().toISOString().split('T')[0],
        workspaceId: workspaceId,
    };
    knowledgeSourcesDB.push(newSource);
    return JSON.parse(JSON.stringify(newSource));
};

export const deleteKnowledgeSource = async (id: string): Promise<void> => {
    await delay(500);
    knowledgeSourcesDB = knowledgeSourcesDB.filter(ks => ks.id !== id);
};

export const getKnowledgeSourceContent = async (id: string): Promise<string> => {
    await delay(150);
    const source = knowledgeSourcesDB.find(ks => ks.id === id);
    if (!source) {
        return "Knowledge source not found.";
    }
    // In a real app, this would fetch and parse the actual document.
    // Here we just return some mock content based on the source name.
    if (source.name.includes("Financial Report")) {
        return "Q3 Financial Report Summary: Revenue is up 20% year-over-year. Net profit is $5.2 million. Projections for Q4 are optimistic, with an expected growth of 15% in the software division.";
    }
    if (source.name.includes("Onboarding")) {
        return "Company Onboarding Guide: All new employees must complete the security training within their first week. The dress code is business casual. The company VPN can be accessed at vpn.example.com.";
    }
    return `This is the placeholder content for the document titled "${source.name}".`;
};