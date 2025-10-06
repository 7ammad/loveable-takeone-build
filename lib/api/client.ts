import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

// API Configuration
export const API_CONFIG = {
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  version: 'v1',
  timeout: 30000, // Increased to 30 seconds for slower queries
};

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication
  auth: {
    register: '/api/v1/auth/register',
    login: '/api/v1/auth/login',
    logout: '/api/v1/auth/logout',
    refresh: '/api/v1/auth/refresh',
    verifyEmail: '/api/v1/auth/verify-email',
    forgotPassword: '/api/v1/auth/forgot-password',
    resetPassword: '/api/v1/auth/reset-password',
    me: '/api/v1/auth/me',
  },
  
  // Nafath Integration
  nafath: {
    initiate: '/api/v1/auth/nafath/initiate',
    status: '/api/v1/auth/nafath/status',
    renew: '/api/v1/auth/nafath/renew',
  },
  
  // Profiles
  profile: {
    talent: '/api/v1/profile/talent',
    caster: '/api/v1/profile/caster',
  },
  
  // Casting Calls
  castingCalls: {
    list: '/api/v1/casting-calls',
    create: '/api/v1/casting-calls',
    detail: (id: string) => `/api/v1/casting-calls/${id}`,
    update: (id: string) => `/api/v1/casting-calls/${id}`,
    delete: (id: string) => `/api/v1/casting-calls/${id}`,
    applications: (id: string) => `/api/v1/casting-calls/${id}/applications`,
  },
  
  // Applications
  applications: {
    list: '/api/v1/applications',
    create: '/api/v1/applications',
    detail: (id: string) => `/api/v1/applications/${id}`,
    withdraw: (id: string) => `/api/v1/applications/${id}/withdraw`,
    updateStatus: (id: string) => `/api/v1/applications/${id}/status`,
  },
  
  // Messages
  messages: {
    list: '/api/v1/messages',
    send: '/api/v1/messages',
    detail: (id: string) => `/api/v1/messages/${id}`,
    markRead: (id: string) => `/api/v1/messages/${id}/read`,
    conversations: '/api/v1/messages/conversations',
  },
  
  // Notifications
  notifications: {
    list: '/api/v1/notifications',
    markRead: (id: string) => `/api/v1/notifications/${id}/read`,
    markAllRead: '/api/v1/notifications/read-all',
  },
};

// API Client Class
class APIClient {
  private client: AxiosInstance;
  
  constructor() {
    this.client = axios.create({
      baseURL: API_CONFIG.baseURL,
      timeout: API_CONFIG.timeout,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    // Request interceptor - Add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );
    
    // Response interceptor - Handle token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
        
        // If 401 error and haven't retried yet, try to refresh token
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          
          try {
            const refreshToken = localStorage.getItem('refreshToken');
            if (!refreshToken) {
              throw new Error('No refresh token available');
            }

            const { data } = await axios.post(
              `${API_CONFIG.baseURL}/api/v1/auth/refresh`,
              { refreshToken }
            );
            
            localStorage.setItem('accessToken', data.data.accessToken);
            localStorage.setItem('refreshToken', data.data.refreshToken);
            
            originalRequest.headers.Authorization = `Bearer ${data.data.accessToken}`;
            return this.client(originalRequest);
          } catch (refreshError) {
            // Redirect to login
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            if (typeof window !== 'undefined') {
              window.location.href = '/login';
            }
            return Promise.reject(refreshError);
          }
        }
        
        return Promise.reject(error);
      }
    );
  }
  
  get<T>(url: string, config?: Record<string, unknown>) {
    return this.client.get<T>(url, config);
  }
  
  post<T>(url: string, data?: unknown, config?: Record<string, unknown>) {
    return this.client.post<T>(url, data, config);
  }
  
  patch<T>(url: string, data?: unknown, config?: Record<string, unknown>) {
    return this.client.patch<T>(url, data, config);
  }
  
  put<T>(url: string, data?: unknown, config?: Record<string, unknown>) {
    return this.client.put<T>(url, data, config);
  }
  
  delete<T>(url: string, config?: Record<string, unknown>) {
    return this.client.delete<T>(url, config);
  }
}

export const apiClient = new APIClient();

