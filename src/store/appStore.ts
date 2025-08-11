import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppState } from '../types';

interface AppStore extends AppState {
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      theme: 'light',
      sidebarCollapsed: false,

      setTheme: (theme: 'light' | 'dark') => {
        set({ theme });
      },

      toggleTheme: () => {
        const { theme } = get();
        set({ theme: theme === 'light' ? 'dark' : 'light' });
      },

      setSidebarCollapsed: (collapsed: boolean) => {
        set({ sidebarCollapsed: collapsed });
      },

      toggleSidebar: () => {
        const { sidebarCollapsed } = get();
        set({ sidebarCollapsed: !sidebarCollapsed });
      }
    }),
    {
      name: 'app-storage',
      partialize: (state) => ({
        theme: state.theme,
        sidebarCollapsed: state.sidebarCollapsed
      })
    }
  )
);