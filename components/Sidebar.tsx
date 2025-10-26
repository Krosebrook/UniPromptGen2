import React, { useState, useEffect } from 'react';
import {
  HomeIcon, ChartPieIcon, CodeBracketSquareIcon, PlayIcon, UserCircleIcon,
  ShoppingCartIcon, BeakerIcon, TerminalIcon, CollectionIcon, RocketLaunchIcon
} from './icons/Icons.tsx';

interface NavLinkProps {
  href: string;
  icon: React.ElementType;
  label: string;
  isActive: boolean;
}

const NavLink: React.FC<NavLinkProps> = ({ href, icon: Icon, label, isActive }) => (
  <a
    href={href}
    className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-md transition-colors ${
      isActive
        ? 'bg-primary text-primary-foreground'
        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
    }`}
  >
    <Icon className="h-5 w-5 mr-3" />
    {label}
  </a>
);

const Sidebar: React.FC = () => {
  const [activeRoute, setActiveRoute] = useState(window.location.hash || '#/dashboard');

  useEffect(() => {
    const handleHashChange = () => {
      setActiveRoute(window.location.hash || '#/dashboard');
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navItems = [
    { href: '#/dashboard', icon: HomeIcon, label: 'Dashboard' },
    { href: '#/templates', icon: CodeBracketSquareIcon, label: 'Template Library' },
    { href: '#/deployments', icon: RocketLaunchIcon, label: 'Deployments' },
    { href: '#/playground', icon: PlayIcon, label: 'AI Playground' },
    { href: '#/agentic-workbench', icon: BeakerIcon, label: 'Agentic Workbench' },
    { href: '#/tool-library', icon: TerminalIcon, label: 'Tool Library' },
    { href: '#/knowledge-library', icon: CollectionIcon, label: 'Knowledge Library' },
    { href: '#/marketplace', icon: ShoppingCartIcon, label: 'Marketplace' },
  ];

  return (
    <aside className="w-64 flex-shrink-0 bg-card bg-gradient-to-b from-card to-background p-4 flex flex-col">
      <div className="flex items-center mb-8">
        <ChartPieIcon className="h-8 w-8 text-primary" />
        <span className="ml-2 text-xl font-bold text-foreground">Prompt Platform</span>
      </div>
      <nav className="flex-1 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.href}
            href={item.href}
            icon={item.icon}
            label={item.label}
            isActive={activeRoute.startsWith(item.href) && item.href !=='#/'}
          />
        ))}
      </nav>
      <div className="mt-auto">
        <NavLink
            href="#/profile"
            icon={UserCircleIcon}
            label="My Profile"
            isActive={activeRoute.startsWith('#/profile')}
          />
      </div>
    </aside>
  );
};

export default Sidebar;