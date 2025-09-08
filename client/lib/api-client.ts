import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

// Extend the AxiosRequestConfig to include retry flag
declare module 'axios' {
  interface InternalAxiosRequestConfig {
    _retry?: boolean;
  }
}

// Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8100/api/v1';
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:8100';

// Create axios instance
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds timeout
});

// Types for API responses
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
  timestamp: string;
}

// Token management utilities
export const TokenManager = {
  setTokens: (accessToken: string, refreshToken?: string) => {
    localStorage.setItem('accessToken', accessToken);
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    }
  },
  
  getAccessToken: () => localStorage.getItem('accessToken'),
  
  getRefreshToken: () => localStorage.getItem('refreshToken'),
  
  clearTokens: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  },
  
  isTokenExpired: (token: string): boolean => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp < Date.now() / 1000;
    } catch {
      return true;
    }
  }
};

// Request interceptor to add JWT token
apiClient.interceptors.request.use(
  (config) => {
    const token = TokenManager.getAccessToken();
    if (token && !TokenManager.isTokenExpired(token)) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling common errors and token refresh
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response.data,
  async (error: AxiosError) => {
    const originalRequest = error.config;
    
    // Handle 401 Unauthorized - attempt token refresh
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;
      
      const refreshToken = TokenManager.getRefreshToken();
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
            refreshToken
          });
          
          const { accessToken, refreshToken: newRefreshToken } = response.data.data;
          TokenManager.setTokens(accessToken, newRefreshToken);
          
          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return apiClient(originalRequest);
        } catch (refreshError) {
          // Refresh failed, clear tokens and redirect to login
          TokenManager.clearTokens();
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      } else {
        // No refresh token, redirect to login
        TokenManager.clearTokens();
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// Error handling utility
export const handleAPIError = (error: any): ApiError => {
  if (error.response) {
    // Server error with response
    const { status, data } = error.response;
    
    switch (status) {
      case 400:
        return {
          success: false,
          message: data.message || 'Dữ liệu không hợp lệ',
          errors: data.errors,
          timestamp: data.timestamp || new Date().toISOString()
        };
      case 401:
        return {
          success: false,
          message: 'Vui lòng đăng nhập lại',
          timestamp: data.timestamp || new Date().toISOString()
        };
      case 403:
        return {
          success: false,
          message: 'Bạn không có quyền thực hiện thao tác này',
          timestamp: data.timestamp || new Date().toISOString()
        };
      case 404:
        return {
          success: false,
          message: 'Không tìm thấy dữ liệu',
          timestamp: data.timestamp || new Date().toISOString()
        };
      case 500:
        return {
          success: false,
          message: 'Lỗi hệ thống, vui lòng thử lại sau',
          timestamp: data.timestamp || new Date().toISOString()
        };
      default:
        return {
          success: false,
          message: data.message || 'Đã xảy ra lỗi',
          timestamp: data.timestamp || new Date().toISOString()
        };
    }
  } else if (error.request) {
    // Network error
    return {
      success: false,
      message: 'Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet.',
      timestamp: new Date().toISOString()
    };
  } else {
    // Other error
    return {
      success: false,
      message: error.message || 'Đã xảy ra lỗi không xác định',
      timestamp: new Date().toISOString()
    };
  }
};

// Configuration export for other modules
export const config = {
  API_BASE_URL,
  SOCKET_URL,
  GOOGLE_MAPS_API_KEY: import.meta.env.VITE_GOOGLE_MAPS_KEY,
  ENVIRONMENT: import.meta.env.MODE || 'development',
  VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
};

// Helper function to properly type API responses after interceptor transformation
export const typedApiCall = <T>(promise: Promise<any>): Promise<ApiResponse<T>> => {
  return promise as Promise<ApiResponse<T>>;
};

export default apiClient;
