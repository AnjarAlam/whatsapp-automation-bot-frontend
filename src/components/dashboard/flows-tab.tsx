'use client';

import React, { useEffect, useState } from 'react';
import {
  Bot,
  Plus,
  Trash2,
  Edit3,
  CheckCircle2,
  XCircle,
  Play,
  Pause,
  MessageSquare,
  Sparkles,
  Layers,
  ChevronRight,
  Send,
  Loader2,
  X,
  Smartphone,
  Info,
  Check
} from 'lucide-react';
import { api } from '../../lib/api';

export function FlowsTab() {
  const [flows, setFlows] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTestingModalOpen, setIsTestingModalOpen] = useState(false);
  
  // Active editing flow
  const [editingFlowId, setEditingFlowId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [triggerKeyword, setTriggerKeyword] = useState('');
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [options, setOptions] = useState<{ key: string; label: string; responseMessage: string }[]>([]);
  const [isActive, setIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Custom Dialog Modal Box
  const [dialog, setDialog] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    type: 'alert' | 'confirm';
    onConfirm?: () => void;
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

  // Live Simulator state
  const [simulatedFlow, setSimulatedFlow] = useState<any | null>(null);
  const [simulatedChat, setSimulatedChat] = useState<{ sender: 'user' | 'bot'; text: string; time: string }[]>([]);
  const [simulatedInput, setSimulatedInput] = useState('');

  const [expandedHierarchy, setExpandedHierarchy] = useState<Record<string, boolean>>({});

  const toggleHierarchy = (flowId: string) => {
    setExpandedHierarchy((prev) => ({
      ...prev,
      [flowId]: !prev[flowId],
    }));
  };

  const renderFlowHierarchy = (flow: any) => {
    return (
      <div className="p-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-850 rounded-xl space-y-4 overflow-x-auto text-[10px] animate-in slide-in-from-top-2 duration-200 mt-3">
        <div className="flex flex-col items-center">
          {/* Node 1: Trigger */}
          <div className="px-2.5 py-1 bg-primary/10 border border-primary/30 rounded text-primary font-bold font-mono">
            ⚡ Triggers: {flow.triggerKeyword || 'hi'}
          </div>
          
          {/* Connector */}
          <div className="w-0.5 h-4 bg-slate-200 dark:bg-slate-805" />
          
          {/* Node 2: Welcome message */}
          <div className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg max-w-sm text-center shadow-sm">
            <span className="font-bold text-[8px] text-slate-400 block uppercase tracking-wider mb-0.5">Welcome Message</span>
            <p className="line-clamp-2 text-slate-700 dark:text-slate-350">{flow.welcomeMessage}</p>
          </div>

          {flow.options && flow.options.length > 0 ? (
            <>
              {/* Connector */}
              <div className="w-0.5 h-4 bg-slate-200 dark:bg-slate-800" />
              
              {/* Node 3: Options splitting */}
              <div className="relative w-full flex justify-around gap-2">
                {/* Horizontal line */}
                <div className="absolute top-0 left-[16.5%] right-[16.5%] h-0.5 bg-slate-200 dark:bg-slate-800" />

                {flow.options.map((opt: any, idx: number) => (
                  <div key={idx} className="flex flex-col items-center w-[30%] relative pt-2 min-w-[100px]">
                    {/* Vertical line to each option */}
                    <div className="absolute top-0 left-1/2 w-0.5 h-2 bg-slate-200 dark:bg-slate-800 -translate-x-1/2" />
                    
                    {/* Option Box */}
                    <div className="px-2 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 rounded font-bold text-[9px] w-full text-center truncate">
                      Option {opt.key}: {opt.label}
                    </div>

                    {/* Connector to Response */}
                    <div className="w-0.5 h-3 bg-slate-200 dark:bg-slate-800" />

                    {/* Response Message Box */}
                    <div className="px-2 py-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded text-slate-600 dark:text-slate-350 w-full text-center truncate shadow-sm" title={opt.responseMessage}>
                      {opt.responseMessage}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-[9px] text-slate-400 mt-2">No nested response options added</div>
          )}
        </div>
      </div>
    );
  };

  const loadFlows = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/flows');
      setFlows(res.data || []);
    } catch (err) {
      console.error('Failed to fetch flows:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFlows();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingFlowId(null);
    setTitle('');
    setTriggerKeyword('hi, hello, menu, start, 1');
    setWelcomeMessage(
      'Hello! Welcome to {{business_name}}! 🌟\n\nPlease select an option by replying with the number:\n1️⃣ Press 1 for Menu & Catalog\n2️⃣ Press 2 to Place an Order\n3️⃣ Press 3 for Customer Support\n4️⃣ Type AGENT to speak with a human'
    );
    setOptions([
      { key: '1', label: 'Menu & Catalog', responseMessage: '📋 *Main Product Catalog:*\nCheck out our latest catalog at https://example.com/catalog or reply with your item query!' },
      { key: '2', label: 'Place Order', responseMessage: '🛒 *Order Online:*\nVisit https://example.com/order to place your order or reply with item details!' },
      { key: '3', label: 'Customer Support', responseMessage: '🎧 *Customer Care:*\nOur team is available Mon-Fri 9AM-6PM. Leave your issue here and we will get back to you shortly!' },
      { key: 'agent', label: 'Human Agent', responseMessage: '👤 *Agent Alert:*\nA customer support agent has been notified and will jump into this conversation shortly.' }
    ]);
    setIsActive(true);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (flow: any) => {
    setEditingFlowId(flow._id);
    setTitle(flow.title || '');
    setTriggerKeyword(flow.triggerKeyword || '');
    setWelcomeMessage(flow.welcomeMessage || '');
    setOptions(flow.options || []);
    setIsActive(flow.isActive ?? true);
    setIsModalOpen(true);
  };

  const handleAddOption = () => {
    const nextKey = (options.length + 1).toString();
    setOptions([...options, { key: nextKey, label: `Option ${nextKey}`, responseMessage: 'Type your automated response text here...' }]);
  };

  const handleRemoveOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  const handleOptionChange = (index: number, field: 'key' | 'label' | 'responseMessage', value: string) => {
    const updated = [...options];
    updated[index][field] = value;
    setOptions(updated);
  };

  const handleSaveFlow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !triggerKeyword.trim() || !welcomeMessage.trim()) {
      return showAlert('Required Fields', 'Please fill in flow title, trigger keywords, and welcome message.');
    }

    setIsSubmitting(true);
    try {
      const payload = {
        title,
        triggerKeyword,
        welcomeMessage,
        options,
        isActive,
      };

      if (editingFlowId) {
        await api.patch(`/flows/${editingFlowId}`, payload);
      } else {
        await api.post('/flows', payload);
      }

      setIsModalOpen(false);
      loadFlows();
    } catch (err) {
      console.error(err);
      showAlert('Error', 'Failed to save bot flow rule.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const executeDeleteFlow = async (id: string) => {
    try {
      await api.delete(`/flows/${id}`);
      loadFlows();
    } catch (err) {
      showAlert('Error', 'Failed to delete flow.');
    }
  };

  const handleDeleteFlow = (id: string) => {
    showConfirm(
      'Delete Bot Menu Flow',
      'Are you sure you want to delete this bot menu flow?',
      () => executeDeleteFlow(id)
    );
  };

  const handleToggleFlowActive = async (flow: any) => {
    try {
      await api.patch(`/flows/${flow._id}`, { isActive: !flow.isActive });
      loadFlows();
    } catch (err) {
      showAlert('Error', 'Failed to toggle flow status.');
    }
  };

  // Open Simulator
  const handleOpenSimulator = (flow: any) => {
    setSimulatedFlow(flow);
    setSimulatedChat([
      {
        sender: 'bot',
        text: '👋 Type "hi" or "menu" to trigger the automated WhatsApp IVR Bot!',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setSimulatedInput('');
    setIsTestingModalOpen(true);
  };

  const handleSendSimulatorMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!simulatedInput.trim() || !simulatedFlow) return;

    const userText = simulatedInput.trim();
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Add user message
    const updatedMessages = [
      ...simulatedChat,
      { sender: 'user' as const, text: userText, time: timeStr },
    ];
    setSimulatedChat(updatedMessages);
    setSimulatedInput('');

    // Evaluate response logic
    const cleanedText = userText.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, '');
    const keywords = (simulatedFlow.triggerKeyword || '').split(',').map((k: string) => k.trim().toLowerCase());

    const isMatchedKeyword = keywords.some(
      (kw: string) => cleanedText === kw || cleanedText.startsWith(kw + ' ') || cleanedText.endsWith(' ' + kw)
    );

    let replyMessage: string | null = null;
    if (isMatchedKeyword) {
      replyMessage = simulatedFlow.welcomeMessage.replace(/{{business_name}}/gi, 'WhatsApp Store');
    } else {
      const matchedOption = (simulatedFlow.options || []).find(
        (opt: any) => opt.key.trim().toLowerCase() === cleanedText
      );
      if (matchedOption) {
        replyMessage = matchedOption.responseMessage;
      }
    }

    // Simulate bot delay
    setTimeout(() => {
      if (replyMessage) {
        setSimulatedChat((prev) => [
          ...prev,
          { sender: 'bot', text: replyMessage!, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
        ]);
      } else {
        setSimulatedChat((prev) => [
          ...prev,
          {
            sender: 'bot',
            text: `⚠️ Unrecognized input "${userText}". Type "menu" or "1" to see options.`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      }
    }, 400);
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Bot className="w-5 h-5 text-primary" />
            <span>WhatsApp Auto-Reply & IVR Bot Builder</span>
          </h1>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            Configure automated menu responses, trigger rules (e.g. Press 1 for Menu, 2 for Order) and keyword handlers
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenCreateModal}
            className="px-3.5 py-1.5 bg-primary hover:bg-primary-hover font-bold text-white text-xs rounded-lg transition-all flex items-center gap-1.5 shadow"
          >
            <Plus className="w-3.5 h-3.5 text-white" />
            <span>Create New Bot Menu</span>
          </button>
        </div>
      </div>

      {/* Info Banner */}
      <div className="p-3.5 bg-primary-light/40 border border-primary/20 rounded-xl flex items-start gap-3">
        <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" />
        <div className="text-xs text-slate-700 dark:text-slate-300">
          <span className="font-bold text-primary block mb-0.5">How WhatsApp Bot Flows Work</span>
          When a customer sends a message matching your trigger keywords (e.g. <code className="bg-white dark:bg-slate-900 px-1 py-0.5 rounded text-primary border border-primary/20 font-mono text-[10px]">hi, menu, start</code>), the bot instantly sends your welcome menu. When the customer replies with an option number (e.g. <code className="bg-white dark:bg-slate-900 px-1 py-0.5 rounded text-primary border border-primary/20 font-mono text-[10px]">1</code> or <code className="bg-white dark:bg-slate-900 px-1 py-0.5 rounded text-primary border border-primary/20 font-mono text-[10px]">2</code>), the bot automatically replies with the specified option message!
        </div>
      </div>

      {/* Flows Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {isLoading ? (
          <div className="col-span-2 py-16 text-center text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto mb-2" />
            <span>Loading bot flow workflows...</span>
          </div>
        ) : flows.length > 0 ? (
          flows.map((flow) => (
            <div
              key={flow._id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-md space-y-3 transition-colors flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Title & Status */}
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span>{flow.title}</span>
                    </h3>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Triggers:</span>
                      <div className="flex flex-wrap gap-1">
                        {(flow.triggerKeyword || '').split(',').map((kw: string) => (
                          <span key={kw} className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-primary-light text-primary border border-primary/20">
                            {kw.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleToggleFlowActive(flow)}
                    className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold border transition-all flex items-center gap-1 ${
                      flow.isActive
                        ? 'bg-primary-light text-primary border-primary/30'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-300 dark:border-slate-700'
                    }`}
                  >
                    {flow.isActive ? <Play className="w-2.5 h-2.5 fill-current" /> : <Pause className="w-2.5 h-2.5 fill-current" />}
                    <span>{flow.isActive ? 'Active Bot' : 'Paused'}</span>
                  </button>
                </div>

                {/* Welcome Message Preview */}
                <div className="p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg text-xs text-slate-700 dark:text-slate-300 space-y-1">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Greeting Welcome Menu:</span>
                  <p className="whitespace-pre-wrap font-sans text-[11px] line-clamp-3 text-slate-800 dark:text-slate-200">{flow.welcomeMessage}</p>
                </div>

                {/* Option Branches Preview */}
                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Menu Response Branches ({flow.options?.length || 0}):</span>
                  <div className="space-y-1">
                    {(flow.options || []).map((opt: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between p-1.5 rounded bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-850 text-[10px]">
                        <div className="flex items-center gap-1.5">
                          <span className="px-1.5 py-0.5 rounded bg-primary-light text-primary font-bold font-mono text-[9px] border border-primary/20">
                            Key {opt.key}
                          </span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200">{opt.label}</span>
                        </div>
                        <span className="text-[9px] text-slate-400 truncate max-w-[150px]">{opt.responseMessage}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Visual Flowchart Tree Hierarchy */}
                {expandedHierarchy[flow._id] && renderFlowHierarchy(flow)}
              </div>

              {/* Actions Footer */}
              <div className="flex justify-between items-center border-t border-slate-100 dark:border-slate-800 pt-3 mt-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenSimulator(flow)}
                    className="px-2.5 py-1 bg-slate-105 dark:bg-slate-800 hover:bg-slate-250 dark:hover:bg-slate-700 text-slate-750 dark:text-slate-200 text-[10px] font-bold rounded-lg transition-colors flex items-center gap-1 shadow-sm border border-slate-200 dark:border-slate-800"
                  >
                    <Smartphone className="w-3.5 h-3.5 text-primary" />
                    <span>Test Simulator</span>
                  </button>

                  <button
                    onClick={() => toggleHierarchy(flow._id)}
                    className="px-2.5 py-1 bg-slate-105 dark:bg-slate-800 hover:bg-slate-250 dark:hover:bg-slate-700 text-slate-750 dark:text-slate-205 text-[10px] font-bold rounded-lg transition-colors flex items-center gap-1 border border-slate-200 dark:border-slate-800 shadow-sm"
                  >
                    <Layers className="w-3.5 h-3.5 text-primary" />
                    <span>{expandedHierarchy[flow._id] ? 'Hide Tree' : 'View Tree Hierarchy'}</span>
                  </button>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEditModal(flow)}
                    className="p-1.5 rounded hover:bg-primary-light text-slate-400 hover:text-primary transition-colors"
                    title="Edit Bot Rules"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteFlow(flow._id)}
                    className="p-1.5 rounded hover:bg-rose-500/10 text-slate-400 hover:text-rose-500 transition-colors"
                    title="Delete Bot Rule"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-2 py-16 text-center text-slate-400 space-y-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8">
            <Bot className="w-10 h-10 text-primary mx-auto opacity-70" />
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No Auto-Reply Bot Rules Configured</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">Create your first automated WhatsApp menu (e.g. Press 1 for Menu, 2 for Order) to handle customer inquiries automatically.</p>
            </div>
            <button
              onClick={handleOpenCreateModal}
              className="px-4 py-2 bg-primary text-white font-bold text-xs rounded-lg hover:bg-primary-hover shadow inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4 text-white" />
              <span>Create Store IVR Menu</span>
            </button>
          </div>
        )}
      </div>

      {/* Editor Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full p-5 shadow-2xl space-y-4 my-8 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Bot className="w-4 h-4 text-primary" />
                <span>{editingFlowId ? 'Edit Bot Flow Menu' : 'Configure New WhatsApp IVR Menu'}</span>
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-900 dark:hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveFlow} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Flow Menu Name</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="E.g. Main Customer Store Menu"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:border-primary/50"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Trigger Keywords (Comma Separated)</label>
                  <input
                    type="text"
                    value={triggerKeyword}
                    onChange={(e) => setTriggerKeyword(e.target.value)}
                    placeholder="E.g. hi, hello, menu, start, 1"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:border-primary/50"
                  />
                </div>
              </div>

              {/* Welcome Message */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Greeting Welcome Menu Text</label>
                <textarea
                  value={welcomeMessage}
                  onChange={(e) => setWelcomeMessage(e.target.value)}
                  rows={4}
                  placeholder="Type the message sent when triggered..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:border-primary/50"
                />
              </div>

              {/* Dynamic Option Branch Builder */}
              <div className="space-y-2 border-t border-slate-200 dark:border-slate-800 pt-3">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Response Option Branches ({options.length})</label>
                  <button
                    type="button"
                    onClick={handleAddOption}
                    className="text-[10px] text-primary hover:underline font-bold flex items-center gap-0.5"
                  >
                    <Plus className="w-3 h-3" /> Add Response Branch
                  </button>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {options.map((opt, idx) => (
                    <div key={idx} className="p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl space-y-2 relative">
                      <div className="flex items-center gap-2">
                        <div className="w-20 space-y-0.5">
                          <span className="text-[8px] font-bold text-slate-400 uppercase">Reply Key</span>
                          <input
                            type="text"
                            value={opt.key}
                            onChange={(e) => handleOptionChange(idx, 'key', e.target.value)}
                            placeholder="1"
                            className="w-full px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded text-xs font-mono font-bold text-primary focus:outline-none"
                          />
                        </div>

                        <div className="flex-1 space-y-0.5">
                          <span className="text-[8px] font-bold text-slate-400 uppercase">Option Title / Label</span>
                          <input
                            type="text"
                            value={opt.label}
                            onChange={(e) => handleOptionChange(idx, 'label', e.target.value)}
                            placeholder="Main Menu"
                            className="w-full px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded text-xs text-slate-900 dark:text-white focus:outline-none"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveOption(idx)}
                          className="p-1 text-slate-400 hover:text-rose-500 self-end mb-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="space-y-0.5">
                        <span className="text-[8px] font-bold text-slate-400 uppercase">Automated Response Text</span>
                        <textarea
                          value={opt.responseMessage}
                          onChange={(e) => handleOptionChange(idx, 'responseMessage', e.target.value)}
                          rows={2}
                          placeholder="Type automated response for this option..."
                          className="w-full px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded text-xs text-slate-900 dark:text-white focus:outline-none"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-between items-center border-t border-slate-200 dark:border-slate-800 pt-3">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="flowActiveCheck"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="rounded border-slate-300 text-primary focus:ring-primary"
                  />
                  <label htmlFor="flowActiveCheck" className="text-xs text-slate-700 dark:text-slate-300 font-semibold cursor-pointer">
                    Enable & Activate Bot Rule
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-lg text-xs hover:bg-slate-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-1.5 bg-primary text-white font-bold text-xs rounded-lg hover:bg-primary-hover shadow flex items-center gap-1"
                  >
                    {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Save & Deploy Bot'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Simulator Modal */}
      {isTestingModalOpen && simulatedFlow && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-sm w-full p-4 shadow-2xl space-y-3 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-primary" />
                <span className="text-xs font-bold text-slate-900 dark:text-white">WhatsApp Live Simulator</span>
              </div>
              <button onClick={() => setIsTestingModalOpen(false)} className="text-slate-400 hover:text-slate-900 dark:hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Smartphone Timeline screen */}
            <div className="h-80 bg-[#efeae2] dark:bg-[#0b141a] rounded-xl p-3 overflow-y-auto space-y-2 border border-slate-200 dark:border-slate-800">
              {simulatedChat.map((m, idx) => (
                <div key={idx} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[85%] p-2 rounded-lg text-xs space-y-1 shadow ${
                      m.sender === 'user'
                        ? 'bg-[#d9fdd3] dark:bg-[#005c4b] text-[#111b21] dark:text-[#e9edef] rounded-tr-none'
                        : 'bg-white dark:bg-[#202c33] text-[#111b21] dark:text-[#e9edef] rounded-tl-none'
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words">{m.text}</p>
                    <span className="text-[8px] text-[#667781] dark:text-[#8696a0] text-right block leading-none">{m.time}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendSimulatorMessage} className="flex gap-2">
              <input
                type="text"
                value={simulatedInput}
                onChange={(e) => setSimulatedInput(e.target.value)}
                placeholder="Type 'hi' or '1' or '2'..."
                className="flex-1 px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none"
              />
              <button type="submit" className="p-2 bg-primary text-white rounded-lg hover:bg-primary-hover shadow">
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Custom Dialog Box Modal overlay */}
      {dialog.isOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-sm w-full p-5 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="space-y-1 text-xs">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Info className="w-4 h-4 text-primary shrink-0" />
                <span>{dialog.title}</span>
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">{dialog.description}</p>
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800 pt-3 mt-1">
              <button
                type="button"
                onClick={closeDialog}
                className="px-3.5 py-1.5 bg-slate-105 dark:bg-slate-850 text-slate-600 dark:text-slate-300 font-bold rounded-lg text-xs hover:bg-slate-200 transition-colors"
              >
                {dialog.type === 'alert' ? 'Close' : 'Cancel'}
              </button>
              {dialog.type !== 'alert' && (
                <button
                  type="button"
                  onClick={dialog.onConfirm}
                  className="px-4 py-1.5 bg-primary text-white font-bold rounded-lg text-xs hover:bg-primary-hover shadow transition-colors"
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
