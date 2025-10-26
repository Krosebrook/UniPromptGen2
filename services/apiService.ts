// services/apiService.ts

import { MOCK_TEMPLATES, MOCK_TOOLS, MOCK_KNOWLEDGE_SOURCES, MOCK_WORKSPACES, MOCK_INITIAL_ANALYTICS } from '../mock-data.ts';
import type { PromptTemplate, Tool, KnowledgeSource, Workspace, ToolFormData, KnowledgeSourceFormData, DashboardAnalytics, AnalyticEvent, ABTest } from '../types.ts';
import { ingestExecutionEvent } from './qualityService.ts';

// Simulate network latency
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

let templates: PromptTemplate[] = JSON.parse(JSON.stringify(MOCK_TEMPLATES));
let tools: Tool[] = JSON.parse(JSON.stringify(MOCK_TOOLS));
let knowledgeSources: KnowledgeSource[] = JSON.parse(JSON.stringify(MOCK_KNOWLEDGE_SOURCES));
let analyticsDB: AnalyticEvent[] = JSON.parse(JSON.stringify(MOCK_INITIAL_ANALYTICS));


// ===== Templates =====
export const getTemplates = async (workspaceId: string): Promise<PromptTemplate[]> => {
    await delay(500);
    return templates.filter(t => t.workspaceId === workspaceId);
};

export const getTemplateById = async (id: string): Promise<PromptTemplate | undefined> => {
    await delay(300);
    return templates.find(t => t.id === id);
};

export const deleteTemplate = async (id: string): Promise<void> => {
    await delay(500);
    templates = templates.filter(t => t.id !== id);
};

export const saveTemplate = async (updatedTemplate: PromptTemplate): Promise<PromptTemplate> => {
    await delay(700);
    const index = templates.findIndex(t => t.id === updatedTemplate.id);
    if (index !== -1) {
        const event = { success: Math.random() > 0.1, userRating: Math.floor(Math.random() * 2) + 4 };
        const withNewMetrics = ingestExecutionEvent(updatedTemplate, event);
        templates[index] = withNewMetrics;
        return withNewMetrics;
    }
    throw new Error("Template not found");
};

export const addTemplate = async (templateData: Omit<PromptTemplate, 'id' | 'qualityScore' | 'metrics' | 'abTests'>, workspaceId: string): Promise<PromptTemplate> => {
    await delay(700);
    const newTemplate: PromptTemplate = {
        ...templateData,
        id: `tmpl-${Date.now()}`,
        workspaceId,
        qualityScore: 75,
        metrics: { totalRuns: 0, successfulRuns: 0, avgLatency: 0, avgTokens: 0, avgUserRating: 0, taskSuccessRate: 0, efficiencyScore: 0.8, totalUserRating: 0 },
        abTests: [],
    };
    templates.push(newTemplate);
    return newTemplate;
};

export const deployVersion = async (templateId: string, version: string): Promise<PromptTemplate> => {
    await delay(1000);
    const template = await getTemplateById(templateId);
    if (!template) throw new Error("Template not found");
    template.deployedVersion = version;
    return await saveTemplate(template);
};


// ===== Tools =====
export const getTools = async (workspaceId: string): Promise<Tool[]> => {
    await delay(500);
    return tools.filter(t => t.workspaceId === workspaceId);
};

export const deleteTool = async (id: string): Promise<void> => {
    await delay(500);
    tools = tools.filter(t => t.id !== id);
};

export const addTool = async (toolData: ToolFormData, workspaceId: string): Promise<Tool> => {
    await delay(600);
    const newTool: Tool = { ...toolData, id: `tool-${Date.now()}`, workspaceId };
    tools.push(newTool);
    return newTool;
};

export const executeTool = async(toolId: string, inputData: any): Promise<any> => {
    await delay(800);
    const tool = tools.find(t => t.id === toolId);
    if (!tool) throw new Error("Tool not found");

    console.log(`[Backend Proxy] Executing tool: ${tool.name}`);
    console.log(`[Backend Proxy] Securely injecting credentials for auth method: ${tool.authMethod}`);
    console.log(`[Backend Proxy] Making fetch call to: ${tool.apiEndpoint}`);
    
    // This is where a real backend would make the call using stored secrets.
    // We will simulate the call here.
    try {
        const response = await fetch(tool.apiEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(inputData),
        });
        if (!response.ok) {
            throw new Error(`API call failed with status: ${response.status}`);
        }
        return await response.json();
    } catch(e) {
        console.error(`[Backend Proxy] Error executing tool ${tool.name}:`, e);
        throw e;
    }
};

// ===== Knowledge Sources =====
export const getKnowledgeSources = async (workspaceId: string): Promise<KnowledgeSource[]> => {
    await delay(500);
    return knowledgeSources.filter(ks => ks.workspaceId === workspaceId);
};

export const getKnowledgeSourceContent = async (sourceId: string): Promise<string> => {
    await delay(150);
    const source = knowledgeSources.find(s => s.id === sourceId);
    if (!source) return "Knowledge source not found.";
    return `Content from ${source.name}: This document outlines the key strategies...`;
};


export const deleteKnowledgeSource = async (id: string): Promise<void> => {
    await delay(500);
    knowledgeSources = knowledgeSources.filter(ks => ks.id !== id);
};

export const addKnowledgeSource = async (sourceData: KnowledgeSourceFormData, workspaceId: string): Promise<KnowledgeSource> => {
    await delay(600);
    const newSource: KnowledgeSource = { ...sourceData, id: `ks-${Date.now()}`, workspaceId, dateAdded: new Date().toISOString(), status: 'available' };
    knowledgeSources.push(newSource);
    return newSource;
};

// ===== Workspaces =====
export const getWorkspacesByIds = async (ids: string[]): Promise<Workspace[]> => {
    await delay(200);
    return MOCK_WORKSPACES.filter(w => ids.includes(w.id));
};

// ===== Deployment & Analytics =====
export const runDeployedTemplate = async (templateId: string): Promise<void> => {
    await delay(200);
    const template = await getTemplateById(templateId);
    if (!template || !template.deployedVersion) throw new Error("Deployed template not found");
    
    const event: AnalyticEvent = {
        id: `evt-${Date.now()}`,
        timestamp: new Date().toISOString(),
        workspaceId: template.workspaceId,
        templateId: template.id,
        latency: Math.floor(Math.random() * 500) + 200, // 200-700ms
        success: Math.random() < 0.98, // 98% success rate
    };
    analyticsDB.push(event);
};


export const getDeployedTemplates = async (workspaceId: string): Promise<PromptTemplate[]> => {
    await delay(600);
    return templates.filter(t => t.workspaceId === workspaceId && t.deployedVersion !== null);
};

export const getAnalytics = async (workspaceId: string, days: number): Promise<DashboardAnalytics> => {
    await delay(800);
    
    const now = new Date();
    const startTime = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    
    const relevantEvents = analyticsDB.filter(event => 
        event.workspaceId === workspaceId && new Date(event.timestamp) >= startTime
    );

    const totalCalls = relevantEvents.length;
    const successfulCalls = relevantEvents.filter(e => e.success).length;
    const avgLatency = totalCalls > 0 ? relevantEvents.reduce((sum, e) => sum + e.latency, 0) / totalCalls : 0;
    const successRate = totalCalls > 0 ? successfulCalls / totalCalls : 0;

    const runsByTemplate = relevantEvents.reduce((acc, event) => {
        acc[event.templateId] = (acc[event.templateId] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    // Generate chart data
    const chartData: { time: string; calls: number }[] = [];
    if (days === 1) { // Group by hour for 24h view
        for (let i = 0; i < 24; i++) {
            const hourStart = new Date(now.getTime() - (23 - i) * 60 * 60 * 1000);
            hourStart.setMinutes(0, 0, 0);
            const calls = relevantEvents.filter(e => {
                const eventHour = new Date(e.timestamp);
                eventHour.setMinutes(0,0,0);
                return eventHour.getTime() === hourStart.getTime();
            }).length;
            chartData.push({ time: `${hourStart.getHours()}:00`, calls });
        }
    } else { // Group by day for 7d/30d view
        for (let i = 0; i < days; i++) {
            const dayStart = new Date(now.getTime() - (days - 1 - i) * 24 * 60 * 60 * 1000);
            dayStart.setHours(0, 0, 0, 0);
            const calls = relevantEvents.filter(e => new Date(e.timestamp).toDateString() === dayStart.toDateString()).length;
            chartData.push({ time: dayStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), calls });
        }
    }

    const deployed = await getDeployedTemplates(workspaceId);

    return {
        totalDeployed: deployed.length,
        totalCalls,
        avgLatency,
        successRate,
        chartData,
        runsByTemplate
    };
};

// ===== A/B Testing =====
export const getABTestAnalytics = async (testId: string): Promise<{
    metricsA: ABTest['metricsA'],
    metricsB: ABTest['metricsB']
}> => {
    await delay(500);
    // Find the test to get start date, etc.
    const relevantEvents = analyticsDB.filter(e => e.abTestVariant);
    
    const metricsA = {
        totalRuns: relevantEvents.filter(e => e.abTestVariant === 'A').length,
        successRate: 0.95,
        avgRating: 4.5
    };
    const metricsB = {
        totalRuns: relevantEvents.filter(e => e.abTestVariant === 'B').length,
        successRate: 0.91,
        avgRating: 4.2
    };

    return { metricsA, metricsB };
};

export const declareABTestWinner = async (templateId: string, testId: string, winner: 'A' | 'B'): Promise<PromptTemplate> => {
    await delay(800);
    const template = await getTemplateById(templateId);
    if (!template) throw new Error("Template not found");

    const testIndex = template.abTests.findIndex(t => t.id === testId);
    if (testIndex === -1) throw new Error("A/B Test not found");

    const test = template.abTests[testIndex];
    test.status = 'completed';
    test.winner = winner;
    
    // Set the winning version as the new active version
    template.activeVersion = winner === 'A' ? test.versionA : test.versionB;
    
    return await saveTemplate(template);
};