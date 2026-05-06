import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../services/api';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoading: false,

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const { data } = await api.post('/auth/login', { email, password });
          localStorage.setItem('token', data.token);
          set({ user: data.user, token: data.token, isLoading: false });
          return { success: true };
        } catch (err) {
          set({ isLoading: false });
          return { success: false, message: err.response?.data?.message };
        }
      },

      register: async (username, email, password, fullName) => {
        set({ isLoading: true });
        try {
          const { data } = await api.post('/auth/register', { username, email, password, fullName });
          localStorage.setItem('token', data.token);
          set({ user: data.user, token: data.token, isLoading: false });
          return { success: true };
        } catch (err) {
          set({ isLoading: false });
          return { success: false, message: err.response?.data?.message };
        }
      },

      logout: () => {
        localStorage.removeItem('token');
        set({ user: null, token: null });
      },

      updateUser: (user) => set({ user }),
    }),
    { name: 'auth-storage', partialize: (s) => ({ user: s.user, token: s.token }) }
  )
);