import { apiClient, ApiResponse } from '../api-client';
import { 
  ServiceData,
  ServiceRequestData,
  ServiceRequestResponse,
  ServicePostData,
  ConsultationData
} from '../schemas';

// Service API response types
export interface ServiceCategory {
  id: number;
  name: string;
  description: string;
  icon: string;
  isActive: boolean;
}

export interface Skill {
  id: number;
  name: string;
  description: string;
  categoryId: number;
  isActive: boolean;
}

export interface ServiceRequest extends ServiceRequestResponse {
  address: {
    id: number;
    fullAddress: string;
    district: string;
    city: string;
    latitude?: number;
    longitude?: number;
  };
}

export interface ServicePost {
  id: number;
  title: string;
  description: string;
  budget: number;
  urgency: 'LOW' | 'MEDIUM' | 'HIGH';
  preferredDate?: string;
  images?: string[];
  status: 'OPEN' | 'IN_NEGOTIATION' | 'ASSIGNED' | 'COMPLETED' | 'CANCELLED';
  customer: {
    id: number;
    fullName: string;
    avatar?: string;
    rating: number;
  };
  service: ServiceData;
  address: {
    district: string;
    city: string;
  };
  consultationsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Consultation {
  id: number;
  price: number;
  description: string;
  estimatedDuration: number;
  availableDate: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  technician: {
    id: number;
    fullName: string;
    avatar?: string;
    rating: number;
    experience: number;
  };
  servicePost: ServicePost;
  createdAt: string;
  updatedAt: string;
}

// Services API
export const servicesAPI = {
  /**
   * Get all services
   */
  getAll: async (): Promise<ApiResponse<ServiceData[]>> => {
    return apiClient.get<ApiResponse<ServiceData[]>>('/services');
  },

  /**
   * Get service by ID
   */
  getById: async (id: number): Promise<ApiResponse<ServiceData>> => {
    return apiClient.get<ApiResponse<ServiceData>>(`/services/${id}`);
  },

  /**
   * Search services
   */
  search: async (query: string): Promise<ApiResponse<ServiceData[]>> => {
    return apiClient.get<ApiResponse<ServiceData[]>>(`/services/search?q=${encodeURIComponent(query)}`);
  },

  /**
   * Get services by category
   */
  getByCategory: async (categoryId: number): Promise<ApiResponse<ServiceData[]>> => {
    return apiClient.get<ApiResponse<ServiceData[]>>(`/services/category/${categoryId}`);
  }
};

// Service Categories API
export const categoriesAPI = {
  /**
   * Get all categories
   */
  getAll: async (): Promise<ApiResponse<ServiceCategory[]>> => {
    return apiClient.get<ApiResponse<ServiceCategory[]>>('/categories');
  },

  /**
   * Get category by ID
   */
  getById: async (id: number): Promise<ApiResponse<ServiceCategory>> => {
    return apiClient.get<ApiResponse<ServiceCategory>>(`/categories/${id}`);
  }
};

// Skills API
export const skillsAPI = {
  /**
   * Get all skills
   */
  getAll: async (): Promise<ApiResponse<Skill[]>> => {
    return apiClient.get<ApiResponse<Skill[]>>('/skills');
  },

  /**
   * Get skills by category
   */
  getByCategory: async (categoryId: number): Promise<ApiResponse<Skill[]>> => {
    return apiClient.get<ApiResponse<Skill[]>>(`/skills/category/${categoryId}`);
  }
};

// Service Requests API (Customer perspective)
export const serviceRequestsAPI = {
  /**
   * Create a service request
   */
  create: async (data: ServiceRequestData): Promise<ApiResponse<ServiceRequest>> => {
    return apiClient.post<ApiResponse<ServiceRequest>>('/service-requests', data);
  },

  /**
   * Get my service requests
   */
  getMy: async (): Promise<ApiResponse<ServiceRequest[]>> => {
    return apiClient.get<ApiResponse<ServiceRequest[]>>('/service-requests/my');
  },

  /**
   * Get service request by ID
   */
  getById: async (id: number): Promise<ApiResponse<ServiceRequest>> => {
    return apiClient.get<ApiResponse<ServiceRequest>>(`/service-requests/${id}`);
  },

  /**
   * Update service request
   */
  update: async (id: number, data: Partial<ServiceRequestData>): Promise<ApiResponse<ServiceRequest>> => {
    return apiClient.put<ApiResponse<ServiceRequest>>(`/service-requests/${id}`, data);
  },

  /**
   * Cancel service request
   */
  cancel: async (id: number): Promise<ApiResponse<null>> => {
    return apiClient.put<ApiResponse<null>>(`/service-requests/${id}/cancel`);
  },

  /**
   * Get available service requests (for technicians)
   */
  getAvailable: async (): Promise<ApiResponse<ServiceRequest[]>> => {
    return apiClient.get<ApiResponse<ServiceRequest[]>>('/service-requests/available');
  },

  /**
   * Accept a service request (technician)
   */
  accept: async (id: number): Promise<ApiResponse<ServiceRequest>> => {
    return apiClient.put<ApiResponse<ServiceRequest>>(`/service-requests/${id}/accept`);
  },

  /**
   * Decline a service request (technician)
   */
  decline: async (id: number): Promise<ApiResponse<null>> => {
    return apiClient.put<ApiResponse<null>>(`/service-requests/${id}/decline`);
  },

  /**
   * Start working on service request (technician)
   */
  start: async (id: number): Promise<ApiResponse<ServiceRequest>> => {
    return apiClient.put<ApiResponse<ServiceRequest>>(`/service-requests/${id}/start`);
  },

  /**
   * Complete service request (technician)
   */
  complete: async (id: number, finalPrice?: number): Promise<ApiResponse<ServiceRequest>> => {
    return apiClient.put<ApiResponse<ServiceRequest>>(`/service-requests/${id}/complete`, {
      finalPrice
    });
  },

  /**
   * Get technician's jobs
   */
  getMyJobs: async (): Promise<ApiResponse<ServiceRequest[]>> => {
    return apiClient.get<ApiResponse<ServiceRequest[]>>('/service-requests/my-jobs');
  }
};

// Service Posts API (Customer posts for technicians to bid)
export const servicePostsAPI = {
  /**
   * Create a service post
   */
  create: async (data: ServicePostData): Promise<ApiResponse<ServicePost>> => {
    return apiClient.post<ApiResponse<ServicePost>>('/service-posts', data);
  },

  /**
   * Get all service posts (for technicians)
   */
  getAll: async (page = 1, limit = 10): Promise<ApiResponse<{
    posts: ServicePost[];
    total: number;
    page: number;
    limit: number;
  }>> => {
    return apiClient.get<ApiResponse<any>>(`/service-posts?page=${page}&limit=${limit}`);
  },

  /**
   * Get my service posts (customer)
   */
  getMy: async (): Promise<ApiResponse<ServicePost[]>> => {
    return apiClient.get<ApiResponse<ServicePost[]>>('/service-posts/my');
  },

  /**
   * Get service post by ID
   */
  getById: async (id: number): Promise<ApiResponse<ServicePost>> => {
    return apiClient.get<ApiResponse<ServicePost>>(`/service-posts/${id}`);
  },

  /**
   * Update service post
   */
  update: async (id: number, data: Partial<ServicePostData>): Promise<ApiResponse<ServicePost>> => {
    return apiClient.put<ApiResponse<ServicePost>>(`/service-posts/${id}`, data);
  },

  /**
   * Delete service post
   */
  delete: async (id: number): Promise<ApiResponse<null>> => {
    return apiClient.delete<ApiResponse<null>>(`/service-posts/${id}`);
  },

  /**
   * Close service post
   */
  close: async (id: number): Promise<ApiResponse<ServicePost>> => {
    return apiClient.put<ApiResponse<ServicePost>>(`/service-posts/${id}/close`);
  }
};

// Consultations API (Technician responses to service posts)
export const consultationsAPI = {
  /**
   * Create a consultation (technician response to service post)
   */
  create: async (data: ConsultationData): Promise<ApiResponse<Consultation>> => {
    return apiClient.post<ApiResponse<Consultation>>('/consultations', data);
  },

  /**
   * Get consultations for a service post
   */
  getByServicePost: async (servicePostId: number): Promise<ApiResponse<Consultation[]>> => {
    return apiClient.get<ApiResponse<Consultation[]>>(`/consultations/service-post/${servicePostId}`);
  },

  /**
   * Get my consultations (technician)
   */
  getMy: async (): Promise<ApiResponse<Consultation[]>> => {
    return apiClient.get<ApiResponse<Consultation[]>>('/consultations/my');
  },

  /**
   * Update consultation
   */
  update: async (id: number, data: Partial<ConsultationData>): Promise<ApiResponse<Consultation>> => {
    return apiClient.put<ApiResponse<Consultation>>(`/consultations/${id}`, data);
  },

  /**
   * Accept consultation (customer accepts technician's offer)
   */
  accept: async (id: number): Promise<ApiResponse<Consultation>> => {
    return apiClient.put<ApiResponse<Consultation>>(`/consultations/${id}/accept`);
  },

  /**
   * Reject consultation (customer rejects technician's offer)
   */
  reject: async (id: number): Promise<ApiResponse<null>> => {
    return apiClient.put<ApiResponse<null>>(`/consultations/${id}/reject`);
  },

  /**
   * Delete consultation (technician withdraws offer)
   */
  delete: async (id: number): Promise<ApiResponse<null>> => {
    return apiClient.delete<ApiResponse<null>>(`/consultations/${id}`);
  }
};

export default servicesAPI;
