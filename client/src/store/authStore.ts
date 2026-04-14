import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, AuthTokens, LoginRequest, RegisterRequest } from '../types';
import api from '../lib/api';

interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isLoading: boolean;
  error: string | null;

  login: (req: LoginRequest) => Promise<void>;
  register: (req: RegisterRequest) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      tokens: null,
      isLoading: false,
      error: null,

      login: async (req) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await api.post<{ user: User; tokens: AuthTokens }>(
            '/auth/login',
            req
          );
          localStorage.setItem('accessToken', data.tokens.accessToken);
          localStorage.setItem('refreshToken', data.tokens.refreshToken);
          set({ user: data.user, tokens: data.tokens, isLoading: false });
        } catch (err: unknown) {
          const msg =
            (err as { response?: { data?: { message?: string } } })?.response?.data
              ?.message ?? 'Login failed';
          set({ error: msg, isLoading: false });
        }
      },

      register: async (req) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await api.post<{ user: User; tokens: AuthTokens }>(
            '/auth/register',
            req
          );
          localStorage.setItem('accessToken', data.tokens.accessToken);
          localStorage.setItem('refreshToken', data.tokens.refreshToken);
          set({ user: data.user, tokens: data.tokens, isLoading: false });
        } catch (err: unknown) {
          const msg =
            (err as { response?: { data?: { message?: string } } })?.response?.data
              ?.message ?? 'Registration failed';
          set({ error: msg, isLoading: false });
        }
      },

      logout: () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        set({ user: null, tokens: null });
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'syntax-arena-auth',
      partialize: (state) => ({ user: state.user, tokens: state.tokens }),
    }
  )
);
