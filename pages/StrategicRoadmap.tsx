

import React, { useMemo } from 'react';
import { ScaleIcon, GlobeAltIcon, WrenchScrewdriverIcon, RocketLaunchIcon } from '../components/icons/Icons.tsx';

const rawRoadmapText = `
MAIN PHASE 6: Admin Platform Completion & Governance
Objective: To complete the Admin UI (Phase 4) and implement the automated governance, security, and quality assurance engines.
Subphase 6.1: Build Admin Tool Management Portal (T-012)
Sub-subphase 6.1.1: UI: Create /admin/tools route and page (M-21) within the Admin App (M-08), reusing the AdminLayout.
Sub-subphase 6.1.2: UI: Implement a data table (e.g., shadcn/ui-table) that fetches and displays all tools from the /api/tools (M-07) endpoint.
Sub-subphase 6.1.3: UI: Implement a "Create Tool" modal/form that POSTs a valid ToolCreate schema (M-06) to the /api/tools (M-07) endpoint.
Sub-subphase 6.1.4: UI: Implement an "Edit Tool" action that pre-fills the form with data from a selected tool and PUTs updates.
Sub-subphase 6.1.5: UI: Implement a "Delete Tool" action with a confirmation dialog that sends a DELETE request to the API.
Subphase 6.2: Build Admin Audit & Governance Portal (T-013)
Sub-subphase 6.2.1: UI: Create /admin/audit route and page (M-22) with date-range pickers and search filters.
Sub-subphase 6.2.2: Backend: Create a new admin-only endpoint /api/admin/audit-logs that queries and paginates the cost_and_usage_service (M-12) log table.
Sub-subphase 6.2.3: UI: Implement a "Security Events" tab that fetches and displays logs where security_guardrail.py (M-17) flagged an event (e.g., type: 'pii_detected').
Sub-subphase 6.2.4: UI: Implement a "Quality Events" tab that fetches and displays logs from the quality_evaluator.py (M-18) service (e.g., type: 'low_quality_score').
Sub-subphase 6.2.5: UI: Implement a "User Drilldown" feature to view all auditable events for a specific user_id.
Subphase 6.3: Implement Automated Red Teaming Service (M-31)
Sub-subphase 6.3.1: Backend: Create src/services/red_teaming_service.py (M-31) as a new background service.
Sub-subphase 6.3.2: Backend: Create a new Supabase table adversarial_prompts and populate it with 100+ known prompt injection attacks (e.g., "ignore previous instructions...").
Sub-subphase 6.3.3: Backend: Implement a run_red_team_audit(gem_id) function that runs all adversarial prompts against a given Gem via the agent_service.py (M-10).
Sub-subphase 6.3.4: Backend: Create a new Supabase table red_team_results to log (gem_id, prompt_id, status, response), marking status as fail if the agent's response indicates the attack was successful.
Sub-subphase 6.3.5: CI/CD: Add a new cron job to the prompt_ci_cd.yml (M-24) that runs this service nightly against all "production" Gems.
Subphase 6.4: Implement Automated Feedback Triage Service (M-30)
Sub-subphase 6.4.1: Backend: Create src/services/feedback_triage_service.py (M-30).
Sub-subphase 6.4.2: Backend: Create a new endpoint /api/feedback (for the PWA, M-19) that accepts a (session_id, user_rating, user_comment) payload.
Sub-subphase 6.4.3: Backend: Implement logic to call the "Prompt Auditor Gem" (M-15) as a meta-agent to classify the feedback (e.g., bug, hallucination, feature_request).
Sub-subphase 6.4.4: Backend: Integrate with the Jira API to automatically create a new bug ticket if the feedback is classified as bug or hallucination.
Sub-subphase 6.4.5: Backend: Implement logic to auto-generate a new test case and save it to a new_regression_tests table if the feedback is a hallucination, to be reviewed by an admin.
Subphase 6.5: Build Strategic AI Risk Heatmap UI (M-32)
Sub-subphase 6.5.1: UI: Create /admin/risk route and page (M-32) in the Admin App.
Sub-subphase 6.5.2: Backend: Create a new admin endpoint /api/admin/risk-heatmap that aggregates data for the dashboard.
Sub-subphase 6.5.3: Backend: Implement the aggregation logic, pulling data from red_team_results (M-31), security_guardrail logs (M-17), and quality_evaluator logs (M-18).
Sub-subphase 6.5.4: UI: Use recharts (or similar) to implement a heatmap visualization showing (Risk Type vs. Gem) with a color-coded severity.
Sub-subphase 6.5.5: UI: Implement a "Top 10 Riskiest Gems" data table that allows an admin to drill down into the raw risk logs.
MAIN PHASE 7: Advanced RAG & Ecosystem Integration
Objective: To productionize the RAG engine (T-004/M-29) and deploy the ecosystem integrations (VS Code, GSuite, CustomGPT) that use it.
Subphase 7.1: Finalize RAG Engine (M-29)
Sub-subphase 7.1.1: Backend (Supabase): Write and apply the SQL migration to enable pgvector and create the code_vectors table (for T-004).
Sub-subphase 7.1.2: Backend (Supabase): Create a search_code_vectors(query_embedding, user_id) RPC function to perform the vector similarity search, secured with RLS.
Sub-subphase 7.1.3: Backend (API): Secure the /repo-indexer/index endpoint (from T-004) to require admin-level auth (or 'pro' tier auth).
Sub-subphase 7.1.4: Backend (API): Create /repo-indexer/delete and /repo-indexer/re-index endpoints for repository lifecycle management.
Sub-subphase 7.1.5: Backend (Service): Optimize the file parser to use tree-sitter for intelligent code chunking (function-by-function) instead of naive text splitting.
Subphase 7.2: Build VS Code Extension (M-27, M-28)
Sub-subphase 7.2.1: VSCode: Create the package.json (M-65) defining the extension, sidebar icon, and promptforge.runCodeAssist command.
Sub-subphase 7.2.2: VSCode: Create the extension.js (M-28) backend, which handles the activate command and message passing.
Sub-subphase 7.2.3: VSCode: Implement the "Context Engineering" logic in extension.js to read the user's activeTextEditor.selection or full file text.
Sub-subphase 7.2.4: VSCode: Build the React-based Webview UI (M-27) that contains the chat interface.
Sub-subphase 7.2.5: VSCode: Implement the API call from the Webview, sending the scraped context and chat message to the /api/agent/run (M-11) endpoint, using the "Code Assist Gem" (M-13).
Subphase 7.3: Build Google Workspace Add-on (M-26, M-63)
Sub-subphase 7.3.1: GSuite: Create the appsscript.json (M-63) manifest, defining the OAuth scopes (Docs, Drive) and UI triggers.
Sub-subphase 7.3.2: GSuite: Implement the Code.gs (M-26) server-side Apps Script.
Sub-subphase 7.3.3: GSuite: Implement the onHomepage() and onFileOpen() card-builder functions to create the add-on UI.
Sub-subphase 7.3.4: GSuite: Implement the runGem(gem_id, context) function, which uses UrlFetchApp to call the /api/agent/run (M-11) endpoint (e.g., with the "Google Doc Writer" Gem, M-14).
Sub-subphase 7.3.5: GSuite: Implement the logic to get the user's selected text from the active document and insert the agent's response back at the cursor.
Subphase 7.4: Implement CustomGPT OpenAPI Schema (M-25)
Sub-subphase 7.4.1: Docs: Generate the openapi_schema.json (M-25) file for the platform.
Sub-subphase 7.4.2: Docs: Add the /api/agent/run (M-11) endpoint to the schema, clearly defining its request and response.
Sub-subphase 7.4.3: Docs: Add the GET /api/tools (M-07) and GET /api/prompts (M-03) endpoints so a CustomGPT could (in theory) discover available Gems/Tools.
Sub-subphase 7.4.4: Docs: Add the Supabase Auth (M-05) OAuth 2.0 flow to the securitySchemes section of the OpenAPI spec.
Sub-subphase 7.4.5: PWA (Tutorials): Write a new tutorial (for T-007) explaining how to connect a CustomGPT to the platform as an "Action."
Subphase 7.5: Build Developer Certification Service (M-67)
Sub-subphase 7.5.1: Backend: Create src/services/dev_cert_service.py (M-67) to manage developer certifications for using platform APIs.
Sub-subphase 7.5.2: Backend: Create a new Supabase table developer_certifications to store (user_id, status, cert_level).
Sub-subphase 7.5.3: Backend: Modify the Supabase Auth logic (M-05) to add cert_level as a custom claim for certified devs.
Sub-subphase 7.5.4: UI (Admin): Build a UI in the Admin Portal (M-08) for admins to manually approve/deny certification requests.
Sub-subphase 7.5.5: UI (PWA): Build a simple "/certify" page where developers can submit their projects for review (or take an automated quiz).
MAIN PHASE 8: Strategic R&D & Platform Resilience
Objective: To implement the high-level strategic, R&D, and resilience services that ensure the platform's long-term health and competitive advantage.
Subphase 8.1: Implement Disaster Recovery Service (M-33)
Sub-subphase 8.1.1: Backend: Create src/services/disaster_recovery_service.py (M-33).
Sub-subphase 8.1.2: Backend: Implement health check logic in llm_abstraction.py (M-09) to ping the /health endpoint of each provider (Gemini, OpenAI, Anthropic).
Sub-subphase 8.1.3: Backend: Implement the initiate_failover(provider_name) function, which updates a global config (e.g., in Supabase or Redis) to change the DEFAULT_PROVIDER.
Sub-subphase 8.1.4: UI (Admin): Create a /admin/disaster-recovery page showing the real-time status (Up/Down) of all integrated LLM providers.
Sub-subphase 8.1.5: UI (Admin): Add a "Manual Failover" button (e.g., "Set Anthropic as Primary") that calls the initiate_failover function, protected by admin auth.
Subphase 8.2: Build R&D Model Evaluation Harness (M-34)
Sub-subphase 8.2.1: Backend: Create src/services/model_eval_harness.py (M-34) to test and evaluate new, untrusted LLM models.
Sub-subphase 8.2.2: Backend: Create a "golden test set" of 100 diverse prompts (in a new golden_prompt_set table) that cover coding, writing, and reasoning.
Sub-subphase 8.2.3: Backend: Implement a run_evaluation(model_name) function that runs the full test set against the new model, storing its response, cost, and latency for each prompt.
Sub-subphase 8.2.4: Backend: Integrate the quality_evaluator.py (M-18) to score the accuracy of each response in the evaluation run.
Sub-subphase 8.2.5: UI (Admin): Create a /admin/model-evaluation page to trigger new runs and compare the performance (Cost, Latency, Quality Score) of all tested models head-to-head.
Subphase 8.3: Build R&D Model Promotion Pipeline (M-69)
Sub-subphase 8.3.1: Backend: Create src/services/model_promotion_pipeline.py (M-69).
Sub-subphase 8.3.2: Backend: Implement a promote_model(model_name, stage) function (e.g., stage = beta, production, deprecated) that updates the llm_abstraction.py (M-09) config.
Sub-subphase 8.3.3: Backend: Create a new Supabase table tdrs (Technical Decision Records, M-36) to store the justification for promoting a model.
Sub-subphase 8.3.4: Backend: Integrate with the model_eval_harness.py (M-34), requiring a passing evaluation score before a model can be promoted.
Sub-subphase 8.3.5: UI (Admin): Create a /admin/model-lifecycle page to visualize all models in their current stage (e.g., in a Kanban board: "R&D", "Beta", "Production") and allow admins to trigger a promotion.
Subphase 8.4: Build AI Patent & IP Tracker Service (M-74)
Sub-subphase 8.4.1: Backend: Create src/services/ip_tracker_service.py (M-74).
Sub-subphase 8.4.2: Backend: Create a new Supabase table innovations_log to store (idea_name, description, team_member, status).
Sub-subphase 8.4.3: Backend: Create a simple API endpoint /api/ip-tracker/log for R&D team members to submit new ideas.
Sub-subphase 8.4.4: Backend (Mock): Implement a placeholder function check_prior_art(keywords) that simulates a search against the USPTO or Google Patents database.
Sub-subphase 8.4.5: UI (Admin): Create a /admin/ip-tracker page for the legal/strategic team to review the innovations_log, add notes, and update the status (e.g., "Under Review", "Patentable", "Internal Trade Secret").
Subphase 8.5: Build AI Portfolio & ROI Dashboard (M-71)
Sub-subphase 8.5.1: UI: Create /admin/roi route and page (M-71) in the Admin App.
Sub-subphase 8.5.2: Backend: Create a new admin endpoint /api/admin/roi-stats that aggregates data for this dashboard.
Sub-subphase 8.5.3: Backend: Implement the aggregation logic, grouping data from cost_and_usage_service.py (M-12) and stripe_service.py (M-16) by gem_id and user_id.
Sub-subphase 8.5.4: UI: Display TCO vs. ROI per "Gem," "Tool," or "Initiative" (e.g., "Code Assist Feature" vs. "GSuite Add-on").
Sub-subphase 8.5.5: UI: Add executive-level summary widgets for "Total Platform ROI," "Most Valuable User Cohort," and "Highest Cost Center."
`;

interface RoadmapTask {
    number: string;
    title: string;
}
interface RoadmapSubphase {
    number: string;
    title: string;
    tasks: RoadmapTask[];
}
interface RoadmapPhase {
    number: string;
    title: string;
    objective: string;
    subphases: RoadmapSubphase[];
}

const ContentParser = ({ text }: { text: string }) => {
    const regex = /(\(M(?:odule|S)?-?\d+\)|\(T-?\d+\)|\(Clarifiers? \d+(?: & \d+)?(?:[-–]\d+)?\)|\".*?\"|[a-zA-Z0-9_./-]+\.(?:py|html|ts|json|yml|gs)|`.*?`|\/api\/[a-zA-Z0-9_./-]+)/g;
    const parts = text.split(regex);

    return (
        <>
            {parts.map((part, index) => {
                if (!part) return null;

                if (part.match(/^\([MT]-?\d+\)/)) {
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
                if (part.match(/\.(py|html|ts|json|yml|gs)$/) || part.startsWith('/api/')) {
                    return <code key={index} className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-primary/90">{part}</code>;
                }
                return part;
            })}
        </>
    );
};

// Fix: Changed component definitions to use React.FC for correct prop typing with keys.
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

// Fix: Changed component definitions to use React.FC for correct prop typing with keys.
const SubSubPhase: React.FC<{ number: string, title: string }> = ({ number, title }) => (
    <li className="flex items-start gap-3">
        <span className="flex-shrink-0 font-mono text-xs text-primary/80 bg-primary/10 px-1.5 py-0.5 rounded-md mt-0.5">{number}</span>
        <p className="text-sm text-muted-foreground"><ContentParser text={title} /></p>
    </li>
);

// Fix: Changed component definitions to use React.FC for correct prop typing with keys.
const SubPhase: React.FC<{ number: string, title: string, tasks: RoadmapTask[] }> = ({ number, title, tasks }) => (
    <div className="bg-card p-4 rounded-lg border border-border shadow-sm">
        <h3 className="font-semibold text-card-foreground">
            Subphase {number}: <ContentParser text={title} />
        </h3>
        <ul className="mt-3 space-y-3">
            {tasks.map(task => <SubSubPhase key={task.number} number={task.number} title={task.title} />)}
        </ul>
    </div>
);

const parseRoadmap = (text: string): RoadmapPhase[] => {
    const phases = text.split('MAIN PHASE ').slice(1);
    return phases.map(phaseText => {
        const lines = phaseText.split('\n').filter(l => l.trim());
        const phaseTitleLine = lines.shift() || '';
        const phaseMatch = phaseTitleLine.match(/(\d+): (.*)/);
        const phaseNumber = phaseMatch ? phaseMatch[1] : '';
        const phaseTitle = phaseMatch ? phaseMatch[2] : '';
        const objectiveLine = lines.shift() || '';
        const objective = objectiveLine.replace('Objective: ', '');

        const subphases: RoadmapSubphase[] = [];
        let currentSubphase: RoadmapSubphase | null = null;
        
        lines.forEach(line => {
            const subphaseMatch = line.match(/Subphase ([\d\.]+): (.*)/);
            const subsubphaseMatch = line.match(/Sub-subphase ([\d\.]+): (.*)/);

            if (subphaseMatch) {
                if (currentSubphase) subphases.push(currentSubphase);
                currentSubphase = {
                    number: subphaseMatch[1],
                    title: subphaseMatch[2],
                    tasks: []
                };
            } else if (subsubphaseMatch && currentSubphase) {
                currentSubphase.tasks.push({
                    number: subsubphaseMatch[1],
                    title: subsubphaseMatch[2]
                });
            }
        });
        if (currentSubphase) subphases.push(currentSubphase);

        return {
            number: phaseNumber,
            title: phaseTitle,
            objective: objective,
            subphases: subphases
        };
    });
};

const phaseIcons: Record<string, React.ElementType> = {
    '6': ScaleIcon,
    '7': GlobeAltIcon,
    '8': WrenchScrewdriverIcon,
};


const StrategicRoadmap: React.FC = () => {
    const roadmapData = useMemo(() => parseRoadmap(rawRoadmapText), []);
    
    return (
        <div className="max-w-4xl mx-auto py-8">
            <div className="text-center mb-16">
                <RocketLaunchIcon className="h-12 w-12 mx-auto text-primary mb-4" />
                <h1 className="text-4xl font-extrabold text-foreground">Strategic Roadmap: Phases 6-8</h1>
                <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
                    This document outlines the next three major phases for platform completion, governance, and strategic R&D, following the core API and initial service implementations.
                </p>
            </div>

            <div className="relative">
                {roadmapData.map(phase => (
                    <Phase 
                        key={phase.number} 
                        phase={parseInt(phase.number)} 
                        title={phase.title} 
                        goal={phase.objective} 
                        icon={phaseIcons[phase.number] || RocketLaunchIcon}
                    >
                        {phase.subphases.map(subphase => (
                            <SubPhase key={subphase.number} number={subphase.number} title={subphase.title} tasks={subphase.tasks} />
                        ))}
                    </Phase>
                ))}
            </div>
        </div>
    );
};

export default StrategicRoadmap;