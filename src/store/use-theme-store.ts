import { create } from 'zustand';

export type AccentColor = 'green' | 'blue' | 'purple' | 'orange' | 'red';

interface ThemeState {
  theme: 'light' | 'dark';
  accentColor: AccentColor;
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setAccentColor: (color: AccentColor) => void;
  initTheme: () => void;
}

const colorPalettes = {
  green: {
    primary: '#10b981',
    hover: '#059669',
    light: 'rgba(16, 185, 129, 0.1)',
    foreground: '#ffffff',
  },
  blue: {
    primary: '#3b82f6',
    hover: '#2563eb',
    light: 'rgba(59, 130, 246, 0.1)',
    foreground: '#ffffff',
  },
  purple: {
    primary: '#8b5cf6',
    hover: '#7c3aed',
    light: 'rgba(139, 92, 246, 0.1)',
    foreground: '#ffffff',
  },
  orange: {
    primary: '#f97316',
    hover: '#ea580c',
    light: 'rgba(249, 115, 22, 0.1)',
    foreground: '#ffffff',
  },
  red: {
    primary: '#ef4444',
    hover: '#dc2626',
    light: 'rgba(239, 68, 68, 0.1)',
    foreground: '#ffffff',
  },
};

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: 'dark',
  accentColor: 'green',

  toggleTheme: () => {
    const nextTheme = get().theme === 'light' ? 'dark' : 'light';
    get().setTheme(nextTheme);
  },

  setTheme: (theme) => {
    if (typeof window !== 'undefined') {
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
      } else {
        document.documentElement.classList.add('light');
        document.documentElement.classList.remove('dark');
      }
      localStorage.setItem('theme', theme);
    }
    set({ theme });
  },

  setAccentColor: (color) => {
    if (typeof window !== 'undefined') {
      const palette = colorPalettes[color];
      const root = document.documentElement;
      root.style.setProperty('--primary-color', palette.primary);
      root.style.setProperty('--primary-color-hover', palette.hover);
      root.style.setProperty('--primary-color-light', palette.light);
      root.style.setProperty('--primary-color-foreground', palette.foreground);
      localStorage.setItem('accentColor', color);
    }
    set({ accentColor: color });
  },

  initTheme: () => {
    if (typeof window !== 'undefined') {
      const savedTheme = (localStorage.getItem('theme') as 'light' | 'dark') || 'dark';
      const savedColor = (localStorage.getItem('accentColor') as AccentColor) || 'green';
      get().setTheme(savedTheme);
      get().setAccentColor(savedColor);
    }
  },
}));
