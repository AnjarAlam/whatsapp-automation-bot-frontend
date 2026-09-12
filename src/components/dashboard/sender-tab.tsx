'use client';

import React, { useEffect, useState, useRef } from 'react';
import {
  Send,
  Search,
  User,
  Clock,
  Loader2,
  FileText,
  AlertCircle,
  Check,
  CheckCheck,
  Paperclip,
  Image as ImageIcon,
  MoreVertical,
  MessageSquare,
  Smile,
  X
} from 'lucide-react';
import { api } from '../../lib/api';

export function SenderTab() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConversation, setActiveConversation] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  
  // Message inputs
  const [inputMessage, setInputMessage] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  
  // States
  const [isLoadingConv, setIsLoadingConv] = useState(true);
  const [isLoadingMsg, setIsLoadingMsg] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadConversations = async (autoSelect = false) => {
    try {
      const res = await api.get('/conversations');
      const list = res.data || [];
      setConversations(list);
      if (autoSelect && list.length > 0 && !activeConversation) {
        handleSelectConversation(list[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingConv(false);
    }
  };

  const loadTemplates = () => {
    const raw = localStorage.getItem('autowhatsapp_templates');
    if (raw) {
      setTemplates(JSON.parse(raw));
    }
  };

  // Setup periodic refresh polling (4 seconds)
  useEffect(() => {
    loadConversations(true);
    loadTemplates();
  }, []);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await api.get('/conversations');
        const list = res.data || [];
        setConversations(list);

        if (activeConversation) {
          const msgRes = await api.get(`/conversations/${activeConversation._id}/messages`);
          setMessages(msgRes.data || []);
        }
      } catch (err) {
        console.error('Failed to sync conversations:', err);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [activeConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSelectConversation = async (conv: any) => {
    setActiveConversation(conv);
    setIsLoadingMsg(true);
    try {
      const res = await api.get(`/conversations/${conv._id}/messages`);
      setMessages(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingMsg(false);
    }
  };

  const handleSendMessage = async () => {
    if ((!inputMessage.trim() && !imageUrl.trim()) || !activeConversation || isSending) return;
    setIsSending(true);
    try {
      const res = await api.post(`/conversations/${activeConversation._id}/messages`, {
        message: inputMessage,
        imageUrl: imageUrl || undefined,
      });

      setMessages((prev) => [...prev, res.data.message]);
      setInputMessage('');
      setImageUrl('');
      loadConversations(false);
    } catch (err) {
      alert('Failed to dispatch manual WhatsApp reply. Ensure session is online.');
    } finally {
      setIsSending(false);
    }
  };

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

  const handleSelectTemplate = (content: string) => {
    setInputMessage(content);
  };

  const filteredConversations = conversations.filter((c) => {
    const nameMatch = c.customerId?.name?.toLowerCase().includes(search.toLowerCase());
    const phoneMatch = c.customerId?.mobile?.includes(search);
    return nameMatch || phoneMatch;
  });

  return (
    <div className="bg-[#f0f2f5] dark:bg-[#111b21] border border-slate-200 dark:border-slate-200 rounded-xl h-[calc(100vh-120px)] flex overflow-hidden shadow-lg transition-colors duration-300 animate-in fade-in">
      
      {/* Left Sidebar: Conversations list */}
      <div className="w-[340px] border-r border-[#e9edef] dark:border-[#222d34] flex flex-col shrink-0 bg-white dark:bg-[#111b21]">
        
        {/* WhatsApp Left Header */}
        <div className="h-[59px] px-4 py-3 bg-[#f0f2f5] dark:bg-[#202c33] flex justify-between items-center shrink-0 border-r border-[#d1d7db] dark:border-[#374248]">
          <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-[#2a3942] border border-slate-300 dark:border-slate-700 flex items-center justify-center font-bold text-xs text-slate-600 dark:text-slate-800">
            Own
          </div>
          <div className="flex items-center gap-3 text-slate-600 dark:text-slate-350">
            <MessageSquare className="w-5 h-5 cursor-pointer hover:text-slate-800 dark:hover:text-slate-900" />
            <MoreVertical className="w-5 h-5 cursor-pointer hover:text-slate-800 dark:hover:text-slate-900" />
          </div>
        </div>

        {/* Search Chat Input Area */}
        <div className="p-2.5 bg-white dark:bg-[#111b21] border-b border-[#e9edef] dark:border-[#222d34]">
          <div className="flex items-center gap-2 bg-[#f0f2f5] dark:bg-[#202c33] rounded-lg px-3 py-1.5">
            <Search className="w-4 h-4 text-slate-400 dark:text-[#8696a0]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search or start new chat"
              className="bg-transparent text-[13px] text-slate-900 dark:text-[#e9edef] focus:outline-none placeholder-[#667781] dark:placeholder-[#8696a0] w-full"
            />
          </div>
        </div>

        {/* Active chats lists scroll */}
        <div className="flex-1 overflow-y-auto divide-y divide-[#f0f2f5] dark:divide-[#222d34]">
          {isLoadingConv ? (
            <div className="py-16 text-center text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto mb-2" />
              <span>Loading messages...</span>
            </div>
          ) : filteredConversations.length > 0 ? (
            filteredConversations.map((c) => {
              const isActive = activeConversation?._id === c._id;
              return (
                <div
                  key={c._id}
                  onClick={() => handleSelectConversation(c)}
                  className={`px-4 py-3 cursor-pointer transition-colors flex gap-3 items-center ${
                    isActive ? 'bg-[#eae6df] dark:bg-[#2a3942]' : 'hover:bg-[#f5f6f6] dark:hover:bg-[#202c33]'
                  }`}
                >
                  <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-[#2a3942] border border-slate-200 dark:border-slate-700 flex items-center justify-center font-bold text-sm text-primary shrink-0">
                    {c.customerId?.name ? c.customerId.name[0].toUpperCase() : 'C'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline">
                      <span className="text-[14.5px] font-normal text-[#111b21] dark:text-[#e9edef] truncate">{c.customerId?.name || 'Contact'}</span>
                      <span className="text-[11px] text-[#667781] dark:text-[#8696a0] font-normal font-sans">
                        {c.lastMessageAt ? new Date(c.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                    </div>
                    <p className="text-[13px] text-[#667781] dark:text-[#8696a0] truncate mt-0.5">{c.lastMessage || 'No message history'}</p>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-16 text-center text-[#667781] dark:text-[#8696a0] text-xs">No active conversations found.</div>
          )}
        </div>
      </div>

      {/* Right Content Area: WhatsApp Chat */}
      <div className="flex-1 flex flex-col justify-between bg-[#efeae2] dark:bg-[#0b141a]">
        {activeConversation ? (
          <>
            {/* Active chat Partner Info Header */}
            <div className="h-[59px] px-4 py-3 bg-[#f0f2f5] dark:bg-[#202c33] flex justify-between items-center shrink-0 border-b border-[#e9edef] dark:border-[#222d34] transition-colors duration-300">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-[#2a3942] border border-slate-200 dark:border-slate-700 flex items-center justify-center font-bold text-xs text-primary shrink-0">
                  {activeConversation.customerId?.name ? activeConversation.customerId.name[0].toUpperCase() : 'C'}
                </div>
                <div>
                  <h4 className="text-[14.5px] font-semibold text-[#111b21] dark:text-[#e9edef] leading-tight">{activeConversation.customerId?.name}</h4>
                  <p className="text-[11px] text-[#667781] dark:text-[#8696a0] mt-0.5">+{activeConversation.customerId?.mobile}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-slate-600 dark:text-[#8696a0]">
                <Search className="w-5 h-5 cursor-pointer hover:text-slate-800 dark:hover:text-slate-900" />
                <MoreVertical className="w-5 h-5 cursor-pointer hover:text-slate-800 dark:hover:text-slate-900" />
              </div>
            </div>

            {/* Chat Timeline message content */}
            <div className="flex-1 p-5 overflow-y-auto space-y-2.5 relative bg-[#efeae2] dark:bg-[#0b141a] transition-colors duration-300">
              {isLoadingMsg ? (
                <div className="absolute inset-0 bg-[#efeae2]/90 dark:bg-[#0b141a]/90 flex items-center justify-center z-10">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : messages.length > 0 ? (
                messages.map((m, idx) => {
                  const isOutgoing = m.direction === 'outgoing' || m.direction === 'OUTGOING';
                  return (
                    <div key={m._id || idx} className={`flex ${isOutgoing ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-[65%] p-2 rounded-lg text-[13.5px] shadow-sm relative space-y-1 ${
                          isOutgoing
                            ? 'bg-[#d9fdd3] dark:bg-[#005c4b] text-[#111b21] dark:text-[#e9edef] rounded-tr-none'
                            : 'bg-white dark:bg-[#202c33] text-[#111b21] dark:text-[#e9edef] rounded-tl-none'
                        }`}
                      >
                        {m.imageUrl && (
                          <img
                            src={m.imageUrl}
                            alt="Media message"
                            className="w-full max-h-48 object-cover rounded-md mb-1 cursor-pointer hover:opacity-90"
                            onError={(e) => { (e.target as any).style.display = 'none'; }}
                          />
                        )}
                        <p className="whitespace-pre-wrap break-words leading-normal font-sans pr-6">{m.message}</p>
                        
                        <div className="absolute bottom-1 right-1.5 flex items-center gap-0.5 text-[9px] text-[#667781] dark:text-[#8696a0] leading-none">
                          <span>
                            {new Date(m.createdAt || m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                          </span>
                          {isOutgoing && (
                            m.status === 'sent' || m.status === 'SENT' ? (
                              <Check className="w-3.5 h-3.5 text-slate-400 dark:text-[#8696a0]" />
                            ) : m.status === 'failed' || m.status === 'FAILED' ? (
                              <AlertCircle className="w-3 h-3 text-rose-500" />
                            ) : (
                              <CheckCheck className="w-3.5 h-3.5 text-sky-500" />
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                  No conversation logs found. Send a message to start!
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Bottom Composer and Attachments panel */}
            <div className="bg-[#f0f2f5] dark:bg-[#202c33] px-4 py-3 flex flex-col gap-2 shrink-0 border-t border-[#e9edef] dark:border-[#222d34] transition-colors duration-300">
              
              {/* Optional Quick Template select line */}
              {templates.length > 0 && (
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
                  <FileText className="w-3.5 h-3.5 text-slate-400 dark:text-slate-400 shrink-0" />
                  <span className="text-[9px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider shrink-0 mr-1">Templates:</span>
                  {templates.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => handleSelectTemplate(t.content)}
                      className="px-2 py-0.5 bg-white dark:bg-[#2a3942] border border-[#d1d7db] dark:border-[#374248] text-[10px] text-slate-700 dark:text-[#e9edef] hover:bg-slate-100 rounded shrink-0 transition-colors"
                    >
                      {t.title}
                    </button>
                  ))}
                </div>
              )}

              {/* Upload image preview panel */}
              {imageUrl && (
                <div className="flex items-center justify-between bg-white dark:bg-[#2a3942] p-1.5 rounded-lg border border-[#e9edef] dark:border-[#374248] animate-in slide-in-from-bottom-2">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-primary shrink-0" />
                    <span className="text-[10px] text-slate-550 dark:text-slate-700 font-medium truncate max-w-xs">{imageUrl}</span>
                  </div>
                  <button onClick={() => setImageUrl('')} className="p-0.5 text-rose-500 hover:text-rose-600">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Input text + Select button row */}
              <div className="flex items-center gap-2">
                {/* Paperclip local file select icon */}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  id="chatImageUploadLocalFile"
                  className="hidden"
                />
                <label
                  htmlFor="chatImageUploadLocalFile"
                  className="p-2 bg-transparent text-slate-600 dark:text-[#8696a0] hover:bg-slate-200 dark:hover:bg-[#2a3942] rounded-full cursor-pointer shrink-0 transition-all"
                  title="Attach Local Image File"
                >
                  {isUploadingImage ? (
                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                  ) : (
                    <Paperclip className="w-5 h-5" />
                  )}
                </label>

                <Smile className="w-6 h-6 text-slate-600 dark:text-[#8696a0] cursor-pointer hover:text-slate-800 dark:hover:text-slate-900 shrink-0" />

                {/* Input text */}
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type a message"
                  className="flex-1 px-4 py-2 bg-white dark:bg-[#2a3942] rounded-lg text-sm text-slate-900 dark:text-[#e9edef] placeholder-[#667781] dark:placeholder-[#8696a0] focus:outline-none"
                />

                {/* Send Button */}
                <button
                  onClick={handleSendMessage}
                  disabled={isSending || isUploadingImage}
                  className="p-2 bg-[#00a884] hover:bg-[#008f72] text-slate-900 rounded-full flex items-center justify-center shrink-0 disabled:opacity-40 transition-all shadow-md"
                >
                  {isSending ? (
                    <Loader2 className="w-4 h-4 animate-spin text-slate-900" />
                  ) : (
                    <Send className="w-4 h-4 text-slate-900" />
                  )}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 text-sm">
            <div className="text-center space-y-2">
              <span className="text-4xl block">💬</span>
              <h3 className="text-base font-medium text-slate-800 dark:text-slate-700">WhatsApp Direct Chats</h3>
              <p className="text-[11px] text-slate-450 max-w-xs leading-normal">Select a conversation thread to review broadcast records or reply manually.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
