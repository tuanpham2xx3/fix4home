import { apiClient, ApiResponse } from '../api-client';
import { ChatMessageData } from '../schemas';
import { ChatMessage, Conversation } from '../socket-client';

// Chat API
export const chatAPI = {
  /**
   * Get all conversations for current user
   */
  getConversations: async (): Promise<ApiResponse<Conversation[]>> => {
    return apiClient.get<ApiResponse<Conversation[]>>('/chat/conversations');
  },

  /**
   * Get or create conversation with another user
   */
  getOrCreateConversation: async (participantId: number): Promise<ApiResponse<Conversation>> => {
    return apiClient.post<ApiResponse<Conversation>>('/chat/conversations', {
      participantId
    });
  },

  /**
   * Get conversation by ID
   */
  getConversation: async (id: number): Promise<ApiResponse<Conversation>> => {
    return apiClient.get<ApiResponse<Conversation>>(`/chat/conversations/${id}`);
  },

  /**
   * Get messages for a conversation
   */
  getMessages: async (
    conversationId: number, 
    page = 1, 
    limit = 50
  ): Promise<ApiResponse<{
    messages: ChatMessage[];
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
  }>> => {
    return apiClient.get<ApiResponse<any>>(
      `/chat/conversations/${conversationId}/messages?page=${page}&limit=${limit}`
    );
  },

  /**
   * Send a text message
   */
  sendMessage: async (data: ChatMessageData): Promise<ApiResponse<ChatMessage>> => {
    return apiClient.post<ApiResponse<ChatMessage>>(
      `/chat/conversations/${data.conversationId}/messages`,
      {
        content: data.content,
        messageType: data.messageType || 'TEXT'
      }
    );
  },

  /**
   * Send a file/image message
   */
  sendFileMessage: async (
    conversationId: number,
    file: File,
    messageType: 'IMAGE' | 'FILE' = 'FILE'
  ): Promise<ApiResponse<ChatMessage>> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('messageType', messageType);
    
    return apiClient.post<ApiResponse<ChatMessage>>(
      `/chat/conversations/${conversationId}/messages/file`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
  },

  /**
   * Mark message as read
   */
  markMessageRead: async (conversationId: number, messageId: number): Promise<ApiResponse<null>> => {
    return apiClient.put<ApiResponse<null>>(
      `/chat/conversations/${conversationId}/messages/${messageId}/read`
    );
  },

  /**
   * Mark all messages in conversation as read
   */
  markAllMessagesRead: async (conversationId: number): Promise<ApiResponse<null>> => {
    return apiClient.put<ApiResponse<null>>(
      `/chat/conversations/${conversationId}/read-all`
    );
  },

  /**
   * Delete a message
   */
  deleteMessage: async (conversationId: number, messageId: number): Promise<ApiResponse<null>> => {
    return apiClient.delete<ApiResponse<null>>(
      `/chat/conversations/${conversationId}/messages/${messageId}`
    );
  },

  /**
   * Search messages
   */
  searchMessages: async (
    query: string,
    conversationId?: number
  ): Promise<ApiResponse<{
    messages: ChatMessage[];
    total: number;
  }>> => {
    const params = new URLSearchParams({ query });
    if (conversationId) {
      params.append('conversationId', conversationId.toString());
    }
    
    return apiClient.get<ApiResponse<any>>(`/chat/search?${params.toString()}`);
  },

  /**
   * Get conversation statistics
   */
  getConversationStats: async (conversationId: number): Promise<ApiResponse<{
    totalMessages: number;
    unreadCount: number;
    firstMessageDate: string;
    lastMessageDate: string;
    messagesByDay: { date: string; count: number }[];
  }>> => {
    return apiClient.get<ApiResponse<any>>(`/chat/conversations/${conversationId}/stats`);
  },

  /**
   * Block a user (prevent them from messaging you)
   */
  blockUser: async (userId: number): Promise<ApiResponse<null>> => {
    return apiClient.post<ApiResponse<null>>('/chat/block', { userId });
  },

  /**
   * Unblock a user
   */
  unblockUser: async (userId: number): Promise<ApiResponse<null>> => {
    return apiClient.delete<ApiResponse<null>>(`/chat/block/${userId}`);
  },

  /**
   * Get blocked users
   */
  getBlockedUsers: async (): Promise<ApiResponse<{
    id: number;
    fullName: string;
    avatar?: string;
    blockedAt: string;
  }[]>> => {
    return apiClient.get<ApiResponse<any>>('/chat/blocked');
  },

  /**
   * Report a conversation or message
   */
  reportConversation: async (
    conversationId: number,
    reason: string,
    messageId?: number
  ): Promise<ApiResponse<null>> => {
    return apiClient.post<ApiResponse<null>>('/chat/report', {
      conversationId,
      messageId,
      reason
    });
  },

  /**
   * Archive a conversation
   */
  archiveConversation: async (conversationId: number): Promise<ApiResponse<null>> => {
    return apiClient.put<ApiResponse<null>>(`/chat/conversations/${conversationId}/archive`);
  },

  /**
   * Unarchive a conversation
   */
  unarchiveConversation: async (conversationId: number): Promise<ApiResponse<null>> => {
    return apiClient.put<ApiResponse<null>>(`/chat/conversations/${conversationId}/unarchive`);
  },

  /**
   * Delete a conversation (for current user only)
   */
  deleteConversation: async (conversationId: number): Promise<ApiResponse<null>> => {
    return apiClient.delete<ApiResponse<null>>(`/chat/conversations/${conversationId}`);
  },

  /**
   * Get chat settings
   */
  getChatSettings: async (): Promise<ApiResponse<{
    allowMessagesFromStrangers: boolean;
    showOnlineStatus: boolean;
    soundNotifications: boolean;
    emailNotifications: boolean;
  }>> => {
    return apiClient.get<ApiResponse<any>>('/chat/settings');
  },

  /**
   * Update chat settings
   */
  updateChatSettings: async (settings: {
    allowMessagesFromStrangers?: boolean;
    showOnlineStatus?: boolean;
    soundNotifications?: boolean;
    emailNotifications?: boolean;
  }): Promise<ApiResponse<null>> => {
    return apiClient.put<ApiResponse<null>>('/chat/settings', settings);
  }
};

export default chatAPI;
