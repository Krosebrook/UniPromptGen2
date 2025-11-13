




import React, { useState, useEffect, lazy, Suspense } from 'react';
import Layout from './components/Layout.tsx';
import { MOCK_LOGGED_IN_USER } from './constants.ts';
import { WorkspaceProvider } from './contexts/WorkspaceContext.tsx';

// Lazy load pages for better performance
const Dashboard = lazy(() => import('./pages/Dashboard.tsx'));
const TemplateLibrary = lazy(() => import('./pages/TemplateLibrary.tsx'));
const TemplateEditor = lazy(() => import('./pages/TemplateEditor.tsx'));
const Playground = lazy(() => import('./pages/Playground.tsx'));
const Profile = lazy(() => import('./pages/Profile.tsx'));
const Marketplace = lazy(() => import('./pages/Marketplace.tsx'));
const AgenticWorkbench = lazy(() => import('./pages/AgenticWorkbench.tsx'));
const ToolLibrary = lazy(() => import('./pages/ToolLibrary.tsx'));
const KnowledgeLibrary = lazy(() => import('./pages/KnowledgeLibrary.tsx'));
const LandingPage = lazy(() => import('./pages/LandingPage.tsx'));
const Deployments = lazy(() => import('./pages/Deployments.tsx'));
const Settings = lazy(() => import('./pages/Settings.tsx'));
const ConfigurationExplorer = lazy(() => import('./pages/ConfigurationExplorer.tsx'));
const StrategicRoadmap = lazy(() => import('./pages/StrategicRoadmap.tsx'));

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="text-center">
      <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      <p className="mt-4 text-muted-foreground">Loading...</p>
    </div>
  </div>
);

const routeConfig: Record<string, React.FC<any>> = {
  '/dashboard': Dashboard,
  '/templates': TemplateLibrary,
  '/playground': Playground,
  '/profile': (props) => <Profile {...props} user={MOCK_LOGGED_IN_USER} />,
  '/marketplace': Marketplace,
  '/agentic-workbench': AgenticWorkbench,
  '/tool-library': ToolLibrary,
  '/knowledge-library': KnowledgeLibrary,
  '/deployments': Deployments,
  '/settings': Settings,
  '/config-explorer': ConfigurationExplorer,
  '/strategic-roadmap': StrategicRoadmap,
};


const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentPath, setCurrentPath] = useState(window.location.hash.substring(1) || '/dashboard');

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentPath(window.location.hash.substring(1) || '/dashboard');
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  const handleSignIn = () => {
    setIsAuthenticated(true);
    window.location.hash = '#/dashboard';
  };

  const renderPage = () => {
    if (currentPath.startsWith('/templates/')) {
      const id = currentPath.split('/')[2];
      return <TemplateEditor templateId={id} />;
    }
    
    // Find a matching route from the config, defaulting to dashboard
    const routeKey = Object.keys(routeConfig).find(key => currentPath.startsWith(key)) || '/dashboard';
    const PageComponent = routeConfig[routeKey];
    
    return PageComponent ? <PageComponent /> : <Dashboard />;
  };

  if (!isAuthenticated) {
    return (
      <Suspense fallback={<LoadingFallback />}>
        <LandingPage onSignIn={handleSignIn} />
      </Suspense>
    );
  }

  return (
    <WorkspaceProvider user={MOCK_LOGGED_IN_USER}>
      <Layout user={MOCK_LOGGED_IN_USER}>
        <Suspense fallback={<LoadingFallback />}>
          {renderPage()}
        </Suspense>
      </Layout>
    </WorkspaceProvider>
  );
};

export default App;