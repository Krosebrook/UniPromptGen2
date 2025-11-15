// apiService.ts

import { MOCK_TEMPLATES, MOCK_TOOLS, MOCK_KNOWLEDGE_SOURCES, MOCK_AGENTS, MOCK_WORKSPACES, MOCK_FOLDERS, MOCK_TASKS, MOCK_AB_TESTS, deleteFolderInMock } from '../mock-data.ts';
import { PromptTemplate, Tool, KnowledgeSource, AgentGraph, Workspace, ABTest, ToolFormData, KnowledgeSourceFormData, Folder, LibraryType, LibraryItem, UserRole, Permission, User, Task, Comment } from '../types.ts';
import { MOCK_USERS, MOCK_LOGGED_IN_USER } from '../constants.ts';

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

// --- Permissions Helper ---
const hasPermission = (item: LibraryItem, userId: string, userRole: UserRole): boolean => {
    if (userRole === 'Admin' || item.ownerId === userId) {
        return true;
    }
    const specificPermission = item.permissions.find(p => p.userId === userId);
    if (specificPermission) {
        return true; // Any specific permission grants at least view access
    }
    // In a real app, you might check for team/org permissions
    return false;
};

const getRole = (userId: string, workspaceId: string): UserRole => {
    const user = MOCK_USERS.find(u => u.id === userId);
    if (!user) return 'Viewer';
    const workspaceRole = user.workspaces.find(w => w.workspaceId === workspaceId);
    return workspaceRole?.role || 'Viewer';
};


// --- Templates ---

export const getTemplates = async (workspaceId: string, folderId: string | null, userId: string): Promise<PromptTemplate[]> => {
    await delay(300);
    const userRole = getRole(userId, workspaceId);
    return MOCK_TEMPLATES.filter(t => t.folderId === folderId && hasPermission(t, userId, userRole));
};

export const getTemplateById = async (id: string): Promise<PromptTemplate | undefined> => {
    await delay(200);
    return MOCK_TEMPLATES.find(t => t.id === id);
};

export const saveTemplate = async (templateData: Partial<PromptTemplate>): Promise<PromptTemplate> => {
    await delay(500);
    if (templateData.id && templateData.id !== 'new') {
        // Update
        const index = MOCK_TEMPLATES.findIndex(t => t.id === templateData.id);
        if (index > -1) {
            MOCK_TEMPLATES[index] = { ...MOCK_TEMPLATES[index], ...templateData } as PromptTemplate;
            return MOCK_TEMPLATES[index];
        }
    }
    // Create
    const newTemplate: PromptTemplate = {
        id: `template-${Date.now()}`,
        folderId: null,
        domain: 'General',
        qualityScore: 0,
        versions: [],
        activeVersion: '1.0',
        deployedVersion: null,
        metrics: { totalRuns: 0, successfulRuns: 0, avgUserRating: 0, totalUserRating: 0, taskSuccessRate: 0, efficiencyScore: 0 },
        createdBy: MOCK_LOGGED_IN_USER.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ownerId: MOCK_LOGGED_IN_USER.id,
        permissions: [],
        comments: [],
        ...templateData,
        name: templateData.name || 'Untitled Template',
    };
    MOCK_TEMPLATES.push(newTemplate);
    return newTemplate;
};

export const getDeployedTemplates = async (workspaceId: string, userId: string): Promise<PromptTemplate[]> => {
    await delay(400);
    const userRole = getRole(userId, workspaceId);
    return MOCK_TEMPLATES.filter(t => t.deployedVersion && hasPermission(t, userId, userRole));
};

// --- Comments ---
export const addComment = async (templateId: string, commentData: Omit<Comment, 'id' | 'timestamp' | 'resolved'>): Promise<Comment> => {
    await delay(200);
    const template = MOCK_TEMPLATES.find(t => t.id === templateId);
    if (!template) throw new Error("Template not found");

    const newComment: Comment = {
        id: `comment-${Date.now()}`,
        timestamp: new Date().toISOString(),
        resolved: false,
        ...commentData,
    };
    template.comments.push(newComment);
    return newComment;
};

export const updateComment = async (templateId: string, commentId: string, updates: Partial<Comment>): Promise<Comment> => {
    await delay(100);
    const template = MOCK_TEMPLATES.find(t => t.id === templateId);
    if (!template) throw new Error("Template not found");

    const commentIndex = template.comments.findIndex(c => c.id === commentId);
    if (commentIndex === -1) throw new Error("Comment not found");

    template.comments[commentIndex] = { ...template.comments[commentIndex], ...updates };
    return template.comments[commentIndex];
};


// --- Folders ---

export const createFolder = async (name: string, type: LibraryType, workspaceId: string, parentFolderId: string | null): Promise<Folder> => {
    await delay(200);
    const newFolder: Folder = {
        id: `folder-${type}-${Date.now()}`,
        name,
        type,
        itemCount: 0,
        createdAt: new Date().toISOString(),
        ownerId: MOCK_LOGGED_IN_USER.id,
        permissions: [],
        folderId: parentFolderId,
    };
    MOCK_FOLDERS.push(newFolder);
    return newFolder;
};

export const getFolders = async (workspaceId: string, type: LibraryType, folderId: string | null, userId: string): Promise<Folder[]> => {
    await delay(200);
    const userRole = getRole(userId, workspaceId);
    return MOCK_FOLDERS.filter(f => f.type === type && f.folderId === folderId && hasPermission(f, userId, userRole));
};

export const moveItemToFolder = async (itemId: string, folderId: string | null, itemType: LibraryType | 'folder'): Promise<void> => {
    await delay(300);
    let itemArray: any[];
    switch (itemType) {
        case 'template': itemArray = MOCK_TEMPLATES; break;
        case 'tool': itemArray = MOCK_TOOLS; break;
        case 'knowledge': itemArray = MOCK_KNOWLEDGE_SOURCES; break;
        case 'folder': itemArray = MOCK_FOLDERS; break;
        default: return;
    }
    const item = itemArray.find(i => i.id === itemId);
    if (item) {
        item.folderId = folderId;
    }
};

export const updateFolder = async (folderId: string, data: Partial<Folder>): Promise<Folder> => {
    await delay(200);
    const index = MOCK_FOLDERS.findIndex(f => f.id === folderId);
    if (index > -1) {
        MOCK_FOLDERS[index] = { ...MOCK_FOLDERS[index], ...data };
        return MOCK_FOLDERS[index];
    }
    throw new Error("Folder not found");
};

export const deleteFolder = async (folderId: string): Promise<void> => {
    await delay(300);
    deleteFolderInMock(folderId);
};

// --- Tools ---

export const getTools = async (workspaceId: string, folderId: string | null, userId: string): Promise<Tool[]> => {
    await delay(300);
    const userRole = getRole(userId, workspaceId);
    return MOCK_TOOLS.filter(t => t.folderId === folderId && hasPermission(t, userId, userRole));
};

export const createTool = async (toolData: ToolFormData, workspaceId: string, folderId: string | null): Promise<Tool> => {
    await delay(300);
    const newTool: Tool = {
        id: `tool-${Date.now()}`,
        folderId,
        createdBy: MOCK_LOGGED_IN_USER.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ownerId: MOCK_LOGGED_IN_USER.id,
        permissions: [],
        ...toolData,
    };
    MOCK_TOOLS.push(newTool);
    return newTool;
};

export const executeTool = async (toolId: string, data: any): Promise<any> => {
    await delay(700);
    const tool = MOCK_TOOLS.find(t => t.id === toolId);
    if (!tool) throw new Error("Tool not found");
    return { success: true, message: `Mock response from ${tool.name}`, received_data: data };
};


// --- Knowledge Sources ---

export const getKnowledgeSources = async (workspaceId: string, folderId: string | null, userId: string): Promise<KnowledgeSource[]> => {
    await delay(300);
    const userRole = getRole(userId, workspaceId);
    return MOCK_KNOWLEDGE_SOURCES.filter(ks => ks.folderId === folderId && hasPermission(ks, userId, userRole));
};

export const getKnowledgeSourceContent = async (sourceId: string): Promise<string> => {
    await delay(400);
    const source = MOCK_KNOWLEDGE_SOURCES.find(s => s.id === sourceId);
    if (!source) return '';
    return `This is mock content from the knowledge source: "${source.name}". It contains important details about ${source.description}.`;
};

export const createKnowledgeSource = async (sourceData: KnowledgeSourceFormData, workspaceId: string, folderId: string | null): Promise<KnowledgeSource> => {
    await delay(300);
    const newSource: KnowledgeSource = {
        id: `ks-${Date.now()}`,
        folderId,
        status: 'Pending',
        createdBy: MOCK_LOGGED_IN_USER.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ownerId: MOCK_LOGGED_IN_USER.id,
        permissions: [],
        ...sourceData,
    };
    MOCK_KNOWLEDGE_SOURCES.push(newSource);
    // Simulate indexing process
    setTimeout(() => {
        const idx = MOCK_KNOWLEDGE_SOURCES.findIndex(s => s.id === newSource.id);
        if (idx > -1) MOCK_KNOWLEDGE_SOURCES[idx].status = 'Indexing';
    }, 1500);
    setTimeout(() => {
        const idx = MOCK_KNOWLEDGE_SOURCES.findIndex(s => s.id === newSource.id);
        if (idx > -1) MOCK_KNOWLEDGE_SOURCES[idx].status = 'Ready';
    }, 5000);
    return newSource;
};

// --- Agents ---

export const getAgentGraphs = async (workspaceId: string): Promise<AgentGraph[]> => {
    await delay(300);
    return MOCK_AGENTS;
};

export const saveAgentGraph = async (agentData: Partial<AgentGraph>, workspaceId: string): Promise<AgentGraph> => {
    await delay(500);
    if (agentData.id) {
        // Update
        const index = MOCK_AGENTS.findIndex(a => a.id === agentData.id);
        if (index > -1) {
            MOCK_AGENTS[index] = { ...MOCK_AGENTS[index], ...agentData } as AgentGraph;
            return MOCK_AGENTS[index];
        }
    }
    // Create
    const newAgent: AgentGraph = {
        id: `agent-${Date.now()}`,
        nodes: [],
        edges: [],
        ...agentData,
        name: agentData.name || 'Untitled Agent',
        description: agentData.description || '',
    };
    MOCK_AGENTS.push(newAgent);
    return newAgent;
};

// --- Analytics & Billing ---

export const getAnalytics = async (workspaceId: string, days: number): Promise<any> => {
    await delay(800);
    const totalCalls = Math.floor(Math.random() * 50000 * (days / 7));
    const chartData = Array.from({ length: days * 24 }, (_, i) => ({
        time: `H${i}`,
        calls: Math.floor(Math.random() * (totalCalls / (days * 24)) * 2)
    }));
    const runsByTemplate: Record<string, number> = {};
    MOCK_TEMPLATES.forEach(t => {
        if (t.deployedVersion) {
            runsByTemplate[t.id] = Math.floor(Math.random() * totalCalls * 0.3);
        }
    });

    return {
        totalDeployed: MOCK_TEMPLATES.filter(t => t.deployedVersion).length,
        totalCalls,
        avgLatency: 350 + Math.random() * 100,
        successRate: 0.95 + Math.random() * 0.04,
        chartData,
        runsByTemplate,
    };
};

export const getABTestsForTemplate = async (templateId: string): Promise<ABTest[]> => {
    await delay(300);
    return MOCK_AB_TESTS.filter(t => t.templateId === templateId);
};

export const createABTest = async (testData: Partial<ABTest>): Promise<ABTest> => {
    await delay(400);
    const newTest: ABTest = {
        id: `ab-test-${Date.now()}`,
        status: 'running',
        ...testData,
    } as ABTest;
    MOCK_AB_TESTS.push(newTest);
    return newTest;
};

export const declareWinner = async (testId: string, winner: 'versionA' | 'versionB'): Promise<ABTest> => {
    await delay(300);
    const testIndex = MOCK_AB_TESTS.findIndex(t => t.id === testId);
    if (testIndex > -1) {
        MOCK_AB_TESTS[testIndex].status = 'completed';
        MOCK_AB_TESTS[testIndex].results = {
            winner,
            reason: 'Manually declared by user.'
        };
        return MOCK_AB_TESTS[testIndex];
    }
    throw new Error('Test not found');
};

export const getABTestAnalytics = async (testId: string): Promise<any> => {
    await delay(500);

    const summary = {
        versionA: {
            runs: Math.floor(Math.random() * 500) + 200,
            successRate: 0.92 + Math.random() * 0.05,
            avgRating: 4.3 + Math.random() * 0.4
        },
        versionB: {
            runs: Math.floor(Math.random() * 500) + 200,
            successRate: 0.91 + Math.random() * 0.05,
            avgRating: 4.4 + Math.random() * 0.4
        }
    };

    const timeSeries = Array.from({ length: 7 }, (_, i) => ({
        time: `Day ${i + 1}`,
        versionA_runs: Math.floor(Math.random() * 100),
        versionB_runs: Math.floor(Math.random() * 100),
        versionA_successRate: 0.90 + Math.random() * 0.08,
        versionB_successRate: 0.90 + Math.random() * 0.08,
        versionA_avgRating: 4.2 + Math.random() * 0.6,
        versionB_avgRating: 4.2 + Math.random() * 0.6,
    }));

    return { summary, timeSeries };
};

export const getBillingUsage = async (workspaceId: string): Promise<{ apiCalls: number }> => {
    await delay(300);
    return { apiCalls: 34567 };
};

// --- Workspaces & Users ---
export const getWorkspacesByIds = async (workspaceIds: string[]): Promise<Workspace[]> => {
    await delay(100);
    return MOCK_WORKSPACES.filter(w => workspaceIds.includes(w.id));
};

export const getUsersForWorkspace = async (workspaceId: string): Promise<User[]> => {
    await delay(200);
    return MOCK_USERS.filter(u => u.workspaces.some(w => w.workspaceId === workspaceId));
};

export const updatePermissions = async (itemId: string, itemType: LibraryType | 'folder', permissions: Permission[]): Promise<void> => {
    await delay(300);
    let itemArray: any[];
    switch (itemType) {
        case 'template': itemArray = MOCK_TEMPLATES; break;
        case 'tool': itemArray = MOCK_TOOLS; break;
        case 'knowledge': itemArray = MOCK_KNOWLEDGE_SOURCES; break;
        case 'folder': itemArray = MOCK_FOLDERS; break;
        default: return;
    }
    const item = itemArray.find(i => i.id === itemId);
    if (item) {
        item.permissions = permissions;
    }
};

// --- Tasks ---
export const getTasks = async (workspaceId: string): Promise<Task[]> => {
    await delay(400);
    return MOCK_TASKS.filter(t => t.workspaceId === workspaceId);
};

export const addTask = async (taskData: Omit<Task, 'id'>): Promise<Task> => {
    await delay(200);
    const newTask: Task = {
        id: `task-${Date.now()}`,
        ...taskData,
    };
    MOCK_TASKS.unshift(newTask);
    return newTask;
};

export const updateTask = async (taskId: string, updates: Partial<Omit<Task, 'id'>>): Promise<Task> => {
    await delay(100);
    const index = MOCK_TASKS.findIndex(t => t.id === taskId);
    if (index > -1) {
        MOCK_TASKS[index] = { ...MOCK_TASKS[index], ...updates };
        return MOCK_TASKS[index];
    }
    throw new Error("Task not found");
};

export const deleteTask = async (taskId: string): Promise<void> => {
    await delay(100);
    const index = MOCK_TASKS.findIndex(t => t.id === taskId);
    if (index > -1) {
        MOCK_TASKS.splice(index, 1);
        return;
    }
    throw new Error("Task not found");
};