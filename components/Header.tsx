

import React, { useState } from 'react';
import { User } from '../types.ts';
import { MagnifyingGlassIcon, BellIcon, CogIcon, ChevronDownIcon } from './icons/Icons.tsx';
import WorkspaceSwitcher from './WorkspaceSwitcher.tsx';

interface HeaderProps {
  user: User;
}

const Header: React.FC<HeaderProps> = ({ user }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="bg-card flex-shrink-0 flex items-center justify-between px-6 py-3">
      <div className="flex items-center gap-4">
        <WorkspaceSwitcher />
        <div className="relative hidden lg:block">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search..."
            className="w-full md:w-80 pl-10 pr-4 py-2 rounded-md bg-input text-foreground focus:ring-2 focus:ring-ring focus:outline-none"
          />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button className="p-2 rounded-full text-muted-foreground hover:bg-accent hover:text-accent-foreground">
          <BellIcon className="h-6 w-6" />
        </button>
        <button className="p-2 rounded-full text-muted-foreground hover:bg-accent hover:text-accent-foreground">
          <CogIcon className="h-6 w-6" />
        </button>
        <div className="relative">
          <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center gap-2">
            <img src={user.avatarUrl} alt={user.name} className="h-9 w-9 rounded-full" />
            <span className="hidden md:inline text-sm font-medium text-foreground">{user.name}</span>
            <ChevronDownIcon className="h-5 w-5 text-muted-foreground" />
          </button>
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-popover rounded-md shadow-lg ring-1 ring-border py-1 z-20">
              <a href="#/profile" className="block px-4 py-2 text-sm text-popover-foreground hover:bg-accent">My Profile</a>
              <a href="#/settings" className="block px-4 py-2 text-sm text-popover-foreground hover:bg-accent">Settings</a>
               <div className="my-1 h-px bg-border" />
              <a href="#/logout" className="block px-4 py-2 text-sm text-destructive hover:bg-accent">Log Out</a>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;