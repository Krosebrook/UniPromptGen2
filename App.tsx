


import React, { useState, useEffect } from 'react';
import Layout from './components/Layout.tsx';
import Dashboard from './pages/Dashboard.tsx';
import TemplateLibrary from './pages/TemplateLibrary.tsx';
import TemplateEditor from './pages/TemplateEditor.tsx';
import Playground from './pages/Playground.tsx';
import Profile from './pages/Profile.tsx';
import Marketplace from './pages/Marketplace.tsx';
import AgenticWorkbench from './pages/AgenticWorkbench.tsx';
import ToolLibrary from './pages/ToolLibrary.tsx';
import KnowledgeLibrary from './pages/KnowledgeLibrary.tsx';
import LandingPage from './pages/LandingPage.tsx';
import Deployments from './pages/Deployments.tsx';
import Settings from './pages/Settings.tsx';
import ConfigurationExplorer from './pages/ConfigurationExplorer.tsx';
import { MOCK_LOGGED_IN_USER } from './constants.ts';
import { WorkspaceProvider } from './contexts/WorkspaceContext.tsx';

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
    return <LandingPage onSignIn={handleSignIn} />;
  }

  return (
    <WorkspaceProvider user={MOCK_LOGGED_IN_USER}>
      <Layout user={MOCK_LOGGED_IN_USER}>{renderPage()}</Layout>
    </WorkspaceProvider>
  );
};

export default App;