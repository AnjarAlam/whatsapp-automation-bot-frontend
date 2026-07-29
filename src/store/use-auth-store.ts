import { create } from 'zustand';
import { api } from '../lib/api';

export interface User {
  _id: string;
  fullName: string;
  businessName: string;
  email: string;
  mobile: string;
  role: string;
  isBotActive?: boolean;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  isInitialized: boolean;
  login: (tokens: { accessToken: string; refreshToken: string }, user: User) => void;
  logout: () => Promise<void>;
  fetchProfile: () => Promise<void>;
  toggleBotActive: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null,
  isLoading: false,
  isInitialized: false,

  login: (tokens, user) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', tokens.accessToken);
      localStorage.setItem('refreshToken', tokens.refreshToken);
    }
    set({ user, accessToken: tokens.accessToken, isInitialized: true });
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // Ignore logout errors
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      }
      set({ user: null, accessToken: null, isInitialized: true });
    }
  },

  fetchProfile: async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (!token) {
      set({ user: null, isInitialized: true });
      return;
    }

    set({ isLoading: true });
    try {
      const response = await api.get('/auth/profile');
      set({ user: response.data, isInitialized: true, isLoading: false });
    } catch (error) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      }
      set({ user: null, accessToken: null, isInitialized: true, isLoading: false });
    }
  },

  toggleBotActive: async () => {
    try {
      const response = await api.post('/auth/toggle-bot');
      set({ user: response.data });
    } catch (error) {
      console.error('Failed to toggle bot status:', error);
    }
  },
}));
