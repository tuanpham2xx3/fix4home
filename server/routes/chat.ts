import { RequestHandler } from "express";
import { ApiResponse } from "@shared/api";

// Mock chat data
let mockChats = [
  {
    id: 1,
    participants: [1, 2], // customer and technician
    participantDetails: [
      { id: 1, name: "Nguyen Van Customer", role: "customer", avatar: null },
      { id: 2, name: "Tran Van Technician", role: "technician", avatar: null }
    ],
    lastMessage: "Bạn có thể đến sửa vào lúc nào?",
    lastMessageTime: "2024-01-15T10:30:00Z",
    unreadCount: 2,
    status: "active"
  },
  {
    id: 2,
    participants: [1, 3], // customer and admin
    participantDetails: [
      { id: 1, name: "Nguyen Van Customer", role: "customer", avatar: null },
      { id: 3, name: "Le Van Admin", role: "admin", avatar: null }
    ],
    lastMessage: "Cảm ơn bạn đã phản hồi!",
    lastMessageTime: "2024-01-14T15:20:00Z",
    unreadCount: 0,
    status: "active"
  }
];

let mockMessages = [
  // Chat 1 messages (customer <-> technician)
  {
    id: 1,
    chatId: 1,
    senderId: 1,
    senderName: "Nguyen Van Customer",
    senderRole: "customer",
    message: "Xin chào, tôi cần sửa ống nước bị rò rỉ",
    timestamp: "2024-01-15T09:00:00Z",
    messageType: "text",
    isRead: true
  },
  {
    id: 2,
    chatId: 1,
    senderId: 2,
    senderName: "Tran Van Technician", 
    senderRole: "technician",
    message: "Chào bạn! Tôi có thể giúp bạn sửa ống nước. Bạn ở địa chỉ nào?",
    timestamp: "2024-01-15T09:05:00Z",
    messageType: "text",
    isRead: true
  },
  {
    id: 3,
    chatId: 1,
    senderId: 1,
    senderName: "Nguyen Van Customer",
    senderRole: "customer",
    message: "Tôi ở 123 Nguyễn Văn Cừ, Quận 1, TP.HCM",
    timestamp: "2024-01-15T09:10:00Z",
    messageType: "text",
    isRead: true
  },
  {
    id: 4,
    chatId: 1,
    senderId: 2,
    senderName: "Tran Van Technician",
    senderRole: "technician", 
    message: "OK, tôi sẽ đến kiểm tra vào chiều nay lúc 2h được không?",
    timestamp: "2024-01-15T09:15:00Z",
    messageType: "text",
    isRead: true
  },
  {
    id: 5,
    chatId: 1,
    senderId: 1,
    senderName: "Nguyen Van Customer",
    senderRole: "customer",
    message: "Được, cảm ơn bạn. Bạn có thể đến sửa vào lúc nào?",
    timestamp: "2024-01-15T10:30:00Z",
    messageType: "text",
    isRead: false
  },
  
  // Chat 2 messages (customer <-> admin)
  {
    id: 6,
    chatId: 2,
    senderId: 1,
    senderName: "Nguyen Van Customer",
    senderRole: "customer",
    message: "Xin chào admin, tôi có thắc mắc về dịch vụ",
    timestamp: "2024-01-14T14:00:00Z",
    messageType: "text",
    isRead: true
  },
  {
    id: 7,
    chatId: 2,
    senderId: 3,
    senderName: "Le Van Admin",
    senderRole: "admin",
    message: "Chào bạn! Bạn có thắc mắc gì về dịch vụ của chúng tôi?",
    timestamp: "2024-01-14T14:30:00Z",
    messageType: "text",
    isRead: true
  },
  {
    id: 8,
    chatId: 2,
    senderId: 1,
    senderName: "Nguyen Van Customer", 
    senderRole: "customer",
    message: "Cảm ơn bạn đã phản hồi!",
    timestamp: "2024-01-14T15:20:00Z",
    messageType: "text",
    isRead: true
  }
];

// Helper function to get user from token
function getUserFromToken(authHeader: string) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  try {
    const token = authHeader.substring(7);
    const payload = JSON.parse(Buffer.from(token, 'base64').toString());
    return payload;
  } catch {
    return null;
  }
}

// Get all chats for current user
export const handleGetChats: RequestHandler = (req, res) => {
  const user = getUserFromToken(req.headers.authorization || '');
  
  if (!user) {
    const response: ApiResponse<null> = {
      success: false,
      message: "Unauthorized",
      data: null,
      timestamp: new Date().toISOString()
    };
    return res.status(401).json(response);
  }

  // Filter chats where user is a participant
  const userChats = mockChats.filter(chat => 
    chat.participants.includes(user.id)
  );

  const response: ApiResponse<any[]> = {
    success: true,
    message: "Lấy danh sách chat thành công",
    data: userChats,
    timestamp: new Date().toISOString()
  };

  res.json(response);
};

// Get messages for a specific chat
export const handleGetChatMessages: RequestHandler = (req, res) => {
  const user = getUserFromToken(req.headers.authorization || '');
  const chatId = parseInt(req.params.chatId);
  
  if (!user) {
    const response: ApiResponse<null> = {
      success: false,
      message: "Unauthorized",
      data: null,
      timestamp: new Date().toISOString()
    };
    return res.status(401).json(response);
  }

  // Check if user has access to this chat
  const chat = mockChats.find(c => c.id === chatId && c.participants.includes(user.id));
  if (!chat) {
    const response: ApiResponse<null> = {
      success: false,
      message: "Chat không tồn tại hoặc bạn không có quyền truy cập",
      data: null,
      timestamp: new Date().toISOString()
    };
    return res.status(404).json(response);
  }

  // Get messages for this chat
  const chatMessages = mockMessages.filter(msg => msg.chatId === chatId);

  const response: ApiResponse<any[]> = {
    success: true,
    message: "Lấy tin nhắn thành công",
    data: chatMessages,
    timestamp: new Date().toISOString()
  };

  res.json(response);
};

// Send a new message
export const handleSendMessage: RequestHandler = (req, res) => {
  const user = getUserFromToken(req.headers.authorization || '');
  const chatId = parseInt(req.params.chatId);
  const { message, messageType = "text" } = req.body;
  
  if (!user) {
    const response: ApiResponse<null> = {
      success: false,
      message: "Unauthorized",
      data: null,
      timestamp: new Date().toISOString()
    };
    return res.status(401).json(response);
  }

  // Check if user has access to this chat
  const chat = mockChats.find(c => c.id === chatId && c.participants.includes(user.id));
  if (!chat) {
    const response: ApiResponse<null> = {
      success: false,
      message: "Chat không tồn tại hoặc bạn không có quyền truy cập",
      data: null,
      timestamp: new Date().toISOString()
    };
    return res.status(404).json(response);
  }

  // Create new message
  const newMessage = {
    id: mockMessages.length + 1,
    chatId,
    senderId: user.id,
    senderName: user.email.split('@')[0], // Simple name extraction
    senderRole: user.role,
    message: message.trim(),
    timestamp: new Date().toISOString(),
    messageType,
    isRead: false
  };

  // Add message to mock data
  mockMessages.push(newMessage);

  // Update chat's last message
  const chatIndex = mockChats.findIndex(c => c.id === chatId);
  if (chatIndex !== -1) {
    mockChats[chatIndex].lastMessage = message.trim();
    mockChats[chatIndex].lastMessageTime = newMessage.timestamp;
    
    // Increment unread count for other participants
    mockChats[chatIndex].unreadCount += 1;
  }

  const response: ApiResponse<any> = {
    success: true,
    message: "Gửi tin nhắn thành công",
    data: newMessage,
    timestamp: new Date().toISOString()
  };

  res.json(response);
};

// Create new chat
export const handleCreateChat: RequestHandler = (req, res) => {
  const user = getUserFromToken(req.headers.authorization || '');
  const { participantId, initialMessage } = req.body;
  
  if (!user) {
    const response: ApiResponse<null> = {
      success: false,
      message: "Unauthorized",
      data: null,
      timestamp: new Date().toISOString()
    };
    return res.status(401).json(response);
  }

  // Check if chat already exists between these users
  const existingChat = mockChats.find(chat => 
    chat.participants.includes(user.id) && chat.participants.includes(participantId)
  );

  if (existingChat) {
    const response: ApiResponse<any> = {
      success: true,
      message: "Chat đã tồn tại",
      data: existingChat,
      timestamp: new Date().toISOString()
    };
    return res.json(response);
  }

  // Mock participant details (in real app, fetch from user service)
  const participantNames = {
    1: "Nguyen Van Customer",
    2: "Tran Van Technician", 
    3: "Le Van Admin"
  };

  const participantRoles = {
    1: "customer",
    2: "technician",
    3: "admin"
  };

  // Create new chat
  const newChat = {
    id: mockChats.length + 1,
    participants: [user.id, participantId],
    participantDetails: [
      { 
        id: user.id, 
        name: participantNames[user.id as keyof typeof participantNames] || user.email, 
        role: user.role, 
        avatar: null 
      },
      { 
        id: participantId, 
        name: participantNames[participantId as keyof typeof participantNames] || `User ${participantId}`, 
        role: participantRoles[participantId as keyof typeof participantRoles] || "customer", 
        avatar: null 
      }
    ],
    lastMessage: initialMessage || "",
    lastMessageTime: new Date().toISOString(),
    unreadCount: 0,
    status: "active"
  };

  mockChats.push(newChat);

  // Add initial message if provided
  if (initialMessage) {
    const newMessage = {
      id: mockMessages.length + 1,
      chatId: newChat.id,
      senderId: user.id,
      senderName: participantNames[user.id as keyof typeof participantNames] || user.email,
      senderRole: user.role,
      message: initialMessage.trim(),
      timestamp: new Date().toISOString(),
      messageType: "text",
      isRead: false
    };

    mockMessages.push(newMessage);
  }

  const response: ApiResponse<any> = {
    success: true,
    message: "Tạo chat thành công",
    data: newChat,
    timestamp: new Date().toISOString()
  };

  res.json(response);
};

// Mark messages as read
export const handleMarkAsRead: RequestHandler = (req, res) => {
  const user = getUserFromToken(req.headers.authorization || '');
  const chatId = parseInt(req.params.chatId);
  
  if (!user) {
    const response: ApiResponse<null> = {
      success: false,
      message: "Unauthorized",
      data: null,
      timestamp: new Date().toISOString()
    };
    return res.status(401).json(response);
  }

  // Mark messages as read for current user
  mockMessages.forEach(msg => {
    if (msg.chatId === chatId && msg.senderId !== user.id) {
      msg.isRead = true;
    }
  });

  // Reset unread count for this user
  const chatIndex = mockChats.findIndex(c => c.id === chatId);
  if (chatIndex !== -1) {
    mockChats[chatIndex].unreadCount = 0;
  }

  const response: ApiResponse<null> = {
    success: true,
    message: "Đánh dấu đã đọc thành công",
    data: null,
    timestamp: new Date().toISOString()
  };

  res.json(response);
};

