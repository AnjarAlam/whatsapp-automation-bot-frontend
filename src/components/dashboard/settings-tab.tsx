'use client';

import React, { useEffect, useState } from 'react';
import { useWhatsAppStore } from '../../store/use-whatsapp-store';
import { useAuthStore } from '../../store/use-auth-store';
import { useThemeStore, AccentColor } from '../../store/use-theme-store';
import {
  Settings,
  QrCode,
  Wifi,
  WifiOff,
  RefreshCw,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  ShieldCheck,
  Save,
  Building,
  Key,
  ShieldAlert,
  Sun,
  Moon,
  Palette,
  Check,
  Send
} from 'lucide-react';
import { api } from '../../lib/api';

export function SettingsTab() {
  const { status, connectedNumber, qrCode, isLoading, connect, disconnect, fetchStatus } =
    useWhatsAppStore();
  const { user } = useAuthStore();
  const { theme, setTheme, accentColor, setAccentColor } = useThemeStore();

  // Mock workspace settings
  const [businessName, setBusinessName] = useState(user?.businessName || 'AutoWhatsApp Hub');
  const [rateLimit, setRateLimit] = useState('5');
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Manual Dispatch State
  const [manualPhone, setManualPhone] = useState('');
  const [manualMessage, setManualMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const handleSaveSettings = () => {
    setIsSavingSettings(true);
    setTimeout(() => {
      setIsSavingSettings(false);
      alert('Workspace preferences saved successfully.');
    }, 800);
  };

  const handleResetSession = async () => {
    try {
      await disconnect();
      // Introduce a delay to allow wwebjs cache files to be deleted by the OS filesystem
      await new Promise((resolve) => setTimeout(resolve, 500));
      await connect();
    } catch (err) {
      console.error('Failed to reset session:', err);
    }
  };

  const handleManualSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualPhone.trim() || !manualMessage.trim()) {
      alert('Please enter both phone number and message.');
      return;
    }
    
    setIsSending(true);
    try {
      await api.post('/whatsapp/send', {
        mobile: manualPhone.trim(),
        message: manualMessage.trim(),
      });
      alert('Message sent successfully!');
      setManualMessage('');
    } catch (err: any) {
      console.error('Manual send error:', err);
      alert(err.response?.data?.message || 'Failed to send message. Is WhatsApp connected?');
    } finally {
      setIsSending(false);
    }
  };

  const colorsList: { name: AccentColor; hex: string; label: string }[] = [
    { name: 'green', hex: '#10b981', label: 'Emerald Green' },
    { name: 'blue', hex: '#3b82f6', label: 'Royal Blue' },
    { name: 'purple', hex: '#8b5cf6', label: 'Deep Purple' },
    { name: 'orange', hex: '#f97316', label: 'Vibrant Orange' },
    { name: 'red', hex: '#ef4444', label: 'Crimson Red' },
  ];

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* Title */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-900 flex items-center gap-2">
          <Settings className="w-5 h-5 text-primary" />
          <span>Device Settings & Preferences</span>
        </h1>
        <p className="text-[11px] text-slate-400 dark:text-slate-400 mt-0.5">Authorise WhatsApp linked sessions and tweak message dispatch parameters</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Column: QR Code scanning */}
        <div className="lg:col-span-2 bg-white dark:bg-white border border-slate-200 dark:border-slate-200 rounded-xl p-4 flex flex-col justify-between space-y-4 shadow transition-colors">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-200 pb-2">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <QrCode className="w-4 h-4 text-primary" />
              <span>Session Authorization QR</span>
            </span>
            
            <button
              onClick={() => fetchStatus()}
              disabled={isLoading}
              title="Sync Status"
              className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-100 text-slate-400 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-900 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="flex flex-col items-center justify-center py-6 text-center">
            {status === 'CONNECTED' ? (
              <div className="space-y-3">
                <div className="w-16 h-16 rounded-full bg-primary-light text-primary border border-primary/20 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-900">WhatsApp Client Connected</h3>
                  <p className="text-[11px] text-slate-400 dark:text-slate-400 mt-1">
                    Active Phone Session: <span className="font-mono font-bold text-primary">+{connectedNumber}</span>
                  </p>
                </div>
              </div>
            ) : qrCode ? (
              <div className="space-y-3">
                <div className="p-2.5 bg-white rounded-xl border border-slate-200 shadow inline-block">
                  {/* eslint-disable-next-html-loader */}
                  <img
                    src={qrCode}
                    alt="WhatsApp Web QR Code"
                    className="w-48 h-48 object-contain rounded-lg"
                  />
                </div>
                <p className="text-[11px] text-amber-500 dark:text-amber-400 font-bold animate-pulse">
                  Scan this QR code using linked devices menu on WhatsApp mobile app.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5 py-6 text-slate-400 dark:text-slate-400">
                <Smartphone className="w-12 h-12 mx-auto text-slate-350 dark:text-slate-700" />
                <p className="text-[11px]">No active authorization session created. Start session below.</p>
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-slate-200 dark:border-slate-200 flex gap-2">
            {status !== 'CONNECTED' ? (
              <>
                <button
                  onClick={() => connect()}
                  disabled={isLoading}
                  className="flex-1 py-2 bg-primary hover:bg-primary-hover font-bold text-slate-900 text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow disabled:opacity-50"
                >
                  {isLoading ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-slate-900" />
                  ) : (
                    <>
                      <Wifi className="w-3.5 h-3.5 text-slate-900" />
                      <span>{qrCode ? 'Refresh QR Session' : 'Authorise Session QR'}</span>
                    </>
                  )}
                </button>
                {(qrCode || status === 'CONNECTING' || status === 'QR_READY') && (
                  <button
                    onClick={handleResetSession}
                    disabled={isLoading}
                    className="py-2 px-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                    title="Force reset and clear cache to scan new device immediately"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                    <span>Reset & Re-Scan</span>
                  </button>
                )}
              </>
            ) : (
              <button
                onClick={() => disconnect()}
                disabled={isLoading}
                className="w-full py-2 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-450 hover:bg-rose-500/20 font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {isLoading ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <>
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Disconnect Linked Session</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Connection Guide */}
        <div className="bg-white dark:bg-white border border-slate-200 dark:border-slate-200 rounded-xl p-4 shadow space-y-3 transition-colors">
          <h3 className="text-xs font-bold text-slate-800 dark:text-slate-800 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-primary" />
            <span>Connection Steps</span>
          </h3>

          <ul className="space-y-3.5 text-[11px] text-slate-600 dark:text-slate-350">
            <li className="flex items-start gap-2">
              <span className="w-4.5 h-4.5 rounded-full bg-slate-100 dark:bg-slate-50 border border-slate-200 dark:border-slate-200 text-[10px] font-bold text-slate-800 dark:text-slate-900 flex items-center justify-center shrink-0">1</span>
              <span>Open WhatsApp App on your phone.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-4.5 h-4.5 rounded-full bg-slate-100 dark:bg-slate-50 border border-slate-200 dark:border-slate-200 text-[10px] font-bold text-slate-800 dark:text-slate-900 flex items-center justify-center shrink-0">2</span>
              <span>Go to <strong>Linked Devices</strong> menu (via Menu or Settings).</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-4.5 h-4.5 rounded-full bg-slate-100 dark:bg-slate-50 border border-slate-200 dark:border-slate-200 text-[10px] font-bold text-slate-800 dark:text-slate-900 flex items-center justify-center shrink-0">3</span>
              <span>Tap <strong>Link a Device</strong> and scan QR box on the left.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-4.5 h-4.5 rounded-full bg-slate-100 dark:bg-slate-50 border border-slate-200 dark:border-slate-200 text-[10px] font-bold text-slate-800 dark:text-slate-900 flex items-center justify-center shrink-0">4</span>
              <span>The platform will authorize & synchronize customer profiles securely.</span>
            </li>
          </ul>

          <div className="p-2.5 bg-slate-50 dark:bg-slate-50/40 border border-slate-200 dark:border-slate-850 rounded-lg text-[10px] text-slate-400 dark:text-slate-450 space-y-1">
            <div className="font-bold text-slate-700 dark:text-slate-700 flex items-center gap-1">
              <AlertCircle className="w-3 h-3 text-primary" /> WhatsApp Rate Limiter
            </div>
            <p>We automatically add queue dispatch delays to align with WhatsApp terms. Adjust queue delays in preference configs below.</p>
          </div>
        </div>
      </div>

      {/* Grid for settings panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left Column: Preferences */}
        <div className="bg-white dark:bg-white border border-slate-200 dark:border-slate-200 rounded-xl p-4 shadow space-y-4 transition-colors">
          <h3 className="text-xs font-bold text-slate-800 dark:text-slate-800 border-b border-slate-200 dark:border-slate-200 pb-2 flex items-center gap-1.5">
            <Building className="w-4 h-4 text-slate-400 dark:text-slate-400" />
            <span>Workspace Preferences</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-550 dark:text-slate-400 uppercase tracking-wider block">Business / Org Title</label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-50 border border-slate-200 dark:border-slate-200 rounded-lg text-xs text-slate-900 dark:text-slate-900 focus:outline-none focus:border-primary/50 transition-colors"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-550 dark:text-slate-400 uppercase tracking-wider block">Message Dispatch delay (seconds)</label>
              <input
                type="number"
                value={rateLimit}
                onChange={(e) => setRateLimit(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-50 border border-slate-200 dark:border-slate-200 rounded-lg text-xs text-slate-900 dark:text-slate-900 focus:outline-none focus:border-primary/50 transition-colors"
              />
              <span className="text-[9px] text-slate-400 dark:text-slate-450">Suggested: 4-6 seconds delay range to lower spam scoring flags.</span>
            </div>
          </div>

          <div className="flex justify-end pt-2 border-t border-slate-200 dark:border-slate-200">
            <button
              onClick={handleSaveSettings}
              disabled={isSavingSettings}
              className="px-4 py-1.5 bg-primary text-slate-900 font-bold text-xs rounded-lg hover:bg-primary-hover transition-all flex items-center gap-1 shadow"
            >
              {isSavingSettings ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Workspace Preference</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Left Column Bottom: Manual Dispatch */}
        <div className="bg-white dark:bg-white border border-slate-200 dark:border-slate-200 rounded-xl p-4 shadow space-y-4 transition-colors">
          <h3 className="text-xs font-bold text-slate-800 dark:text-slate-800 border-b border-slate-200 dark:border-slate-200 pb-2 flex items-center gap-1.5">
            <Send className="w-4 h-4 text-primary" />
            <span>Manual Message Dispatch</span>
          </h3>
          <p className="text-[11px] text-slate-400 dark:text-slate-450">Quickly send a direct message to any number to test your WhatsApp connection.</p>
          
          <form onSubmit={handleManualSend} className="space-y-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-550 dark:text-slate-400 uppercase tracking-wider block">Phone Number (with country code)</label>
              <input
                type="text"
                placeholder="e.g. 919876543210"
                value={manualPhone}
                onChange={(e) => setManualPhone(e.target.value)}
                disabled={status !== 'CONNECTED'}
                className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-50 border border-slate-200 dark:border-slate-200 rounded-lg text-xs text-slate-900 dark:text-slate-900 focus:outline-none focus:border-primary/50 transition-colors disabled:opacity-50"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-550 dark:text-slate-400 uppercase tracking-wider block">Message text</label>
              <textarea
                placeholder="Type your message here..."
                value={manualMessage}
                onChange={(e) => setManualMessage(e.target.value)}
                disabled={status !== 'CONNECTED'}
                rows={3}
                className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-50 border border-slate-200 dark:border-slate-200 rounded-lg text-xs text-slate-900 dark:text-slate-900 focus:outline-none focus:border-primary/50 transition-colors disabled:opacity-50 resize-none"
              />
            </div>
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isSending || status !== 'CONNECTED' || !manualPhone || !manualMessage}
                className="px-4 py-1.5 bg-slate-900 dark:bg-primary hover:bg-slate-800 dark:hover:bg-primary-hover text-white dark:text-slate-900 font-bold text-xs rounded-lg transition-all flex items-center gap-1.5 shadow disabled:opacity-50"
              >
                {isSending ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <>
                    <Send className="w-3 h-3" />
                    <span>Send Message</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Complete Theme Settings Customizer Panel */}
        <div className="bg-white dark:bg-white border border-slate-200 dark:border-slate-200 rounded-xl p-4 shadow space-y-4 transition-colors">
          <h3 className="text-xs font-bold text-slate-800 dark:text-slate-800 border-b border-slate-200 dark:border-slate-200 pb-2 flex items-center gap-1.5">
            <Palette className="w-4 h-4 text-primary" />
            <span>Theme & Accent Customization</span>
          </h3>

          {/* Theme Switcher Toggle */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-550 dark:text-slate-400 uppercase tracking-wider block">Mode Toggle</label>
            <div className="grid grid-cols-2 gap-2 max-w-sm">
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`flex items-center justify-center gap-2 px-4 py-2 border rounded-lg text-xs font-bold transition-all ${
                  theme === 'light'
                    ? 'bg-slate-100 border-slate-350 text-slate-900 dark:bg-slate-100'
                    : 'bg-transparent border-slate-200 dark:border-slate-200 text-slate-400 hover:text-slate-900 dark:hover:text-slate-900'
                }`}
              >
                <Sun className="w-4 h-4 text-amber-500" />
                <span>Light Theme</span>
              </button>
              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`flex items-center justify-center gap-2 px-4 py-2 border rounded-lg text-xs font-bold transition-all ${
                  theme === 'dark'
                    ? 'bg-slate-100 dark:bg-slate-100 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-900'
                    : 'bg-transparent border-slate-200 dark:border-slate-200 text-slate-400 hover:text-slate-900 dark:hover:text-slate-900'
                }`}
              >
                <Moon className="w-4 h-4 text-indigo-500" />
                <span>Dark Theme</span>
              </button>
            </div>
          </div>

          {/* Accent Color Chooser */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-550 dark:text-slate-400 uppercase tracking-wider block">Select Dashboard Accent Color</label>
            <div className="flex flex-wrap gap-3">
              {colorsList.map((col) => {
                const isSelected = accentColor === col.name;
                return (
                  <button
                    key={col.name}
                    type="button"
                    onClick={() => setAccentColor(col.name)}
                    className={`relative w-8 h-8 rounded-full border transition-all ${
                      isSelected
                        ? 'border-slate-900 dark:border-white scale-110 shadow-lg'
                        : 'border-transparent opacity-80 hover:opacity-100 hover:scale-105'
                    }`}
                    style={{ backgroundColor: col.hex }}
                    title={col.label}
                  >
                    {isSelected && (
                      <Check className="w-4 h-4 text-slate-900 absolute inset-0 m-auto font-black stroke-[3.5]" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dynamic Theme Preview Block */}
          <div className="p-3 bg-slate-50 dark:bg-slate-50 border border-slate-200 dark:border-slate-850 rounded-xl space-y-2">
            <span className="text-[9px] font-bold text-slate-450 uppercase tracking-wider block">Live UI Component Preview</span>
            <div className="grid grid-cols-3 gap-2">
              <div className="border border-slate-200 dark:border-slate-200 bg-white dark:bg-white p-2 rounded-lg flex flex-col justify-between h-20 shadow-sm transition-colors">
                <span className="text-[9px] text-slate-400 block uppercase font-bold">Active Tab</span>
                <div className="bg-primary-light text-primary px-2 py-0.5 rounded text-[10px] font-bold text-center border border-primary/20">
                  Dashboard
                </div>
              </div>
              <div className="border border-slate-200 dark:border-slate-200 bg-white dark:bg-white p-2 rounded-lg flex flex-col justify-between h-20 shadow-sm transition-colors">
                <span className="text-[9px] text-slate-400 block uppercase font-bold">Actions</span>
                <button className="bg-primary text-slate-900 font-bold rounded text-[10px] py-1 text-center shadow hover:bg-primary-hover transition-colors">
                  Button
                </button>
              </div>
              <div className="border border-slate-200 dark:border-slate-200 bg-white dark:bg-white p-2 rounded-lg flex flex-col justify-between h-20 shadow-sm transition-colors">
                <span className="text-[9px] text-slate-400 block uppercase font-bold">Data Metrics</span>
                <div className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-primary" />
                  <span>98%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
