


import React, { useState, useEffect } from 'react';
import {
  RocketLaunchIcon, ClockIcon, CheckCircleIcon, CodeBracketSquareIcon, SpinnerIcon
// Fix: Corrected import paths to be relative.
} from '../components/icons/Icons.tsx';
import { getAnalytics, getDeployedTemplates } from '../services/apiService.ts';
import { PromptTemplate, AnalyticsChartData } from '../types.ts';
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
            // Fix: Expected 2 arguments, but got 1.
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
    </div>
  );
};

export default Dashboard;