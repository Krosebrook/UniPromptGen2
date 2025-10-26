


import React, { useState, useEffect } from 'react';
import Layout from './components/Layout.tsx';
import Dashboard from './pages/Dashboard.tsx';
import TemplateLibrary from './pages/TemplateLibrary.tsx';
import TemplateEditor from './pages/TemplateEditor.tsx';
// FIX: Added file extension to fix module resolution error.
import Playground from './pages/Playground.tsx';
import Profile from './pages/Profile.tsx';
import Marketplace from './pages/Marketplace.tsx';
import AgenticWorkbench from './pages/AgenticWorkbench.tsx';
import ToolLibrary from './pages/ToolLibrary.tsx';
import KnowledgeLibrary from './pages/KnowledgeLibrary.tsx';
import LandingPage from './pages/LandingPage.tsx';
import { MOCK_USER } from './constants.ts';
import { WorkspaceProvider } from './contexts/WorkspaceContext.tsx';

const App: React.FC = () => {
  // Simulate authentication state. In a real app, this would be managed
  // by a context, library like Redux, or by checking a token.
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [route, setRoute] = useState(window.location.hash);

  useEffect(() => {
    const handleHashChange = () => {
      setRoute(window.location.hash);
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  const handleSignIn = () => {
    setIsAuthenticated(true);
    // After signing in, redirect to the dashboard
    window.location.hash = '#/dashboard';
  };

  const renderPage = () => {
    if (route.startsWith('#/templates/')) {
      const id = route.split('/')[2];
      return <TemplateEditor templateId={id} />;
    }

    switch (route) {
      case '#/templates':
        return <TemplateLibrary />;
      case '#/playground':
        return <Playground />;
      case '#/profile':
        return <Profile user={MOCK_USER} />;
      case '#/marketplace':
        return <Marketplace />;
       case '#/agentic-workbench':
        return <AgenticWorkbench />;
      case '#/tool-library':
        return <ToolLibrary />;
      case '#/knowledge-library':
        return <KnowledgeLibrary />;
      case '#/':
      case '#/dashboard':
      default:
        return <Dashboard />;
    }
  };

  // If the user is not authenticated, show the landing page.
  if (!isAuthenticated) {
    return <LandingPage onSignIn={handleSignIn} />;
  }

  // Otherwise, show the main application layout.
  return (
    <WorkspaceProvider user={MOCK_USER}>
      <Layout user={MOCK_USER}>{renderPage()}</Layout>
    </WorkspaceProvider>
  );
};

export default App;