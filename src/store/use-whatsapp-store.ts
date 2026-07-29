import { create } from 'zustand';
import { api } from '../lib/api';

export type WhatsAppStatus = 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED' | 'QR_READY';

interface WhatsAppState {
  status: WhatsAppStatus;
  connectedNumber: string | null;
  qrCode: string | null;
  isLoading: boolean;
  fetchStatus: () => Promise<void>;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
}

export const useWhatsAppStore = create<WhatsAppState>((set, get) => ({
  status: 'DISCONNECTED',
  connectedNumber: null,
  qrCode: null,
  isLoading: false,

  fetchStatus: async () => {
    try {
      const res = await api.get('/whatsapp/status');
      set({
        status: res.data.status || 'DISCONNECTED',
        connectedNumber: res.data.connectedNumber || null,
        qrCode: res.data.qrCode || null,
      });
    } catch (err) {
      set({ status: 'DISCONNECTED', connectedNumber: null, qrCode: null });
    }
  },

  connect: async () => {
    set({ isLoading: true });
    try {
      const res = await api.post('/whatsapp/connect');
      set({
        status: res.data.status || 'CONNECTING',
        qrCode: res.data.qrCode || null,
        isLoading: false,
      });
      // Refresh status after delay
      setTimeout(() => get().fetchStatus(), 2000);
    } catch (err) {
      set({ isLoading: false });
    }
  },

  disconnect: async () => {
    set({ isLoading: true });
    try {
      await api.post('/whatsapp/disconnect');
      set({
        status: 'DISCONNECTED',
        connectedNumber: null,
        qrCode: null,
        isLoading: false,
      });
    } catch (err) {
      set({ isLoading: false });
    }
  },
}));
