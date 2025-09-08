import { apiClient, ApiResponse, typedApiCall } from '../api-client';
import { ReviewData } from '../schemas';

// Review response types
export interface Review {
  id: number;
  serviceRequestId: number;
  customerId: number;
  technicianId: number;
  rating: number;
  comment: string;
  isPublic: boolean;
  response?: string; // Technician's response to the review
  responseAt?: string;
  createdAt: string;
  updatedAt: string;
  customer: {
    id: number;
    fullName: string;
    avatar?: string;
  };
  technician: {
    id: number;
    fullName: string;
    avatar?: string;
  };
  serviceRequest: {
    id: number;
    description: string;
    service: {
      id: number;
      name: string;
    };
    completedAt: string;
  };
}

export interface ReviewStats {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: {
    rating: number;
    count: number;
    percentage: number;
  }[];
  recentReviews: Review[];
  monthlyStats: {
    month: string;
    averageRating: number;
    totalReviews: number;
  }[];
}

// Reviews API
export const reviewsAPI = {
  /**
   * Create a review (customer reviews technician)
   */
  createReview: async (data: ReviewData): Promise<ApiResponse<Review>> => {
    return typedApiCall<Review>(apiClient.post('/reviews', data));
  },

  /**
   * Get review by ID
   */
  getReview: async (id: number): Promise<ApiResponse<Review>> => {
    return typedApiCall<Review>(apiClient.get(`/reviews/${id}`));
  },

  /**
   * Update my review
   */
  updateReview: async (id: number, data: Partial<ReviewData>): Promise<ApiResponse<Review>> => {
    return typedApiCall<Review>(apiClient.put(`/reviews/${id}`, data));
  },

  /**
   * Delete my review
   */
  deleteReview: async (id: number): Promise<ApiResponse<null>> => {
    return typedApiCall<null>(apiClient.delete(`/reviews/${id}`));
  },

  /**
   * Get reviews I've written (customer)
   */
  getMyReviews: async (
    page = 1,
    limit = 20
  ): Promise<ApiResponse<{
    reviews: Review[];
    total: number;
    page: number;
    limit: number;
  }>> => {
    return typedApiCall<any>(apiClient.get(`/reviews/my?page=${page}&limit=${limit}`));
  },

  /**
   * Get reviews I've received (technician)
   */
  getReceivedReviews: async (
    page = 1,
    limit = 20
  ): Promise<ApiResponse<{
    reviews: Review[];
    total: number;
    page: number;
    limit: number;
  }>> => {
    return typedApiCall<any>(apiClient.get(`/reviews/received?page=${page}&limit=${limit}`));
  },

  /**
   * Get reviews for a specific technician (public)
   */
  getTechnicianReviews: async (
    technicianId: number,
    page = 1,
    limit = 20
  ): Promise<ApiResponse<{
    reviews: Review[];
    total: number;
    page: number;
    limit: number;
    stats: {
      averageRating: number;
      totalReviews: number;
      ratingDistribution: { rating: number; count: number }[];
    };
  }>> => {
    return typedApiCall<any>(apiClient.get(
      `/reviews/technician/${technicianId}?page=${page}&limit=${limit}`
    ));
  },

  /**
   * Get reviews for a specific service
   */
  getServiceReviews: async (
    serviceId: number,
    page = 1,
    limit = 20
  ): Promise<ApiResponse<{
    reviews: Review[];
    total: number;
    page: number;
    limit: number;
    stats: {
      averageRating: number;
      totalReviews: number;
    };
  }>> => {
    return typedApiCall<any>(apiClient.get(
      `/reviews/service/${serviceId}?page=${page}&limit=${limit}`
    ));
  },

  /**
   * Respond to a review (technician responds to customer review)
   */
  respondToReview: async (id: number, response: string): Promise<ApiResponse<Review>> => {
    return typedApiCall<Review>(apiClient.put(`/reviews/${id}/respond`, { response }));
  },

  /**
   * Update review response
   */
  updateReviewResponse: async (id: number, response: string): Promise<ApiResponse<Review>> => {
    return typedApiCall<Review>(apiClient.put(`/reviews/${id}/response`, { response }));
  },

  /**
   * Delete review response
   */
  deleteReviewResponse: async (id: number): Promise<ApiResponse<Review>> => {
    return typedApiCall<Review>(apiClient.delete(`/reviews/${id}/response`));
  },

  /**
   * Report a review (for inappropriate content)
   */
  reportReview: async (id: number, reason: string): Promise<ApiResponse<null>> => {
    return typedApiCall<null>(apiClient.post(`/reviews/${id}/report`, { reason }));
  },

  /**
   * Like/Unlike a review
   */
  toggleReviewLike: async (id: number): Promise<ApiResponse<{ liked: boolean; likesCount: number }>> => {
    return typedApiCall<{ liked: boolean; likesCount: number }>(apiClient.post(`/reviews/${id}/like`));
  },

  /**
   * Get my review statistics (customer)
   */
  getMyReviewStats: async (): Promise<ApiResponse<{
    totalReviews: number;
    averageRatingGiven: number;
    reviewsByRating: { rating: number; count: number }[];
    monthlyReviews: { month: string; count: number }[];
  }>> => {
    return typedApiCall<any>(apiClient.get('/reviews/my/stats'));
  },

  /**
   * Get my rating statistics (technician)
   */
  getMyRatingStats: async (): Promise<ApiResponse<ReviewStats>> => {
    return typedApiCall<ReviewStats>(apiClient.get('/reviews/received/stats'));
  },

  /**
   * Search reviews
   */
  searchReviews: async (params: {
    query?: string;
    technicianId?: number;
    serviceId?: number;
    rating?: number;
    minRating?: number;
    maxRating?: number;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
    sortBy?: 'rating' | 'date' | 'helpful';
    sortOrder?: 'asc' | 'desc';
  }): Promise<ApiResponse<{
    reviews: Review[];
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
    
    return apiClient.get(`/reviews/search?${searchParams.toString()}`);
  },

  /**
   * Get review insights (for technicians to understand feedback)
   */
  getReviewInsights: async (): Promise<ApiResponse<{
    commonPraises: { text: string; count: number }[];
    commonComplaints: { text: string; count: number }[];
    ratingTrends: { month: string; rating: number }[];
    responseRate: number;
    averageResponseTime: number; // in hours
    topKeywords: { keyword: string; sentiment: 'positive' | 'negative' | 'neutral'; count: number }[];
  }>> => {
    return typedApiCall<any>(apiClient.get('/reviews/insights'));
  },

  /**
   * Get pending reviews (reviews I need to write)
   */
  getPendingReviews: async (): Promise<ApiResponse<{
    serviceRequestId: number;
    technicianId: number;
    technicianName: string;
    serviceName: string;
    completedAt: string;
    daysAgo: number;
  }[]>> => {
    return typedApiCall<any>(apiClient.get('/reviews/pending'));
  },

  /**
   * Get review reminders count
   */
  getReviewRemindersCount: async (): Promise<ApiResponse<{ count: number }>> => {
    return typedApiCall<{ count: number }>(apiClient.get('/reviews/reminders/count'));
  }
};

// Review utilities
export const reviewUtils = {
  /**
   * Format rating display
   */
  formatRating: (rating: number): string => {
    return rating.toFixed(1);
  },

  /**
   * Get rating color
   */
  getRatingColor: (rating: number): string => {
    if (rating >= 4.5) return 'green';
    if (rating >= 4.0) return 'yellow-green';
    if (rating >= 3.5) return 'yellow';
    if (rating >= 3.0) return 'orange';
    return 'red';
  },

  /**
   * Get star display for rating
   */
  getStars: (rating: number): { filled: number; half: boolean; empty: number } => {
    const filled = Math.floor(rating);
    const half = rating % 1 >= 0.5;
    const empty = 5 - filled - (half ? 1 : 0);
    
    return { filled, half, empty };
  },

  /**
   * Calculate percentage for rating distribution
   */
  calculateRatingPercentage: (count: number, total: number): number => {
    return total > 0 ? Math.round((count / total) * 100) : 0;
  },

  /**
   * Get review sentiment
   */
  getReviewSentiment: (rating: number): 'positive' | 'neutral' | 'negative' => {
    if (rating >= 4) return 'positive';
    if (rating >= 3) return 'neutral';
    return 'negative';
  },

  /**
   * Check if review can be edited (within time limit)
   */
  canEditReview: (createdAt: string, editTimeLimit = 24): boolean => {
    const created = new Date(createdAt);
    const now = new Date();
    const hoursDiff = (now.getTime() - created.getTime()) / (1000 * 60 * 60);
    return hoursDiff < editTimeLimit;
  },

  /**
   * Format time since review
   */
  formatTimeSince: (date: string): string => {
    const now = new Date();
    const reviewDate = new Date(date);
    const diffInMs = now.getTime() - reviewDate.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Hôm nay';
    if (diffInDays === 1) return 'Hôm qua';
    if (diffInDays < 7) return `${diffInDays} ngày trước`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} tuần trước`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} tháng trước`;
    return `${Math.floor(diffInDays / 365)} năm trước`;
  }
};

export default reviewsAPI;
