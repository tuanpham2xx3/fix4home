import { apiClient, ApiResponse, TokenManager, typedApiCall } from '../api-client';
import { 
  LoginData, 
  RegisterCustomerData, 
  RegisterTechnicianData,
  UserData 
} from '../schemas';

// Auth API response types
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: UserData;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

// Auth API service
export const authAPI = {
  /**
   * User login
   */
  login: async (credentials: LoginData): Promise<ApiResponse<AuthResponse>> => {
    const response = await apiClient.post('/auth/login', credentials) as ApiResponse<AuthResponse>;
    
    // Store tokens automatically
    if (response.success && response.data) {
      const { accessToken, refreshToken } = response.data;
      TokenManager.setTokens(accessToken, refreshToken);
    }
    
    return response;
  },

  /**
   * Customer registration
   */
  registerCustomer: async (userData: RegisterCustomerData): Promise<ApiResponse<AuthResponse>> => {
    const response = await apiClient.post('/auth/register', userData) as ApiResponse<AuthResponse>;
    
    // Store tokens automatically after registration
    if (response.success && response.data) {
      const { accessToken, refreshToken } = response.data;
      TokenManager.setTokens(accessToken, refreshToken);
    }
    
    return response;
  },

  /**
   * Technician registration
   */
  registerTechnician: async (userData: RegisterTechnicianData): Promise<ApiResponse<AuthResponse>> => {
    const response = await apiClient.post('/auth/register', userData) as ApiResponse<AuthResponse>;
    
    // Note: Technician registration might not auto-login due to approval requirement
    // Only store tokens if login is successful
    if (response.success && response.data && response.data.accessToken) {
      const { accessToken, refreshToken } = response.data;
      TokenManager.setTokens(accessToken, refreshToken);
    }
    
    return response;
  },

  /**
   * User logout
   */
  logout: async (): Promise<ApiResponse<null>> => {
    try {
      const response = await apiClient.post('/auth/logout') as ApiResponse<null>;
      return response;
    } finally {
      // Clear tokens regardless of API response
      TokenManager.clearTokens();
    }
  },

  /**
   * Refresh access token
   */
  refreshToken: async (): Promise<RefreshTokenResponse> => {
    const refreshToken = TokenManager.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await apiClient.post('/auth/refresh-token', {
      refreshToken
    }) as ApiResponse<RefreshTokenResponse>;

    if (response.success && response.data) {
      const { accessToken, refreshToken: newRefreshToken } = response.data;
      TokenManager.setTokens(accessToken, newRefreshToken);
      return response.data;
    }

    throw new Error('Failed to refresh token');
  },

  /**
   * Get current user profile
   */
  getCurrentUser: async (): Promise<ApiResponse<UserData>> => {
    return typedApiCall<UserData>(apiClient.get('/auth/me'));
  },

  /**
   * Forgot password
   */
  forgotPassword: async (email: string): Promise<ApiResponse<null>> => {
    return typedApiCall<null>(apiClient.post('/auth/forgot-password', { email }));
  },

  /**
   * Reset password
   */
  resetPassword: async (token: string, password: string): Promise<ApiResponse<null>> => {
    return typedApiCall<null>(apiClient.post('/auth/reset-password', {
      token,
      password
    }));
  },

  /**
   * Change password (for authenticated users)
   */
  changePassword: async (currentPassword: string, newPassword: string): Promise<ApiResponse<null>> => {
    return typedApiCall<null>(apiClient.put('/auth/change-password', {
      currentPassword,
      newPassword
    }));
  },

  /**
   * Verify email
   */
  verifyEmail: async (token: string): Promise<ApiResponse<null>> => {
    return typedApiCall<null>(apiClient.post('/auth/verify-email', { token }));
  },

  /**
   * Resend verification email
   */
  resendVerificationEmail: async (): Promise<ApiResponse<null>> => {
    return typedApiCall<null>(apiClient.post('/auth/resend-verification'));
  },

  /**
   * Check if username is available
   */
  checkUsername: async (username: string): Promise<ApiResponse<{ available: boolean }>> => {
    return typedApiCall<{ available: boolean }>(apiClient.get(`/auth/check-username/${username}`));
  },

  /**
   * Check if email is available
   */
  checkEmail: async (email: string): Promise<ApiResponse<{ available: boolean }>> => {
    return typedApiCall<{ available: boolean }>(apiClient.get(`/auth/check-email/${email}`));
  }
};

// Auth utilities
export const authUtils = {
  /**
   * Check if user is authenticated
   */
  isAuthenticated: (): boolean => {
    const token = TokenManager.getAccessToken();
    return token !== null && !TokenManager.isTokenExpired(token);
  },

  /**
   * Get current user role from token
   */
  getCurrentUserRole: (): string | null => {
    const token = TokenManager.getAccessToken();
    if (!token || TokenManager.isTokenExpired(token)) {
      return null;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.role || null;
    } catch {
      return null;
    }
  },

  /**
   * Get current user ID from token
   */
  getCurrentUserId: (): number | null => {
    const token = TokenManager.getAccessToken();
    if (!token || TokenManager.isTokenExpired(token)) {
      return null;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.userId || payload.sub || null;
    } catch {
      return null;
    }
  },

  /**
   * Check if user has required role
   */
  hasRole: (requiredRole: string | string[]): boolean => {
    const userRole = authUtils.getCurrentUserRole();
    if (!userRole) return false;

    if (Array.isArray(requiredRole)) {
      return requiredRole.includes(userRole);
    }
    
    return userRole === requiredRole;
  },

  /**
   * Logout and redirect to login page
   */
  logoutAndRedirect: async (redirectPath: string = '/login'): Promise<void> => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      TokenManager.clearTokens();
      window.location.href = redirectPath;
    }
  }
};

export default authAPI;
