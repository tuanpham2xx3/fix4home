import { apiClient, ApiResponse } from '../api-client';
import { Notification } from '../socket-client';

// Extended notification type for API responses
export interface NotificationWithDetails extends Notification {
  actionUrl?: string;
  imageUrl?: string;
  metadata?: Record<string, any>;
}

// Notification preferences
export interface NotificationPreferences {
  email: {
    serviceUpdates: boolean;
    chatMessages: boolean;
    paymentUpdates: boolean;
    promotions: boolean;
    systemAlerts: boolean;
  };
  push: {
    serviceUpdates: boolean;
    chatMessages: boolean;
    paymentUpdates: boolean;
    promotions: boolean;
    systemAlerts: boolean;
  };
  sms: {
    serviceUpdates: boolean;
    paymentUpdates: boolean;
    systemAlerts: boolean;
  };
  inApp: {
    serviceUpdates: boolean;
    chatMessages: boolean;
    paymentUpdates: boolean;
    promotions: boolean;
    systemAlerts: boolean;
  };
}

// Notifications API
export const notificationsAPI = {
  /**
   * Get user notifications
   */
  getNotifications: async (
    page = 1,
    limit = 20,
    unreadOnly = false
  ): Promise<ApiResponse<{
    notifications: NotificationWithDetails[];
    total: number;
    unreadCount: number;
    page: number;
    limit: number;
  }>> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      unreadOnly: unreadOnly.toString()
    });
    
    return apiClient.get<ApiResponse<any>>(`/notifications?${params.toString()}`);
  },

  /**
   * Get notification by ID
   */
  getNotification: async (id: number): Promise<ApiResponse<NotificationWithDetails>> => {
    return apiClient.get<ApiResponse<NotificationWithDetails>>(`/notifications/${id}`);
  },

  /**
   * Mark notification as read
   */
  markAsRead: async (id: number): Promise<ApiResponse<null>> => {
    return apiClient.put<ApiResponse<null>>(`/notifications/${id}/read`);
  },

  /**
   * Mark all notifications as read
   */
  markAllAsRead: async (): Promise<ApiResponse<null>> => {
    return apiClient.put<ApiResponse<null>>('/notifications/read-all');
  },

  /**
   * Delete notification
   */
  deleteNotification: async (id: number): Promise<ApiResponse<null>> => {
    return apiClient.delete<ApiResponse<null>>(`/notifications/${id}`);
  },

  /**
   * Delete all notifications
   */
  deleteAllNotifications: async (): Promise<ApiResponse<null>> => {
    return apiClient.delete<ApiResponse<null>>('/notifications/all');
  },

  /**
   * Get unread notifications count
   */
  getUnreadCount: async (): Promise<ApiResponse<{ count: number }>> => {
    return apiClient.get<ApiResponse<{ count: number }>>('/notifications/unread-count');
  },

  /**
   * Get notification preferences
   */
  getPreferences: async (): Promise<ApiResponse<NotificationPreferences>> => {
    return apiClient.get<ApiResponse<NotificationPreferences>>('/notifications/preferences');
  },

  /**
   * Update notification preferences
   */
  updatePreferences: async (preferences: Partial<NotificationPreferences>): Promise<ApiResponse<NotificationPreferences>> => {
    return apiClient.put<ApiResponse<NotificationPreferences>>('/notifications/preferences', preferences);
  },

  /**
   * Subscribe to push notifications (register device token)
   */
  subscribeToPush: async (deviceToken: string, deviceType: 'ios' | 'android' | 'web'): Promise<ApiResponse<null>> => {
    return apiClient.post<ApiResponse<null>>('/notifications/push/subscribe', {
      deviceToken,
      deviceType
    });
  },

  /**
   * Unsubscribe from push notifications
   */
  unsubscribeFromPush: async (deviceToken: string): Promise<ApiResponse<null>> => {
    return apiClient.post<ApiResponse<null>>('/notifications/push/unsubscribe', {
      deviceToken
    });
  },

  /**
   * Test notification (send test notification to current user)
   */
  sendTestNotification: async (type: 'email' | 'push' | 'sms'): Promise<ApiResponse<null>> => {
    return apiClient.post<ApiResponse<null>>('/notifications/test', { type });
  },

  /**
   * Get notification statistics
   */
  getStats: async (): Promise<ApiResponse<{
    total: number;
    unread: number;
    byType: { type: string; count: number }[];
    byWeek: { week: string; count: number }[];
    deliveryStats: {
      email: { sent: number; delivered: number; opened: number };
      push: { sent: number; delivered: number; opened: number };
      sms: { sent: number; delivered: number };
    };
  }>> => {
    return apiClient.get<ApiResponse<any>>('/notifications/stats');
  }
};

export default notificationsAPI;
