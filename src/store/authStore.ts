import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthState, User } from '../types';
import { api } from '../utils/api';

// Hardcoded admin user for simple authentication
const HARDCODED_ADMIN: User = {
  id: 'admin-1',
  email: 'admin@test.com',
  username: 'admin',
  password: 'admin123',
  firstName: 'Admin',
  lastName: 'User',
  role: 'admin' as const,
  department: 'IT',
  phone: '+90 555 000 0000',
  isActive: true,
  lastLogin: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

interface AuthStore extends Omit<AuthState, 'refreshToken'> {
  login: (credentials: { email: string; password: string }) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (credentials: { email: string; password: string }) => {
        console.log('🔐 Auth Store: Login başlatıldı', credentials);
        console.log('🌐 Auth Store: API Base URL:', 'http://localhost:3001/api');
        
        set({ isLoading: true });
        
        try {
          console.log('📡 Auth Store: API çağrısı yapılıyor...');
          // Gerçek API çağrısı yap
          const response = await api.post('/auth/login', credentials);
          console.log('✅ Auth Store: Ham API yanıtı:', response);
          console.log('✅ Auth Store: Response data:', response.data);
          console.log('✅ Auth Store: Response status:', response.status);
          
          if (response.data && response.data.success && response.data.data) {
            const { token, user } = response.data.data;
            console.log('👤 Auth Store: User data:', user);
            console.log('🎫 Auth Store: Token:', token ? 'Token alındı' : 'Token yok');
            
            set({
              user,
              token,
              isAuthenticated: true,
              isLoading: false
            });
            
            console.log('✅ Auth Store: State güncellendi, login başarılı');
            return;
          } else {
            console.log('❌ Auth Store: API yanıtı başarısız:', response.data);
            throw new Error(response.data?.error || 'Giriş başarısız');
          }
        } catch (error: any) {
          console.log('❌ Auth Store: Login hatası detayı:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
            config: error.config
          });
          set({ isLoading: false });
          
          // Daha detaylı hata mesajı
          let errorMessage = 'Giriş yapılamadı';
          if (error.response?.data?.error) {
        const errorData = error.response.data.error;
        errorMessage = typeof errorData === 'string' ? errorData : 
                      typeof errorData === 'object' && errorData ? 
                      (errorData.message || JSON.stringify(errorData)) : 
                      'Giriş yapılamadı';
          } else if (error.message) {
            errorMessage = error.message;
          }
          
          throw new Error(errorMessage);
        }
      },

      logout: () => {
        console.log('🚪 Auth Store: Logout yapılıyor');
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false
        });
        console.log('✅ Auth Store: Logout tamamlandı');
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
        isAuthenticated: state.isAuthenticated
      })
    }
  )
);