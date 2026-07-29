import { create } from 'zustand';

export type DashboardTab =
  | 'dashboard'
  | 'campaigns'
  | 'customers'
  | 'contacts'
  | 'templates'
  | 'sender'
  | 'analytics'
  | 'queue'
  | 'settings'
  | 'flows'
  | 'orders';

interface DashboardState {
  activeTab: DashboardTab;
  sidebarCollapsed: boolean;
  searchQuery: string;
  selectedWorkspace: string;
  setActiveTab: (tab: DashboardTab) => void;
  toggleSidebar: () => void;
  setSearchQuery: (query: string) => void;
  setSelectedWorkspace: (workspace: string) => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  activeTab: 'dashboard',
  sidebarCollapsed: false,
  searchQuery: '',
  selectedWorkspace: 'Default Workspace',
  setActiveTab: (tab) => set({ activeTab: tab }),
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedWorkspace: (workspace) => set({ selectedWorkspace: workspace }),
}));
