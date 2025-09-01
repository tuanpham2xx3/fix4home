import { io, Socket } from 'socket.io-client';
import { config, TokenManager } from './api-client';
import { ChatMessageData } from './schemas';

// Socket event types
export interface ServerToClientEvents {
  // Chat events
  'chat:message': (message: ChatMessage) => void;
  'chat:typing': (data: { conversationId: number; userId: number; isTyping: boolean }) => void;
  'chat:user_online': (data: { userId: number; isOnline: boolean }) => void;
  
  // Notification events
  'notification:new': (notification: Notification) => void;
  'notification:read': (notificationId: number) => void;
  
  // Service request events
  'service_request:status_changed': (data: { serviceRequestId: number; status: string }) => void;
  'service_request:new_application': (data: { serviceRequestId: number; technicianId: number }) => void;
  
  // Service post events
  'service_post:new_consultation': (data: { servicePostId: number; consultationId: number }) => void;
  'service_post:consultation_accepted': (data: { consultationId: number }) => void;
  
  // General events
  'user:location_update': (data: { userId: number; latitude: number; longitude: number }) => void;
  'system:maintenance': (data: { message: string; scheduledTime: string }) => void;
  
  // Connection events
  'connect': () => void;
  'disconnect': () => void;
  'connect_error': (error: Error) => void;
  'error': (error: any) => void;
}

export interface ClientToServerEvents {
  // Chat events
  'chat:join_conversation': (conversationId: number) => void;
  'chat:leave_conversation': (conversationId: number) => void;
  'chat:send_message': (data: ChatMessageData) => void;
  'chat:typing': (data: { conversationId: number; isTyping: boolean }) => void;
  'chat:mark_read': (data: { conversationId: number; messageId: number }) => void;
  
  // User presence
  'user:online': () => void;
  'user:offline': () => void;
  'user:update_location': (data: { latitude: number; longitude: number }) => void;
  
  // Notifications
  'notification:mark_read': (notificationId: number) => void;
  'notification:mark_all_read': () => void;
}

// Data types
export interface ChatMessage {
  id: number;
  conversationId: number;
  senderId: number;
  content: string;
  messageType: 'TEXT' | 'IMAGE' | 'FILE';
  fileUrl?: string;
  fileName?: string;
  isRead: boolean;
  createdAt: string;
  sender: {
    id: number;
    fullName: string;
    avatar?: string;
  };
}

export interface Conversation {
  id: number;
  participant1Id: number;
  participant2Id: number;
  lastMessage?: ChatMessage;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
  participant: {
    id: number;
    fullName: string;
    avatar?: string;
    isOnline: boolean;
    lastSeen?: string;
  };
}

export interface Notification {
  id: number;
  userId: number;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  data?: Record<string, any>;
  isRead: boolean;
  createdAt: string;
}

// Socket client class
class SocketClient {
  private socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private isConnecting = false;
  private eventListeners = new Map<string, Function[]>();

  constructor() {
    this.initializeSocket();
  }

  private initializeSocket() {
    if (this.isConnecting || this.socket?.connected) {
      return;
    }

    const token = TokenManager.getAccessToken();
    if (!token || TokenManager.isTokenExpired(token)) {
      console.warn('No valid token found, socket connection skipped');
      return;
    }

    this.isConnecting = true;

    this.socket = io(config.SOCKET_URL, {
      auth: {
        token: `Bearer ${token}`,
      },
      transports: ['websocket', 'polling'],
      timeout: 20000,
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000,
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connect', () => {
      console.log('Socket connected');
      this.isConnecting = false;
      this.reconnectAttempts = 0;
      this.emit('connected');
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      this.emit('disconnected', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      this.isConnecting = false;
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('Max reconnection attempts reached');
        this.emit('connection_failed');
      }
    });

    // Chat events
    this.socket.on('chat:message', (message) => {
      this.emit('chat:message', message);
    });

    this.socket.on('chat:typing', (data) => {
      this.emit('chat:typing', data);
    });

    this.socket.on('chat:user_online', (data) => {
      this.emit('chat:user_online', data);
    });

    // Notification events
    this.socket.on('notification:new', (notification) => {
      this.emit('notification:new', notification);
    });

    // Service events
    this.socket.on('service_request:status_changed', (data) => {
      this.emit('service_request:status_changed', data);
    });

    this.socket.on('service_post:new_consultation', (data) => {
      this.emit('service_post:new_consultation', data);
    });
  }

  // Public methods
  connect() {
    if (!this.socket || this.socket.disconnected) {
      this.initializeSocket();
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.isConnecting = false;
  }

  // Event listener management
  on<K extends keyof ServerToClientEvents>(event: K | string, callback: Function) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);

    // If socket is connected, also add to socket
    if (this.socket?.connected) {
      this.socket.on(event as any, callback as any);
    }
  }

  off<K extends keyof ServerToClientEvents>(event: K | string, callback?: Function) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      if (callback) {
        const index = listeners.indexOf(callback);
        if (index > -1) {
          listeners.splice(index, 1);
        }
      } else {
        listeners.length = 0;
      }
    }

    if (this.socket) {
      this.socket.off(event as any, callback as any);
    }
  }

  private emit(event: string, ...args: any[]) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => callback(...args));
    }
  }

  // Chat methods
  joinConversation(conversationId: number) {
    this.socket?.emit('chat:join_conversation', conversationId);
  }

  leaveConversation(conversationId: number) {
    this.socket?.emit('chat:leave_conversation', conversationId);
  }

  sendMessage(data: ChatMessageData) {
    this.socket?.emit('chat:send_message', data);
  }

  sendTyping(conversationId: number, isTyping: boolean) {
    this.socket?.emit('chat:typing', { conversationId, isTyping });
  }

  markMessageRead(conversationId: number, messageId: number) {
    this.socket?.emit('chat:mark_read', { conversationId, messageId });
  }

  // User presence methods
  setOnline() {
    this.socket?.emit('user:online');
  }

  setOffline() {
    this.socket?.emit('user:offline');
  }

  updateLocation(latitude: number, longitude: number) {
    this.socket?.emit('user:update_location', { latitude, longitude });
  }

  // Notification methods
  markNotificationRead(notificationId: number) {
    this.socket?.emit('notification:mark_read', notificationId);
  }

  markAllNotificationsRead() {
    this.socket?.emit('notification:mark_all_read');
  }

  // Utility methods
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  getConnectionState(): 'connecting' | 'connected' | 'disconnected' {
    if (this.isConnecting) return 'connecting';
    if (this.socket?.connected) return 'connected';
    return 'disconnected';
  }

  // Refresh connection with new token
  refreshConnection() {
    this.disconnect();
    setTimeout(() => {
      this.connect();
    }, 1000);
  }
}

// Singleton instance
export const socketClient = new SocketClient();

// React hook for socket functionality
export const useSocket = () => {
  return {
    socket: socketClient,
    isConnected: socketClient.isConnected(),
    connectionState: socketClient.getConnectionState(),
    connect: () => socketClient.connect(),
    disconnect: () => socketClient.disconnect(),
  };
};

export default socketClient;
