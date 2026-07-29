'use client';

import React, { useEffect, useState } from 'react';
import { useWhatsAppStore } from '../../store/use-whatsapp-store';
import { useAuthStore } from '../../store/use-auth-store';
import { useDashboardStore } from '../../store/use-dashboard-store';
import { useThemeStore } from '../../store/use-theme-store';
import {
  Bell,
  Search,
  ChevronDown,
  Building,
  User,
  LogOut,
  Settings,
  Wifi,
  WifiOff,
  RefreshCw,
  Check,
  Bot,
  Sun,
  Moon
} from 'lucide-react';

export function Header() {
  const { status, connectedNumber, fetchStatus } = useWhatsAppStore();
  const { user, logout, toggleBotActive } = useAuthStore();
  const { searchQuery, setSearchQuery, setActiveTab } = useDashboardStore();
  const { theme, toggleTheme } = useThemeStore();

  const [showNotificationMenu, setShowNotificationMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const notifications = [
    { id: 1, text: 'Campaign "Summer VIP Offer" finished sending.', time: '5m ago', type: 'success' },
    { id: 2, text: 'WhatsApp Session successfully connected.', time: '1h ago', type: 'info' },
    { id: 3, text: 'Failed to deliver message to +15550199 (Invalid format).', time: '3h ago', type: 'warning' },
  ];

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(() => fetchStatus(), 15000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  const closeAllMenus = () => {
    setShowNotificationMenu(false);
    setShowProfileMenu(false);
  };

  return (
    <header className="h-14 border-b border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md sticky top-0 z-30 px-4 flex items-center justify-between gap-4">
      {/* Theme & Bot Active Toggle */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-primary-light flex items-center justify-center text-primary border border-primary/20 transition-all">
          <Bot className="w-4.5 h-4.5" />
        </div>

        {/* Bot Toggle switch */}
        <button
          onClick={() => toggleBotActive()}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all shadow-sm ${
            user?.isBotActive !== false
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20'
              : 'bg-slate-100 dark:bg-slate-900 border-slate-250 dark:border-slate-800 text-slate-500 hover:bg-slate-150 dark:hover:bg-slate-850'
          }`}
          title={user?.isBotActive !== false ? 'Bot is active. Click to pause.' : 'Bot is paused. Click to activate.'}
        >
          <span className="relative flex h-2 w-2">
            {user?.isBotActive !== false ? (
              <>
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </>
            ) : (
              <span className="relative inline-flex rounded-full h-2 w-2 bg-slate-400"></span>
            )}
          </span>
          <span>{user?.isBotActive !== false ? 'Bot Active' : 'Bot Paused'}</span>
        </button>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-250 dark:border-slate-850 hover:bg-slate-100 dark:hover:bg-slate-850 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors"
          title="Toggle Theme"
        >
          {theme === 'dark' ? (
            <Sun className="w-3.5 h-3.5 text-amber-500" />
          ) : (
            <Moon className="w-3.5 h-3.5 text-indigo-550 dark:text-indigo-400" />
          )}
        </button>
      </div>


      {/* Global Search Bar */}
      <div className="flex-1 max-w-md relative hidden md:block">
        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Global filter (search campaigns, contacts, templates...)"
          className="w-full pl-9 pr-4 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-550 focus:outline-none focus:border-primary/50 transition-colors"
        />
      </div>

      {/* Action Control Badges & Menus */}
      <div className="flex items-center gap-3 shrink-0">
        {/* WhatsApp Session Pill */}
        <button
          onClick={() => setActiveTab('settings')}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 hover:border-primary/30 text-slate-700 dark:text-slate-300 transition-colors"
        >
          {status === 'CONNECTED' ? (
            <>
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary"></span>
              </span>
              <span className="text-primary font-mono text-[10px]">Connected</span>
            </>
          ) : status === 'CONNECTING' || status === 'QR_READY' ? (
            <>
              <RefreshCw className="w-3 h-3 text-amber-500 animate-spin" />
              <span className="text-amber-500 text-[10px]">Setup QR</span>
            </>
          ) : (
            <>
              <WifiOff className="w-3 h-3 text-slate-450 dark:text-slate-550" />
              <span className="text-slate-500 dark:text-slate-400 text-[10px]">Offline</span>
            </>
          )}
        </button>

        {/* Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => { closeAllMenus(); setShowNotificationMenu(!showNotificationMenu); }}
            className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-primary rounded-full" />
          </button>

          {showNotificationMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={closeAllMenus} />
              <div className="absolute right-0 top-10 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2 shadow-2xl z-20 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="flex justify-between items-center px-2 py-1.5 border-b border-slate-250 dark:border-slate-800 mb-1">
                  <span className="text-[10px] font-bold text-slate-550 dark:text-slate-400 uppercase tracking-wider">Alert Notifications</span>
                  <button onClick={() => setActiveTab('queue')} className="text-[9px] text-primary hover:underline">View Queue logs</button>
                </div>
                <div className="space-y-1">
                  {notifications.map((n) => (
                    <div key={n.id} className="p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-950/40 text-left space-y-0.5">
                      <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-tight">{n.text}</p>
                      <span className="text-[9px] text-slate-500 dark:text-slate-500 block">{n.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* User Profile Droplist */}
        <div className="relative">
          <button
            onClick={() => { closeAllMenus(); setShowProfileMenu(!showProfileMenu); }}
            className="flex items-center gap-1.5 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors text-left"
          >
            <div className="w-6.5 h-6.5 rounded-full bg-primary-light text-primary font-bold flex items-center justify-center text-[10px] border border-primary/20 transition-colors">
              {user?.fullName ? user.fullName[0].toUpperCase() : 'A'}
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
          </button>


          {showProfileMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={closeAllMenus} />
              <div className="absolute right-0 top-10 w-56 bg-slate-900 border border-slate-800 rounded-xl p-1.5 shadow-2xl z-20 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-2.5 py-2 border-b border-slate-800 mb-1 text-slate-200">
                  <p className="text-xs font-bold truncate text-white">{user?.fullName || 'Business Owner'}</p>
                  <p className="text-[10px] text-slate-400 truncate mt-0.5">{user?.email || 'owner@autowhatsapp.com'}</p>
                </div>

                <button
                  onClick={() => {
                    setActiveTab('settings');
                    setShowProfileMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-slate-300 hover:text-white hover:bg-slate-800 transition-colors text-left"
                >
                  <Settings className="w-3.5 h-3.5 text-slate-400" />
                  <span>Configure Settings</span>
                </button>

                <button
                  onClick={() => logout()}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors text-left"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-500" />
                  <span>Sign Out Account</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

