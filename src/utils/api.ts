import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import type { ApiResponse } from '../types';
import { useAuthStore } from '../store/authStore';
import { toast } from 'sonner';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors and token refresh
apiClient.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    return response;
  },
  async (error: AxiosError<ApiResponse>) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        await useAuthStore.getState().refreshTokenAction();
        const token = useAuthStore.getState().token;
        if (token && originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${token}`;
        }
        return apiClient(originalRequest);
      } catch (refreshError) {
        useAuthStore.getState().logout();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // Show error toast for non-401 errors
    if (error.response?.status !== 401) {
      const errorMessage = error.response?.data?.error || 'An error occurred';
      toast.error('Error', {
        description: errorMessage
      });
    }

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

// Extend AxiosRequestConfig to include _retry property
declare module 'axios' {
  interface AxiosRequestConfig {
    _retry?: boolean;
  }
}