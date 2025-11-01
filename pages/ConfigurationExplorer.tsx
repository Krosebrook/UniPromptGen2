

import React from 'react';
import { ShoppingCartIcon, CogIcon, GlobeAltIcon, RocketLaunchIcon } from '../components/icons/Icons.tsx';

const ContentParser = ({ text }: { text: string }) => {
    // This regex is designed to be conservative and capture specific patterns from the source text.
    const regex = /(\(Modules? \d+(?:[-–]\d+)?\)|\(Clarifiers? \d+(?: & \d+)?(?:[-–]\d+)?\)|\".*?\"|[a-zA-Z0-9_./-]+\.(?:py|html|ts|json)|`.*?`|\/api\/[a-zA-Z0-9_./-]+)/g;
    const parts = text.split(regex);

    return (
        <>
            {parts.map((part, index) => {
                if (!part) return null;

                if (part.match(/^\(Modules?/)) {
                    return <span key={index} className="whitespace-nowrap inline-block bg-blue-900/50 text-blue-300 rounded px-1.5 py-0.5 text-xs font-mono mx-1">{part.trim()}</span>;
                }
                if (part.match(/^\(Clarifiers?/)) {
                    return <span key={index} className="whitespace-nowrap inline-block bg-purple-900/50 text-purple-300 rounded px-1.5 py-0.5 text-xs font-mono mx-1">{part.trim()}</span>;
                }
                if (part.startsWith('"') && part.endsWith('"')) {
                    return <strong key={index} className="text-foreground/90 font-medium">{part}</strong>;
                }
                if (part.startsWith('`') && part.endsWith('`')) {
                     return <code key={index} className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-primary/90">{part.slice(1, -1)}</code>;
                }
                if (part.match(/\.(py|html|ts|json)$/) || part.startsWith('/api/')) {
                    return <code key={index} className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-primary/90">{part}</code>;
                }
                return part;
            })}
        </>
    );
};


const Phase: React.FC<{ icon: React.ElementType, phase: number, title: string, goal: string, children: React.ReactNode }> = ({ icon: Icon, phase, title, goal, children }) => (
    <div className="relative pl-12 pb-12 last:pb-0 border-l-2 border-border">
        <div className="absolute -left-5 top-0 flex items-center justify-center w-10 h-10 bg-primary rounded-full ring-8 ring-background">
            <Icon className="h-5 w-5 text-primary-foreground" />
        </div>
        
        <div className="mb-8">
            <p className="text-sm font-semibold text-primary">PHASE {phase}</p>
            <h2 className="text-2xl font-bold text-foreground">{title}</h2>
            <p className="mt-2 text-muted-foreground">{goal}</p>
        </div>
        
        <div className="space-y-4">
            {children}
        </div>
    </div>
);

const Task: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-card p-4 rounded-lg border border-border shadow-sm">
        <h3 className="font-semibold text-card-foreground">{title}</h3>
        <div className="mt-1 text-sm text-muted-foreground">
            <ContentParser text={String(children)} />
        </div>
    </div>
);

const ConfigurationExplorer: React.FC = () => {
    return (
        <div className="max-w-4xl mx-auto py-8">
            <div className="text-center mb-16">
                <RocketLaunchIcon className="h-12 w-12 mx-auto text-primary mb-4" />
                <h1 className="text-4xl font-extrabold text-foreground">Project Roadmap: Phases 3-5</h1>
                <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
                    This document outlines the next three major phases of development, building upon the completed core API, execution, and governance services (Modules 1-18).
                </p>
            </div>

            <div className="relative">
                <Phase phase={3} title="The End-User Experience (PWA/Marketplace UI)" goal='Build the primary PWA/Mobile App "storefront." This is the core "Marketplace" (Clarifier 2) that allows end-users to find, purchase, and run your "Gems" (Golden Prompts) and "Tools."' icon={ShoppingCartIcon}>
                    <Task title="UI/UX Foundation (PWA Shell)">Implement the end-user PWA using React or your preferred framework. This includes setting up the core navigation (Marketplace, Tutorials, My Account), the main chat interface, and responsive (mobile-first) styling with Tailwind.</Task>
                    <Task title="Authentication & User Accounts (UI)">Build the frontend components for Login, Signup, and Profile Management. This will integrate directly with our supabase_client.py (Module 5) to handle Supabase Auth (Clarifier 3).</Task>
                    <Task title="Monetization & Subscriptions (UI)">Build the "Pricing" and "Subscribe" pages. This will integrate with stripe_service.py (Module 16) to create and manage user subscriptions via Stripe Checkout (Clarifier 4).</Task>
                    <Task title='Marketplace & "Gem Runner" (UI)'>Develop the main PWA interface. This includes a "Marketplace" page to browse Gems/Tools (from Module 7 API) and the central "Chat" component that calls our core /api/agent/run endpoint (Module 11) to execute agentic workflows.</Task>
                    <Task title="Tutorials & Examples (Content)">Build the static pages for "Tutorials" and "Examples" (Clarifier 2). This is critical for user onboarding and will showcase how to use your platform's "Gems" (Modules 13-15) effectively.</Task>
                </Phase>

                <Phase phase={4} title="The Admin & Developer Experience (Internal Platform)" goal="Build the 'back office' and internal tooling for platform owners and developers. This is required to manage your 200+ tools, audit system performance, and ensure platform health and governance." icon={CogIcon}>
                    <Task title="Central Admin Dashboard (UI)">Implement the admin_ui/index.html (Module 41) as a dynamic React application. This dashboard will be the single pane of glass, showing high-level stats from the cost_and_usage_service.py (Module 12) and quality_evaluator.py (Module 18).</Task>
                    <Task title="Tool Management Portal (UI)">Build the admin UI for managing your 200+ tools. This interface will call the tool_router.py (Module 7) API to allow admins to create, edit, and publish new tools, (fulfilling your "Marketplace" backend need).</Task>
                    <Task title="Audit & Governance Viewer (UI)">Build the frontend for your "Auditor" services. This UI will display security alerts from the security_guardrail.py (Module 17) and show the detailed reasoning-chain evaluations from the quality_evaluator.py (Module 18).</Task>
                    <Task title="Monetization & BI Dashboard (UI)">Build the admin UI for the "Monetization" system. This will visualize revenue from stripe_service.py (Module 16) and correlate it with LLM/tool costs from cost_and_usage_service.py (Module 12) to track ROI and profitability (fulfilling your Cost attribution reporting interest).</Task>
                    <Task title='Developer "Golden Path" (CI/CD)'>Implement the CI/CD pipeline (Module 59) for the platform. This pipeline will automatically run the security_guardrail.py (Module 17) and quality_evaluator.py (Module 18) on any new Gem or Tool submitted by a developer, enforcing quality and safety before it ever reaches production.</Task>
                </Phase>

                <Phase phase={5} title="Advanced Integration & Ecosystem (External Connectors)" goal="Expand the platform's reach beyond the PWA and embed its intelligence directly into the external ecosystems you specified (Clarifier 1 & 3)." icon={GlobeAltIcon}>
                    <Task title="CustomGPT OpenAPI Schema">Create and publish a production-grade OpenAPI 3.1 schema. This schema will define the /api/agent/run endpoint (Module 11) and its authentication, allowing any "CustomGPT" (Clarifier 3) to use your entire 200+ tool platform as its "Action" backend.</Task>
                    <Task title="Google Workspace Add-on (Implementation)">Build the full Google Apps Script (Module 64) and client-side UI for the Google Workspace integration. This add-on will allow users to run your "Google Doc AI Assistant" Gem (Module 14) directly inside a Google Doc.</Task>
                    <Task title="VS Code Extension (Implementation)">Build the full TypeScript/JavaScript frontend for the VS Code Extension (Module 65). This will provide the UI for your "Code Assist Pro" Gem (Module 13) and call the /api/agent/run endpoint (Module 11) for repository-aware assistance.</Task>
                    <Task title='Developer Integration "Tutorials"'>Create the developer-facing "Tutorials" (Clarifier 2). This documentation will teach other developers how to integrate your platform, covering: (a) calling the API, (b) using the CustomGPT action, and (c) building their own tools for your marketplace.</Task>
                    <Task title="Advanced RAG Indexing Service">Implement the repo_indexing_service.py (Module 72). This is a critical backend service that provides "deep context" for your integrations. It will clone and index a user's entire codebase (for the VS Code extension) or Google Drive (for the Workspace add-on), providing repository-level context to your agents.</Task>
                </Phase>
            </div>
        </div>
    );
};

export default ConfigurationExplorer;