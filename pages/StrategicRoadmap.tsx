import React, { useMemo } from 'react';
import { ScaleIcon, GlobeAltIcon, WrenchScrewdriverIcon, RocketLaunchIcon } from '../components/icons/Icons.tsx';

const rawRoadmapText = `
MAIN PHASE 6: Admin Platform Finalization & Automated Governance
Objective: Finalize the administrative interface for comprehensive platform management and deploy automated services for governance, security auditing, and quality assurance to ensure platform integrity and reliability.
Subphase 6.1: Build Admin Tool Management Portal (T-012)
Sub-subphase 6.1.1: UI: Implement the '/admin/tools' route and corresponding page component (M-21) within the main Admin App (M-08), ensuring it correctly utilizes the shared AdminLayout for consistency.
Sub-subphase 6.1.2: API Integration: Connect the UI to the \`tool_router.py\` (M-07) to enable full CRUD (Create, Read, Update, Delete) operations on tools, including publishing and deprecation workflows.
Subphase 6.2: Implement Automated Governance & Security Workflows (T-013)
Sub-subphase 6.2.1: CI/CD Integration: Integrate the \`security_guardrail.py\` (M-17) and \`quality_evaluator.py\` (M-18) into the CI/CD pipeline (\`prompt_ci_cd.yml\`, M-59) to automatically audit all new tool and Gem submissions.
Sub-subphase 6.2.2: Alerting System: Develop an alerting mechanism within \`security_guardrail.py\` (M-17) to notify platform administrators via email or Slack of high-risk prompt patterns or security violations in real-time.
Subphase 6.3: Finalize BI & Monetization Dashboard (T-014)
Sub-subphase 6.3.1: UI: Complete the '/admin/billing' page (M-21) to visualize financial data from \`stripe_service.py\` (M-16) and usage metrics from \`cost_and_usage_service.py\` (M-12).
Sub-subphase 6.3.2: Reporting Engine: Implement a feature to generate and export monthly financial and usage reports for business intelligence analysis.

MAIN PHASE 7: Platform Scaling & Performance Optimization
Objective: Refactor and optimize core services for scalability, performance, and cost-efficiency to handle enterprise-level workloads and prepare for public launch.
Subphase 7.1: Database & Caching Optimization (T-015)
Sub-subphase 7.1.1: Database Indexing: Analyze and apply database indexes to PostgreSQL tables managed by Supabase (Clarifier 3) to optimize query performance for high-traffic endpoints like \`/api/agent/run\` (M-11).
Sub-subphase 7.1.2: Implement Redis Cache: Integrate a Redis caching layer for frequently accessed, non-volatile data, such as published tool schemas from \`tool_router.py\` (M-07), to reduce database load.
Subphase 7.2: Asynchronous Agent Execution (T-016)
Sub-subphase 7.2.1: Celery Worker Implementation: Refactor the \`agent_executor.py\` (M-10) to run within a Celery distributed task queue. This will move long-running agent executions to background workers, improving API responsiveness.
Sub-subphase 7.2.2: WebSocket Status Updates: Implement a WebSocket service to provide real-time status updates from the Celery workers back to the PWA (M-08) and Admin UI (M-21), showing the live progress of agent runs.
Subphase 7.3: Load Testing & Autoscaling (T-017)
Sub-subphase 7.3.1: Load Testing Scripts: Develop Locust-based load testing scripts (\`locustfile.py\`) to simulate high-concurrency usage against all production APIs.
Sub-subphase 7.3.2: Configure Autoscaling: Configure autoscaling policies for the backend services (FastAPI application and Celery workers) on the cloud provider to automatically adjust resources based on load test results.

MAIN PHASE 8: Public Launch & Ecosystem Expansion
Objective: Execute the public launch of the platform, expand the developer ecosystem with a public SDK, and introduce advanced features for prompt engineering and agent management.
Subphase 8.1: Public Launch Readiness (T-018)
Sub-subphase 8.1.1: Finalize Public Documentation: Complete and publish the official public documentation website, including API references, tutorials, and quick-start guides (Clarifier 2).
Sub-subphase 8.1.2: Marketing & Community Engagement: Execute the go-to-market strategy, including a public announcement, product launch on platforms like Product Hunt, and initial community-building efforts.
Subphase 8.2: Release Public SDK & Tooling (T-019)
Sub-subphase 8.2.1: Python SDK Development: Develop and publish a Python SDK (\`prompt-platform-sdk\`) to PyPI, providing a simple, high-level interface for interacting with the platform's public APIs.
Sub-subphase 8.2.2: Prompt Template CLI: Create a command-line interface (CLI) tool that allows developers to sync, test, and deploy prompt templates from their local development environment, integrating with the CI/CD pipeline (M-59).
Subphase 8.3: Introduce Advanced Prompt Engineering Features (T-020)
Sub-subphase 8.3.1: A/B Testing UI: Implement a user-facing A/B testing feature in the PWA (M-08), allowing users to compare the performance of two different prompt versions against live traffic.
Sub-subphase 8.3.2: Prompt Optimization Service: Develop a new service, \`prompt_optimizer.py\`, that uses a meta-LLM to automatically suggest improvements to a user's prompt based on quality heuristics and performance data from \`quality_evaluator.py\` (M-18).
`;

const Phase: React.FC<{ icon: React.ElementType, title: string, objective: string, children: React.ReactNode }> = ({ icon: Icon, title, objective, children }) => (
    <div className="mb-12">
        <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/20 rounded-lg">
                <Icon className="h-7 w-7 text-primary" />
            </div>
            <div>
                <h2 className="text-2xl font-bold text-foreground">{title}</h2>
                <p className="text-muted-foreground">{objective}</p>
            </div>
        </div>
        <div className="mt-6 pl-4 border-l-2 border-border ml-7 space-y-6">
            {children}
        </div>
    </div>
);

const Subphase: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => (
    <div className="relative">
        <div className="absolute -left-[1.2rem] top-3 h-3 w-3 bg-border rounded-full"></div>
        <h3 className="text-lg font-semibold text-foreground/90">{title}</h3>
        <div className="mt-2 space-y-3 pl-4">
            {children}
        </div>
    </div>
);

const Task: React.FC<{ title: string, description: string }> = ({ title, description }) => (
     <div className="bg-card/50 p-3 rounded-md border border-border/50">
        <p className="font-medium text-sm text-foreground/80">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
    </div>
);


const StrategicRoadmap: React.FC = () => {
    const parsedRoadmap = useMemo(() => {
        return rawRoadmapText.trim().split('MAIN PHASE').filter(Boolean).map(phaseText => {
            const [titleLine, ...rest] = phaseText.trim().split('\n');
            const objectiveLine = rest.find(line => line.startsWith('Objective:')) || '';
            const subphasesText = rest.join('\n').split('Subphase').filter(Boolean);

            return {
                title: titleLine.trim(),
                objective: objectiveLine.replace('Objective:', '').trim(),
                subphases: subphasesText.map(subphaseText => {
                    const [subphaseTitleLine, ...tasksText] = subphaseText.trim().split('\n');
                    return {
                        title: subphaseTitleLine.trim(),
                        tasks: tasksText.join('\n').split('Sub-subphase').filter(Boolean).map(taskText => {
                            const [taskTitle, ...taskDescParts] = taskText.trim().split(':');
                            return {
                                title: taskTitle.trim(),
                                description: taskDescParts.join(':').trim()
                            }
                        })
                    }
                })
            };
        });
    }, []);

    const phaseIcons = [WrenchScrewdriverIcon, ScaleIcon, GlobeAltIcon];

    return (
        <div className="max-w-4xl mx-auto py-8">
            <div className="text-center mb-16">
                <RocketLaunchIcon className="h-12 w-12 mx-auto text-primary mb-4" />
                <h1 className="text-4xl font-extrabold text-foreground">Strategic Roadmap: Phases 6-8</h1>
                <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
                    This document outlines the strategic objectives for platform finalization, scaling, and public launch, building on the core services.
                </p>
            </div>
            
            {parsedRoadmap.map((phase, index) => (
                <Phase key={index} icon={phaseIcons[index % phaseIcons.length]} title={phase.title} objective={phase.objective}>
                    {phase.subphases.map((subphase, subIndex) => (
                        <Subphase key={subIndex} title={subphase.title}>
                            {subphase.tasks.map((task, taskIndex) => (
                                <Task key={taskIndex} title={task.title} description={task.description} />
                            ))}
                        </Subphase>
                    ))}
                </Phase>
            ))}
        </div>
    );
};

export default StrategicRoadmap;
