'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Bot, Lock, Mail, ArrowRight, Loader2, AlertCircle, QrCode } from 'lucide-react';
import { loginSchema, LoginInput } from '../../../lib/validators';
import { useAuthStore } from '../../../store/use-auth-store';
import { api } from '../../../lib/api';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginMethod, setLoginMethod] = useState<'qr' | 'email'>('qr');
  
  // QR Login State
  const [tempSessionId, setTempSessionId] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [qrStatus, setQrStatus] = useState<string>('CONNECTING');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    let interval: NodeJS.Timeout;

    const initQrLogin = async () => {
      try {
        const res = await api.get('/auth/whatsapp-login-init');
        setTempSessionId(res.data.tempSessionId);
      } catch (err) {
        console.error('Failed to init QR login', err);
        setErrorMsg('Failed to initialize WhatsApp login. Please use email.');
        setLoginMethod('email');
      }
    };

    let isFlowContinuing = false;

    if (loginMethod === 'qr' && !tempSessionId) {
      initQrLogin();
    }

    if (loginMethod === 'qr' && tempSessionId) {
      interval = setInterval(async () => {
        try {
          const res = await api.get(`/auth/whatsapp-login-status/${tempSessionId}`);
          
          if (res.data.status === 'success') {
            clearInterval(interval);
            isFlowContinuing = true;
            login(res.data.tokens, res.data.user);
            router.push('/dashboard');
          } else if (res.data.status === 'requires_registration') {
            clearInterval(interval);
            isFlowContinuing = true;
            router.push(`/register?mobile=${encodeURIComponent(res.data.phoneNumber)}&tempSessionId=${tempSessionId}`);
          } else {
            setQrStatus(res.data.status);
            if (res.data.qrCode) {
              setQrCode(res.data.qrCode);
            }
          }
        } catch (err) {
          console.error('Polling error', err);
        }
      }, 2000);
    }

    return () => {
      if (interval) clearInterval(interval);
      // Only cancel the session if the user manually switched away or closed the page,
      // not if they successfully logged in or are continuing to registration.
      if (tempSessionId && !isFlowContinuing) {
        api.post(`/auth/whatsapp-login-cancel/${tempSessionId}`).catch(() => {});
      }
    };
  }, [loginMethod, tempSessionId, router, login]);

  const onSubmit = async (data: LoginInput) => {
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      const res = await api.post('/auth/login', data);
      login(res.data.tokens, res.data.user);
      router.push('/dashboard');
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-8 shadow-2xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 items-center justify-center text-white font-bold shadow-lg shadow-emerald-500/20 mb-2">
            <Bot className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Welcome Back</h1>
          <p className="text-sm text-slate-400">Log in to your WhatsApp Automation Dashboard</p>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {loginMethod === 'qr' ? (
          <div className="space-y-6">
            <div className="flex flex-col items-center justify-center space-y-4 bg-slate-50/50 p-6 rounded-xl border border-slate-200/50">
              <div className="text-center space-y-1">
                <h3 className="font-semibold text-slate-800">Login with WhatsApp</h3>
                <p className="text-xs text-slate-400">Scan this QR code with your WhatsApp to instantly login.</p>
              </div>
              
              <div className="w-48 h-48 bg-white rounded-xl p-2 flex items-center justify-center">
                {qrCode ? (
                  <img src={qrCode} alt="WhatsApp QR Code" className="w-full h-full object-contain" />
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-400 space-y-2">
                    <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                    <span className="text-xs font-medium uppercase tracking-wider">{qrStatus}</span>
                  </div>
                )}
              </div>
            </div>
            
            <button
              type="button"
              onClick={() => setLoginMethod('email')}
              className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm rounded-xl transition-all"
            >
              Use Email & Password Instead
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Email or Mobile</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    {...register('emailOrMobile')}
                    type="text"
                    placeholder="john@example.com or +123456789"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
                {errors.emailOrMobile && (
                  <p className="text-[11px] text-rose-400">{errors.emailOrMobile.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700">Password</label>
                  <Link
                    href="/forgot-password"
                    className="text-xs text-emerald-400 hover:underline font-medium"
                  >
                    Forgot?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    {...register('password')}
                    type="password"
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
                {errors.password && (
                  <p className="text-[11px] text-rose-400">{errors.password.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 bg-emerald-500 hover:bg-emerald-600 font-semibold text-white text-sm rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>Log In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
            
            <button
              type="button"
              onClick={() => setLoginMethod('qr')}
              className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <QrCode className="w-4 h-4" />
              <span>Login with WhatsApp QR</span>
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-xs text-slate-400 pt-2 border-t border-slate-200/80">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-emerald-400 font-semibold hover:underline">
            Register Business
          </Link>
        </div>
      </div>
    </div>
  );
}
