'use client';

import React from 'react';
import { useAuthStore } from '../../../store/use-auth-store';
import { useWhatsAppStore } from '../../../store/use-whatsapp-store';
import { useThemeStore } from '../../../store/use-theme-store';
import {
  Settings as SettingsIcon,
  User,
  Building,
  Mail,
  Phone,
  QrCode,
  Moon,
  Sun,
  LogOut,
  ShieldCheck,
} from 'lucide-react';

export default function SettingsPage() {
  const { user, logout } = useAuthStore();
  const { status, connectedNumber, disconnect } = useWhatsAppStore();
  const { theme, setTheme } = useThemeStore();

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
          <SettingsIcon className="w-7 h-7 text-emerald-500" />
          <span>Platform & Business Settings</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Manage your business account profile, WhatsApp integration preferences & theme appearance
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Business Profile Information Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <User className="w-4 h-4 text-emerald-500" />
            <span>Business Profile Details</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-slate-400">Full Name</span>
              <p className="font-semibold text-slate-900 dark:text-white mt-0.5">{user?.fullName || 'N/A'}</p>
            </div>

            <div>
              <span className="text-slate-400">Business Name</span>
              <p className="font-semibold text-slate-900 dark:text-white mt-0.5">{user?.businessName || 'N/A'}</p>
            </div>

            <div>
              <span className="text-slate-400">Registered Email</span>
              <p className="font-semibold text-slate-900 dark:text-white mt-0.5">{user?.email || 'N/A'}</p>
            </div>

            <div>
              <span className="text-slate-400">Mobile Phone</span>
              <p className="font-semibold text-slate-900 dark:text-white mt-0.5">{user?.mobile || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* WhatsApp Integration Settings Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <QrCode className="w-4 h-4 text-emerald-500" />
            <span>WhatsApp Session Settings</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-slate-400">Connection Status</span>
              <p className="font-bold text-emerald-500 mt-0.5">{status}</p>
            </div>

            <div>
              <span className="text-slate-400">Connected Phone Number</span>
              <p className="font-mono text-slate-900 dark:text-white mt-0.5">
                {connectedNumber ? `+${connectedNumber}` : 'Not Connected'}
              </p>
            </div>

            <div className="pt-2">
              <button
                onClick={() => disconnect()}
                className="py-2 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-semibold border border-rose-500/20 text-xs flex items-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Disconnect WhatsApp Account</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Theme & Appearance Options */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Theme & Interface Preferences</span>
        </h3>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setTheme('light')}
            className={`py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center gap-2 border transition-all ${
              theme === 'light'
                ? 'bg-emerald-500 text-slate-950 border-emerald-500 shadow-md'
                : 'border-slate-200 dark:border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Sun className="w-4 h-4" />
            <span>Light Theme</span>
          </button>

          <button
            onClick={() => setTheme('dark')}
            className={`py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center gap-2 border transition-all ${
              theme === 'dark'
                ? 'bg-emerald-500 text-slate-950 border-emerald-500 shadow-md'
                : 'border-slate-200 dark:border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Moon className="w-4 h-4" />
            <span>Dark Theme (Default)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
