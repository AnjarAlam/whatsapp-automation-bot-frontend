'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '../../components/layout/sidebar';
import { Header } from '../../components/layout/header';
import { useAuthStore } from '../../store/use-auth-store';
import { useDashboardStore } from '../../store/use-dashboard-store';
import { Loader2 } from 'lucide-react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { useThemeStore } from '../../store/use-theme-store';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { accessToken, user, isInitialized, fetchProfile } = useAuthStore();
  const { sidebarCollapsed } = useDashboardStore();
  const { initTheme } = useThemeStore();

  useEffect(() => {
    initTheme();
  }, [initTheme]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    if (isInitialized && !accessToken && !user) {
      router.push('/login');
    }
  }, [isInitialized, accessToken, user, router]);

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 space-y-3">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-xs font-medium">Initializing WhatsApp Platform Hub...</p>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 selection:bg-primary/30 selection:text-primary transition-colors duration-300">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
          <Header />
          <main className="flex-1 p-4 md:p-5 overflow-y-auto bg-slate-100/30 dark:bg-slate-950/40">{children}</main>
        </div>
      </div>
    </QueryClientProvider>
  );
}


