'use client';

import React, { useEffect, useState } from 'react';
import {
  FileText,
  Plus,
  Trash2,
  Edit,
  Save,
  X,
  Search,
  CheckCircle,
  Copy,
  Info
} from 'lucide-react';

interface Template {
  id: string;
  title: string;
  category: string;
  content: string;
  variables: string[];
}

export function TemplatesTab() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [search, setSearch] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [activeTemplate, setActiveTemplate] = useState<Template | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Promotion');
  const [content, setContent] = useState('');

  const loadTemplates = () => {
    const raw = localStorage.getItem('autowhatsapp_templates');
    if (raw) {
      setTemplates(JSON.parse(raw));
    } else {
      localStorage.setItem('autowhatsapp_templates', JSON.stringify([]));
      setTemplates([]);
    }
  };


  useEffect(() => {
    loadTemplates();
  }, []);

  const handleCreateNew = () => {
    setActiveTemplate(null);
    setTitle('');
    setCategory('Promotion');
    setContent('');
    setIsEditing(true);
  };

  const handleEdit = (temp: Template) => {
    setActiveTemplate(temp);
    setTitle(temp.title);
    setCategory(temp.category);
    setContent(temp.content);
    setIsEditing(true);
  };

  const handleDelete = (id: string) => {
    if (!confirm('Are you sure you want to delete this message template?')) return;
    const updated = templates.filter((t) => t.id !== id);
    localStorage.setItem('autowhatsapp_templates', JSON.stringify(updated));
    setTemplates(updated);
  };

  const handleSave = () => {
    if (!title.trim() || !content.trim()) return alert('Please fill in all template fields.');

    // Parse variables dynamically from content
    const matches = content.match(/{{(.*?)}}/g) || [];
    const variables = matches.map((m) => m.replace(/{{|}}/g, '').trim());

    let updated: Template[];
    if (activeTemplate) {
      // Edit mode
      updated = templates.map((t) =>
        t.id === activeTemplate.id
          ? { ...t, title, category, content, variables }
          : t
      );
    } else {
      // Create mode
      const newTemp: Template = {
        id: `temp_${Date.now()}`,
        title,
        category,
        content,
        variables,
      };
      updated = [newTemp, ...templates];
    }

    localStorage.setItem('autowhatsapp_templates', JSON.stringify(updated));
    setTemplates(updated);
    setIsEditing(false);
    setActiveTemplate(null);
  };

  const handleCopyContent = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Message template copied to clipboard.');
  };

  const filteredTemplates = templates.filter(
    (t) =>
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.content.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            <span>Templates Repository</span>
          </h1>
          <p className="text-[11px] text-slate-550 dark:text-slate-400 mt-0.5">Pre-built messages layout drafts for direct broadcast campaigns</p>
        </div>

        {!isEditing && (
          <button
            onClick={handleCreateNew}
            className="px-3.5 py-1.5 bg-primary hover:bg-primary-hover font-bold text-slate-900 text-xs rounded-lg flex items-center gap-1.5 transition-all shadow"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Template</span>
          </button>
        )}
      </div>

      {isEditing ? (
        /* Form view editor */
        <div className="bg-white dark:bg-white border border-slate-205 dark:border-slate-200 rounded-xl p-4 shadow-md space-y-4 max-w-2xl transition-colors">
          <h3 className="text-xs font-bold text-slate-850 dark:text-slate-800 uppercase tracking-wider">
            {activeTemplate ? 'Edit Template Draft' : 'Create Custom Template'}
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-550 dark:text-slate-400 uppercase tracking-wider block">Template Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="E.g. VIP Festive Greeting"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-50 border border-slate-250 dark:border-slate-200 rounded-lg text-xs text-slate-900 dark:text-slate-900 placeholder-slate-500 focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-550 dark:text-slate-400 uppercase tracking-wider block">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-50 border border-slate-250 dark:border-slate-200 rounded-lg text-xs text-slate-700 dark:text-slate-700 focus:outline-none"
              >
                <option value="Promotion">Promotion</option>
                <option value="Reminder">Reminder</option>
                <option value="Announcement">Announcement</option>
                <option value="Transaction">Transaction</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-bold text-slate-550 dark:text-slate-400 uppercase tracking-wider block">Message Content</label>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => setContent((c) => c + ' {{customer_name}}')}
                  className="px-2 py-0.5 bg-slate-100 dark:bg-slate-50 hover:bg-slate-200 dark:hover:bg-slate-850 border border-slate-250 dark:border-slate-200 text-[9px] font-mono text-primary rounded transition-colors"
                >
                  + Name
                </button>
                <button
                  type="button"
                  onClick={() => setContent((c) => c + ' {{business_name}}')}
                  className="px-2 py-0.5 bg-slate-100 dark:bg-slate-50 hover:bg-slate-200 dark:hover:bg-slate-850 border border-slate-250 dark:border-slate-200 text-[9px] font-mono text-primary rounded transition-colors"
                >
                  + Business
                </button>
              </div>
            </div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={5}
              placeholder="Type template message here..."
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-50 border border-slate-250 dark:border-slate-200 rounded-lg text-xs text-slate-900 dark:text-slate-900 placeholder-slate-500 focus:outline-none font-mono"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-200">
            <button
              onClick={() => setIsEditing(false)}
              className="px-3 py-1.5 bg-slate-100 dark:bg-slate-50 border border-slate-250 dark:border-slate-200 text-slate-650 dark:text-slate-400 text-xs rounded-lg hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-1.5 bg-primary text-slate-900 font-bold text-xs rounded-lg hover:bg-primary-hover transition-colors flex items-center gap-1"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Template</span>
            </button>
          </div>
        </div>
      ) : (
        /* Grid list templates */
        <div className="space-y-3">
          {/* search templates */}
          <div className="flex items-center gap-2.5 bg-white dark:bg-white border border-slate-205 dark:border-slate-200 rounded-xl px-3 py-1.5 w-full sm:max-w-xs shadow-sm transition-colors">
            <Search className="w-3.5 h-3.5 text-slate-400 dark:text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search templates..."
              className="w-full bg-transparent text-xs text-slate-900 dark:text-slate-900 focus:outline-none placeholder-slate-400 dark:placeholder-slate-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filteredTemplates.length > 0 ? (
              filteredTemplates.map((t) => (
                <div key={t.id} className="bg-white dark:bg-white border border-slate-200 dark:border-slate-200 hover:border-primary/50 dark:hover:border-slate-700/80 rounded-xl p-4 shadow-md flex flex-col justify-between space-y-3 relative group transition-all duration-200">
                  <div className="space-y-1">
                    <div className="flex justify-between items-start">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-slate-900 leading-tight">{t.title}</h4>
                      <span className="px-2 py-0.5 rounded bg-slate-50 dark:bg-slate-50 border border-slate-200 dark:border-slate-850 text-[9px] font-bold text-slate-400 dark:text-slate-450">{t.category}</span>
                    </div>
                    <p className="text-[11px] text-slate-650 dark:text-slate-400 font-mono break-words line-clamp-3 bg-slate-50 dark:bg-slate-50/60 p-2 rounded border border-slate-200 dark:border-slate-850">{t.content}</p>
                  </div>

                  <div className="flex justify-between items-center border-t border-slate-200 dark:border-slate-850 pt-2 text-[10px]">
                    <div className="flex flex-wrap gap-1">
                      {t.variables.map((v) => (
                        <span key={v} className="bg-slate-100 dark:bg-slate-50 text-slate-400 dark:text-slate-400 font-bold px-1.5 py-0.5 rounded text-[8px] border border-slate-200 dark:border-slate-850">
                          {v}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleCopyContent(t.content)}
                        title="Copy text content"
                        className="p-1 rounded text-slate-400 hover:text-slate-800 dark:hover:text-slate-800 hover:bg-slate-100 dark:hover:bg-slate-100"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleEdit(t)}
                        title="Edit template details"
                        className="p-1 rounded text-slate-455 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-100"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDelete(t.id)}
                        title="Delete template"
                        className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-100"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-12 text-center text-slate-400 text-[10px]">
                No templates match search criteria.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
