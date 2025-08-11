import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthState, User, LoginRequest, LoginResponse } from '../types';
import { api } from '../utils/api';

interface AuthStore extends Omit<AuthState, 'refreshToken'> {
  refreshToken: string;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  logout: () => void;
  refreshTokenAction: () => Promise<void>;
  setUser: (user: User) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (credentials: LoginRequest) => {
        try {
          set({ isLoading: true });
          
          const response = await api.post<LoginResponse>('/auth/login', credentials);
          const { token, refreshToken, user } = response.data.data;

          set({
            user,
            token,
            refreshToken,
            isAuthenticated: true,
            isLoading: false
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false
        });
      },

      refreshTokenAction: async () => {
        try {
          const currentRefreshToken = get().refreshToken;
          if (!currentRefreshToken) {
            throw new Error('No refresh token available');
          }

          const response = await api.post('/auth/refresh', {
            refreshToken: currentRefreshToken
          });

          const { token: newToken, refreshToken: newRefreshToken } = response.data.data;
          
          set({
            token: newToken,
            refreshToken: newRefreshToken
          });
        } catch (error) {
          // If refresh fails, logout user
          get().logout();
          throw error;
        }
      },

      setUser: (user: User | null) => {
        set({ user });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
);