// API Client and Configuration
export { default as apiClient, TokenManager, config, handleAPIError } from '../api-client';
export type { ApiResponse, ApiError } from '../api-client';

// Socket Client
export { default as socketClient, useSocket } from '../socket-client';
export type { 
  ChatMessage, 
  Conversation, 
  Notification as SocketNotification,
  ServerToClientEvents,
  ClientToServerEvents 
} from '../socket-client';

// Validation Schemas
export * from '../schemas';

// Authentication API
export { default as authAPI, authUtils } from './auth';
export type { AuthResponse, RefreshTokenResponse } from './auth';

// Services API
export { 
  servicesAPI, 
  categoriesAPI, 
  skillsAPI, 
  serviceRequestsAPI, 
  servicePostsAPI, 
  consultationsAPI 
} from './services';
export type { 
  ServiceCategory, 
  Skill, 
  ServiceRequest, 
  ServicePost, 
  Consultation 
} from './services';

// Users API
export { customerAPI, technicianAPI, userAPI } from './users';
export type { 
  Address, 
  CustomerProfile, 
  TechnicianProfile 
} from './users';

// Chat API
export { default as chatAPI } from './chat';

// Payments API
export { default as paymentsAPI, paymentUtils } from './payments';
export type { PaymentMethod, Payment, PaymentStats } from './payments';

// Reviews API
export { default as reviewsAPI, reviewUtils } from './reviews';
export type { Review, ReviewStats } from './reviews';

// Notifications API
export { default as notificationsAPI } from './notifications';
export type { NotificationWithDetails, NotificationPreferences } from './notifications';

// Admin APIs
export { 
  adminAPI, 
  userManagementAPI, 
  technicianManagementAPI, 
  serviceManagementAPI, 
  paymentManagementAPI, 
  systemConfigAPI 
} from './admin';
export type { 
  AdminStats, 
  UserManagement, 
  TechnicianApproval, 
  SystemReport 
} from './admin';

// Common API utilities
export const apiUtils = {
  /**
   * Format error message from API response
   */
  formatErrorMessage: (error: any): string => {
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    if (error.message) {
      return error.message;
    }
    return 'Đã xảy ra lỗi không xác định';
  },

  /**
   * Check if error is network error
   */
  isNetworkError: (error: any): boolean => {
    return !error.response && error.request;
  },

  /**
   * Check if error is authentication error
   */
  isAuthError: (error: any): boolean => {
    return error.response?.status === 401;
  },

  /**
   * Check if error is authorization error
   */
  isAuthorizationError: (error: any): boolean => {
    return error.response?.status === 403;
  },

  /**
   * Check if error is validation error
   */
  isValidationError: (error: any): boolean => {
    return error.response?.status === 400 && error.response?.data?.errors;
  },

  /**
   * Get validation errors from API response
   */
  getValidationErrors: (error: any): Record<string, string[]> => {
    return error.response?.data?.errors || {};
  },

  /**
   * Format file size
   */
  formatFileSize: (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  /**
   * Check if file type is allowed
   */
  isAllowedFileType: (file: File, allowedTypes: string[]): boolean => {
    return allowedTypes.some(type => file.type.startsWith(type));
  },

  /**
   * Check if file size is within limit
   */
  isFileSizeValid: (file: File, maxSizeInMB: number): boolean => {
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
    return file.size <= maxSizeInBytes;
  },

  /**
   * Create form data for file upload
   */
  createFormData: (data: Record<string, any>): FormData => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value instanceof File) {
        formData.append(key, value);
      } else if (Array.isArray(value)) {
        value.forEach((item, index) => {
          if (item instanceof File) {
            formData.append(`${key}[${index}]`, item);
          } else {
            formData.append(`${key}[${index}]`, JSON.stringify(item));
          }
        });
      } else if (typeof value === 'object' && value !== null) {
        formData.append(key, JSON.stringify(value));
      } else if (value !== null && value !== undefined) {
        formData.append(key, value.toString());
      }
    });
    return formData;
  },

  /**
   * Parse query parameters
   */
  parseQueryParams: (params: Record<string, any>): URLSearchParams => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          value.forEach(item => searchParams.append(key, item.toString()));
        } else {
          searchParams.append(key, value.toString());
        }
      }
    });
    return searchParams;
  },

  /**
   * Debounce function for API calls
   */
  debounce: <T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): ((...args: Parameters<T>) => void) => {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  },

  /**
   * Retry function for failed API calls
   */
  retry: async <T>(
    fn: () => Promise<T>,
    retries: number = 3,
    delay: number = 1000
  ): Promise<T> => {
    try {
      return await fn();
    } catch (error) {
      if (retries > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
        return apiUtils.retry(fn, retries - 1, delay * 2);
      }
      throw error;
    }
  }
};

// API status constants
export const API_STATUS = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error'
} as const;

// Common HTTP status codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503
} as const;

// File upload constants
export const FILE_UPLOAD = {
  MAX_SIZE_MB: 10,
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
} as const;

// Default API configurations
export const API_CONFIG = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  REQUEST_TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000
} as const;
