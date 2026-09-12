'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../store/use-auth-store';
import { Loader2 } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const { accessToken, user, isInitialized, fetchProfile } = useAuthStore();

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    if (isInitialized) {
      if (accessToken || user) {
        router.push('/dashboard');
      } else {
        router.push('/login');
      }
    }
  }, [isInitialized, accessToken, user, router]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-slate-400 space-y-3">
      <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      <p className="text-xs font-medium">Redirecting to WhatsApp Automation Platform...</p>
    </div>
  );
}
