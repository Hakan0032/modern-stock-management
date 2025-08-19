import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import type { ApiResponse } from '../types';
import { useAuthStore } from '../store/authStore';
import { toast } from 'sonner';

// Get API base URL based on environment
const getApiBaseUrl = (): string => {
  // In production (Vercel), use relative path
  if (typeof window !== 'undefined') {
    // Browser environment
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      // Development environment - use full URL to backend server
      return 'http://localhost:3001/api';
    } else {
      // Production environment (Vercel)
      return '/api';
    }
  }
  // Server-side rendering or Node.js environment
  return '/api';
};

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    // Add token to all API requests if available
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
apiClient.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    return response;
  },
  async (error: AxiosError<ApiResponse>) => {
    // For 401 errors on auth endpoints, logout and redirect
    if (error.response?.status === 401 && error.config?.url?.includes('/auth/')) {
      console.log('🚪 API: 401 hatası, logout yapılıyor');
      useAuthStore.getState().logout();
      window.location.href = '/login';
      return Promise.reject(error);
    }

    // Show error toast for other errors
    const errorData = error.response?.data?.error;
    const errorMessage = typeof errorData === 'string' ? errorData : 
                        typeof errorData === 'object' ? JSON.stringify(errorData) : 
                        'An error occurred';
    
    console.error('❌ API Error Details:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: errorMessage,
      data: error.response?.data
    });
    toast.error('Error', {
      description: errorMessage
    });

    return Promise.reject(error);
  }
);

// API helper functions
export const api = {
  get: <T = any>(url: string, params?: any): Promise<AxiosResponse<ApiResponse<T>>> => {
    return apiClient.get(url, { params });
  },

  post: <T = any>(url: string, data?: any): Promise<AxiosResponse<ApiResponse<T>>> => {
    return apiClient.post(url, data);
  },

  put: <T = any>(url: string, data?: any): Promise<AxiosResponse<ApiResponse<T>>> => {
    return apiClient.put(url, data);
  },

  delete: <T = any>(url: string): Promise<AxiosResponse<ApiResponse<T>>> => {
    return apiClient.delete(url);
  },

  patch: <T = any>(url: string, data?: any): Promise<AxiosResponse<ApiResponse<T>>> => {
    return apiClient.patch(url, data);
  }
};

export { apiClient };
export default api;

// Extend AxiosRequestConfig to include _retry property
declare module 'axios' {
  interface AxiosRequestConfig {
    _retry?: boolean;
  }
}