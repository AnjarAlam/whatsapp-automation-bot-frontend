'use client';

import React, { useEffect, useState } from 'react';
import {
  Megaphone,
  Plus,
  X,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Trash2,
  Eye,
  Loader2,
  Send,
  Building,
  Info,
  CalendarDays,
  FileSpreadsheet,
  Check,
  Upload,
  AlertCircle
} from 'lucide-react';
import { api } from '../../lib/api';
import { formatDate } from '../../lib/utils';
import { useThemeStore } from '../../store/use-theme-store';

export function CampaignsTab() {
  const { theme } = useThemeStore();
  // Campaign Lists & Builders toggling
  const [isCreating, setIsCreating] = useState(false);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form Fields
  const [name, setName] = useState('');
  const [type, setType] = useState('Offer');
  const [message, setMessage] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [buttonText, setButtonText] = useState('');
  const [buttonUrl, setButtonUrl] = useState('');
  const [scheduleOption, setScheduleOption] = useState<'now' | 'later'>('now');
  const [scheduledAt, setScheduledAt] = useState('');

  // Custom Dialog Modal Box
  const [dialogLinkLabel, setDialogLinkLabel] = useState('Shop Now');
  const [dialogLinkUrl, setDialogLinkUrl] = useState('https://example.com/shop?user={{customer_name}}');
  const [dialog, setDialog] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    type: 'alert' | 'confirm' | 'prompt_link';
    onConfirm?: (value?: string) => void;
  }>({
    isOpen: false,
    title: '',
    description: '',
    type: 'alert',
  });

  const showAlert = (title: string, description: string) => {
    setDialog({ isOpen: true, title, description, type: 'alert' });
  };

  const showConfirm = (title: string, description: string, onConfirm: () => void) => {
    setDialog({
      isOpen: true,
      title,
      description,
      type: 'confirm',
      onConfirm: () => {
        onConfirm();
        closeDialog();
      },
    });
  };

  const closeDialog = () => {
    setDialog((prev) => ({ ...prev, isOpen: false }));
  };

  // Audience Target Selection
  const [targetType, setTargetType] = useState<'all' | 'specific' | 'tags'>('all');
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  
  // Search & Filter within checklist
  const [customerSearch, setCustomerSearch] = useState('');
  const [customerStatusFilter, setCustomerStatusFilter] = useState('');
  const [customerTagFilter, setCustomerTagFilter] = useState('');

  // Data refs
  const [allCustomers, setAllCustomers] = useState<any[]>([]);
  const [tagCounts, setTagCounts] = useState<Record<string, number>>({});
  const [isLoadingContacts, setIsLoadingContacts] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (res.data?.url) {
        setImageUrl(res.data.url);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to upload local image.');
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Load Campaigns
  const loadCampaigns = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/campaigns');
      setCampaigns(res.data || []);
    } catch (err) {
      console.error('Failed to load campaigns:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Load Contacts list for target builder
  const loadContacts = async () => {
    setIsLoadingContacts(true);
    try {
      const res = await api.get('/customers', { params: { limit: 5000 } });
      const list = res.data.data || [];
      setAllCustomers(list);

      // Extract unique tags and count totals
      const counts: Record<string, number> = {};
      list.forEach((c: any) => {
        (c.tags || []).forEach((t: string) => {
          counts[t] = (counts[t] || 0) + 1;
        });
      });
      setTagCounts(counts);
    } catch (err) {
      console.error('Failed to fetch targeting list:', err);
    } finally {
      setIsLoadingContacts(false);
    }
  };

  useEffect(() => {
    loadCampaigns();
    loadContacts();
  }, []);

  const executeLaunch = async (id: string) => {
    try {
      await api.post(`/campaigns/${id}/launch`);
      loadCampaigns();
    } catch (err) {
      showAlert('Error', 'Failed to launch campaign broadcast');
    }
  };

  const handleLaunch = (id: string) => {
    showConfirm(
      'Launch Campaign',
      'Launch campaign broadcast now? Messages will be queued immediately.',
      () => executeLaunch(id)
    );
  };

  const executeDelete = async (id: string) => {
    try {
      await api.delete(`/campaigns/${id}`);
      loadCampaigns();
    } catch (err) {
      showAlert('Error', 'Failed to delete campaign');
    }
  };

  const handleDelete = (id: string) => {
    showConfirm(
      'Delete Campaign',
      'Are you sure you want to delete this campaign?',
      () => executeDelete(id)
    );
  };

  const handleSaveCampaign = async (statusOverride?: 'Draft' | 'Scheduled') => {
    if (!name.trim()) return showAlert('Required Field', 'Please specify a campaign name.');
    if (!message.trim()) return showAlert('Required Field', 'Please enter message text.');

    setIsSubmitting(true);
    try {
      const payload = {
        name,
        type,
        message,
        targetType,
        targetCustomers: targetType === 'specific' ? selectedCustomers : [],
        targetTags: targetType === 'tags' ? selectedTags : [],
        scheduledAt: scheduleOption === 'later' && scheduledAt ? new Date(scheduledAt).toISOString() : undefined,
        imageUrl: imageUrl || undefined,
        buttonText: buttonText || undefined,
        buttonUrl: buttonUrl || undefined,
      };

      const res = await api.post('/campaigns', payload);

      // If scheduled immediately, queue it
      if (scheduleOption === 'now' && statusOverride !== 'Draft') {
        await api.post(`/campaigns/${res.data._id}/launch`);
      }

      // Reset Form
      setName('');
      setMessage('');
      setImageUrl('');
      setButtonText('');
      setButtonUrl('');
      setSelectedCustomers([]);
      setSelectedTags([]);
      setScheduledAt('');
      setScheduleOption('now');
      setIsCreating(false);
      loadCampaigns();
    } catch (err) {
      console.error(err);
      showAlert('Error', 'Failed to save or launch campaign.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInsertLink = () => {
    setDialogLinkLabel('Shop Now');
    setDialogLinkUrl('https://example.com/shop?user={{customer_name}}');
    setDialog({
      isOpen: true,
      title: 'Insert Dynamic Hyperlink',
      description: 'Define the label and redirect URL. Placeholders will be replaced automatically.',
      type: 'prompt_link',
    });
  };

  // Filter contacts locally for checklist rendering
  const filteredCustomersForTargeting = allCustomers.filter((c) => {
    const searchMatch =
      c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
      c.mobile.includes(customerSearch);
    const statusMatch =
      !customerStatusFilter ||
      (customerStatusFilter === 'active' && c.totalMessages > 0) ||
      (customerStatusFilter === 'inactive' && c.totalMessages === 0);
    const tagMatch = !customerTagFilter || (c.tags || []).includes(customerTagFilter);
    return searchMatch && statusMatch && tagMatch;
  });

  const handleToggleCustomerSelect = (id: string) => {
    setSelectedCustomers((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAllFiltered = () => {
    const filteredIds = filteredCustomersForTargeting.map((c) => c._id);
    const allSelected = filteredIds.every((id) => selectedCustomers.includes(id));
    if (allSelected) {
      setSelectedCustomers((prev) => prev.filter((id) => !filteredIds.includes(id)));
    } else {
      setSelectedCustomers((prev) => Array.from(new Set([...prev, ...filteredIds])));
    }
  };

  const handleToggleTagSelect = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((x) => x !== tag) : [...prev, tag]
    );
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-300 min-h-[calc(100vh-120px)] flex flex-col">
      {/* Header bar */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-900 flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-primary" />
            <span>Campaign Manager</span>
          </h1>
          <p className="text-[11px] text-slate-400 dark:text-slate-400 mt-0.5">
            Configure bulk WhatsApp alerts and queue marketing schedules via BullMQ
          </p>
        </div>

        <button
          onClick={() => setIsCreating(!isCreating)}
          className="px-3.5 py-1.5 bg-primary hover:bg-primary-hover font-bold text-slate-900 text-xs rounded-lg transition-all flex items-center gap-1.5 shadow"
        >
          {isCreating ? (
            <>
              <X className="w-3.5 h-3.5 text-slate-900" />
              <span>Cancel Campaign</span>
            </>
          ) : (
            <>
              <Plus className="w-3.5 h-3.5 text-slate-900" />
              <span>Create Campaign</span>
            </>
          )}
        </button>
      </div>

      {isCreating ? (
        /* SINGLE PAGE WORKFLOW builder */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1">
          {/* Main setup columns */}
          <div className="lg:col-span-2 bg-white dark:bg-white border border-slate-200 dark:border-slate-200 rounded-xl p-4 shadow-md flex flex-col justify-between space-y-4 transition-colors">
            <div className="space-y-4">
              {/* Row 1 inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-550 dark:text-slate-400 uppercase tracking-wider">Campaign Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="E.g. Festival VIP Promotion"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-50 border border-slate-200 dark:border-slate-805 rounded-lg text-xs text-slate-900 dark:text-slate-100 placeholder-slate-550 focus:outline-none focus:border-primary/50"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-550 dark:text-slate-400 uppercase tracking-wider">Campaign Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-50 border border-slate-200 dark:border-slate-805 rounded-lg text-xs text-slate-700 dark:text-slate-305 focus:outline-none focus:border-primary/50"
                  >
                    <option value="Offer">Offer Campaign</option>
                    <option value="Festival">Festival Campaign</option>
                    <option value="Announcement">Announcement</option>
                    <option value="Reminder">Reminder</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-550 dark:text-slate-400 uppercase tracking-wider">Schedule Option</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setScheduleOption('now')}
                      className={`py-1.5 rounded-lg text-[11px] font-bold border transition-colors ${
                        scheduleOption === 'now'
                          ? 'bg-primary-light border-primary/35 text-primary'
                          : 'bg-slate-50 dark:bg-slate-50 border-slate-200 dark:border-slate-200 text-slate-550 dark:text-slate-400'
                      }`}
                    >
                      Now
                    </button>
                    <button
                      type="button"
                      onClick={() => setScheduleOption('later')}
                      className={`py-1.5 rounded-lg text-[11px] font-bold border transition-colors ${
                        scheduleOption === 'later'
                          ? 'bg-primary-light border-primary/35 text-primary'
                          : 'bg-slate-50 dark:bg-slate-50 border-slate-200 dark:border-slate-200 text-slate-550 dark:text-slate-400'
                      }`}
                    >
                      Schedule
                    </button>
                  </div>
                </div>
              </div>

              {/* Campaign Image URL input */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-550 dark:text-slate-400 uppercase tracking-wider">Campaign Image (Optional)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-example... (Sends image with caption)"
                    className="flex-1 px-3 py-2 bg-slate-55 dark:bg-slate-50 border border-slate-200 dark:border-slate-805 rounded-lg text-xs text-slate-900 dark:text-slate-100 placeholder-slate-500 focus:outline-none focus:border-primary/50"
                  />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    id="campaignImageUploadFile"
                    className="hidden"
                  />
                  <label
                    htmlFor="campaignImageUploadFile"
                    className="px-3 py-2 bg-slate-50 dark:bg-white hover:bg-slate-100 dark:hover:bg-slate-100 border border-slate-250 dark:border-slate-200 rounded-lg text-xs text-slate-700 dark:text-slate-350 cursor-pointer font-bold flex items-center gap-1.5 shrink-0 transition-colors"
                  >
                    {isUploadingImage ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                    ) : (
                      <Upload className="w-3.5 h-3.5 text-primary" />
                    )}
                    <span>{isUploadingImage ? 'Uploading...' : 'Select Local Image'}</span>
                  </label>
                </div>
              </div>

              {/* Schedule time pick */}
              {scheduleOption === 'later' && (
                <div className="p-2.5 bg-slate-50 dark:bg-slate-50/60 border border-slate-200 dark:border-slate-850 rounded-lg flex items-center gap-3 animate-in fade-in duration-200">
                  <CalendarDays className="w-4.5 h-4.5 text-primary shrink-0" />
                  <div className="flex-1 space-y-0.5">
                    <span className="text-[9px] font-bold text-slate-400 dark:text-slate-450 uppercase block">Broadcast Execution Date</span>
                    <input
                      type="datetime-local"
                      value={scheduledAt}
                      onChange={(e) => setScheduledAt(e.target.value)}
                      className="bg-transparent text-xs text-slate-800 dark:text-slate-800 focus:outline-none border-b border-slate-300 dark:border-slate-200 pb-0.5 w-full max-w-[200px]"
                    />
                  </div>
                </div>
              )}

              {/* Message composer */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-slate-550 dark:text-slate-400 uppercase tracking-wider">Alert Message Template Body</label>
                  <div className="flex flex-wrap items-center gap-1.5 max-w-md justify-end">
                    <span className="text-[9px] text-slate-450 mr-0.5">Insert variables:</span>
                    <button
                      type="button"
                      onClick={() => setMessage((m) => m + ' {{customer_name}}')}
                      className="px-2 py-0.5 bg-slate-100 dark:bg-slate-50 hover:bg-slate-200 dark:hover:bg-slate-850 border border-slate-250 dark:border-slate-200 text-[9px] font-mono text-primary rounded transition-colors"
                    >
                      + Name
                    </button>
                    <button
                      type="button"
                      onClick={() => setMessage((m) => m + ' {{business_name}}')}
                      className="px-2 py-0.5 bg-slate-100 dark:bg-slate-50 hover:bg-slate-200 dark:hover:bg-slate-850 border border-slate-250 dark:border-slate-200 text-[9px] font-mono text-primary rounded transition-colors"
                    >
                      + Business
                    </button>
                    <button
                      type="button"
                      onClick={() => setMessage((m) => m + ' {{customer_email}}')}
                      className="px-2 py-0.5 bg-slate-100 dark:bg-slate-50 hover:bg-slate-200 dark:hover:bg-slate-850 border border-slate-250 dark:border-slate-200 text-[9px] font-mono text-primary rounded transition-colors"
                    >
                      + Email
                    </button>
                    <button
                      type="button"
                      onClick={() => setMessage((m) => m + ' {{customer_mobile}}')}
                      className="px-2 py-0.5 bg-slate-100 dark:bg-slate-50 hover:bg-slate-200 dark:hover:bg-slate-850 border border-slate-250 dark:border-slate-200 text-[9px] font-mono text-primary rounded transition-colors"
                    >
                      + Mobile
                    </button>
                    <button
                      type="button"
                      onClick={() => setMessage((m) => m + ' {{date_today}}')}
                      className="px-2 py-0.5 bg-slate-100 dark:bg-slate-50 hover:bg-slate-200 dark:hover:bg-slate-850 border border-slate-250 dark:border-slate-200 text-[9px] font-mono text-primary rounded transition-colors"
                    >
                      + Date
                    </button>
                    <button
                      type="button"
                      onClick={handleInsertLink}
                      className="px-2 py-0.5 bg-primary/10 hover:bg-primary/20 border border-primary/20 text-[9px] font-bold text-primary rounded transition-colors"
                      title="Insert dynamic links like Shop Now with name placeholders"
                    >
                      + Link
                    </button>
                  </div>
                </div>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={6}
                  placeholder="Type broadcast text. You can insert {{customer_name}}, {{business_name}}, {{customer_email}}, {{customer_mobile}}, {{date_today}} variables, or click + Link to insert URLs..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-805 rounded-lg text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-primary/50"
                />
              </div>

              {/* Call to Action Button section */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-50 border border-slate-200 dark:border-slate-200 rounded-xl space-y-3">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider block">Interactive Link Button (Optional)</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold text-slate-450 block uppercase">Button Display Text</span>
                    <input
                      type="text"
                      value={buttonText}
                      onChange={(e) => setButtonText(e.target.value)}
                      placeholder="e.g. Buy Now, Shop Now"
                      className="w-full px-3 py-2 bg-white dark:bg-white border border-slate-200 dark:border-slate-200 rounded-lg text-xs text-slate-900 dark:text-slate-900 placeholder-slate-400 focus:outline-none focus:border-primary/50"
                    />
                  </div>

                  <div className="space-y-1">
                    <span className="text-[9px] font-bold text-slate-450 block uppercase">Button Redirect Link</span>
                    <input
                      type="text"
                      value={buttonUrl}
                      onChange={(e) => setButtonUrl(e.target.value)}
                      placeholder="e.g. https://example.com/shop?user={{customer_name}}"
                      className="w-full px-3 py-2 bg-white dark:bg-white border border-slate-200 dark:border-slate-200 rounded-lg text-xs text-slate-900 dark:text-slate-900 placeholder-slate-400 focus:outline-none focus:border-primary/50"
                    />
                  </div>
                </div>
              </div>

              {/* Audience Targets configurations */}
              <div className="space-y-2 border-t border-slate-200 dark:border-slate-200 pt-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-550 dark:text-slate-400 uppercase tracking-wider">Configure Recipients Target</label>
                  <p className="text-[10px] text-slate-400 dark:text-slate-400">Choose who receives this campaign blast</p>
                </div>

                <div className="flex gap-2">
                  {(['all', 'tags', 'specific'] as const).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setTargetType(mode)}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                        targetType === mode
                          ? 'bg-primary-light border-primary/35 text-primary shadow-sm'
                          : 'bg-slate-50 dark:bg-slate-50 border-slate-200 dark:border-slate-200 text-slate-550 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-800'
                      }`}
                    >
                      {mode === 'all' ? 'All CRM Directory' : mode === 'tags' ? 'Filter by Tag Segments' : 'Choose Specific'}
                    </button>
                  ))}
                </div>

                {/* Tags filtering configuration */}
                {targetType === 'tags' && (
                  <div className="p-3 bg-slate-50 dark:bg-slate-50/60 border border-slate-200 dark:border-slate-200 rounded-xl space-y-2 animate-in fade-in duration-200">
                    <span className="text-[9px] font-bold text-slate-450 uppercase block">Select Target Segment Tags</span>
                    <div className="flex flex-wrap gap-2">
                      {Object.keys(tagCounts).length > 0 ? (
                        Object.keys(tagCounts).map((tag) => {
                          const isSel = selectedTags.includes(tag);
                          return (
                            <button
                              key={tag}
                              type="button"
                              onClick={() => handleToggleTagSelect(tag)}
                              className={`px-2 py-1 rounded border text-[10px] font-bold flex items-center gap-1 transition-all ${
                                isSel
                                  ? 'bg-primary/10 border-primary text-primary shadow-sm'
                                  : 'bg-white dark:bg-white border-slate-200 dark:border-slate-200 text-slate-400 dark:text-slate-400'
                              }`}
                            >
                              <span>{tag}</span>
                              <span className="opacity-60 text-[9px] font-mono">({tagCounts[tag]})</span>
                            </button>
                          );
                        })
                      ) : (
                        <div className="text-[10px] text-slate-400">No segment tags exist in the CRM.</div>
                      )}
                    </div>
                  </div>
                )}

                {/* Specific contacts picker checklist */}
                {targetType === 'specific' && (
                  <div className="bg-slate-50 dark:bg-slate-50 border border-slate-200 dark:border-slate-200 rounded-xl p-3 space-y-2.5 animate-in fade-in duration-200">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                      <span className="text-[9px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider block">
                        Select Contacts checklist ({selectedCustomers.length} selected)
                      </span>

                      {/* Local Filter Bar */}
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5 bg-white dark:bg-white border border-slate-200 dark:border-slate-200 rounded px-2 py-0.5">
                          <Search className="w-3 h-3 text-slate-400" />
                          <input
                            type="text"
                            value={customerSearch}
                            onChange={(e) => setCustomerSearch(e.target.value)}
                            placeholder="Filter checklist..."
                            className="bg-transparent text-[10px] text-slate-900 dark:text-slate-900 focus:outline-none w-24"
                          />
                        </div>
                        <select
                          value={customerTagFilter}
                          onChange={(e) => setCustomerTagFilter(e.target.value)}
                          className="px-1.5 py-0.5 bg-white dark:bg-white border border-slate-200 dark:border-slate-850 rounded text-[9px] text-slate-550 dark:text-slate-350 focus:outline-none"
                        >
                          <option value="">Any Tag</option>
                          {Object.keys(tagCounts).map((t) => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Virtual List Wrapper */}
                    <div className="max-h-40 overflow-y-auto border border-slate-200 dark:border-slate-805 rounded-lg divide-y divide-slate-105 dark:divide-slate-850 bg-white dark:bg-white/60 transition-colors">
                      {filteredCustomersForTargeting.length > 0 && (
                        <div className="p-2 bg-slate-50 dark:bg-slate-50 flex items-center justify-between border-b border-slate-200 dark:border-slate-850">
                          <span className="text-[9px] font-bold text-slate-400">Apply Filter selection</span>
                          <button
                            type="button"
                            onClick={handleToggleSelectAllFiltered}
                            className="text-[9px] text-primary hover:underline font-bold"
                          >
                            Toggle Select All Filtered ({filteredCustomersForTargeting.length})
                          </button>
                        </div>
                      )}
                      
                      {filteredCustomersForTargeting.length > 0 ? (
                        filteredCustomersForTargeting.map((cust) => {
                          const isChecked = selectedCustomers.includes(cust._id);
                          return (
                            <div
                              key={cust._id}
                              onClick={() => handleToggleCustomerSelect(cust._id)}
                              className={`flex items-center justify-between p-2 cursor-pointer transition-colors text-[10px] hover:bg-slate-100 dark:hover:bg-white/60 ${
                                isChecked ? 'bg-primary-light/40' : ''
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <div
                                  className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-colors ${
                                    isChecked
                                      ? 'bg-primary border-primary text-slate-900'
                                      : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-50'
                                  }`}
                                >
                                  {isChecked && <Check className="w-2.5 h-2.5 text-slate-900 stroke-[3.5]" />}
                                </div>
                                <span className="font-semibold text-slate-850 dark:text-slate-800">{cust.name}</span>
                                <span className="font-mono text-[9px] text-slate-400 font-normal">({cust.mobile})</span>
                              </div>

                              <div className="flex gap-1">
                                {(cust.tags || []).map((t: string) => (
                                  <span key={t} className="px-1 rounded bg-slate-200 dark:bg-slate-50 text-[8px] text-slate-400 font-bold">
                                    {t}
                                  </span>
                                ))}
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="p-4 text-center text-slate-400 text-[10px]">No targeting matches.</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Form submission controls */}
            <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-200 pt-3 mt-3 shrink-0">
              <span className="text-[10px] text-slate-400 dark:text-slate-400">
                {targetType === 'all'
                  ? 'This broadcast will dispatch to ALL CRM directory customers.'
                  : targetType === 'tags'
                  ? `Broadcasting to segment targets matching: ${selectedTags.join(', ') || 'N/A'}`
                  : `Broadcasting to ${selectedCustomers.length} manually checked targets.`}
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleSaveCampaign('Draft')}
                  disabled={isSubmitting}
                  className="px-3.5 py-1.5 bg-slate-100 dark:bg-slate-50 border border-slate-250 dark:border-slate-200 text-slate-650 dark:text-slate-700 font-bold rounded-lg text-xs hover:bg-slate-200"
                >
                  Save Draft
                </button>

                <button
                  type="button"
                  onClick={() => handleSaveCampaign(scheduleOption === 'later' ? 'Scheduled' : undefined)}
                  disabled={isSubmitting}
                  className="px-4 py-1.5 bg-primary text-slate-900 font-bold text-xs rounded-lg hover:bg-primary-hover flex items-center gap-1 shadow disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5 text-slate-900" />
                      <span>{scheduleOption === 'later' ? 'Schedule Broadcast' : 'Launch Campaign'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Right Preview Mockup Smartphone (WA Mockup) */}
          <div className="bg-white dark:bg-white border border-slate-205 dark:border-slate-200 rounded-xl p-4 shadow-md flex flex-col justify-between h-[450px] transition-colors">
            <div>
              <span className="text-[10px] font-bold text-slate-550 dark:text-slate-400 uppercase tracking-wider block">Visual Mockup Live Preview</span>
              <p className="text-[10px] text-slate-400 mt-0.5">Real-time simulation of incoming WhatsApp message UI</p>
            </div>

            {/* WA frame layout */}
            <div className="flex-1 w-full bg-[#f0f2f5] dark:bg-[#0b141a] rounded-xl p-3 overflow-y-auto flex flex-col justify-end space-y-2 relative my-3 border border-slate-200 dark:border-slate-200 transition-colors">
              {/* Simulated chat timeline bubble */}
              <div className="flex justify-start">
                <div className="bg-white dark:bg-[#202c33] border border-slate-200 dark:border-slate-200 text-slate-900 dark:text-slate-900 p-2.5 rounded-xl rounded-tl-none text-[11px] max-w-[85%] shadow space-y-1 transition-colors">
                  <span className="text-[9px] text-primary font-bold block">Business Dispatcher</span>
                  {imageUrl && imageUrl.trim().startsWith('http') && (
                    <img
                      src={imageUrl}
                      alt="Campaign attachment preview"
                      className="w-full h-24 object-cover rounded-lg mb-1"
                      onError={(e) => { (e.target as any).style.display = 'none'; }}
                    />
                  )}
                  <p className="whitespace-pre-wrap font-sans break-words text-slate-800 dark:text-slate-100">
                    {message
                      ? message
                          .replace(/{{customer_name}}/g, 'Alice')
                          .replace(/{{business_name}}/g, 'Workspace Store')
                      : 'Type a message to preview live formatting...'}
                  </p>
                  <span className="text-[8px] text-slate-450 dark:text-slate-400 text-right block leading-none">10:00 AM</span>
                </div>
              </div>
            </div>

            <div className="text-center text-[10px] text-slate-400">
              Personalisation parameters will replace values on execution.
            </div>
          </div>
        </div>
      ) : (
        /* Campaigns Data Grid table */
        <div className="bg-white dark:bg-white border border-slate-200 dark:border-slate-200 rounded-xl shadow-md overflow-hidden transition-colors">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-350">
              <thead className="bg-slate-50 dark:bg-slate-50/60 uppercase text-[9px] tracking-wider text-slate-400 border-b border-slate-200 dark:border-slate-200">
                <tr>
                  <th className="py-3 px-4">Campaign Name</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Delivery progress</th>
                  <th className="py-3 px-4">Created Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary mb-2" />
                      Loading campaigns...
                    </td>
                  </tr>
                ) : campaigns.length > 0 ? (
                  campaigns.map((camp) => (
                    <tr key={camp._id} className="hover:bg-slate-550/5 dark:hover:bg-slate-50/20 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-850 dark:text-slate-800">
                        {camp.name}
                        <div className="text-[10px] font-normal text-slate-400 dark:text-slate-450 truncate max-w-xs">{camp.message}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-slate-50 dark:bg-slate-50 border border-slate-200 dark:border-slate-850 text-slate-650 dark:text-slate-400">
                          {camp.type}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[10px]">
                        {camp.status === 'Completed' ? (
                          <span className="inline-flex items-center gap-1 text-primary bg-primary-light px-2.5 py-0.5 rounded-full border border-primary/20">
                            <CheckCircle2 className="w-3 h-3" /> Completed
                          </span>
                        ) : camp.status === 'Running' || camp.status === 'Scheduled' ? (
                          <span className="inline-flex items-center gap-1 text-amber-500 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                            <Clock className="w-3 h-3 animate-spin animate-duration-1000" /> {camp.status}
                          </span>
                        ) : camp.status === 'Failed' ? (
                          <span className="inline-flex items-center gap-1 text-rose-500 bg-rose-500/10 px-2.5 py-0.5 rounded-full border border-rose-500/20">
                            <AlertCircle className="w-3 h-3" /> Failed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-slate-400 dark:text-slate-400 bg-slate-100 dark:bg-slate-50/80 px-2.5 py-0.5 rounded-full border border-slate-200 dark:border-slate-200">
                            Draft
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2 max-w-[150px]">
                          <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-850 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary transition-all duration-300"
                              style={{
                                width: `${
                                  camp.stats?.total
                                    ? Math.min(100, (camp.stats.sent / camp.stats.total) * 100)
                                    : 0
                                }%`,
                              }}
                            ></div>
                          </div>
                          <span className="text-[9px] font-semibold font-mono text-slate-400 dark:text-slate-400">
                            {camp.stats?.sent || 0}/{camp.stats?.total || 0}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-400 dark:text-slate-450 text-[11px]">
                        {formatDate(camp.createdAt)}
                      </td>
                      <td className="py-3 px-4 text-right space-x-1.5">
                        {camp.status === 'Draft' && (
                          <button
                            onClick={() => handleLaunch(camp._id)}
                            title="Launch Campaign"
                            className="p-1 rounded bg-primary text-slate-900 hover:bg-primary-hover shadow-sm"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(camp._id)}
                          title="Delete Campaign"
                          className="p-1 rounded bg-slate-100 hover:bg-rose-500/10 text-slate-400 hover:text-rose-500 dark:bg-slate-50/60 dark:hover:bg-rose-500/10 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      No campaigns launched yet. Start by creating a campaign!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Custom Dialog Box Modal overlay */}
      {dialog.isOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-50/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-white border border-slate-205 dark:border-slate-200 rounded-2xl max-w-sm w-full p-5 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="space-y-1">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-900 flex items-center gap-1.5">
                <Info className="w-4 h-4 text-primary shrink-0" />
                <span>{dialog.title}</span>
              </h3>
              <p className="text-slate-400 dark:text-slate-400 text-[11px] leading-relaxed">{dialog.description}</p>
            </div>

            {dialog.type === 'prompt_link' && (
              <div className="space-y-3 p-3.5 bg-slate-50 dark:bg-slate-50 border border-slate-200 dark:border-slate-850 rounded-xl">
                <div className="space-y-1">
                  <span className="text-[8px] font-bold text-slate-450 uppercase block">Link Button Text / Label</span>
                  <input
                    type="text"
                    value={dialogLinkLabel}
                    onChange={(e) => setDialogLinkLabel(e.target.value)}
                    placeholder="e.g. Shop Now"
                    className="w-full px-3 py-1.5 bg-white dark:bg-white border border-slate-200 dark:border-slate-200 rounded-lg text-xs text-slate-900 dark:text-slate-900 focus:outline-none focus:border-primary/50"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[8px] font-bold text-slate-455 uppercase block">Redirect URL (placeholders allowed)</span>
                  <input
                    type="text"
                    value={dialogLinkUrl}
                    onChange={(e) => setDialogLinkUrl(e.target.value)}
                    placeholder="e.g. https://example.com/shop?user={{customer_name}}"
                    className="w-full px-3 py-1.5 bg-white dark:bg-white border border-slate-200 dark:border-slate-200 rounded-lg text-xs text-slate-900 dark:text-slate-900 focus:outline-none focus:border-primary/50"
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 border-t border-slate-100 dark:border-slate-200 pt-3 mt-1">
              <button
                type="button"
                onClick={closeDialog}
                className="px-3.5 py-1.5 bg-slate-100 dark:bg-slate-850 text-slate-600 dark:text-slate-700 font-bold rounded-lg text-xs hover:bg-slate-200 transition-colors"
              >
                {dialog.type === 'alert' ? 'Close' : 'Cancel'}
              </button>
              {dialog.type !== 'alert' && (
                <button
                  type="button"
                  onClick={() => {
                    if (dialog.type === 'prompt_link') {
                      if (!dialogLinkLabel.trim() || !dialogLinkUrl.trim()) {
                        alert('Please fill in both label and URL.');
                        return;
                      }
                      const formatted = `*${dialogLinkLabel.trim()}* 👉 ${dialogLinkUrl.trim()}`;
                      setMessage((m) => m + (m ? ' ' : '') + formatted);
                      closeDialog();
                    } else if (dialog.onConfirm) {
                      dialog.onConfirm();
                    }
                  }}
                  className="px-4 py-1.5 bg-primary text-slate-900 font-bold rounded-lg text-xs hover:bg-primary-hover shadow transition-colors"
                >
                  Confirm
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
