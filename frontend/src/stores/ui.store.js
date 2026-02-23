import { create } from 'zustand';

export const useUIStore = create()((set) => ({
  sidebarOpen: false,
  theme: 'system',

  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  setTheme: (theme) => set({ theme }),
}));
