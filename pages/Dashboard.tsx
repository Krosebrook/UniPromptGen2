import React, { useState, useEffect, useCallback } from 'react';
import {
  RocketLaunchIcon, ClockIcon, CheckCircleIcon, CodeBracketSquareIcon, SpinnerIcon, TrashIcon, PlusIcon
} from '../components/icons/Icons.tsx';
import { getAnalytics, getDeployedTemplates, getTasks, addTask, updateTask, deleteTask } from '../services/apiService.ts';
import { PromptTemplate, AnalyticsChartData, Task, TaskPriority } from '../types.ts';
import { useWorkspace } from '../contexts/WorkspaceContext.tsx';
import {
  ResponsiveContainer,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Area,
} from 'recharts';
import { MOCK_LOGGED_IN_USER } from '../constants.ts';

interface DashboardStats {
  totalDeployed: number;
  apiCalls: number;
  avgLatency: number;
  successRate: number;
}

const StatCard = ({ title, value, icon: Icon, unit = '' }: {title: string, value: string | number, icon: React.ElementType, unit?: string}) => (
  <div className="bg-card shadow-card rounded-lg p-5">
    <div className="flex items-center">
      <div className="p-3 rounded-md bg-primary/20 text-primary">
        <Icon className="h-6 w-6" />
      </div>
      <div className="ml-4">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <p className="text-2xl font-bold text-foreground">{value}<span className="text-lg ml-1 text-muted-foreground">{unit}</span></p>
      </div>
    </div>
  </div>
);

const timeRanges = [
    { label: '24 Hours', days: 1 },
    { label: '7 Days', days: 7 },
    { label: '30 Days', days: 30 },
];

// --- Task List Feature ---

const priorityConfig: Record<TaskPriority, { color: string, border: string, label: string }> = {
    High: { color: 'text-destructive', border: 'border-destructive', label: 'High' },
    Medium: { color: 'text-warning', border: 'border-warning', label: 'Medium' },
    Low: { color: 'text-info', border: 'border-info', label: 'Low' },
};

const priorityOrder: Record<TaskPriority, number> = {
    High: 0,
    Medium: 1,
    Low: 2,
};

interface TaskItemProps {
    task: Task;
    onToggle: (taskId: string, completed: boolean) => void;
    onDelete: (taskId: string) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onToggle, onDelete }) => {
    const config = priorityConfig[task.priority];

    return (
        <div className={`flex items-center p-3 bg-secondary/50 rounded-md border-l-4 ${config.border} transition-all hover:bg-secondary`}>
            <input
                type="checkbox"
                checked={task.completed}
                onChange={(e) => onToggle(task.id, e.target.checked)}
                className="h-5 w-5 rounded border-border text-primary focus:ring-primary bg-input flex-shrink-0"
            />
            <span className={`flex-1 mx-3 text-sm ${task.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                {task.text}
            </span>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${config.color} bg-background`}>
                {config.label}
            </span>
            <button onClick={() => onDelete(task.id)} className="ml-2 text-muted-foreground hover:text-destructive p-1 rounded-full">
                <TrashIcon className="h-4 w-4" />
            </button>
        </div>
    );
};


const TaskList: React.FC = () => {
    const { currentWorkspace } = useWorkspace();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [newTaskText, setNewTaskText] = useState('');
    const [newTaskPriority, setNewTaskPriority] = useState<TaskPriority>('Medium');

    const fetchTasks = useCallback(async () => {
        if (!currentWorkspace) return;
        setIsLoading(true);
        try {
            const fetchedTasks = await getTasks(currentWorkspace.id);
            const sortedTasks = fetchedTasks.sort((a, b) => {
                if (a.completed !== b.completed) {
                    return a.completed ? 1 : -1;
                }
                return priorityOrder[a.priority] - priorityOrder[b.priority];
            });
            setTasks(sortedTasks);
        } catch (error) {
            console.error("Failed to fetch tasks:", error);
        } finally {
            setIsLoading(false);
        }
    }, [currentWorkspace]);

    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    const handleAddTask = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTaskText.trim() || !currentWorkspace) return;
        
        const newTaskData = {
            text: newTaskText.trim(),
            priority: newTaskPriority,
            completed: false,
            workspaceId: currentWorkspace.id,
        };
        
        await addTask(newTaskData);
        setNewTaskText('');
        setNewTaskPriority('Medium');
        fetchTasks(); // Refresh list
    };
    
    const handleToggleTask = async (taskId: string, completed: boolean) => {
        await updateTask(taskId, { completed });
        fetchTasks();
    };
    
    const handleDeleteTask = async (taskId: string) => {
        await deleteTask(taskId);
        fetchTasks();
    };

    return (
        <div className="bg-card shadow-card rounded-lg p-6 flex flex-col">
            <h2 className="text-xl font-semibold mb-4">My Tasks</h2>
            <div className="flex-1 overflow-y-auto pr-2 space-y-2 min-h-[200px] max-h-[300px]">
                {isLoading ? (
                    <div className="flex justify-center items-center h-full">
                        <SpinnerIcon className="h-6 w-6 text-primary" />
                    </div>
                ) : tasks.length > 0 ? (
                     tasks.map(task => (
                        <TaskItem key={task.id} task={task} onToggle={handleToggleTask} onDelete={handleDeleteTask} />
                    ))
                ) : (
                    <p className="text-center text-muted-foreground pt-10">No tasks for this workspace.</p>
                )}
            </div>
            <form onSubmit={handleAddTask} className="mt-4 flex gap-2 border-t border-border pt-4">
                <input
                    type="text"
                    value={newTaskText}
                    onChange={(e) => setNewTaskText(e.target.value)}
                    placeholder="Add a new task..."
                    className="flex-1 px-3 py-2 text-sm bg-input rounded-md focus:ring-2 focus:ring-ring focus:outline-none"
                />
                <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value as TaskPriority)}
                    className="px-3 py-2 text-sm bg-input rounded-md focus:ring-2 focus:ring-ring focus:outline-none"
                >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                </select>
                <button type="submit" className="p-2 bg-primary text-primary-foreground rounded-md disabled:opacity-50" disabled={!newTaskText.trim()}>
                    <PlusIcon className="h-5 w-5" />
                </button>
            </form>
        </div>
    );
}

// --- End of Task List Feature ---

const Dashboard: React.FC = () => {
  const { currentWorkspace } = useWorkspace();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [chartData, setChartData] = useState<AnalyticsChartData[]>([]);
  const [topTemplates, setTopTemplates] = useState<PromptTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<number>(1);

  useEffect(() => {
    const fetchData = async () => {
        if (!currentWorkspace) return;
        setIsLoading(true);
        try {
            const analytics = await getAnalytics(currentWorkspace.id, timeRange);
            const templates = await getDeployedTemplates(currentWorkspace.id, MOCK_LOGGED_IN_USER.id);
            
            setStats({
                totalDeployed: analytics.totalDeployed,
                apiCalls: analytics.totalCalls,
                avgLatency: analytics.avgLatency,
                successRate: analytics.successRate,
            });
            setChartData(analytics.chartData);
            
            const templatesWithCounts = templates.map(t => ({
                ...t,
                runCount: analytics.runsByTemplate[t.id] || 0
            })).sort((a, b) => b.runCount - a.runCount);
            
            setTopTemplates(templatesWithCounts.slice(0, 5));
        } catch (error) {
            console.error("Failed to load dashboard data:", error);
        } finally {
            setIsLoading(false);
        }
    };
    fetchData();
  }, [currentWorkspace, timeRange]);

  if (isLoading && !stats) {
    return (
        <div className="flex justify-center items-center h-64">
          <SpinnerIcon className="h-8 w-8 text-primary" />
          <span className="ml-2 text-muted-foreground">Loading Analytics...</span>
        </div>
      );
  }
  
  const apiCallsTitle = `API Calls (${timeRange === 1 ? '24h' : `${timeRange}d`})`;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold text-foreground">Production Dashboard</h1>
        <div className="flex items-center bg-secondary p-1 rounded-md">
            {timeRanges.map(({ label, days }) => (
                <button
                    key={days}
                    onClick={() => setTimeRange(days)}
                    className={`px-3 py-1 text-sm font-semibold rounded ${timeRange === days ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-background/50'}`}
                >
                    {label}
                </button>
            ))}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Deployed" value={stats?.totalDeployed ?? 0} icon={RocketLaunchIcon} />
        <StatCard title={apiCallsTitle} value={stats?.apiCalls.toLocaleString() ?? 0} icon={CodeBracketSquareIcon} />
        <StatCard title="Avg. Latency" value={stats?.avgLatency.toFixed(0) ?? 0} icon={ClockIcon} unit="ms" />
        <StatCard title="Success Rate" value={(stats?.successRate * 100).toFixed(1) ?? '0.0'} icon={CheckCircleIcon} unit="%" />
      </div>

      <div className={`bg-card shadow-card rounded-lg p-6 transition-opacity duration-300 ${isLoading ? 'opacity-50' : 'opacity-100'}`}>
        <h2 className="text-xl font-semibold mb-4">API Calls ({timeRanges.find(tr => tr.days === timeRange)?.label})</h2>
         <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorCalls" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(217 91% 60%)" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="hsl(217 91% 60%)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(215 28% 17%)" />
              <XAxis dataKey="time" stroke="hsl(215 15% 65%)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="hsl(215 15% 65%)" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(220 13% 14%)',
                  borderColor: 'hsl(215 28% 17%)',
                }}
              />
              <Area type="monotone" dataKey="calls" stroke="hsl(217 91% 60%)" strokeWidth={2} fillOpacity={1} fill="url(#colorCalls)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className={`bg-card shadow-card rounded-lg p-6 transition-opacity duration-300 ${isLoading ? 'opacity-50' : 'opacity-100'}`}>
               <h2 className="text-xl font-semibold mb-4">Top 5 Deployed Templates by Usage ({timeRanges.find(tr => tr.days === timeRange)?.label})</h2>
               {topTemplates.length > 0 ? (
                   <ul className="divide-y divide-border">
                     {topTemplates.map(t => {
                       const activeVersion = t.versions.find(v => v.version === t.activeVersion);
                       return (
                         <li key={t.id} className="flex justify-between items-center text-sm py-3">
                           <div>
                             <a href={`#/templates/${t.id}`} className="font-medium text-foreground hover:text-primary">{activeVersion?.name || 'Untitled Template'}</a>
                             <p className="text-xs text-muted-foreground">Deployed v{t.deployedVersion}</p>
                           </div>
                           <span className="font-semibold text-primary">{(t as any).runCount.toLocaleString()} runs</span>
                         </li>
                       );
                     })}
                   </ul>
               ) : (
                <p className="text-center text-muted-foreground py-8">No deployed templates with usage data in this period.</p>
               )}
           </div>
           
           <TaskList />
       </div>
    </div>
  );
};

export default Dashboard;