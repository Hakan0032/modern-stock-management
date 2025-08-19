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
      // Production environment (Vercel) - use absolute path
      return window.location.origin + '/api';
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
    // Validate response structure to prevent React error #31
    if (response && typeof response === 'object') {
      // Ensure response.data exists and is properly structured
      if (!response.data) {
        console.warn('⚠️ API Response missing data field:', response);
        response.data = { data: null, success: false, error: 'Invalid response structure' } as any;
      }
      
      // Ensure response.data is an object
      if (typeof response.data !== 'object') {
        console.warn('⚠️ API Response data is not an object:', typeof response.data);
        response.data = { data: response.data, success: true } as any;
      }
    }
    
    return response;
  },
  async (error: AxiosError<ApiResponse>) => {
    // Enhanced error logging for debugging React error #31
    const errorContext = {
      url: error.config?.url,
      method: error.config?.method?.toUpperCase(),
      status: error.response?.status,
      statusText: error.response?.statusText,
      timestamp: new Date().toISOString(),
      requestId: error.config?.headers?.['X-Request-ID'] || 'unknown'
    };
    
    console.error('❌ API Error Context:', errorContext);
    
    // For 401 errors on auth endpoints, logout and redirect
    if (error.response?.status === 401 && error.config?.url?.includes('/auth/')) {
      console.log('🚪 API: 401 hatası, logout yapılıyor');
      try {
        useAuthStore.getState().logout();
        window.location.href = '/login';
      } catch (logoutError) {
        console.error('Error during logout:', logoutError);
      }
      return Promise.reject(error);
    }

    // Enhanced error message extraction
    let errorMessage = 'An unexpected error occurred';
    
    try {
      const errorData = error.response?.data?.error;
      if (typeof errorData === 'string' && errorData.trim()) {
        errorMessage = errorData;
      } else if (typeof errorData === 'object' && errorData !== null) {
        errorMessage = JSON.stringify(errorData);
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
    } catch (parseError) {
      console.error('Error parsing error message:', parseError);
      errorMessage = `Network error (${error.response?.status || 'unknown'})`;
    }
    
    console.error('❌ API Error Details:', {
      ...errorContext,
      message: errorMessage,
      responseData: error.response?.data
    });
    
    // Only show toast for non-auth errors to prevent spam
    if (!error.config?.url?.includes('/auth/')) {
      try {
        toast.error('Error', {
          description: errorMessage
        });
      } catch (toastError) {
        console.error('Error showing toast:', toastError);
      }
    }

    return Promise.reject(error);
  }
);

// API helper functions with enhanced error handling
export const api = {
  get: <T = any>(url: string, params?: any): Promise<AxiosResponse<ApiResponse<T>>> => {
    try {
      return apiClient.get(url, { params });
    } catch (error) {
      console.error(`API GET error for ${url}:`, error);
      throw error;
    }
  },

  post: <T = any>(url: string, data?: any): Promise<AxiosResponse<ApiResponse<T>>> => {
    try {
      // Ensure data is serializable to prevent React error #31
      const sanitizedData = data ? JSON.parse(JSON.stringify(data)) : data;
      return apiClient.post(url, sanitizedData);
    } catch (error) {
      console.error(`API POST error for ${url}:`, error);
      throw error;
    }
  },

  put: <T = any>(url: string, data?: any): Promise<AxiosResponse<ApiResponse<T>>> => {
    try {
      // Ensure data is serializable to prevent React error #31
      const sanitizedData = data ? JSON.parse(JSON.stringify(data)) : data;
      return apiClient.put(url, sanitizedData);
    } catch (error) {
      console.error(`API PUT error for ${url}:`, error);
      throw error;
    }
  },

  delete: <T = any>(url: string): Promise<AxiosResponse<ApiResponse<T>>> => {
    try {
      return apiClient.delete(url);
    } catch (error) {
      console.error(`API DELETE error for ${url}:`, error);
      throw error;
    }
  },

  patch: <T = any>(url: string, data?: any): Promise<AxiosResponse<ApiResponse<T>>> => {
    try {
      // Ensure data is serializable to prevent React error #31
      const sanitizedData = data ? JSON.parse(JSON.stringify(data)) : data;
      return apiClient.patch(url, sanitizedData);
    } catch (error) {
      console.error(`API PATCH error for ${url}:`, error);
      throw error;
    }
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