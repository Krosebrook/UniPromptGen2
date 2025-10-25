import React, { useState, useEffect } from 'react';
import {
  CodeBracketSquareIcon, StarIcon, UserGroupIcon, ChartBarIcon
} from '../components/icons/Icons.tsx';
import { getTemplates, getEvaluationsByTemplateId } from '../services/apiService.ts'; // Fictional function
import { PromptTemplate, Evaluation } from '../types.ts';
import {
  ResponsiveContainer,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Line,
} from 'recharts';

const StatCard = ({ title, value, icon: Icon }: {title: string, value: string, icon: React.ElementType}) => (
  <div className="bg-card shadow-card rounded-lg p-5">
    <div className="flex items-center">
      <div className="p-3 rounded-md bg-primary/20 text-primary">
        <Icon className="h-6 w-6" />
      </div>
      <div className="ml-4">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <p className="text-2xl font-bold text-foreground">{value}</p>
      </div>
    </div>
  </div>
);

const chartData = [
  { name: 'Jan', templates: 12, evaluations: 20 },
  { name: 'Feb', templates: 19, evaluations: 30 },
  { name: 'Mar', templates: 25, evaluations: 45 },
  { name: 'Apr', templates: 31, evaluations: 50 },
  { name: 'May', templates: 42, evaluations: 70 },
];


const Dashboard: React.FC = () => {
  const [recentTemplates, setRecentTemplates] = useState<PromptTemplate[]>([]);
  const [recentEvaluations, setRecentEvaluations] = useState<Evaluation[]>([]);

  useEffect(() => {
    const fetchData = async () => {
        const templates = await getTemplates();
        setRecentTemplates(templates.slice(0, 3));
        
        // In a real app, you'd have a dedicated endpoint for recent evaluations
        const evals1 = await getEvaluationsByTemplateId('template-001');
        const evals2 = await getEvaluationsByTemplateId('template-002');
        const evals3 = await getEvaluationsByTemplateId('template-003');
        setRecentEvaluations([...evals1, ...evals2, ...evals3].slice(0, 3));
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Templates" value="1,258" icon={CodeBracketSquareIcon} />
        <StatCard title="Total Evaluations" value="4,321" icon={StarIcon} />
        <StatCard title="Active Users" value="892" icon={UserGroupIcon} />
        <StatCard title="Avg. Quality Score" value="88.7" icon={ChartBarIcon} />
      </div>

      <div className="bg-card shadow-card rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
         <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(215 28% 17%)" />
              <XAxis dataKey="name" stroke="hsl(215 15% 65%)" />
              <YAxis stroke="hsl(215 15% 65%)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(220 13% 14%)',
                  borderColor: 'hsl(215 28% 17%)',
                }}
              />
              <Legend />
              <Line type="monotone" dataKey="templates" stroke="hsl(217 91% 60%)" strokeWidth={2} name="Templates Submitted" />
              <Line type="monotone" dataKey="evaluations" stroke="hsl(142 71% 45%)" strokeWidth={2} name="Evaluations Done" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         <div className="bg-card shadow-card rounded-lg p-6">
           <h2 className="text-xl font-semibold mb-4">Recent Templates</h2>
           <ul className="space-y-3">
             {recentTemplates.map(t => {
               const activeVersion = t.versions.find(v => v.version === t.activeVersion);
               return (
                 <li key={t.id} className="flex justify-between items-center text-sm">
                   <a href={`#/templates/${t.id}`} className="font-medium text-foreground hover:text-primary">{activeVersion?.name || 'Untitled Template'}</a>
                   <span className="text-muted-foreground">{t.domain}</span>
                 </li>
               );
             })}
           </ul>
         </div>
         <div className="bg-card shadow-card rounded-lg p-6">
           <h2 className="text-xl font-semibold mb-4">Recent Evaluations</h2>
            <ul className="space-y-3">
             {recentEvaluations.map(e => (
               <li key={e.id} className="flex justify-between items-center text-sm">
                 <div className="flex items-center">
                    <img src={e.evaluator.avatarUrl} className="h-6 w-6 rounded-full mr-2" />
                    <span className="font-medium text-foreground">{e.evaluator.name}</span>
                 </div>
                 <span className="text-muted-foreground">{new Date(e.date).toLocaleDateString()}</span>
               </li>
             ))}
           </ul>
         </div>
      </div>
    </div>
  );
};

export default Dashboard;