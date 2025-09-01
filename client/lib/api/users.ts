import { apiClient, ApiResponse } from '../api-client';
import { 
  CustomerProfileData,
  TechnicianProfileData,
  AddressData,
  UserData
} from '../schemas';

// Address API response type
export interface Address extends AddressData {
  id: number;
  customerId: number;
  createdAt: string;
  updatedAt: string;
}

// Customer profile response
export interface CustomerProfile extends UserData {
  dateOfBirth?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  addresses: Address[];
  totalOrders: number;
  totalSpent: number;
  averageRating: number;
}

// Technician profile response
export interface TechnicianProfile extends UserData {
  dateOfBirth?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  experience: number;
  description: string;
  skills: {
    id: number;
    name: string;
    categoryName: string;
  }[];
  averageRating: number;
  totalJobs: number;
  totalEarnings: number;
  isApproved: boolean;
  portfolio: {
    id: number;
    title: string;
    description: string;
    imageUrl: string;
    createdAt: string;
  }[];
}

// Customer API
export const customerAPI = {
  /**
   * Get customer profile
   */
  getProfile: async (): Promise<ApiResponse<CustomerProfile>> => {
    return apiClient.get<ApiResponse<CustomerProfile>>('/customers/profile');
  },

  /**
   * Update customer profile
   */
  updateProfile: async (data: CustomerProfileData): Promise<ApiResponse<CustomerProfile>> => {
    return apiClient.put<ApiResponse<CustomerProfile>>('/customers/profile', data);
  },

  /**
   * Upload avatar
   */
  uploadAvatar: async (file: File): Promise<ApiResponse<{ avatarUrl: string }>> => {
    const formData = new FormData();
    formData.append('avatar', file);
    
    return apiClient.post<ApiResponse<{ avatarUrl: string }>>('/customers/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  /**
   * Get customer addresses
   */
  getAddresses: async (): Promise<ApiResponse<Address[]>> => {
    return apiClient.get<ApiResponse<Address[]>>('/customers/addresses');
  },

  /**
   * Add new address
   */
  addAddress: async (data: Omit<AddressData, 'id'>): Promise<ApiResponse<Address>> => {
    return apiClient.post<ApiResponse<Address>>('/customers/addresses', data);
  },

  /**
   * Update address
   */
  updateAddress: async (id: number, data: Partial<AddressData>): Promise<ApiResponse<Address>> => {
    return apiClient.put<ApiResponse<Address>>(`/customers/addresses/${id}`, data);
  },

  /**
   * Delete address
   */
  deleteAddress: async (id: number): Promise<ApiResponse<null>> => {
    return apiClient.delete<ApiResponse<null>>(`/customers/addresses/${id}`);
  },

  /**
   * Set default address
   */
  setDefaultAddress: async (id: number): Promise<ApiResponse<Address>> => {
    return apiClient.put<ApiResponse<Address>>(`/customers/addresses/${id}/default`);
  },

  /**
   * Get customer statistics
   */
  getStats: async (): Promise<ApiResponse<{
    totalOrders: number;
    totalSpent: number;
    averageRating: number;
    pendingOrders: number;
    completedOrders: number;
    monthlySpending: { month: string; amount: number }[];
  }>> => {
    return apiClient.get<ApiResponse<any>>('/customers/stats');
  }
};

// Technician API
export const technicianAPI = {
  /**
   * Get technician profile
   */
  getProfile: async (): Promise<ApiResponse<TechnicianProfile>> => {
    return apiClient.get<ApiResponse<TechnicianProfile>>('/technicians/me');
  },

  /**
   * Update technician profile
   */
  updateProfile: async (data: TechnicianProfileData): Promise<ApiResponse<TechnicianProfile>> => {
    return apiClient.put<ApiResponse<TechnicianProfile>>('/technicians/me', data);
  },

  /**
   * Upload avatar
   */
  uploadAvatar: async (file: File): Promise<ApiResponse<{ avatarUrl: string }>> => {
    const formData = new FormData();
    formData.append('avatar', file);
    
    return apiClient.post<ApiResponse<{ avatarUrl: string }>>('/technicians/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  /**
   * Get technician skills
   */
  getSkills: async (): Promise<ApiResponse<number[]>> => {
    return apiClient.get<ApiResponse<number[]>>('/technicians/me/skills');
  },

  /**
   * Update technician skills
   */
  updateSkills: async (skillIds: number[]): Promise<ApiResponse<null>> => {
    return apiClient.put<ApiResponse<null>>('/technicians/me/skills', { skillIds });
  },

  /**
   * Get technician portfolio
   */
  getPortfolio: async (): Promise<ApiResponse<TechnicianProfile['portfolio']>> => {
    return apiClient.get<ApiResponse<TechnicianProfile['portfolio']>>('/technicians/me/portfolio');
  },

  /**
   * Add portfolio item
   */
  addPortfolioItem: async (data: {
    title: string;
    description: string;
    image: File;
  }): Promise<ApiResponse<TechnicianProfile['portfolio'][0]>> => {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('description', data.description);
    formData.append('image', data.image);
    
    return apiClient.post<ApiResponse<TechnicianProfile['portfolio'][0]>>('/technicians/me/portfolio', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  /**
   * Update portfolio item
   */
  updatePortfolioItem: async (id: number, data: {
    title?: string;
    description?: string;
    image?: File;
  }): Promise<ApiResponse<TechnicianProfile['portfolio'][0]>> => {
    const formData = new FormData();
    if (data.title) formData.append('title', data.title);
    if (data.description) formData.append('description', data.description);
    if (data.image) formData.append('image', data.image);
    
    return apiClient.put<ApiResponse<TechnicianProfile['portfolio'][0]>>(`/technicians/me/portfolio/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  /**
   * Delete portfolio item
   */
  deletePortfolioItem: async (id: number): Promise<ApiResponse<null>> => {
    return apiClient.delete<ApiResponse<null>>(`/technicians/me/portfolio/${id}`);
  },

  /**
   * Get technician statistics
   */
  getStats: async (): Promise<ApiResponse<{
    totalJobs: number;
    totalEarnings: number;
    averageRating: number;
    pendingJobs: number;
    completedJobs: number;
    monthlyEarnings: { month: string; amount: number }[];
    ratingDistribution: { rating: number; count: number }[];
  }>> => {
    return apiClient.get<ApiResponse<any>>('/technicians/me/stats');
  },

  /**
   * Get public technician profile (for customers to view)
   */
  getPublicProfile: async (id: number): Promise<ApiResponse<TechnicianProfile>> => {
    return apiClient.get<ApiResponse<TechnicianProfile>>(`/technicians/${id}`);
  },

  /**
   * Search technicians
   */
  search: async (params: {
    skillIds?: number[];
    city?: string;
    district?: string;
    minRating?: number;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<{
    technicians: TechnicianProfile[];
    total: number;
    page: number;
    limit: number;
  }>> => {
    const queryParams = new URLSearchParams();
    
    if (params.skillIds && params.skillIds.length > 0) {
      queryParams.append('skillIds', params.skillIds.join(','));
    }
    if (params.city) queryParams.append('city', params.city);
    if (params.district) queryParams.append('district', params.district);
    if (params.minRating) queryParams.append('minRating', params.minRating.toString());
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());

    return apiClient.get<ApiResponse<any>>(`/technicians/search?${queryParams.toString()}`);
  }
};

// Common user operations
export const userAPI = {
  /**
   * Get current user profile (works for any role)
   */
  getCurrentProfile: async (): Promise<ApiResponse<CustomerProfile | TechnicianProfile>> => {
    return apiClient.get<ApiResponse<any>>('/users/me');
  },

  /**
   * Update user settings
   */
  updateSettings: async (settings: {
    notifications?: {
      email: boolean;
      push: boolean;
      sms: boolean;
    };
    privacy?: {
      showProfile: boolean;
      showPhone: boolean;
      showEmail: boolean;
    };
    language?: string;
  }): Promise<ApiResponse<null>> => {
    return apiClient.put<ApiResponse<null>>('/users/settings', settings);
  },

  /**
   * Get user settings
   */
  getSettings: async (): Promise<ApiResponse<{
    notifications: {
      email: boolean;
      push: boolean;
      sms: boolean;
    };
    privacy: {
      showProfile: boolean;
      showPhone: boolean;
      showEmail: boolean;
    };
    language: string;
  }>> => {
    return apiClient.get<ApiResponse<any>>('/users/settings');
  },

  /**
   * Deactivate account
   */
  deactivateAccount: async (password: string): Promise<ApiResponse<null>> => {
    return apiClient.put<ApiResponse<null>>('/users/deactivate', { password });
  },

  /**
   * Request account deletion
   */
  requestAccountDeletion: async (password: string, reason?: string): Promise<ApiResponse<null>> => {
    return apiClient.post<ApiResponse<null>>('/users/delete-request', { password, reason });
  }
};

export default { customerAPI, technicianAPI, userAPI };
