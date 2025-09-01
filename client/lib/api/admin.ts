import { apiClient, ApiResponse } from '../api-client';
import { UserData, ServiceData } from '../schemas';
import { Payment } from './payments';
import { ServiceRequest } from './services';

// Admin-specific types
export interface AdminStats {
  users: {
    total: number;
    customers: number;
    technicians: number;
    admins: number;
    activeToday: number;
    newThisMonth: number;
  };
  services: {
    totalRequests: number;
    completedRequests: number;
    pendingRequests: number;
    cancelledRequests: number;
    averageRating: number;
  };
  revenue: {
    totalRevenue: number;
    monthlyRevenue: number;
    dailyRevenue: number;
    commissionEarned: number;
  };
  system: {
    totalTransactions: number;
    successRate: number;
    averageResponseTime: number;
    systemUptime: number;
  };
}

export interface UserManagement {
  id: number;
  username: string;
  email: string;
  fullName: string;
  phone: string;
  role: 'CUSTOMER' | 'TECHNICIAN' | 'ADMIN';
  isActive: boolean;
  isApproved?: boolean; // for technicians
  avatar?: string;
  totalOrders?: number;
  totalSpent?: number;
  totalEarnings?: number;
  averageRating?: number;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TechnicianApproval {
  id: number;
  userId: number;
  fullName: string;
  email: string;
  phone: string;
  experience: number;
  description: string;
  skills: {
    id: number;
    name: string;
    categoryName: string;
  }[];
  portfolio: {
    id: number;
    title: string;
    description: string;
    imageUrl: string;
  }[];
  submittedAt: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reviewedBy?: number;
  reviewedAt?: string;
  rejectionReason?: string;
}

export interface SystemReport {
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  data: {
    userGrowth: { date: string; customers: number; technicians: number }[];
    revenueGrowth: { date: string; revenue: number; commission: number }[];
    serviceStats: { date: string; completed: number; cancelled: number }[];
    popularServices: { serviceId: number; serviceName: string; count: number }[];
    topTechnicians: { id: number; name: string; rating: number; earnings: number }[];
    topCustomers: { id: number; name: string; totalSpent: number; ordersCount: number }[];
  };
}

// Admin API
export const adminAPI = {
  /**
   * Get admin dashboard statistics
   */
  getStats: async (): Promise<ApiResponse<AdminStats>> => {
    return apiClient.get<ApiResponse<AdminStats>>('/admin/stats');
  },

  /**
   * Get system health status
   */
  getSystemHealth: async (): Promise<ApiResponse<{
    database: { status: 'healthy' | 'warning' | 'error'; responseTime: number };
    redis: { status: 'healthy' | 'warning' | 'error'; responseTime: number };
    storage: { status: 'healthy' | 'warning' | 'error'; usage: number };
    api: { status: 'healthy' | 'warning' | 'error'; averageResponseTime: number };
    websocket: { status: 'healthy' | 'warning' | 'error'; activeConnections: number };
  }>> => {
    return apiClient.get<ApiResponse<any>>('/admin/system/health');
  },

  /**
   * Get system reports
   */
  getSystemReport: async (
    period: SystemReport['period'],
    startDate?: string,
    endDate?: string
  ): Promise<ApiResponse<SystemReport>> => {
    const params = new URLSearchParams({ period });
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    return apiClient.get<ApiResponse<SystemReport>>(`/admin/reports?${params.toString()}`);
  }
};

// User Management API
export const userManagementAPI = {
  /**
   * Get all users with pagination and filters
   */
  getUsers: async (params: {
    page?: number;
    limit?: number;
    role?: string;
    isActive?: boolean;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}): Promise<ApiResponse<{
    users: UserManagement[];
    total: number;
    page: number;
    limit: number;
  }>> => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });
    
    return apiClient.get<ApiResponse<any>>(`/admin/users?${searchParams.toString()}`);
  },

  /**
   * Get user by ID
   */
  getUser: async (id: number): Promise<ApiResponse<UserManagement>> => {
    return apiClient.get<ApiResponse<UserManagement>>(`/admin/users/${id}`);
  },

  /**
   * Update user
   */
  updateUser: async (id: number, data: Partial<UserManagement>): Promise<ApiResponse<UserManagement>> => {
    return apiClient.put<ApiResponse<UserManagement>>(`/admin/users/${id}`, data);
  },

  /**
   * Activate/Deactivate user
   */
  toggleUserStatus: async (id: number, isActive: boolean): Promise<ApiResponse<UserManagement>> => {
    return apiClient.put<ApiResponse<UserManagement>>(`/admin/users/${id}/status`, { isActive });
  },

  /**
   * Delete user
   */
  deleteUser: async (id: number): Promise<ApiResponse<null>> => {
    return apiClient.delete<ApiResponse<null>>(`/admin/users/${id}`);
  },

  /**
   * Reset user password
   */
  resetUserPassword: async (id: number): Promise<ApiResponse<{ temporaryPassword: string }>> => {
    return apiClient.post<ApiResponse<{ temporaryPassword: string }>>(`/admin/users/${id}/reset-password`);
  },

  /**
   * Get user activity logs
   */
  getUserActivity: async (id: number, page = 1, limit = 20): Promise<ApiResponse<{
    activities: {
      id: number;
      action: string;
      details: string;
      ipAddress: string;
      userAgent: string;
      createdAt: string;
    }[];
    total: number;
    page: number;
    limit: number;
  }>> => {
    return apiClient.get<ApiResponse<any>>(`/admin/users/${id}/activity?page=${page}&limit=${limit}`);
  }
};

// Technician Management API
export const technicianManagementAPI = {
  /**
   * Get pending technician approvals
   */
  getPendingApprovals: async (): Promise<ApiResponse<TechnicianApproval[]>> => {
    return apiClient.get<ApiResponse<TechnicianApproval[]>>('/admin/technicians/pending');
  },

  /**
   * Get technician approval by ID
   */
  getApproval: async (id: number): Promise<ApiResponse<TechnicianApproval>> => {
    return apiClient.get<ApiResponse<TechnicianApproval>>(`/admin/technicians/approvals/${id}`);
  },

  /**
   * Approve technician
   */
  approveTechnician: async (id: number, notes?: string): Promise<ApiResponse<TechnicianApproval>> => {
    return apiClient.put<ApiResponse<TechnicianApproval>>(`/admin/technicians/approvals/${id}/approve`, {
      notes
    });
  },

  /**
   * Reject technician
   */
  rejectTechnician: async (id: number, reason: string): Promise<ApiResponse<TechnicianApproval>> => {
    return apiClient.put<ApiResponse<TechnicianApproval>>(`/admin/technicians/approvals/${id}/reject`, {
      reason
    });
  },

  /**
   * Get all technicians
   */
  getTechnicians: async (params: {
    page?: number;
    limit?: number;
    isApproved?: boolean;
    search?: string;
  } = {}): Promise<ApiResponse<{
    technicians: UserManagement[];
    total: number;
    page: number;
    limit: number;
  }>> => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });
    
    return apiClient.get<ApiResponse<any>>(`/admin/technicians?${searchParams.toString()}`);
  },

  /**
   * Suspend technician
   */
  suspendTechnician: async (id: number, reason: string): Promise<ApiResponse<null>> => {
    return apiClient.put<ApiResponse<null>>(`/admin/technicians/${id}/suspend`, { reason });
  },

  /**
   * Unsuspend technician
   */
  unsuspendTechnician: async (id: number): Promise<ApiResponse<null>> => {
    return apiClient.put<ApiResponse<null>>(`/admin/technicians/${id}/unsuspend`);
  }
};

// Service Management API
export const serviceManagementAPI = {
  /**
   * Get all services
   */
  getServices: async (): Promise<ApiResponse<ServiceData[]>> => {
    return apiClient.get<ApiResponse<ServiceData[]>>('/admin/services');
  },

  /**
   * Create service
   */
  createService: async (data: {
    name: string;
    description: string;
    basePrice: number;
    categoryId: number;
  }): Promise<ApiResponse<ServiceData>> => {
    return apiClient.post<ApiResponse<ServiceData>>('/admin/services', data);
  },

  /**
   * Update service
   */
  updateService: async (id: number, data: Partial<ServiceData>): Promise<ApiResponse<ServiceData>> => {
    return apiClient.put<ApiResponse<ServiceData>>(`/admin/services/${id}`, data);
  },

  /**
   * Delete service
   */
  deleteService: async (id: number): Promise<ApiResponse<null>> => {
    return apiClient.delete<ApiResponse<null>>(`/admin/services/${id}`);
  },

  /**
   * Get service requests
   */
  getServiceRequests: async (params: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  } = {}): Promise<ApiResponse<{
    serviceRequests: ServiceRequest[];
    total: number;
    page: number;
    limit: number;
  }>> => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });
    
    return apiClient.get<ApiResponse<any>>(`/admin/service-requests?${searchParams.toString()}`);
  }
};

// Payment Management API
export const paymentManagementAPI = {
  /**
   * Get all payments
   */
  getPayments: async (params: {
    page?: number;
    limit?: number;
    status?: string;
    method?: string;
    startDate?: string;
    endDate?: string;
  } = {}): Promise<ApiResponse<{
    payments: Payment[];
    total: number;
    page: number;
    limit: number;
  }>> => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });
    
    return apiClient.get<ApiResponse<any>>(`/admin/payments?${searchParams.toString()}`);
  },

  /**
   * Process refund
   */
  processRefund: async (paymentId: number, amount: number, notes?: string): Promise<ApiResponse<Payment>> => {
    return apiClient.post<ApiResponse<Payment>>(`/admin/payments/${paymentId}/refund`, {
      amount,
      notes
    });
  },

  /**
   * Update payment status
   */
  updatePaymentStatus: async (
    id: number,
    status: Payment['status'],
    notes?: string
  ): Promise<ApiResponse<Payment>> => {
    return apiClient.put<ApiResponse<Payment>>(`/admin/payments/${id}/status`, {
      status,
      notes
    });
  }
};

// System Configuration API
export const systemConfigAPI = {
  /**
   * Get system settings
   */
  getSettings: async (): Promise<ApiResponse<{
    maintenance: { enabled: boolean; message: string; scheduledAt?: string };
    fees: { serviceCommission: number; paymentProcessing: number };
    limits: { maxFileSize: number; maxImagesPerPost: number };
    notifications: { emailEnabled: boolean; smsEnabled: boolean; pushEnabled: boolean };
  }>> => {
    return apiClient.get<ApiResponse<any>>('/admin/settings');
  },

  /**
   * Update system settings
   */
  updateSettings: async (settings: Record<string, any>): Promise<ApiResponse<null>> => {
    return apiClient.put<ApiResponse<null>>('/admin/settings', settings);
  },

  /**
   * Send system notification
   */
  sendSystemNotification: async (data: {
    title: string;
    message: string;
    type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
    targetUsers?: 'all' | 'customers' | 'technicians' | 'admins';
    userIds?: number[];
  }): Promise<ApiResponse<null>> => {
    return apiClient.post<ApiResponse<null>>('/admin/notifications/send', data);
  },

  /**
   * Export system data
   */
  exportData: async (
    dataType: 'users' | 'payments' | 'services' | 'all',
    format: 'CSV' | 'JSON' | 'EXCEL',
    startDate?: string,
    endDate?: string
  ): Promise<Blob> => {
    const params = new URLSearchParams({
      dataType,
      format
    });
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const response = await apiClient.get(`/admin/export?${params.toString()}`, {
      responseType: 'blob'
    });
    return response;
  }
};

export default {
  adminAPI,
  userManagementAPI,
  technicianManagementAPI,
  serviceManagementAPI,
  paymentManagementAPI,
  systemConfigAPI
};
