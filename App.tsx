
import React, 'react';
import { useState, useEffect } from 'react';
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
import { MOCK_USER } from './constants.ts';

const App: React.FC = () => {
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

  return <Layout user={MOCK_USER}>{renderPage()}</Layout>;
};

export default App;
