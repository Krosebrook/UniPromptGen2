

import React from 'react';
import { ChartPieIcon, CodeBracketSquareIcon, BeakerIcon, ChartBarIcon, QuoteIcon } from '../components/icons/Icons.tsx';

interface LandingPageProps {
  onSignIn: () => void;
}

const FeatureCard: React.FC<{icon: React.ElementType, title: string, children: React.ReactNode}> = ({ icon: Icon, title, children }) => (
  <div className="bg-card p-6 rounded-lg shadow-card border border-border">
    <div className="flex items-center gap-4 mb-3">
      <div className="bg-primary/20 p-2 rounded-md">
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <h3 className="text-xl font-bold text-foreground">{title}</h3>
    </div>
    <p className="text-muted-foreground">{children}</p>
  </div>
);

const Step: React.FC<{number: number, title: string, children: React.ReactNode}> = ({ number, title, children }) => (
    <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-primary text-primary-foreground rounded-full font-bold text-xl border-4 border-background ring-2 ring-primary">
            {number}
        </div>
        <div>
            <h4 className="text-lg font-semibold text-foreground">{title}</h4>
            <p className="text-muted-foreground">{children}</p>
        </div>
    </div>
);


const TestimonialCard: React.FC<{quote: string, name: string, title: string, avatarUrl: string}> = ({ quote, name, title, avatarUrl }) => (
    <div className="bg-card p-6 rounded-lg shadow-card border border-border h-full flex flex-col">
        <QuoteIcon className="h-8 w-8 text-primary/50 mb-4" />
        <p className="text-muted-foreground flex-grow italic">"{quote}"</p>
        <div className="mt-4 flex items-center gap-3 pt-4 border-t border-border">
            <img src={avatarUrl} alt={name} className="h-11 w-11 rounded-full" />
            <div>
                <p className="font-semibold text-foreground">{name}</p>
                <p className="text-sm text-primary">{title}</p>
            </div>
        </div>
    </div>
);


const LandingPage: React.FC<LandingPageProps> = ({ onSignIn }) => {
  return (
    <div className="bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 bg-background/80 backdrop-blur-sm z-10 border-b border-border">
          <div className="container mx-auto px-6 py-4 flex justify-between items-center">
             <div className="flex items-center gap-2">
                <ChartPieIcon className="h-8 w-8 text-primary" />
                <span className="text-xl font-bold text-foreground">Prompt Platform</span>
             </div>
             <button onClick={onSignIn} className="px-4 py-2 text-sm font-medium border border-border rounded-md hover:bg-accent">
                Sign In
             </button>
          </div>
      </header>
      
      <main>
        {/* Hero Section */}
        <section className="text-center py-20 md:py-32">
            <div className="container mx-auto px-6">
                <h1 className="text-4xl md:text-6xl font-extrabold text-foreground leading-tight">
                    Build, Test, and Deploy Enterprise-Grade Prompts
                </h1>
                <p className="mt-6 max-w-2xl mx-auto text-lg text-muted-foreground">
                    Our platform provides the tools your team needs to manage the entire lifecycle of your generative AI applications, from design to production.
                </p>
                <div className="mt-10 flex flex-col sm:flex-row justify-center items-center gap-4">
                    <button onClick={onSignIn} className="px-6 py-3 font-semibold text-primary-foreground bg-primary rounded-md hover:bg-primary/90 w-full sm:w-auto">
                        Start a Free Demo
                    </button>
                     <button onClick={onSignIn} className="px-6 py-3 font-semibold text-foreground bg-secondary rounded-md hover:bg-accent w-full sm:w-auto">
                        Sign In
                    </button>
                </div>
            </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-muted/30">
            <div className="container mx-auto px-6">
                <div className="text-center mb-12">
                     <h2 className="text-3xl font-bold text-foreground">A Unified Platform for Prompt Engineering</h2>
                     <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">Everything you need to go from idea to production-ready AI.</p>
                </div>
                <div className="grid md:grid-cols-3 gap-8">
                    <FeatureCard icon={CodeBracketSquareIcon} title="Template Library">
                        Create, version, and share reusable prompt templates. Ensure consistency and quality across all your applications.
                    </FeatureCard>
                    <FeatureCard icon={BeakerIcon} title="Agentic Workbench">
                        Design complex, multi-step agents using a powerful node-based editor. Connect models, tools, and knowledge bases with ease.
                    </FeatureCard>
                     <FeatureCard icon={ChartBarIcon} title="Quality & Analytics">
                        Continuously evaluate prompt performance with our automated testing suite and monitor usage with a detailed analytics dashboard.
                    </FeatureCard>
                </div>
            </div>
        </section>

        {/* How It Works Section */}
        <section className="py-20">
            <div className="container mx-auto px-6">
                 <div className="text-center mb-12">
                     <h2 className="text-3xl font-bold text-foreground">Get Started in 3 Simple Steps</h2>
                </div>
                <div className="max-w-2xl mx-auto space-y-12">
                    <Step number={1} title="Design Your Template">
                        Use our intuitive editor to craft your prompt. Define variables, set risk levels, and write clear instructions for the model.
                    </Step>
                     <Step number={2} title="Test & Evaluate">
                        Run your template in the AI Playground against different models. Track metrics and gather feedback with our evaluation tools.
                    </Step>
                     <Step number={3} title="Deploy with Confidence">
                        Once your template meets quality standards, set it as the active version. Integrate it into your applications via our secure API.
                    </Step>
                </div>
            </div>
        </section>
        
        {/* Testimonials Section */}
         <section className="py-20 bg-muted/30">
            <div className="container mx-auto px-6">
                 <div className="text-center mb-12">
                     <h2 className="text-3xl font-bold text-foreground">Trusted by Leading AI Teams</h2>
                </div>
                <div className="grid lg:grid-cols-2 gap-8">
                     <TestimonialCard 
                        quote="This platform has become the central nervous system for our entire generative AI strategy. The version control and quality scoring are game-changers."
                        name="Alex Chen"
                        title="Senior AI Engineer"
                        avatarUrl="https://i.pravatar.cc/150?u=alexchen"
                     />
                     <TestimonialCard 
                        quote="We've reduced our time-to-market for new AI features by over 60%. The ability to collaborate on and test prompts so efficiently is incredible."
                        name="Jane Doe"
                        title="Product Manager, AI Initiatives"
                        avatarUrl="https://i.pravatar.cc/150?u=janedoe"
                     />
                </div>
            </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-20">
             <div className="container mx-auto px-6 text-center">
                 <h2 className="text-3xl font-bold text-foreground">Ready to Supercharge Your Prompt Engineering?</h2>
                 <p className="mt-4 max-w-xl mx-auto text-muted-foreground">
                    Stop managing prompts in spreadsheets. Start building robust, scalable, and high-quality AI applications today.
                 </p>
                 <div className="mt-8">
                     <button onClick={onSignIn} className="px-8 py-4 text-lg font-semibold text-primary-foreground bg-primary rounded-md hover:bg-primary/90">
                        Get Started Now
                    </button>
                 </div>
            </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card">
          <div className="container mx-auto px-6 py-6 text-center text-muted-foreground text-sm">
             &copy; {new Date().getFullYear()} Universal Prompt Generator Pro. All rights reserved.
          </div>
      </footer>
    </div>
  );
};

export default LandingPage;