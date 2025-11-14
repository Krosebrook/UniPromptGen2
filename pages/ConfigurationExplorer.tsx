

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
                <Phase phase={3} title="End-User Marketplace & PWA Implementation" goal='Construct a Progressive Web App (PWA) to serve as the user-facing marketplace. This application will enable users to discover, purchase, and interact with AI agents ("Gems") and tools, providing a seamless mobile and desktop experience.' icon={ShoppingCartIcon}>
                    <Task title="UI/UX Foundation (PWA Shell)">Implement a React-based PWA shell, establishing the primary navigation structure (Marketplace, Tutorials, My Account), a central chat interface for agent interaction, and a responsive, mobile-first layout using Tailwind CSS.</Task>
                    <Task title="Authentication UI">Develop the frontend components for user registration, login, and profile management. These components will interface directly with the `supabase_client.py` (Module 5) backend to handle user authentication and session management via Supabase Auth (Clarifier 3).</Task>
                    <Task title="Monetization UI">Construct the "Pricing" and "Subscribe" pages. This involves integrating with the `stripe_service.py` (Module 16) to initiate Stripe Checkout sessions, enabling users to subscribe to different tiers and manage their payment information (Clarifier 4).</Task>
                    <Task title='Core Marketplace & Agent Runner UI'>Develop the primary marketplace interface for browsing Gems and Tools, sourcing data from the `/api/tools` (Module 7) endpoint. Implement the central "Agent Runner" chat component which will send user inputs to the `/api/agent/run` (Module 11) endpoint to execute workflows.</Task>
                    <Task title="Onboarding Content">Create the static content pages for "Tutorials" and "Examples" (Clarifier 2). This content is critical for user onboarding and must clearly demonstrate the practical application of core platform "Gems" (Modules 13-15).</Task>
                </Phase>

                <Phase phase={4} title="Internal Admin & Developer Tooling" goal="Develop the internal administrative platform required for platform operators and developers. This 'back office' is essential for managing the tool ecosystem, auditing system performance, and enforcing platform-wide governance and security policies." icon={CogIcon}>
                    <Task title="Central Admin Dashboard (UI)">Implement the `admin_ui/index.html` (Module 41) as a dynamic React application to serve as the central administrative hub. This dashboard will provide a high-level overview of platform health by visualizing key metrics from the `cost_and_usage_service.py` (Module 12) and `quality_evaluator.py` (Module 18).</Task>
                    <Task title="Tool Management Portal (UI)">Construct the admin interface for full lifecycle management of the platform's 200+ tools. This UI will consume the `tool_router.py` (Module 7) API, enabling administrators to create, review, publish, and deprecate tools available in the user-facing marketplace.</Task>
                    <Task title="Audit & Governance Viewer (UI)">Develop the frontend interface for the platform's 'Auditor' services. This UI must clearly display security alerts originating from `security_guardrail.py` (Module 17) and provide detailed views of the reasoning-chain evaluations generated by `quality_evaluator.py` (Module 18).</Task>
                    <Task title="Monetization & BI Dashboard (UI)">Build the administrative dashboard for business intelligence and monetization. This interface will visualize revenue data from `stripe_service.py` (Module 16) and correlate it with LLM and tool usage costs from `cost_and_usage_service.py` (Module 12) to enable granular ROI and profitability tracking.</Task>
                    <Task title='Developer "Golden Path" (CI/CD)'>Define and implement the CI/CD pipeline (`prompt_ci_cd.yml`, Module 59) for new Gem and Tool submissions. This automated "Golden Path" must enforce quality by automatically executing the `security_guardrail.py` (Module 17) and `quality_evaluator.py` (Module 18) against any new submission before it can be deployed.</Task>
                </Phase>

                <Phase phase={5} title="Ecosystem Integration & Advanced RAG" goal="Extend the platform's capabilities beyond the primary PWA by embedding its intelligence directly into external ecosystems. This involves deploying production-ready connectors for IDEs, office suites, and other AI platforms (Clarifier 1 & 3)." icon={GlobeAltIcon}>
                    <Task title="CustomGPT OpenAPI Schema">Author and publish a production-grade OpenAPI 3.1 schema (`openapi_schema.json`, M-25). This specification must accurately define the `/api/agent/run` endpoint (Module 11) and its authentication flow, enabling any CustomGPT to use the platform as a secure 'Action' backend.</Task>
                    <Task title="Google Workspace Add-on (Implementation)">Build and deploy the Google Workspace add-on, comprising a Google Apps Script backend (`Code.gs`, Module 64) and a client-side UI. This add-on will enable users to invoke the "Google Doc AI Assistant" Gem (Module 14) directly within Google Docs for contextual writing assistance.</Task>
                    <Task title="VS Code Extension (Implementation)">Develop and package the VS Code Extension (`package.json`, Module 65). The extension's TypeScript/JavaScript frontend (`extension.js`, M-28) will provide the UI for the "Code Assist Pro" Gem (Module 13) and call the `/api/agent/run` endpoint (Module 11), providing repository-aware coding assistance within the IDE.</Task>
                    <Task title='Developer Integration "Tutorials"'>Produce comprehensive developer-facing tutorials (Clarifier 2) for platform integration. The documentation must provide clear, actionable guides on: (a) authenticating and calling the core API, (b) configuring a CustomGPT action, and (c) developing custom tools for the marketplace.</Task>
                    <Task title="Advanced RAG Indexing Service">Implement the `repo_indexing_service.py` (Module 72) as a robust, scalable backend service. This service is critical for providing deep context to integrations by cloning and indexing a user's entire codebase (for VS Code) or Google Drive (for GSuite), enabling repository-level contextual understanding for agents.</Task>
                </Phase>
            </div>
        </div>
    );
};

export default ConfigurationExplorer;