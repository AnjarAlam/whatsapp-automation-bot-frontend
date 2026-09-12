'use client';

import React, { useEffect, useState, useRef } from 'react';
import {
  MessageSquare,
  Search,
  Send,
  User,
  Phone,
  Check,
  CheckCheck,
  Loader2,
  Clock,
  Bot,
} from 'lucide-react';
import { api } from '../../../lib/api';
import { formatDate, formatTimeOnly } from '../../../lib/utils';

export default function ConversationsPage() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConv, setActiveConv] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [isLoadingConvs, setIsLoadingConvs] = useState(true);
  const [isLoadingMsgs, setIsLoadingMsgs] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadConversations = async () => {
    try {
      const res = await api.get('/conversations');
      const data = res.data || [];
      setConversations(data);
      if (data.length > 0 && !activeConv) {
        setActiveConv(data[0]);
      }
    } catch (err) {
      console.error('Failed to load conversations:', err);
    } finally {
      setIsLoadingConvs(false);
    }
  };

  const loadMessages = async (convId: string) => {
    setIsLoadingMsgs(true);
    try {
      const res = await api.get(`/conversations/${convId}/messages`);
      setMessages(res.data || []);
    } catch (err) {
      console.error('Failed to load chat messages:', err);
    } finally {
      setIsLoadingMsgs(false);
    }
  };

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (activeConv) {
      loadMessages(activeConv._id);
    }
  }, [activeConv]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConv || isSending) return;

    const messageText = newMessage;
    setNewMessage('');
    setIsSending(true);

    try {
      await api.post(`/conversations/${activeConv._id}/messages`, {
        message: messageText,
      });
      loadMessages(activeConv._id);
      loadConversations();
    } catch (err) {
      alert('Failed to send WhatsApp message. Please check WhatsApp connection status.');
    } finally {
      setIsSending(false);
    }
  };

  const filteredConversations = conversations.filter((c) => {
    const custName = c.customerId?.name || '';
    const custPhone = c.customerId?.mobile || '';
    const term = search.toLowerCase();
    return custName.toLowerCase().includes(term) || custPhone.includes(term);
  });

  return (
    <div className="h-[calc(100vh-6.5rem)] bg-white dark:bg-white border border-slate-200 dark:border-slate-200 rounded-2xl shadow-sm overflow-hidden flex">
      {/* Left Sidebar: Customer Conversations List */}
      <div className="w-80 md:w-96 border-r border-slate-200 dark:border-slate-200 flex flex-col shrink-0 bg-slate-50/50 dark:bg-slate-50/40">
        <div className="p-4 border-b border-slate-200 dark:border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-900 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-emerald-500" />
              <span>Customer Conversations</span>
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              {conversations.length} Active
            </span>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search chat list..."
              className="w-full pl-8 pr-3 py-1.5 bg-white dark:bg-white border border-slate-200 dark:border-slate-200 rounded-xl text-xs text-slate-900 dark:text-slate-900 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Conversation List Items */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
          {isLoadingConvs ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              <Loader2 className="w-5 h-5 animate-spin mx-auto text-emerald-500 mb-1" />
              Loading customer chats...
            </div>
          ) : filteredConversations.length > 0 ? (
            filteredConversations.map((conv) => {
              const isActive = activeConv?._id === conv._id;
              const customerName = conv.customerId?.name || 'Customer';
              const customerMobile = conv.customerId?.mobile || '';

              return (
                <div
                  key={conv._id}
                  onClick={() => setActiveConv(conv)}
                  className={`p-3.5 flex items-center gap-3 cursor-pointer transition-colors ${
                    isActive
                      ? 'bg-emerald-500/10 dark:bg-emerald-500/15 border-l-4 border-emerald-500'
                      : 'hover:bg-slate-100/60 dark:hover:bg-slate-100/40'
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-sm shrink-0 border border-emerald-500/30">
                    {customerName[0]?.toUpperCase()}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-slate-900 truncate">
                        {customerName}
                      </h4>
                      <span className="text-[10px] text-slate-400 shrink-0">
                        {formatTimeOnly(conv.lastMessageAt || conv.updatedAt)}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">
                      {conv.lastMessage || 'No messages yet'}
                    </p>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-12 text-center text-slate-400 text-xs px-4">
              No chat conversations found.
            </div>
          )}
        </div>
      </div>

      {/* Right Window: Active Chat Window */}
      {activeConv ? (
        <div className="flex-1 flex flex-col bg-slate-100/70 dark:bg-[#0b141a]">
          {/* Active Chat Header */}
          <div className="h-16 px-6 border-b border-slate-200 dark:border-slate-200/80 bg-white dark:bg-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-xs border border-emerald-500/30">
                {activeConv.customerId?.name?.[0]?.toUpperCase() || 'C'}
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-slate-900">
                  {activeConv.customerId?.name || 'WhatsApp Customer'}
                </h3>
                <p className="text-[11px] text-slate-400 font-mono">
                  {activeConv.customerId?.mobile}
                </p>
              </div>
            </div>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 p-6 overflow-y-auto space-y-3">
            {isLoadingMsgs ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                <Loader2 className="w-6 h-6 animate-spin mx-auto text-emerald-500 mb-2" />
                Loading message history...
              </div>
            ) : messages.length > 0 ? (
              messages.map((msg) => {
                const isOutgoing = msg.direction === 'outgoing';
                return (
                  <div
                    key={msg._id}
                    className={`flex ${isOutgoing ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-md px-4 py-2.5 rounded-2xl text-xs space-y-1 shadow-sm ${
                        isOutgoing
                          ? 'bg-emerald-600 text-slate-900 rounded-tr-none'
                          : 'bg-white dark:bg-[#202c33] text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700/50 rounded-tl-none'
                      }`}
                    >
                      <p className="whitespace-pre-line leading-relaxed">{msg.message}</p>
                      <div
                        className={`flex items-center justify-end gap-1 text-[10px] ${
                          isOutgoing ? 'text-emerald-200' : 'text-slate-400'
                        }`}
                      >
                        <span>{formatTimeOnly(msg.timestamp || msg.createdAt)}</span>
                        {isOutgoing && (
                          <CheckCheck className="w-3 h-3 text-emerald-300" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-12 text-center text-slate-400 text-xs">
                No chat message log recorded for this customer yet.
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Bottom Message Input Bar */}
          <form
            onSubmit={handleSendMessage}
            className="p-4 bg-white dark:bg-white border-t border-slate-200 dark:border-slate-200/80 flex items-center gap-3 shrink-0"
          >
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a WhatsApp message..."
              className="flex-1 px-4 py-2.5 bg-slate-100 dark:bg-slate-50 border border-slate-200 dark:border-slate-200 rounded-xl text-xs text-slate-900 dark:text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
            />
            <button
              type="submit"
              disabled={isSending || !newMessage.trim()}
              className="py-2.5 px-4 bg-emerald-500 hover:bg-emerald-600 font-semibold text-white text-xs rounded-xl transition-all flex items-center gap-1.5 shadow-md shadow-emerald-500/20 disabled:opacity-40 shrink-0"
            >
              {isSending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Send</span>
                  <Send className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 text-xs space-y-2">
          <MessageSquare className="w-10 h-10 text-slate-400" />
          <p>Select a customer conversation to start messaging</p>
        </div>
      )}
    </div>
  );
}
