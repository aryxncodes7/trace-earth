import { useState, useEffect } from 'react';
import { LayoutDashboard, BookOpen, Trophy, Leaf, Settings, LogIn, Sun, Moon, LogOut } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  email: string | null;
  user?: {
    name: string | null;
    image: string | null;
  } | null;
  onLogout?: () => void;
}

export default function Navbar({ activeTab, setActiveTab, email, user = null, onLogout }: NavbarProps) {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark') || localStorage.getItem('theme') === 'dark';
    }
    return false;
  });

  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    if (!dropdownOpen) return;
    
    const handleOutsideClick = (e: MouseEvent) => {
      const container = document.getElementById('avatar-dropdown-container');
      if (container && !container.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [dropdownOpen]);

  const toggleDarkMode = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    } else if (savedTheme === 'light') {
      document.documentElement.classList.remove('dark');
      setIsDark(false);
    } else if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    }
  }, []);

  const tabs = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'log', label: 'Track Habits', icon: BookOpen },
    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
    { id: 'offset', label: 'Offsets', icon: Leaf },
  ];

  const isImageUrl = typeof user?.image === 'string' && /^https?:\/\//i.test(user.image);

  return (
    <>
      {/* 1. Desktop & Mobile Top Bar Header Layout */}
      <header id="desktop-navbar" className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-sm shadow-sm dark:border-zinc-800 dark:bg-gray-900/95">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
          {/* Brand Logo & Name */}
          <div className="flex items-center cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <svg width="140" height="32" viewBox="0 0 140 32" xmlns="http://www.w3.org/2000/svg" className="h-8 w-auto">
              <defs><clipPath id="nc"><circle cx="16" cy="16" r="12"/></clipPath></defs>
              <circle cx="16" cy="16" r="12" fill="#dbeafe" className="dark:fill-blue-950/40"/>
              <ellipse cx="14" cy="14" rx="4" ry="5" fill="#16a34a" opacity="0.75" clipPath="url(#nc)"/>
              <ellipse cx="20" cy="18" rx="3" ry="4" fill="#16a34a" opacity="0.6" clipPath="url(#nc)"/>
              <circle cx="16" cy="16" r="12" fill="none" stroke="#93c5fd" strokeWidth="0.5" className="dark:stroke-blue-800"/>
              <ellipse cx="16" cy="16" rx="16" ry="5" fill="none" stroke="#16a34a" strokeWidth="1.2" strokeDasharray="3 2" opacity="0.5"/>
              <circle cx="32" cy="16" r="2.5" fill="#16a34a" className="dark:fill-green-400"/>
              <text x="40" y="21" fontFamily="Inter, sans-serif" fontSize="16" fontWeight="500" className="fill-slate-900 dark:fill-zinc-100">trace<tspan className="text-green-600 dark:text-green-400 font-normal" fill="currentColor">.earth</tspan></text>
            </svg>
          </div>

          {/* Desktop Navigation Links (hidden on mobile) */}
          <nav className="hidden md:flex items-center space-x-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              if (activeTab === 'landing' && tab.id !== 'profile') return null; // Hide menus if not authenticated yet

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  id={`nav-tab-${tab.id}`}
                  className={`flex items-center space-x-2 rounded-lg py-1.5 px-3.5 text-xs font-semibold cursor-pointer transition-all ${
                    isActive
                      ? 'bg-slate-200 text-slate-900 dark:bg-zinc-800 dark:text-zinc-50'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:bg-zinc-800/55'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}

            {activeTab === 'landing' && (
              <button
                onClick={() => setActiveTab('landing')}
                className="flex items-center space-x-2 rounded-lg bg-green-600 text-white hover:bg-green-700 py-1.5 px-4 text-xs font-semibold cursor-pointer"
              >
                <LogIn className="h-4 w-4" />
                <span>Log In</span>
              </button>
            )}
          </nav>

          {/* Actions & Integration indicators bar */}
          <div className="flex items-center space-x-3">
            {/* Dark Mode Toggle Button */}
            <button
              onClick={toggleDarkMode}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-all cursor-pointer dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100"
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle Theme"
            >
              {isDark ? <Sun className="h-3.5 w-3.5 text-amber-500" /> : <Moon className="h-3.5 w-3.5 text-slate-600" />}
            </button>

            {/* Connected indicator tag (Avatar with Dropdown menu) */}
            {email && activeTab !== 'landing' && (
              <div className="relative flex items-center border-l border-slate-200 pl-3 dark:border-zinc-800 animate-in fade-in duration-350" id="avatar-dropdown-container">
                <button
                  type="button"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className={`flex h-8 w-8 items-center justify-center rounded-full bg-slate-50 dark:bg-zinc-800 border transition-all cursor-pointer overflow-hidden shadow-sm ${
                    dropdownOpen
                      ? 'border-green-600 ring-2 ring-green-600/15 dark:ring-green-400/20 scale-105'
                      : 'border-slate-200 dark:border-zinc-700 hover:border-green-600 dark:hover:border-green-500 hover:scale-105'
                  }`}
                  title="View Profile Settings & Actions"
                  aria-expanded={dropdownOpen}
                >
                  {isImageUrl ? (
                    <img
                      src={user.image || ''}
                      alt=""
                      referrerPolicy="no-referrer"
                      className="h-full w-full rounded-full object-cover"
                    />
                  ) : user?.image ? (
                    <span className="text-base leading-none select-none">{user.image}</span>
                  ) : (
                    <span className="font-sans text-xs font-semibold text-slate-700 dark:text-zinc-200 uppercase select-none">
                      {user?.name ? user.name.slice(0, 1).toUpperCase() : 'U'}
                    </span>
                  )}
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 py-1.5 shadow-lg ring-1 ring-black/5 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                    <div className="px-3.5 py-1.5 border-b border-slate-100 dark:border-zinc-800 mb-1">
                      <p className="text-[10px] font-medium text-slate-400 dark:text-zinc-500 uppercase tracking-wider font-semibold">Signed in as</p>
                      <p className="text-xs font-medium text-slate-800 dark:text-zinc-200 truncate mt-0.5 leading-tight">{email}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('profile');
                        setDropdownOpen(false);
                      }}
                      className="flex w-full items-center px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800/80 hover:text-slate-900 dark:hover:text-zinc-100 transition-colors cursor-pointer text-left"
                    >
                      <Settings className="mr-2 h-3.5 w-3.5 text-slate-400 dark:text-zinc-500" />
                      <span>Profile Settings</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setDropdownOpen(false);
                        onLogout?.();
                      }}
                      className="flex w-full items-center px-3.5 py-2 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50/50 dark:hover:bg-red-950/25 transition-colors cursor-pointer text-left"
                    >
                      <LogOut className="mr-2 h-3.5 w-3.5 text-red-500 dark:text-red-400" />
                      <span>Log Out</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 2. Mobile Responsive Bottom Tab Bar (Only triggers on screens < 768px, replaces Hamburger menu) */}
      <nav 
        id="mobile-bottom-tabs" 
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white dark:bg-gray-900 dark:border-zinc-800 px-3 pb-safe shadow-[0_-2px_10px_rgba(0,0,0,0.05)]"
      >
        <div className="flex h-16 items-center justify-around">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            if (activeTab === 'landing') return null; // Hide tabs on splash or loading screens

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                id={`mobile-tab-${tab.id}`}
                className="flex flex-col items-center justify-center w-14 h-12 py-1 select-none cursor-pointer focus:outline-none"
                style={{ minHeight: '44px', minWidth: '44px' }} // Touch safe target
              >
                <Icon className={`h-4.5 w-4.5 transition-colors ${
                  isActive ? 'text-green-600' : 'text-slate-400 dark:text-zinc-400'
                }`} />
                <span className={`mt-1 font-sans text-[10px] font-medium tracking-tight transition-colors ${
                  isActive ? 'text-green-600' : 'text-slate-400 dark:text-zinc-400'
                }`}>
                  {tab.label.split(' ')[0]} {/* Keep it simple (e.g. Overview, Habits) */}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
