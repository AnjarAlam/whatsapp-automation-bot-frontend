'use client';

import React, { useEffect, useState } from 'react';
import {
  Users,
  MessageSquare,
  TrendingUp,
  AlertTriangle,
  Activity,
  Megaphone,
  Clock,
  CheckCircle2,
  ArrowUpRight,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { api } from '../../lib/api';
import { formatDate } from '../../lib/utils';
import { useThemeStore } from '../../store/use-theme-store';
import { useWhatsAppStore } from '../../store/use-whatsapp-store';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Legend
} from 'recharts';

export function OverviewTab() {
  const router = useRouter();
  const [stats, setStats] = useState({
    totalCustomers: 0,
    activeCampaigns: 0,
    sentToday: 0,
    deliveryRate: 0,
    failedMessages: 0,
  });
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [recentConversations, setRecentConversations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { theme } = useThemeStore() as any;
  const { status, connectedNumber, fetchStatus } = useWhatsAppStore();

  // Recharts Simulated Data - Only show trend data if campaigns exist
  const volumeData = campaigns.length > 0 ? [
    { name: '08:00', sent: 120, failed: 2 },
    { name: '10:00', sent: 240, failed: 8 },
    { name: '12:00', sent: 480, failed: 12 },
    { name: '14:00', sent: 390, failed: 5 },
    { name: '16:00', sent: 610, failed: 15 },
    { name: '18:00', sent: 720, failed: 4 },
    { name: '20:00', sent: 350, failed: 3 },
  ] : [
    { name: '00:00', sent: 0, failed: 0 }
  ];

  const campaignPerformanceData = campaigns.slice(0, 5).map((c) => ({
    name: c.name.length > 15 ? c.name.slice(0, 15) + '...' : c.name,
    Sent: c.stats?.sent || 0,
    Failed: c.stats?.failed || 0,
  }));

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [custRes, campRes, convRes] = await Promise.all([
          api.get('/customers?limit=1'),
          api.get('/campaigns'),
          api.get('/conversations'),
          fetchStatus()
        ]);

        const campaignList = campRes.data || [];
        const activeCamps = campaignList.filter(
          (c: any) => c.status === 'Running' || c.status === 'Scheduled'
        ).length;

        let totalSent = 0;
        let totalFailed = 0;

        campaignList.forEach((c: any) => {
          totalSent += c.stats?.sent || 0;
          totalFailed += c.stats?.failed || 0;
        });

        const totalDelivered = Math.max(0, totalSent - totalFailed);
        const rate = totalSent > 0 ? Math.round((totalDelivered / totalSent) * 100) : 0;

        setStats({
          totalCustomers: custRes.data.total || 0,
          activeCampaigns: activeCamps,
          sentToday: totalSent,
          deliveryRate: rate,
          failedMessages: totalFailed,
        });

        setCampaigns(campaignList);
        setRecentConversations((convRes.data || []).slice(0, 5));
      } catch (err) {
        console.error('Failed to load dashboard metrics:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-900">System Overview</h1>
          <p className="text-[11px] text-slate-400 dark:text-slate-450 mt-0.5">Real-time status updates and bulk broadcast dispatch tracking</p>
        </div>
      </div>

      {/* Row 1 KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3.5">
        {/* KPI 1: Customers */}
        <div className="p-3 bg-white dark:bg-white border border-slate-200 dark:border-slate-200 rounded-xl relative overflow-hidden flex flex-col justify-between h-[85px] hover:border-primary/50 dark:hover:border-slate-700 transition-colors shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">Customers</span>
            <Users className="w-3.5 h-3.5 text-blue-500" />
          </div>
          <div>
            <span className="text-lg font-black text-slate-900 dark:text-slate-900">{isLoading ? '...' : stats.totalCustomers}</span>
            <span className="text-[9px] text-primary font-semibold block mt-0.5">+12% month-over-month</span>
          </div>
        </div>

        {/* KPI 2: Active Broadcasts */}
        <div className="p-3 bg-white dark:bg-white border border-slate-200 dark:border-slate-200 rounded-xl relative overflow-hidden flex flex-col justify-between h-[85px] hover:border-primary/50 dark:hover:border-slate-700 transition-colors shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">Active Jobs</span>
            <Megaphone className="w-3.5 h-3.5 text-purple-500" />
          </div>
          <div>
            <span className="text-lg font-black text-slate-900 dark:text-slate-900">{isLoading ? '...' : stats.activeCampaigns}</span>
            <span className="text-[9px] text-slate-400 dark:text-slate-450 block mt-0.5">In queue processor</span>
          </div>
        </div>

        {/* KPI 3: Sent Messages */}
        <div className="p-3 bg-white dark:bg-white border border-slate-200 dark:border-slate-200 rounded-xl relative overflow-hidden flex flex-col justify-between h-[85px] hover:border-primary/50 dark:hover:border-slate-700 transition-colors shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">Sent Today</span>
            <MessageSquare className="w-3.5 h-3.5 text-primary" />
          </div>
          <div>
            <span className="text-lg font-black text-slate-900 dark:text-slate-900">{isLoading ? '...' : stats.sentToday}</span>
            <span className="text-[9px] text-slate-550 dark:text-slate-450 block mt-0.5">Dispatched logs</span>
          </div>
        </div>

        {/* KPI 4: Delivery Rate */}
        <div className="p-3 bg-white dark:bg-white border border-slate-200 dark:border-slate-200 rounded-xl relative overflow-hidden flex flex-col justify-between h-[85px] hover:border-primary/50 dark:hover:border-slate-700 transition-colors shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">Delivery Rate</span>
            <TrendingUp className="w-3.5 h-3.5 text-teal-500" />
          </div>
          <div>
            <span className="text-lg font-black text-teal-600 dark:text-teal-400">{isLoading ? '...' : `${stats.deliveryRate}%`}</span>
            <span className="text-[9px] text-slate-400 dark:text-slate-450 block mt-0.5">Target reached</span>
          </div>
        </div>

        {/* KPI 5: Failed Messages */}
        <div className="p-3 bg-white dark:bg-white border border-slate-200 dark:border-slate-200 rounded-xl relative overflow-hidden flex flex-col justify-between h-[85px] hover:border-primary/50 dark:hover:border-slate-700 transition-colors shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">Failed</span>
            <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
          </div>
          <div>
            <span className="text-lg font-black text-rose-600 dark:text-rose-500">{isLoading ? '...' : stats.failedMessages}</span>
            <span className="text-[9px] text-slate-550 dark:text-slate-450 block mt-0.5">Needs check</span>
          </div>
        </div>

        {/* KPI 6: WhatsApp Connection */}
        <div className="p-3 bg-white dark:bg-white border border-slate-200 dark:border-slate-200 rounded-xl relative overflow-hidden flex flex-col justify-between h-[85px] hover:border-primary/50 dark:hover:border-slate-700 transition-colors cursor-pointer shadow-sm" onClick={() => router.push('/whatsapp')}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-550 dark:text-slate-400 uppercase tracking-wider">WhatsApp Status</span>
            <Activity className="w-3.5 h-3.5 text-primary" />
          </div>
          <div>
            {status === 'CONNECTED' ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-primary bg-primary-light px-2 py-0.5 rounded border border-primary/20">
                Connected
              </span>
            ) : status === 'QR_READY' || status === 'CONNECTING' ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 animate-pulse">
                Pending QR
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-600 bg-rose-550/10 px-2 py-0.5 rounded border border-rose-500/20">
                Disconnected
              </span>
            )}
            <span className="text-[9px] text-slate-400 block truncate mt-1">
              {connectedNumber ? `+${connectedNumber}` : 'Configure device'}
            </span>
          </div>
        </div>
      </div>

      {/* Row 2: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: Message Volume Chart */}
        <div className="bg-white dark:bg-white border border-slate-200 dark:border-slate-200 rounded-xl p-4 shadow-md space-y-3 transition-colors">
          <div>
            <h3 className="text-xs font-bold text-slate-850 dark:text-slate-800">Message Volume Trend</h3>
            <p className="text-[10px] text-slate-400 dark:text-slate-400">Total sent vs failed messages across active processes</p>
          </div>
          <div className="h-60 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={volumeData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary-color)" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="var(--primary-color)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#64748b" fontSize={9} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={9} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: theme === 'dark' ? '#0f172a' : '#ffffff', borderColor: theme === 'dark' ? '#1e293b' : '#e2e8f0', color: theme === 'dark' ? '#f8fafc' : '#0f172a' }} />
                <Area type="monotone" dataKey="sent" stroke="var(--primary-color)" fillOpacity={1} fill="url(#colorSent)" strokeWidth={1.5} name="Sent Messages" />
                <Area type="monotone" dataKey="failed" stroke="#ef4444" fill="transparent" strokeWidth={1} name="Failed" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Campaign Performance Chart */}
        <div className="bg-white dark:bg-white border border-slate-200 dark:border-slate-200 rounded-xl p-4 shadow-md space-y-3 transition-colors">
          <div>
            <h3 className="text-xs font-bold text-slate-850 dark:text-slate-800">Campaign Performance</h3>
            <p className="text-[10px] text-slate-400 dark:text-slate-400">Comparing sent vs failed statistics per campaign</p>
          </div>
          <div className="h-60 w-full text-xs">
            {campaignPerformanceData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={campaignPerformanceData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#1e293b' : '#e2e8f0'} vertical={false} />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={9} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={9} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: theme === 'dark' ? '#0f172a' : '#ffffff', borderColor: theme === 'dark' ? '#1e293b' : '#e2e8f0', color: theme === 'dark' ? '#f8fafc' : '#0f172a' }} />
                  <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '10px' }} />
                  <Bar dataKey="Sent" fill="var(--primary-color)" radius={[4, 4, 0, 0]} barSize={15} />
                  <Bar dataKey="Failed" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={15} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-450 text-[10px]">
                Create & launch campaigns to display data comparisons.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Row 3: Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left: Recent Campaigns */}
        <div className="lg:col-span-2 bg-white dark:bg-white border border-slate-200 dark:border-slate-200 rounded-xl p-4 shadow-md space-y-3 transition-colors">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xs font-bold text-slate-850 dark:text-slate-800">Recent Campaigns</h3>
              <p className="text-[10px] text-slate-400 dark:text-slate-400">Launch states and BullMQ progress trackers</p>
            </div>
            <button onClick={() => router.push('/campaigns')} className="text-[10px] text-primary font-semibold hover:underline flex items-center gap-0.5">
              Manage Campaigns <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-700">
              <thead className="bg-slate-50 dark:bg-slate-50/60 uppercase text-[9px] tracking-wider text-slate-400 border-b border-slate-200 dark:border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Name</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Progress</th>
                  <th className="py-2.5 px-3 text-right">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400 text-[10px]">Loading campaigns...</td>
                  </tr>
                ) : campaigns.length > 0 ? (
                  campaigns.slice(0, 5).map((camp) => (
                    <tr key={camp._id} className="hover:bg-slate-50 dark:hover:bg-slate-50/20 transition-colors">
                      <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-slate-100 max-w-[120px] truncate">{camp.name}</td>
                      <td className="py-2.5 px-3 text-[10px]">
                        <span className="px-2 py-0.5 rounded bg-slate-50 dark:bg-slate-50 border border-slate-200 dark:border-slate-850 text-slate-650 dark:text-slate-400 font-medium">
                          {camp.type}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-[10px]">
                        {camp.status === 'Completed' ? (
                          <span className="inline-flex items-center gap-1 text-primary bg-primary-light px-2 py-0.5 rounded-full border border-primary/20">
                            <CheckCircle2 className="w-3 h-3" /> Done
                          </span>
                        ) : camp.status === 'Running' || camp.status === 'Scheduled' ? (
                          <span className="inline-flex items-center gap-1 text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                            <Clock className="w-3 h-3 animate-spin" /> {camp.status}
                          </span>
                        ) : (
                          <span className="text-slate-400 dark:text-slate-400 bg-slate-100 dark:bg-slate-50/80 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-200">
                            {camp.status}
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1 bg-slate-100 dark:bg-slate-850 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary"
                              style={{
                                width: `${
                                  camp.stats?.total
                                    ? Math.min(100, (camp.stats.sent / camp.stats.total) * 100)
                                    : 0
                                  }%`,
                                }}
                            ></div>
                          </div>
                          <span className="text-[9px] text-slate-400">{camp.stats?.sent || 0}/{camp.stats?.total || 0}</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-400 text-[10px]">{formatDate(camp.createdAt)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-450">No campaigns created yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Recent Customer Activity Feed */}
        <div className="bg-white dark:bg-white border border-slate-200 dark:border-slate-200 rounded-xl p-4 shadow-md space-y-3 transition-colors">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xs font-bold text-slate-850 dark:text-slate-800">Inbound Activity</h3>
              <p className="text-[10px] text-slate-400 dark:text-slate-400">Latest message responses</p>
            </div>
            <button onClick={() => router.push('/conversations')} className="text-[10px] text-primary font-semibold hover:underline">
              Open Chat
            </button>
          </div>

          <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
            {recentConversations.length > 0 ? (
              recentConversations.map((conv) => (
                <div key={conv._id} className="flex gap-2.5 items-start p-2 rounded bg-slate-50 dark:bg-slate-50/20 border border-slate-200 dark:border-slate-850">
                  <div className="w-6 h-6 rounded-full bg-primary-light text-primary flex items-center justify-center font-black text-[9px] border border-primary/20 shrink-0">
                    {conv.customerId?.name ? conv.customerId.name[0].toUpperCase() : 'C'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline">
                      <span className="text-[10px] font-bold text-slate-800 dark:text-slate-900 truncate max-w-[100px]">{conv.customerId?.name || 'WhatsApp Contact'}</span>
                      <span className="text-[8px] text-slate-400">{formatDate(conv.lastMessageAt || conv.updatedAt)}</span>
                    </div>
                    <p className="text-[9px] text-slate-550 dark:text-slate-400 truncate mt-0.5">{conv.lastMessage || 'No message history'}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center text-slate-450 text-[10px]">
                No customer exchanges recorded yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
