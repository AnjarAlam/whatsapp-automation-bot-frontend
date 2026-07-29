'use client';

import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { formatDate } from '../../lib/utils';
import {
  ShoppingCart,
  Clock,
  MapPin,
  Utensils,
  CheckCircle,
  Play,
  XCircle,
  Search,
  RefreshCw,
  MessageSquare
} from 'lucide-react';

interface Order {
  _id: string;
  customer: {
    _id: string;
    name: string;
    mobile: string;
  };
  items: string[];
  deliveryType: 'Dine-in' | 'Delivery';
  tableNumber?: string;
  deliveryAddress?: string;
  status: 'Pending' | 'Preparing' | 'Completed' | 'Cancelled';
  createdAt: string;
}

export function OrdersTab() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'All' | 'Pending' | 'Preparing' | 'Completed'>('All');
  const [search, setSearch] = useState('');

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/orders');
      setOrders(response.data);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateStatus = async (orderId: string, newStatus: string) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { status: newStatus });
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status: newStatus as any } : o))
      );
    } catch (error) {
      console.error('Failed to update order status:', error);
      alert('Error updating order status');
    }
  };

  const deleteOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to delete this order record?')) return;
    try {
      await api.delete(`/orders/${orderId}`);
      setOrders((prev) => prev.filter((o) => o._id !== orderId));
    } catch (error) {
      console.error('Failed to delete order:', error);
      alert('Error deleting order record');
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesFilter = filter === 'All' || order.status === filter;
    const matchesSearch =
      order.customer?.name.toLowerCase().includes(search.toLowerCase()) ||
      order.customer?.mobile.includes(search) ||
      order.items.some((item) => item.toLowerCase().includes(search.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-primary" />
            <span>Orders & POS Tracker</span>
          </h1>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            Monitor restaurant orders received through the automated WhatsApp Ordering Bot
          </p>
        </div>
        <button
          onClick={fetchOrders}
          disabled={isLoading}
          className="self-start sm:self-center p-2 rounded-lg bg-slate-105 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 flex items-center gap-1.5 text-xs font-semibold shadow-sm transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Tickets</span>
        </button>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Pending Queue', value: orders.filter((o) => o.status === 'Pending').length, color: 'text-amber-500 bg-amber-500/10' },
          { label: 'Preparing', value: orders.filter((o) => o.status === 'Preparing').length, color: 'text-indigo-500 bg-indigo-500/10' },
          { label: 'Completed Today', value: orders.filter((o) => o.status === 'Completed').length, color: 'text-emerald-500 bg-emerald-500/10' },
          { label: 'Total Placed', value: orders.length, color: 'text-primary bg-primary-light' }
        ].map((stat, i) => (
          <div key={i} className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between shadow-sm">
            <div>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">{stat.label}</span>
              <span className="text-base font-black text-slate-900 dark:text-white mt-0.5 block">{stat.value}</span>
            </div>
            <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${stat.color}`}>
              {stat.value}
            </span>
          </div>
        ))}
      </div>

      {/* Filter and search bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="flex bg-slate-100 dark:bg-slate-950 p-0.5 rounded-lg border border-slate-200 dark:border-slate-850 w-full sm:w-auto">
          {(['All', 'Pending', 'Preparing', 'Completed'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`flex-1 sm:flex-none px-4 py-1 rounded-md text-xs font-semibold transition-all ${
                filter === tab
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm border border-slate-200/50 dark:border-slate-800/30'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="relative flex-1 w-full">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by customer, phone, or pizza type..."
            className="w-full pl-9 pr-4 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-primary/50 transition-colors shadow-sm"
          />
        </div>
      </div>

      {/* Orders grid */}
      {isLoading ? (
        <div className="min-h-[250px] flex flex-col items-center justify-center text-slate-500 space-y-2.5">
          <RefreshCw className="w-7 h-7 text-primary animate-spin" />
          <p className="text-xs font-medium">Loading ticket queue...</p>
        </div>
      ) : filteredOrders.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredOrders.map((order) => {
            const timeDiff = Math.round((Date.now() - new Date(order.createdAt).getTime()) / 60000);
            const timeLabel = timeDiff < 1 ? 'Just now' : `${timeDiff}m ago`;

            return (
              <div
                key={order._id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-4 shadow hover:shadow-md transition-all relative overflow-hidden"
              >
                {/* Accent Top Border Indicator */}
                <div
                  className={`absolute top-0 left-0 right-0 h-1 ${
                    order.status === 'Pending'
                      ? 'bg-amber-500'
                      : order.status === 'Preparing'
                      ? 'bg-indigo-500'
                      : order.status === 'Completed'
                      ? 'bg-emerald-500'
                      : 'bg-slate-400'
                  }`}
                />

                {/* Card Header */}
                <div className="flex justify-between items-start pt-1">
                  <div>
                    <h3 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                      {order.customer?.name || 'WhatsApp Customer'}
                    </h3>
                    <span className="text-[10px] text-slate-450 block font-mono mt-0.5">
                      +{order.customer?.mobile}
                    </span>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                      order.status === 'Pending'
                        ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                        : order.status === 'Preparing'
                        ? 'bg-indigo-500/10 text-indigo-500 border border-indigo-500/20'
                        : order.status === 'Completed'
                        ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                        : 'bg-slate-100 dark:bg-slate-950 text-slate-500 border border-slate-250 dark:border-slate-850'
                    }`}
                  >
                    {order.status}
                  </span>
                </div>

                {/* Items Block */}
                <div className="py-2 border-y border-slate-100 dark:border-slate-850/60 my-2 space-y-1">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Ordered Items</span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {order.items.map((item, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 bg-slate-50 dark:bg-slate-950 rounded border border-slate-200 dark:border-slate-800 text-[10px] font-semibold text-slate-800 dark:text-slate-300"
                      >
                        🍕 {item}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Dispatch/Table Details */}
                <div className="space-y-2 text-[11px] text-slate-600 dark:text-slate-350">
                  <div className="flex items-center gap-2">
                    {order.deliveryType === 'Dine-in' ? (
                      <>
                        <Utensils className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          Dine-in: <span className="font-bold text-slate-900 dark:text-white">Table {order.tableNumber || 'N/A'}</span>
                        </span>
                      </>
                    ) : (
                      <>
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate" title={order.deliveryAddress}>
                          Delivery Address: <span className="font-bold text-slate-900 dark:text-white">{order.deliveryAddress || 'N/A'}</span>
                        </span>
                      </>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-[10px] text-slate-400">
                    <Clock className="w-3 h-3" />
                    <span>Received: {formatDate(order.createdAt)} ({timeLabel})</span>
                  </div>
                </div>

                {/* Card Action footer */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-850 flex items-center gap-2">
                  {order.status === 'Pending' && (
                    <>
                      <button
                        onClick={() => updateStatus(order._id, 'Preparing')}
                        className="flex-1 py-1.5 bg-indigo-650 hover:bg-indigo-600 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white font-bold text-[10px] rounded-lg transition-colors flex items-center justify-center gap-1 shadow-sm"
                      >
                        <Play className="w-3 h-3 text-white fill-white" />
                        <span>Start Preparing</span>
                      </button>
                      <button
                        onClick={() => updateStatus(order._id, 'Completed')}
                        className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-450 hover:bg-emerald-500/20 transition-all"
                        title="Mark Completed"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}

                  {order.status === 'Preparing' && (
                    <>
                      <button
                        onClick={() => updateStatus(order._id, 'Completed')}
                        className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] rounded-lg transition-colors flex items-center justify-center gap-1 shadow-sm"
                      >
                        <CheckCircle className="w-3 h-3 text-white" />
                        <span>Complete Order</span>
                      </button>
                      <button
                        onClick={() => updateStatus(order._id, 'Cancelled')}
                        className="p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-455 hover:bg-rose-500/20 transition-all"
                        title="Cancel Order"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}

                  {order.status === 'Completed' && (
                    <span className="text-[10px] text-emerald-500 font-bold flex items-center gap-1 mx-auto py-1">
                      <CheckCircle className="w-3.5 h-3.5" /> Order Completed & Served
                    </span>
                  )}

                  {order.status === 'Cancelled' && (
                    <span className="text-[10px] text-rose-550 font-bold flex items-center gap-1 mx-auto py-1">
                      <XCircle className="w-3.5 h-3.5" /> Order Cancelled
                    </span>
                  )}

                  {/* Delete option for logs */}
                  <button
                    onClick={() => deleteOrder(order._id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-550 hover:bg-rose-500/10 dark:hover:bg-rose-500/25 transition-all text-[10px] ml-auto font-bold border border-transparent hover:border-rose-500/20"
                    title="Delete Record"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="min-h-[250px] bg-slate-50 dark:bg-slate-950/20 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 py-10 space-y-2.5">
          <ShoppingCart className="w-9 h-9 text-slate-300 dark:text-slate-700" />
          <p className="text-xs font-semibold">No pizza orders matched filters</p>
          <span className="text-[10px] text-slate-400 block">Orders created by customers using WhatsApp Bot will display here.</span>
        </div>
      )}
    </div>
  );
}
