// services/apiService.ts
import { MOCK_TEMPLATES, MOCK_USERS, MOCK_WORKSPACES, MOCK_TOOLS, MOCK_KNOWLEDGE_SOURCES, MOCK_AB_TESTS, MOCK_AGENT_GRAPHS, MOCK_INITIAL_ANALYTICS } from '../mock-data.ts';
import { PromptTemplate, User, Workspace, Tool, ToolFormData, KnowledgeSource, KnowledgeSourceFormData, AnalyticsChartData, ABTest, AgentGraph, UserRole, AnalyticEvent } from '../types.ts';
import { ingestExecutionEvent } from './qualityService.ts';

// Simulate network latency
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

// --- In-memory DBs ---
let analyticsDB: AnalyticEvent[] = [...MOCK_INITIAL_ANALYTICS];


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
    
    // Simulate an initial run to populate analytics
    runDeployedTemplate(template.id, {});

    return template;
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

export const getKnowledgeSourceContent = async (sourceId: string): Promise<string> => {
    await delay(150);
    const source = MOCK_KNOWLEDGE_SOURCES.find(ks => ks.id === sourceId);
    return `Content from ${source?.name}: This is the internal knowledge provided for grounding.`;
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
    const template = await getTemplateById(templateId);
    return template?.abTests || [];
};

export const createABTest = async (templateId: string, testData: Partial<ABTest>): Promise<ABTest> => {
    await delay(500);
    const template = await getTemplateById(templateId);
    if (!template) throw new Error("Template not found");
    
    const newTest: ABTest = {
        id: `${templateId}-test-${Date.now()}`,
        name: testData.name!,
        versionA: testData.versionA!,
        versionB: testData.versionB!,
        trafficSplit: testData.trafficSplit!,
        status: 'running',
    };
    template.abTests.push(newTest);
    return newTest;
};

export const declareABTestWinner = async (testId: string, winner: 'A' | 'B'): Promise<void> => {
    await delay(600);
    const templateId = testId.split('-test-')[0];
    const template = await getTemplateById(templateId);
    if (!template) throw new Error("Template not found for this test");
    
    const test = template.abTests.find(t => t.id === testId);
    if (!test) throw new Error("A/B Test not found");
    
    test.status = 'completed';
    
    const winnerVariant = winner === 'A' ? 'versionA' : 'versionB';
    const winningVersion = winner === 'A' ? test.versionA : test.versionB;

    // Ensure results object exists and set the winner
    if (!test.results) {
        const zeroMetrics = { totalRuns: 0, successfulRuns: 0, avgUserRating: 0, taskSuccessRate: 0, efficiencyScore: 0, totalUserRating: 0 };
        test.results = { 
            versionA: zeroMetrics, 
            versionB: zeroMetrics,
            confidence: 0, 
            winner: winnerVariant
        };
    } else {
        test.results.winner = winnerVariant;
    }

    // Promote the winner to be the new active version
    template.activeVersion = winningVersion;
};


// --- Analytics, Billing & Production Simulation ---
export const runDeployedTemplate = async (templateId: string, variables: Record<string, any>): Promise<any> => {
    await delay(200 + Math.random() * 300); // Simulate network + execution latency
    const template = await getTemplateById(templateId);
    if (!template || !template.deployedVersion) throw new Error("Deployed template not found");

    let versionToRun = template.deployedVersion;
    let abTestVariant: 'A' | 'B' | undefined = undefined;

    // Check for active A/B test
    const activeTest = template.abTests.find(t => t.status === 'running');
    if (activeTest) {
        if (Math.random() * 100 < activeTest.trafficSplit) {
            versionToRun = activeTest.versionA;
            abTestVariant = 'A';
        } else {
            versionToRun = activeTest.versionB;
            abTestVariant = 'B';
        }
    }

    // Log the analytic event
    const event: AnalyticEvent = {
        templateId,
        workspaceId: template.workspaceId,
        version: versionToRun,
        timestamp: new Date().toISOString(),
        latency: 250 + Math.random() * 200,
        success: Math.random() < 0.95, // 95% success rate
        userRating: Math.floor(Math.random() * 3) + 3, // Rating between 3-5
        abTestVariant,
    };
    analyticsDB.push(event);

    return { success: true, message: `Simulated run of v${versionToRun}`, data: { ...variables }};
}

export const getAnalytics = async (workspaceId: string, days: number): Promise<{
    totalDeployed: number;
    totalCalls: number;
    avgLatency: number;
    successRate: number;
    chartData: AnalyticsChartData[];
    runsByTemplate: Record<string, number>;
}> => {
    await delay(800);
    const templates = MOCK_TEMPLATES.filter(t => t.workspaceId === workspaceId && t.deployedVersion);
    
    const timeLimit = new Date();
    timeLimit.setDate(timeLimit.getDate() - days);
    
    const relevantEvents = analyticsDB.filter(e => e.workspaceId === workspaceId && new Date(e.timestamp) > timeLimit);

    const totalCalls = relevantEvents.length;
    const avgLatency = totalCalls > 0 ? relevantEvents.reduce((sum, e) => sum + e.latency, 0) / totalCalls : 0;
    const successRate = totalCalls > 0 ? relevantEvents.filter(e => e.success).length / totalCalls : 0;

    const runsByTemplate: Record<string, number> = {};
    relevantEvents.forEach(e => {
        runsByTemplate[e.templateId] = (runsByTemplate[e.templateId] || 0) + 1;
    });

    // Chart Data Aggregation
    const chartData: AnalyticsChartData[] = [];
    if (days === 1) { // Group by hour
        const callsByHour: Record<string, number> = {};
        for (let i = 0; i < 24; i++) {
            const hour = new Date();
            hour.setHours(hour.getHours() - i);
            const key = hour.toLocaleTimeString('en-US', { hour: '2-digit' });
            callsByHour[key] = 0;
        }
        relevantEvents.forEach(e => {
            const key = new Date(e.timestamp).toLocaleTimeString('en-US', { hour: '2-digit' });
            if (key in callsByHour) {
                callsByHour[key]++;
            }
        });
        chartData.push(...Object.entries(callsByHour).map(([time, calls]) => ({ time, calls })).reverse());
    } else { // Group by day
        const callsByDay: Record<string, number> = {};
        for (let i = 0; i < days; i++) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const key = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            callsByDay[key] = 0;
        }
        relevantEvents.forEach(e => {
            const key = new Date(e.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            if (key in callsByDay) {
                callsByDay[key]++;
            }
        });
        chartData.push(...Object.entries(callsByDay).map(([time, calls]) => ({ time, calls })).reverse());
    }
    
    return {
        totalDeployed: templates.length,
        totalCalls,
        avgLatency,
        successRate,
        chartData,
        runsByTemplate,
    }
};

export const getABTestAnalytics = async (testId: string): Promise<{
    versionA: { runs: number; successRate: number; avgRating: number };
    versionB: { runs: number; successRate: number; avgRating: number };
}> => {
    await delay(400);
    const templateId = testId.split('-test-')[0];
    const template = MOCK_TEMPLATES.find(t => t.id === templateId);
    if (!template) return { versionA: { runs: 0, successRate: 0, avgRating: 0 }, versionB: { runs: 0, successRate: 0, avgRating: 0 }};
    
    const test = template.abTests.find(t => t.id === testId);
    if (!test) return { versionA: { runs: 0, successRate: 0, avgRating: 0 }, versionB: { runs: 0, successRate: 0, avgRating: 0 }};

    const events = analyticsDB.filter(e => e.templateId === templateId);
    
    const variantAEvents = events.filter(e => e.abTestVariant === 'A' && e.version === test.versionA);
    const variantBEvents = events.filter(e => e.abTestVariant === 'B' && e.version === test.versionB);

    const calculateMetrics = (arr: AnalyticEvent[]) => {
        if (arr.length === 0) return { runs: 0, successRate: 0, avgRating: 0 };
        const ratedEvents = arr.filter(e => e.userRating !== undefined);
        return {
            runs: arr.length,
            successRate: arr.filter(e => e.success).length / arr.length,
            avgRating: ratedEvents.length > 0 ? ratedEvents.reduce((sum, e) => sum + (e.userRating!), 0) / ratedEvents.length : 0,
        }
    };

    return {
        versionA: calculateMetrics(variantAEvents),
        versionB: calculateMetrics(variantBEvents),
    }
}


export const getBillingUsage = async (workspaceId: string): Promise<{ apiCalls: number }> => {
    await delay(400);
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const monthlyEvents = analyticsDB.filter(e => e.workspaceId === workspaceId && new Date(e.timestamp) >= startOfMonth);
    return {
        apiCalls: monthlyEvents.length
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

// --- SECURE TOOL PROXY ---
export const executeTool = async (toolId: string, input: any): Promise<any> => {
    await delay(600 + Math.random() * 400);
    const tool = MOCK_TOOLS.find(t => t.id === toolId);
    if (!tool) throw new Error("Tool not found");

    console.log(`[SECURE PROXY] Executing tool: ${tool.name}`);
    if (tool.authMethod !== 'None') {
        console.log(`[SECURE PROXY] Securely injecting credentials for ${tool.authMethod}`);
    }

    // In a real backend, you'd use fetch() here to call tool.apiEndpoint
    // We will simulate it based on the mock tool
    if (tool.apiEndpoint.includes('dummyjson.com/products/add')) {
        return { id: Math.floor(Math.random() * 100) + 1, ...input };
    }
    
    return { success: true, message: `Mock response from ${tool.name}`, received_input: input };
};