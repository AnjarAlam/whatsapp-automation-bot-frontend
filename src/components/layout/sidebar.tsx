'use client';

import React from 'react';
import { cn } from '../../lib/utils';
import { useDashboardStore, DashboardTab } from '../../store/use-dashboard-store';
import { useAuthStore } from '../../store/use-auth-store';
import {
  LayoutDashboard,
  Megaphone,
  Users,
  FileText,
  Send,
  BarChart3,
  Activity,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Bot,
  ShoppingCart
} from 'lucide-react';

export function Sidebar() {
  const { activeTab, setActiveTab, sidebarCollapsed, toggleSidebar } = useDashboardStore();
  const { user, logout } = useAuthStore();

  const navItems = [
    { label: 'Dashboard', id: 'dashboard' as DashboardTab, icon: LayoutDashboard },
    { label: 'Campaigns', id: 'campaigns' as DashboardTab, icon: Megaphone },
    { label: 'Customers & CRM', id: 'customers' as DashboardTab, icon: Users },
    { label: 'Auto-Reply Bot', id: 'flows' as DashboardTab, icon: Bot },
    { label: 'Orders & POS', id: 'orders' as DashboardTab, icon: ShoppingCart },
    { label: 'Templates', id: 'templates' as DashboardTab, icon: FileText },
    { label: 'Message Sender', id: 'sender' as DashboardTab, icon: Send },
    { label: 'Settings', id: 'settings' as DashboardTab, icon: Settings },
  ];

  return (
    <aside
      className={cn(
        'bg-white dark:bg-white border-r border-slate-200 dark:border-slate-200 flex flex-col h-screen sticky top-0 shrink-0 text-slate-700 dark:text-slate-800 transition-all duration-300 z-40',
        sidebarCollapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* Brand Header */}
      <div className={cn('p-4 border-b border-slate-200 dark:border-slate-200 flex items-center justify-between', sidebarCollapsed && 'justify-center p-3')}>
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-slate-900 font-bold shadow-lg shadow-primary/20 shrink-0 transition-all">
            <Bot className="w-4.5 h-4.5" />
          </div>
          {!sidebarCollapsed && (
            <div className="animate-in fade-in duration-200">
              <h1 className="font-extrabold text-sm tracking-tight text-slate-900 dark:text-slate-900">AutoWhatsApp</h1>
              <p className="text-[10px] text-primary font-medium leading-none">Enterprise SaaS</p>
            </div>
          )}
        </div>

        {!sidebarCollapsed && (
          <button
            onClick={toggleSidebar}
            className="p-1 rounded bg-slate-100 dark:bg-slate-100 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-400 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-900 transition-colors"
            title="Collapse Menu"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {sidebarCollapsed && (
        <div className="flex justify-center py-2 border-b border-slate-200 dark:border-slate-200">
          <button
            onClick={toggleSidebar}
            className="p-1 rounded bg-slate-100 dark:bg-slate-100 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-400 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-900 transition-colors"
            title="Expand Menu"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Navigation List */}
      <div className="flex-1 py-3 px-2.5 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 relative group',
                isActive
                  ? 'bg-primary-light text-primary border border-primary/25 shadow-sm'
                  : 'text-slate-400 dark:text-slate-400 hover:text-white dark:hover:text-slate-800 hover:bg-slate-100 dark:hover:bg-slate-100/40 border border-transparent',
                sidebarCollapsed && 'justify-center px-0'
              )}
              title={sidebarCollapsed ? item.label : undefined}
            >
              <Icon className={cn('w-4 h-4 shrink-0 transition-colors', isActive ? 'text-primary' : 'text-slate-400 dark:text-slate-400')} />
              {!sidebarCollapsed ? (
                <span className="truncate">{item.label}</span>
              ) : (
                <span className="absolute left-14 bg-white dark:bg-white border border-slate-200 dark:border-slate-200 text-slate-900 dark:text-slate-900 text-[10px] px-2 py-1 rounded shadow-xl hidden group-hover:block whitespace-nowrap z-50">
                  {item.label}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Profile & Logout Footer */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-200 bg-slate-50/50 dark:bg-slate-50/40 shrink-0">
        <div className="flex items-center justify-between">
          {!sidebarCollapsed ? (
            <>
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-850 flex items-center justify-center text-xs font-bold text-primary border border-slate-200 dark:border-slate-200 shrink-0">
                  {user?.fullName ? user.fullName[0].toUpperCase() : 'A'}
                </div>
                <div className="truncate">
                  <p className="text-[11px] font-bold text-slate-800 dark:text-slate-900 truncate leading-none">{user?.fullName || 'Admin User'}</p>
                  <p className="text-[9px] text-slate-400 truncate mt-0.5">{user?.businessName || 'Business Owner'}</p>
                </div>
              </div>
              <button
                onClick={() => logout()}
                title="Logout"
                className="p-1.5 rounded-lg text-slate-400 dark:text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </>
          ) : (
            <button
              onClick={() => logout()}
              title="Logout"
              className="w-full py-1 rounded hover:bg-rose-500/10 text-slate-400 dark:text-slate-400 hover:text-rose-500 transition-colors flex items-center justify-center"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
