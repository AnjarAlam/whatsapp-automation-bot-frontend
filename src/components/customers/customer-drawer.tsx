'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, User, Phone, Mail, Tag, Loader2, AlertCircle } from 'lucide-react';
import { customerSchema, CustomerInput } from '../../lib/validators';
import { api } from '../../lib/api';

interface CustomerDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveSuccess: () => void;
  customer?: any | null;
}

export default function CustomerDrawer({ isOpen, onClose, onSaveSuccess, customer }: CustomerDrawerProps) {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CustomerInput>({
    resolver: zodResolver(customerSchema),
  });

  useEffect(() => {
    if (customer) {
      setValue('name', customer.name);
      setValue('mobile', customer.mobile);
      setValue('email', customer.email || '');
      setValue('tags', (customer.tags || []).join(', '));
    } else {
      reset({ name: '', mobile: '', email: '', tags: '' });
    }
    setErrorMsg(null);
  }, [customer, setValue, reset, isOpen]);

  if (!isOpen) return null;

  const onSubmit = async (data: CustomerInput) => {
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      const formattedTags = data.tags
        ? data.tags.split(',').map((t) => t.trim()).filter(Boolean)
        : [];

      const payload = {
        name: data.name,
        mobile: data.mobile,
        email: data.email || undefined,
        tags: formattedTags,
      };

      if (customer) {
        await api.patch(`/customers/${customer._id}`, payload);
      } else {
        await api.post('/customers', payload);
      }
      onSaveSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to save customer');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-50/60 backdrop-blur-sm" onClick={onClose} />

      {/* Slide drawer panel */}
      <div className="relative w-full max-w-md bg-white dark:bg-white border-l border-slate-200 dark:border-slate-200 h-full shadow-2xl flex flex-col justify-between z-10 animate-slide-in">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-900">
              {customer ? 'Edit Customer Info' : 'New Customer Contact'}
            </h3>
            <p className="text-xs text-slate-400">Specify details for WhatsApp automations</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 p-6 space-y-5 overflow-y-auto">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form id="drawerForm" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-700">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                 <input
                  {...register('name')}
                  type="text"
                  placeholder="John Doe"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-50 border border-slate-200 dark:border-slate-200 rounded-xl text-xs text-slate-900 dark:text-slate-900 focus:outline-none focus:border-primary transition-colors"
                />
              </div>
              {errors.name && <p className="text-[10px] text-rose-400">{errors.name.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-700">Mobile Number</label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  {...register('mobile')}
                  type="text"
                  placeholder="+1234567890"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-50 border border-slate-200 dark:border-slate-200 rounded-xl text-xs text-slate-900 dark:text-slate-900 focus:outline-none focus:border-primary transition-colors"
                />
              </div>
              {errors.mobile && <p className="text-[10px] text-rose-400">{errors.mobile.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-700">Email Address (Optional)</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  {...register('email')}
                  type="email"
                  placeholder="john@example.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-50 border border-slate-200 dark:border-slate-200 rounded-xl text-xs text-slate-900 dark:text-slate-900 focus:outline-none focus:border-primary transition-colors"
                />
              </div>
              {errors.email && <p className="text-[10px] text-rose-400">{errors.email.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-700">Tags (comma separated)</label>
              <div className="relative">
                <Tag className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  {...register('tags')}
                  type="text"
                  placeholder="VIP, Regular, Premium"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-50 border border-slate-200 dark:border-slate-200 rounded-xl text-xs text-slate-900 dark:text-slate-900 focus:outline-none focus:border-primary transition-colors"
                />
              </div>
              <p className="text-[10px] text-slate-400">Helps group customers for targeted campaign building.</p>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 dark:border-slate-200 flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 px-4 bg-slate-100 dark:bg-slate-100 hover:bg-slate-200 dark:hover:bg-slate-200 font-semibold text-slate-600 dark:text-slate-800 text-xs rounded-xl transition-all text-center"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="drawerForm"
            disabled={isSubmitting}
            className="flex-1 py-2.5 px-4 bg-primary hover:bg-primary-hover font-semibold text-slate-900 text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-md shadow-primary/20 disabled:opacity-50"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <span>Save Contact</span>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
