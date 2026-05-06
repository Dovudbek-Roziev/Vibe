import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useThemeStore = create(
  persist(
    (set) => ({
      theme: 'light',
      toggleTheme: () =>
        set((s) => {
          const next = s.theme === 'light' ? 'dark' : 'light';
          document.documentElement.classList.toggle('dark', next === 'dark');
          return { theme: next };
        }),
      initTheme: () =>
        set((s) => {
          document.documentElement.classList.toggle('dark', s.theme === 'dark');
          return s;
        }),
    }),
    { name: 'theme-storage' }
  )
);