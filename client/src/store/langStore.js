import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import i18n from '../i18n';

export const useLangStore = create(
  persist(
    (set) => ({
      lang: 'uz',
      setLang: (lang) => {
        i18n.changeLanguage(lang);
        set({ lang });
      },
    }),
    { name: 'lang-storage' }
  )
);