// services/apiService.ts
import { MOCK_TEMPLATES, MOCK_USERS, MOCK_WORKSPACES, MOCK_TOOLS, MOCK_KNOWLEDGE_SOURCES, MOCK_AB_TESTS, MOCK_AGENT_GRAPHS } from '../mock-data.ts';
import { PromptTemplate, User, Workspace, Tool, ToolFormData, KnowledgeSource, KnowledgeSourceFormData, AnalyticsChartData, ABTest, AgentGraph, UserRole } from '../types.ts';
import { ingestExecutionEvent } from './qualityService.ts';

// Simulate network latency
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

// --- Templates ---
export const getTemplates = async (workspaceId: string): Promise<PromptTemplate[]> => {
    await delay(500);
    return MOCK_TEMPLATES.filter(t => t.workspaceId === workspaceId);
}

export const getDeployedTemplates = async (workspaceId: string): Promise<PromptTemplate[]> => {
    await delay(500);
    return MOCK_TEMPLATES.filter(t => t.workspaceId === workspaceId && t.deployedVersion);
};

export const getTemplateById = async (id: string): Promise<PromptTemplate | undefined> => {
    await delay(300);
    return MOCK_TEMPLATES.find(t => t.id === id);
}

export const saveTemplate = async (template: PromptTemplate): Promise<PromptTemplate> => {
    await delay(700);
    if (template.id) { // Update
        const index = MOCK_TEMPLATES.findIndex(t => t.id === template.id);
        if (index > -1) {
            MOCK_TEMPLATES[index] = template;
            return template;
        }
    }
    // Create
    const newTemplate = { ...template, id: `tmpl-${Date.now()}` };
    MOCK_TEMPLATES.push(newTemplate);
    return newTemplate;
};

export const deleteTemplate = async (id: string): Promise<void> => {
    await delay(400);
    const index = MOCK_TEMPLATES.findIndex(t => t.id === id);
    if (index > -1) {
        MOCK_TEMPLATES.splice(index, 1);
    }
};

export const deployTemplateVersion = async (templateId: string, version: string): Promise<PromptTemplate> => {
    await delay(800);
    const template = MOCK_TEMPLATES.find(t => t.id === templateId);
    if (!template) throw new Error("Template not found");
    template.deployedVersion = version;
    
    // Simulate some event ingestion for quality score updates
    const updatedTemplate = ingestExecutionEvent(template, { success: true, userRating: 4.5 });
    
    return updatedTemplate;
};


// --- Users & Workspaces ---
export const getUsersForWorkspace = async (workspaceId: string): Promise<User[]> => {
    await delay(300);
    return MOCK_USERS.filter(u => u.workspaces.some(ws => ws.workspaceId === workspaceId));
};

export const getWorkspacesByIds = async (ids: string[]): Promise<Workspace[]> => {
    await delay(200);
    return MOCK_WORKSPACES.filter(ws => ids.includes(ws.id));
};

// --- Tools ---
export const getTools = async (workspaceId: string): Promise<Tool[]> => {
    await delay(300);
    return MOCK_TOOLS.filter(t => t.workspaceId === workspaceId);
};

export const addTool = async (toolData: ToolFormData, workspaceId: string): Promise<Tool> => {
    await delay(400);
    const newTool: Tool = {
        ...toolData,
        id: `tool-${Date.now()}`,
        workspaceId,
    };
    MOCK_TOOLS.push(newTool);
    return newTool;
};

export const deleteTool = async (id: string): Promise<void> => {
    await delay(400);
    const index = MOCK_TOOLS.findIndex(t => t.id === id);
    if (index > -1) {
        MOCK_TOOLS.splice(index, 1);
    }
};

// --- Knowledge Sources ---
export const getKnowledgeSources = async (workspaceId: string): Promise<KnowledgeSource[]> => {
    await delay(300);
    return MOCK_KNOWLEDGE_SOURCES.filter(ks => ks.workspaceId === workspaceId);
};

export const addKnowledgeSource = async (sourceData: KnowledgeSourceFormData, workspaceId: string): Promise<KnowledgeSource> => {
    await delay(400);
    const newSource: KnowledgeSource = {
        ...sourceData,
        id: `ks-${Date.now()}`,
        workspaceId,
        dateAdded: new Date().toISOString(),
    };
    MOCK_KNOWLEDGE_SOURCES.push(newSource);
    return newSource;
};

export const deleteKnowledgeSource = async (id: string): Promise<void> => {
    await delay(400);
    const index = MOCK_KNOWLEDGE_SOURCES.findIndex(ks => ks.id === id);
    if (index > -1) {
        MOCK_KNOWLEDGE_SOURCES.splice(index, 1);
    }
};

// --- A/B Testing ---
export const getABTestsForTemplate = async (templateId: string): Promise<ABTest[]> => {
    await delay(250);
    return MOCK_AB_TESTS.filter(t => t.id.startsWith(templateId));
};

export const createABTest = async (templateId: string, testData: Partial<ABTest>): Promise<ABTest> => {
    await delay(500);
    const newTest: ABTest = {
        id: `${templateId}-test-${Date.now()}`,
        name: testData.name!,
        versionA: testData.versionA!,
        versionB: testData.versionB!,
        trafficSplit: testData.trafficSplit!,
        status: 'running',
    };
    MOCK_AB_TESTS.push(newTest);
    return newTest;
};

export const declareABTestWinner = async (testId: string, winner: 'A' | 'B'): Promise<void> => {
    await delay(600);
    const test = MOCK_AB_TESTS.find(t => t.id === testId);
    if (!test) throw new Error("A/B Test not found");
    
    test.status = 'completed';
    // Here you would also update the activeVersion of the template, etc.
};

// --- Analytics & Billing ---
export const getAnalytics = async (workspaceId: string, days: number): Promise<{
    totalDeployed: number,
    totalCalls: number,
    avgLatency: number,
    successRate: number,
    chartData: AnalyticsChartData[],
    runsByTemplate: Record<string, number>
}> => {
    await delay(800);
    const templates = MOCK_TEMPLATES.filter(t => t.workspaceId === workspaceId && t.deployedVersion);
    const usageSeed = workspaceId.charCodeAt(3) || 1;
    
    const chartData: AnalyticsChartData[] = [];
    for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        chartData.push({
            time: days > 1 ? date.toLocaleDateString('en-US', { month: 'short', day: 'numeric'}) : date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit'}),
            calls: (usageSeed * 100) + Math.floor(Math.random() * (200 + i * 50)),
        });
    }

    const runsByTemplate: Record<string, number> = {};
    templates.forEach(t => {
        runsByTemplate[t.id] = (t.id.charCodeAt(5) || 1) * 100 + Math.floor(Math.random() * 500);
    });
    
    return {
        totalDeployed: templates.length,
        totalCalls: chartData.reduce((acc, cur) => acc + cur.calls, 0),
        avgLatency: 250 + usageSeed * 5,
        successRate: 0.95 - (usageSeed / 1000),
        chartData,
        runsByTemplate,
    }
};


export const getBillingUsage = async (workspaceId: string): Promise<{ apiCalls: number }> => {
    await delay(400);
    const usageSeed = workspaceId.length + (workspaceId.charCodeAt(1) || 1);
    return {
        apiCalls: 5000 + usageSeed * 100 + Math.floor(Math.random() * 1000)
    };
}

// --- Agent Graphs ---
export const getAgentGraphs = async (workspaceId: string): Promise<AgentGraph[]> => {
    await delay(300);
    return MOCK_AGENT_GRAPHS.filter(ag => ag.workspaceId === workspaceId);
}

export const saveAgentGraph = async (agentData: Omit<AgentGraph, 'id' | 'workspaceId'> & { id?: string }, workspaceId: string): Promise<AgentGraph> => {
    await delay(500);
    if (agentData.id) { // Update
        const index = MOCK_AGENT_GRAPHS.findIndex(ag => ag.id === agentData.id);
        if (index > -1) {
            MOCK_AGENT_GRAPHS[index] = { ...MOCK_AGENT_GRAPHS[index], ...(agentData as AgentGraph), workspaceId };
            return MOCK_AGENT_GRAPHS[index];
        }
    }
    // Create
    const newAgent: AgentGraph = {
        id: `agent-${Date.now()}`,
        workspaceId,
        name: agentData.name,
        description: agentData.description,
        nodes: agentData.nodes,
        edges: agentData.edges,
    };
    MOCK_AGENT_GRAPHS.push(newAgent);
    return newAgent;
}
