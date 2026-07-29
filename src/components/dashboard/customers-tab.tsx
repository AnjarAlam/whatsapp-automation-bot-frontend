'use client';

import React, { useEffect, useState } from 'react';
import {
  Users,
  Search,
  Filter,
  Trash2,
  Edit2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Tag,
  Upload,
  Download,
  UserPlus,
  Check,
  Megaphone,
  Layers,
  FolderOpen
} from 'lucide-react';
import { api } from '../../lib/api';
import { formatDate } from '../../lib/utils';
import CustomerDrawer from '../customers/customer-drawer';
import BulkImportModal from '../customers/bulk-import-modal';

export function CustomersTab() {
  const [crmView, setCrmView] = useState<'directory' | 'segments'>('directory');
  const [customers, setCustomers] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Selection states for bulk actions
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // Drawer / Modals
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);

  // Bulk operations
  const [bulkTagInput, setBulkTagInput] = useState('');
  const [isExecutingBulk, setIsExecutingBulk] = useState(false);

  // Cursors
  const [cursorHistory, setCursorHistory] = useState<string[]>([]);
  const [currentCursor, setCurrentCursor] = useState<string | undefined>(undefined);
  const [nextCursor, setNextCursor] = useState<string | null>(null);

  // Segment View states
  const [tagsGroup, setTagsGroup] = useState<Record<string, any[]>>({});
  const [activeSegmentTag, setActiveSegmentTag] = useState<string>('All Contacts');
  const [segmentSearch, setSegmentSearch] = useState('');

  const loadCustomers = async (cursor?: string) => {
    setIsLoading(true);
    try {
      const res = await api.get('/customers', {
        params: {
          page,
          limit: 12,
          search: search || undefined,
          tag: selectedTag || undefined,
          status: selectedStatus || undefined,
          afterCursor: cursor,
        },
      });

      setCustomers(res.data.data || []);
      setTotal(res.data.total || 0);
      setTotalPages(res.data.totalPages || 1);
      setNextCursor(res.data.nextCursor || null);

      // Re-group for segments
      const allRes = await api.get('/customers', { params: { limit: 10000 } });
      const allList = allRes.data.data || [];
      const grouped: Record<string, any[]> = { 'All Contacts': allList };
      allList.forEach((c: any) => {
        (c.tags || []).forEach((t: string) => {
          if (!grouped[t]) grouped[t] = [];
          grouped[t].push(c);
        });
      });
      setTagsGroup(grouped);
    } catch (err) {
      console.error('Failed to load customers:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers(currentCursor);
  }, [page, search, selectedTag, selectedStatus, currentCursor]);

  const triggerSearch = (val: string) => {
    setSearch(val);
    setPage(1);
    setCurrentCursor(undefined);
    setCursorHistory([]);
    setSelectedIds([]);
  };

  const handleNextPage = () => {
    if (nextCursor) {
      setCursorHistory([...cursorHistory, currentCursor || '']);
      setCurrentCursor(nextCursor);
      setPage((p) => p + 1);
      setSelectedIds([]);
    }
  };

  const handlePrevPage = () => {
    if (cursorHistory.length > 0) {
      const prev = cursorHistory[cursorHistory.length - 1];
      setCursorHistory(cursorHistory.slice(0, -1));
      setCurrentCursor(prev || undefined);
      setPage((p) => Math.max(1, p - 1));
      setSelectedIds([]);
    }
  };

  const handleToggleSelectRow = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAllRows = () => {
    if (selectedIds.length === customers.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(customers.map((c) => c._id));
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} selected contacts?`)) return;
    setIsExecutingBulk(true);
    try {
      await Promise.all(selectedIds.map((id) => api.delete(`/customers/${id}`)));
      setSelectedIds([]);
      loadCustomers(currentCursor);
      alert('Selected customers deleted.');
    } catch (err) {
      alert('Failed to delete some customers.');
    } finally {
      setIsExecutingBulk(false);
    }
  };

  const handleBulkAssignTags = async () => {
    if (!bulkTagInput.trim()) return alert('Please enter tags.');
    setIsExecutingBulk(true);
    try {
      const newTags = bulkTagInput.split(',').map((t) => t.trim()).filter(Boolean);
      await Promise.all(
        selectedIds.map(async (id) => {
          const cust = customers.find((c) => c._id === id);
          const currentTags = cust?.tags || [];
          const combinedTags = Array.from(new Set([...currentTags, ...newTags]));
          return api.patch(`/customers/${id}`, { tags: combinedTags });
        })
      );
      setBulkTagInput('');
      setSelectedIds([]);
      loadCustomers(currentCursor);
      alert('Tags assigned successfully.');
    } catch (err) {
      alert('Failed to assign tags.');
    } finally {
      setIsExecutingBulk(false);
    }
  };

  const handleExport = async () => {
    try {
      const res = await api.get('/customers/export', {
        params: { search: search || undefined, tag: selectedTag || undefined },
      });
      const data = res.data || [];

      const headers = ['Name', 'Mobile', 'Email', 'Tags', 'Total Messages', 'Created At'];
      const rows = data.map((c: any) => [
        `"${c.name.replace(/"/g, '""')}"`,
        `"${c.mobile}"`,
        `"${c.email || ''}"`,
        `"${(c.tags || []).join(',')}"`,
        c.totalMessages || 0,
        c.createdAt,
      ]);

      const csvContent =
        'data:text/csv;charset=utf-8,' +
        [headers.join(','), ...rows.map((r: any) => r.join(','))].join('\n');

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', 'exported_customers.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      alert('Failed to export customers');
    }
  };

  const openAddDrawer = () => {
    setSelectedCustomer(null);
    setIsDrawerOpen(true);
  };

  const openEditDrawer = (cust: any) => {
    setSelectedCustomer(cust);
    setIsDrawerOpen(true);
  };

  const handleDeleteSingle = async (id: string) => {
    if (!confirm('Are you sure you want to delete this customer?')) return;
    try {
      await api.delete(`/customers/${id}`);
      loadCustomers(currentCursor);
    } catch (err) {
      alert('Failed to delete customer');
    }
  };

  const displayedSegmentContacts = (tagsGroup[activeSegmentTag] || []).filter(
    (c) =>
      c.name.toLowerCase().includes(segmentSearch.toLowerCase()) ||
      c.mobile.includes(segmentSearch)
  );

  return (
    <div className="space-y-4 animate-in fade-in duration-300 relative">
      {/* Top action header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-850">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            <span>Customers & CRM Portal</span>
          </h1>
          <p className="text-[11px] text-slate-555 dark:text-slate-400 mt-0.5">
            Manage contact profiles, filter audience categories, and verify delivery logs
          </p>
        </div>

        {/* View Switcher Toggle & CSV Actions */}
        <div className="flex items-center gap-2">
          {/* Main Toggle Switch */}
          <div className="bg-slate-100 dark:bg-slate-950 p-0.5 rounded-lg border border-slate-250 dark:border-slate-850 flex shrink-0 transition-colors">
            <button
              onClick={() => setCrmView('directory')}
              className={`px-3 py-1 rounded-md text-[11px] font-bold transition-all ${
                crmView === 'directory'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-450 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Directory Grid
            </button>
            <button
              onClick={() => setCrmView('segments')}
              className={`px-3 py-1 rounded-md text-[11px] font-bold transition-all ${
                crmView === 'segments'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-450 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Tag Segments
            </button>
          </div>

          <button
            onClick={openAddDrawer}
            className="px-3.5 py-1.5 bg-primary hover:bg-primary-hover font-bold text-white text-xs rounded-lg flex items-center gap-1 shadow transition-all"
          >
            <UserPlus className="w-3.5 h-3.5 text-white" />
            <span className="hidden sm:inline">Add Customer</span>
          </button>
          
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-250 dark:border-slate-800 text-slate-700 dark:text-slate-250 text-xs font-bold rounded-lg flex items-center gap-1 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Upload className="w-3.5 h-3.5 text-primary" />
            <span className="hidden sm:inline">Import</span>
          </button>

          <button
            onClick={handleExport}
            className="px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-250 dark:border-slate-800 text-slate-700 dark:text-slate-250 text-xs font-bold rounded-lg flex items-center gap-1 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-primary" />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>

      {crmView === 'directory' ? (
        /* DIRECTORY VIEW WORKSPACE */
        <>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors">
            {/* Search */}
            <div className="flex items-center gap-2.5 bg-slate-55 dark:bg-slate-955 border border-slate-200 dark:border-slate-850 rounded-lg px-3 py-1.5 w-full sm:max-w-xs">
              <Search className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => triggerSearch(e.target.value)}
                placeholder="Search name or mobile number..."
                className="w-full bg-transparent text-xs text-slate-900 dark:text-white focus:outline-none placeholder-slate-400 dark:placeholder-slate-500"
              />
            </div>

            {/* Dropdowns filters */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-450">
                <Filter className="w-3 h-3" />
                <span>Filters:</span>
              </div>

              <select
                value={selectedTag}
                onChange={(e) => { setSelectedTag(e.target.value); setPage(1); }}
                className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg text-xs text-slate-700 dark:text-slate-300 focus:outline-none transition-colors"
              >
                <option value="">All Tags</option>
                {Object.keys(tagsGroup).filter(t => t !== 'All Contacts').map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => { setSelectedStatus(e.target.value); setPage(1); }}
                className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg text-xs text-slate-700 dark:text-slate-300 focus:outline-none transition-colors"
              >
                <option value="">All States</option>
                <option value="active">Active Chats</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* CRM table grid */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow overflow-hidden transition-colors">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-650 dark:text-slate-350">
                <thead className="bg-slate-50 dark:bg-slate-955/60 uppercase text-[9px] tracking-wider text-slate-500 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-2.5 px-4 w-10">
                      <div
                        onClick={handleToggleSelectAllRows}
                        className={`w-3.5 h-3.5 rounded border flex items-center justify-center cursor-pointer transition-colors ${
                          selectedIds.length === customers.length && customers.length > 0
                            ? 'bg-primary border-primary text-white'
                            : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900'
                        }`}
                      >
                        {selectedIds.length === customers.length && customers.length > 0 && <Check className="w-3 h-3 text-white stroke-[3.5]" />}
                      </div>
                    </th>
                    <th className="py-2.5 px-4">Name</th>
                    <th className="py-2.5 px-4">Phone</th>
                    <th className="py-2.5 px-4">Tags</th>
                    <th className="py-2.5 px-4">Last Message Campaign</th>
                    <th className="py-2.5 px-4 text-center">Total Sent</th>
                    <th className="py-2.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {isLoading ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-500">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary mb-1" />
                        Loading CRM database records...
                      </td>
                    </tr>
                  ) : customers.length > 0 ? (
                    customers.map((cust) => {
                      const isChecked = selectedIds.includes(cust._id);
                      return (
                        <tr
                          key={cust._id}
                          className={`hover:bg-slate-50 dark:hover:bg-slate-955/20 transition-colors ${isChecked ? 'bg-primary-light/40' : ''}`}
                        >
                          <td className="py-2.5 px-4">
                            <div
                              onClick={() => handleToggleSelectRow(cust._id)}
                              className={`w-3.5 h-3.5 rounded border flex items-center justify-center cursor-pointer transition-colors ${
                                isChecked ? 'bg-primary border-primary text-white' : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900'
                              }`}
                            >
                              {isChecked && <Check className="w-3 h-3 text-white stroke-[3.5]" />}
                            </div>
                          </td>
                          <td className="py-2.5 px-4 font-semibold text-slate-900 dark:text-slate-200">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex items-center justify-center font-bold text-[10px] text-primary shrink-0">
                                {cust.name[0]?.toUpperCase()}
                              </div>
                              <span>{cust.name}</span>
                            </div>
                          </td>
                          <td className="py-2.5 px-4 font-mono text-[11px] text-slate-700 dark:text-slate-300">{cust.mobile}</td>
                          <td className="py-2.5 px-4">
                            <div className="flex flex-wrap gap-1">
                              {cust.tags && cust.tags.length > 0 ? (
                                cust.tags.map((t: string, idx: number) => (
                                  <span
                                    key={idx}
                                    className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-primary-light text-primary border border-primary/20"
                                  >
                                    {t}
                                  </span>
                                ))
                              ) : (
                                <span className="text-[10px] text-slate-400">N/A</span>
                              )}
                            </div>
                          </td>
                          <td className="py-2.5 px-4 text-slate-500 dark:text-slate-400 text-[11px] truncate max-w-[150px]">
                            {cust.lastCampaign || 'No campaigns sent'}
                          </td>
                          <td className="py-2.5 px-4 text-center font-bold text-slate-700 dark:text-slate-300">
                            {cust.totalMessages || 0}
                          </td>
                          <td className="py-2.5 px-4 text-right space-x-1.5">
                            <button
                              onClick={() => openEditDrawer(cust)}
                              title="Edit Customer"
                              className="p-1 rounded hover:bg-primary-light text-slate-400 hover:text-primary transition-colors"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteSingle(cust._id)}
                              title="Delete Contact"
                              className="p-1 rounded hover:bg-rose-500/10 text-slate-400 hover:text-rose-500 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-500">
                        No contacts found matching search filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            <div className="p-3 bg-slate-55 dark:bg-slate-955/60 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 transition-colors">
              <span>Total Customers: <strong>{total}</strong></span>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrevPage}
                  disabled={page === 1}
                  className="p-1 rounded border border-slate-250 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 disabled:opacity-40 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-[10px] font-bold">Page {page} of {totalPages}</span>
                <button
                  onClick={handleNextPage}
                  disabled={!nextCursor}
                  className="p-1 rounded border border-slate-250 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 disabled:opacity-40 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </>
      ) : (
        /* SEGMENTS VIEW WORKSPACE */
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl h-[450px] flex overflow-hidden shadow transition-colors">
          {/* Left panel: tag category scroll list */}
          <div className="w-64 border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0">
            <div className="p-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-955/20 transition-colors">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Audience Tag Groupings</span>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
              {Object.keys(tagsGroup).map((tagKey) => {
                const count = tagsGroup[tagKey].length;
                const isActive = activeSegmentTag === tagKey;
                return (
                  <button
                    key={tagKey}
                    onClick={() => { setActiveSegmentTag(tagKey); setSegmentSearch(''); }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-primary-light text-primary border border-primary/25 shadow-sm'
                        : 'text-slate-655 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-850/50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Tag className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                      <span className="truncate max-w-[120px]">{tagKey}</span>
                    </div>
                    <span className="text-[9px] bg-slate-200 dark:bg-slate-950 px-1.5 py-0.5 rounded text-slate-500 dark:text-slate-400 border border-slate-300 dark:border-slate-850 font-bold font-mono">
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right panel: Segment Contact list */}
          <div className="flex-1 flex flex-col justify-between bg-slate-50/20 dark:bg-slate-950/30 transition-colors">
            {/* Header info */}
            <div className="p-3 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0 transition-colors">
              <div>
                <h3 className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1">
                  <span>Selected Category Tag:</span>
                  <span className="text-primary font-extrabold">{activeSegmentTag}</span>
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg px-2.5 py-1 w-44">
                  <Search className="w-3 h-3 text-slate-400 dark:text-slate-550" />
                  <input
                    type="text"
                    value={segmentSearch}
                    onChange={(e) => setSegmentSearch(e.target.value)}
                    placeholder="Search in tag group..."
                    className="bg-transparent text-[11px] text-slate-900 dark:text-white focus:outline-none w-full"
                  />
                </div>
              </div>
            </div>

            {/* List Table */}
            <div className="flex-1 overflow-y-auto">
              {displayedSegmentContacts.length > 0 ? (
                <table className="w-full text-left text-xs text-slate-650 dark:text-slate-350">
                  <thead className="bg-slate-50 dark:bg-slate-950/60 uppercase text-[9px] tracking-wider text-slate-500 sticky top-0 border-b border-slate-200 dark:border-slate-800 z-10">
                    <tr>
                      <th className="py-2.5 px-3">Name</th>
                      <th className="py-2.5 px-3">Phone</th>
                      <th className="py-2.5 px-3">Email Address</th>
                      <th className="py-2.5 px-3 text-right">Sent Messages</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {displayedSegmentContacts.map((c) => (
                      <tr key={c._id} className="hover:bg-slate-100 dark:hover:bg-slate-955/20 transition-colors text-[11px]">
                        <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-slate-200">
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-[9px] text-primary shrink-0">
                              {c.name[0]?.toUpperCase()}
                            </div>
                            <span>{c.name}</span>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-700 dark:text-slate-300">{c.mobile}</td>
                        <td className="py-2.5 px-3 text-slate-500 dark:text-slate-450">{c.email || 'N/A'}</td>
                        <td className="py-2.5 px-3 text-right font-bold text-slate-400 px-4">{c.totalMessages || 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-450 text-[10px]">
                  No contacts found matching tag category filter.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Floating BULK ACTIONS overlay */}
      {selectedIds.length > 0 && crmView === 'directory' && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 bg-white dark:bg-slate-900 border border-slate-250 dark:border-primary/30 rounded-xl px-4 py-3 shadow-2xl flex items-center gap-4 animate-in slide-in-from-bottom-5 duration-200">
          <div className="text-xs text-slate-850 dark:text-slate-200">
            Selected Contacts: <strong className="text-primary">{selectedIds.length}</strong>
          </div>
          
          <div className="h-5 w-px bg-slate-200 dark:bg-slate-800" />

          {/* Bulk Assign Tag Input */}
          <div className="flex items-center gap-1.5">
            <input
              type="text"
              value={bulkTagInput}
              onChange={(e) => setBulkTagInput(e.target.value)}
              placeholder="Tag list (e.g. VIP, Lead)"
              className="px-2 py-1 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded text-[11px] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none w-36"
            />
            <button
              onClick={handleBulkAssignTags}
              disabled={isExecutingBulk}
              className="px-2.5 py-1 bg-primary text-white font-bold rounded text-[10px] hover:bg-primary-hover disabled:opacity-50"
            >
              Apply Tags
            </button>
          </div>

          <div className="h-5 w-px bg-slate-200 dark:bg-slate-800" />

          <button
            onClick={handleBulkDelete}
            disabled={isExecutingBulk}
            className="px-2.5 py-1 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-450 font-bold rounded text-[10px] hover:bg-rose-500/20 disabled:opacity-50 flex items-center gap-1"
          >
            <Trash2 className="w-3 h-3" />
            <span>Delete Selected</span>
          </button>
        </div>
      )}

      {/* Drawer customer create/edit modal */}
      <CustomerDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onSaveSuccess={() => loadCustomers(currentCursor)}
        customer={selectedCustomer}
      />

      {/* CSV importer */}
      <BulkImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportSuccess={() => loadCustomers(currentCursor)}
      />
    </div>
  );
}
