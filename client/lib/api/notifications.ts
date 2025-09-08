import { apiClient, ApiResponse, typedApiCall } from '../api-client';
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
    
    return apiClient.get(`/notifications?${params.toString()}`);
  },

  /**
   * Get notification by ID
   */
  getNotification: async (id: number): Promise<ApiResponse<NotificationWithDetails>> => {
    return typedApiCall<NotificationWithDetails>(apiClient.get(`/notifications/${id}`));
  },

  /**
   * Mark notification as read
   */
  markAsRead: async (id: number): Promise<ApiResponse<null>> => {
    return typedApiCall<null>(apiClient.put(`/notifications/${id}/read`));
  },

  /**
   * Mark all notifications as read
   */
  markAllAsRead: async (): Promise<ApiResponse<null>> => {
    return typedApiCall<null>(apiClient.put('/notifications/read-all'));
  },

  /**
   * Delete notification
   */
  deleteNotification: async (id: number): Promise<ApiResponse<null>> => {
    return typedApiCall<null>(apiClient.delete(`/notifications/${id}`));
  },

  /**
   * Delete all notifications
   */
  deleteAllNotifications: async (): Promise<ApiResponse<null>> => {
    return typedApiCall<null>(apiClient.delete('/notifications/all'));
  },

  /**
   * Get unread notifications count
   */
  getUnreadCount: async (): Promise<ApiResponse<{ count: number }>> => {
    return typedApiCall<{ count: number }>(apiClient.get('/notifications/unread-count'));
  },

  /**
   * Get notification preferences
   */
  getPreferences: async (): Promise<ApiResponse<NotificationPreferences>> => {
    return typedApiCall<NotificationPreferences>(apiClient.get('/notifications/preferences'));
  },

  /**
   * Update notification preferences
   */
  updatePreferences: async (preferences: Partial<NotificationPreferences>): Promise<ApiResponse<NotificationPreferences>> => {
    return typedApiCall<NotificationPreferences>(apiClient.put('/notifications/preferences', preferences));
  },

  /**
   * Subscribe to push notifications (register device token)
   */
  subscribeToPush: async (deviceToken: string, deviceType: 'ios' | 'android' | 'web'): Promise<ApiResponse<null>> => {
    return typedApiCall<null>(apiClient.post('/notifications/push/subscribe', {
      deviceToken,
      deviceType
    }));
  },

  /**
   * Unsubscribe from push notifications
   */
  unsubscribeFromPush: async (deviceToken: string): Promise<ApiResponse<null>> => {
    return typedApiCall<null>(apiClient.post('/notifications/push/unsubscribe', {
      deviceToken
    }));
  },

  /**
   * Test notification (send test notification to current user)
   */
  sendTestNotification: async (type: 'email' | 'push' | 'sms'): Promise<ApiResponse<null>> => {
    return typedApiCall<null>(apiClient.post('/notifications/test', { type }));
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
    return typedApiCall<any>(apiClient.get('/notifications/stats'));
  }
};

export default notificationsAPI;
