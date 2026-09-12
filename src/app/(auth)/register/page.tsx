'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Bot, Lock, Mail, User, Building, Phone, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { registerSchema, RegisterInput } from '../../../lib/validators';
import { useAuthStore } from '../../../store/use-auth-store';
import { api } from '../../../lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const [mobileParam, setMobileParam] = useState<string | null>(null);
  const [tempSessionIdParam, setTempSessionIdParam] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const m = params.get('mobile');
    const t = params.get('tempSessionId');
    if (m) {
      setMobileParam(m);
      setValue('mobile', m);
    }
    if (t) {
      setTempSessionIdParam(t);
    }
  }, [setValue]);

  const onSubmit = async (data: RegisterInput) => {
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      const res = await api.post('/auth/register', {
        fullName: data.fullName,
        businessName: data.businessName,
        email: data.email,
        mobile: data.mobile,
        password: data.password,
        tempSessionId: tempSessionIdParam || undefined,
      });
      login(res.data.tokens, res.data.user);
      router.push('/dashboard');
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 py-8">
      <div className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl p-8 shadow-2xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 items-center justify-center text-white font-bold shadow-lg shadow-emerald-500/20 mb-1">
            <Bot className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Create Business Account</h1>
          <p className="text-sm text-slate-400">Automate your WhatsApp customer support & marketing</p>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  {...register('fullName')}
                  type="text"
                  placeholder="John Doe"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
              {errors.fullName && (
                <p className="text-[11px] text-rose-400">{errors.fullName.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Business Name</label>
              <div className="relative">
                <Building className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  {...register('businessName')}
                  type="text"
                  placeholder="ABC Grocery"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
              {errors.businessName && (
                <p className="text-[11px] text-rose-400">{errors.businessName.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  {...register('email')}
                  type="email"
                  placeholder="john@example.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
              {errors.email && (
                <p className="text-[11px] text-rose-400">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Mobile Number</label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  {...register('mobile')}
                  type="text"
                  readOnly={!!mobileParam}
                  placeholder="+1234567890"
                  className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors ${mobileParam ? 'opacity-70 cursor-not-allowed' : ''}`}
                />
              </div>
              {errors.mobile && (
                <p className="text-[11px] text-rose-400">{errors.mobile.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Password</label>
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

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Confirm Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  {...register('confirmPassword')}
                  type="password"
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-[11px] text-rose-400">{errors.confirmPassword.message}</p>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 px-4 bg-emerald-500 hover:bg-emerald-600 font-semibold text-white text-sm rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 disabled:opacity-50 mt-2"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Register Business</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center text-xs text-slate-400 pt-2 border-t border-slate-200/80">
          Already registered?{' '}
          <Link href="/login" className="text-emerald-400 font-semibold hover:underline">
            Log In here
          </Link>
        </div>
      </div>
    </div>
  );
}
