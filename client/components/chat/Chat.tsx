import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { 
  chatAPI, 
  socketClient, 
  useSocket,
  Conversation,
  ChatMessage,
  handleAPIError
} from '@/lib/api';
import ConversationList from './ConversationList';
import ChatWindow from './ChatWindow';
import { cn } from '@/lib/utils';
import { 
  MessageCircle, 
  Plus, 
  RefreshCw,
  Wifi,
  WifiOff 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ChatProps {
  className?: string;
  initialConversationId?: number;
  participantId?: number; // To start new conversation
}

export default function Chat({ 
  className, 
  initialConversationId,
  participantId 
}: ChatProps) {
  const { user } = useAuth();
  const { socket, isConnected, connectionState } = useSocket();
  const { toast } = useToast();
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileChat, setShowMobileChat] = useState(false);

  // Load conversations
  const loadConversations = async () => {
    try {
      setIsLoading(true);
      const response = await chatAPI.getConversations();
      
      if (response.success) {
        setConversations(response.data);
        
        // Auto-select conversation
        if (initialConversationId) {
          const conversation = response.data.find(c => c.id === initialConversationId);
          if (conversation) {
            setSelectedConversation(conversation);
            setShowMobileChat(true);
          }
        } else if (response.data.length > 0 && !selectedConversation) {
          // Auto-select first conversation on desktop
          if (window.innerWidth >= 768) {
            setSelectedConversation(response.data[0]);
          }
        }
      }
    } catch (error) {
      console.error('Failed to load conversations:', error);
      toast({
        title: "Lỗi tải tin nhắn",
        description: "Không thể tải danh sách cuộc trò chuyện",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Create new conversation
  const createConversation = async (participantId: number) => {
    try {
      const response = await chatAPI.getOrCreateConversation(participantId);
      
      if (response.success) {
        const newConversation = response.data;
        
        // Add to conversations list if not exists
        setConversations(prev => {
          const exists = prev.find(c => c.id === newConversation.id);
          if (exists) {
            return prev.map(c => c.id === newConversation.id ? newConversation : c);
          }
          return [newConversation, ...prev];
        });
        
        // Select new conversation
        setSelectedConversation(newConversation);
        setShowMobileChat(true);
        
        return newConversation;
      }
    } catch (error) {
      console.error('Failed to create conversation:', error);
      toast({
        title: "Lỗi tạo cuộc trò chuyện",
        description: handleAPIError(error).message,
        variant: "destructive"
      });
    }
  };

  // Initialize
  useEffect(() => {
    if (!user) return;
    
    loadConversations();
    
    // Connect socket
    if (!isConnected) {
      socketClient.connect();
    }

    // Auto-create conversation if participantId provided
    if (participantId) {
      createConversation(participantId);
    }
  }, [user]);

  // Socket event handlers
  useEffect(() => {
    if (!isConnected) return;

    const handleNewMessage = (message: ChatMessage) => {
      // Update conversation's last message and unread count
      setConversations(prev => prev.map(conv => {
        if (conv.id === message.conversationId) {
          return {
            ...conv,
            lastMessage: message,
            unreadCount: message.senderId === user?.id ? conv.unreadCount : conv.unreadCount + 1,
            updatedAt: message.createdAt
          };
        }
        return conv;
      }));

      // Sort conversations by latest message
      setConversations(prev => [...prev].sort((a, b) => 
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      ));
    };

    const handleUserOnline = (data: { userId: number; isOnline: boolean }) => {
      setConversations(prev => prev.map(conv => {
        if (conv.participant.id === data.userId) {
          return {
            ...conv,
            participant: {
              ...conv.participant,
              isOnline: data.isOnline,
              lastSeen: data.isOnline ? undefined : new Date().toISOString()
            }
          };
        }
        return conv;
      }));
    };

    socketClient.on('chat:message', handleNewMessage);
    socketClient.on('chat:user_online', handleUserOnline);

    return () => {
      socketClient.off('chat:message', handleNewMessage);
      socketClient.off('chat:user_online', handleUserOnline);
    };
  }, [isConnected, user?.id]);

  // Handle conversation selection
  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    setShowMobileChat(true);
    
    // Mark conversation as read
    if (conversation.unreadCount > 0) {
      chatAPI.markAllMessagesRead(conversation.id).catch(console.error);
      
      // Update local state
      setConversations(prev => prev.map(conv => 
        conv.id === conversation.id ? { ...conv, unreadCount: 0 } : conv
      ));
    }
  };

  // Handle conversation actions
  const handleArchiveConversation = async (conversationId: number) => {
    try {
      await chatAPI.archiveConversation(conversationId);
      setConversations(prev => prev.filter(c => c.id !== conversationId));
      
      if (selectedConversation?.id === conversationId) {
        setSelectedConversation(null);
        setShowMobileChat(false);
      }
      
      toast({
        title: "Đã lưu trữ",
        description: "Cuộc trò chuyện đã được lưu trữ"
      });
    } catch (error) {
      toast({
        title: "Lỗi lưu trữ",
        description: handleAPIError(error).message,
        variant: "destructive"
      });
    }
  };

  const handleDeleteConversation = async (conversationId: number) => {
    try {
      await chatAPI.deleteConversation(conversationId);
      setConversations(prev => prev.filter(c => c.id !== conversationId));
      
      if (selectedConversation?.id === conversationId) {
        setSelectedConversation(null);
        setShowMobileChat(false);
      }
      
      toast({
        title: "Đã xóa",
        description: "Cuộc trò chuyện đã được xóa"
      });
    } catch (error) {
      toast({
        title: "Lỗi xóa",
        description: handleAPIError(error).message,
        variant: "destructive"
      });
    }
  };

  const handleBack = () => {
    setShowMobileChat(false);
    setSelectedConversation(null);
  };

  const handleRefresh = () => {
    loadConversations();
  };

  // Mobile view
  const isMobile = window.innerWidth < 768;

  if (isMobile) {
    return (
      <div className={cn("h-full", className)}>
        {!showMobileChat ? (
          <div className="h-full flex flex-col">
            {/* Connection Status */}
            <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
              <div className="flex items-center space-x-2">
                <h1 className="text-lg font-semibold">Tin nhắn</h1>
                {connectionState === 'connecting' && (
                  <RefreshCw className="w-4 h-4 animate-spin text-gray-400" />
                )}
                {isConnected ? (
                  <Wifi className="w-4 h-4 text-green-500" />
                ) : (
                  <WifiOff className="w-4 h-4 text-red-500" />
                )}
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefresh}
                disabled={isLoading}
              >
                <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
              </Button>
            </div>

            <ConversationList
              conversations={conversations}
              selectedConversationId={selectedConversation?.id}
              onSelectConversation={handleSelectConversation}
              onArchiveConversation={handleArchiveConversation}
              onDeleteConversation={handleDeleteConversation}
              isLoading={isLoading}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />
          </div>
        ) : (
          selectedConversation && (
            <ChatWindow
              conversation={selectedConversation}
              onBack={handleBack}
            />
          )
        )}
      </div>
    );
  }

  // Desktop view
  return (
    <div className={cn("h-full flex", className)}>
      {/* Conversation List */}
      <div className="w-80 flex-shrink-0">
        {/* Connection Status */}
        <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <h1 className="text-lg font-semibold">Tin nhắn</h1>
            {connectionState === 'connecting' && (
              <RefreshCw className="w-4 h-4 animate-spin text-gray-400" />
            )}
            {isConnected ? (
              <Wifi className="w-4 h-4 text-green-500" />
            ) : (
              <WifiOff className="w-4 h-4 text-red-500" />
            )}
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
          </Button>
        </div>

        <ConversationList
          conversations={conversations}
          selectedConversationId={selectedConversation?.id}
          onSelectConversation={handleSelectConversation}
          onArchiveConversation={handleArchiveConversation}
          onDeleteConversation={handleDeleteConversation}
          isLoading={isLoading}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
      </div>

      {/* Chat Window */}
      <div className="flex-1 border-l border-gray-200">
        {selectedConversation ? (
          <ChatWindow conversation={selectedConversation} />
        ) : (
          <div className="h-full flex flex-col items-center justify-center bg-gray-50 text-center p-8">
            <MessageCircle className="w-16 h-16 text-gray-300 mb-4" />
            <h3 className="text-xl font-medium text-gray-500 mb-2">
              Chọn một cuộc trò chuyện
            </h3>
            <p className="text-gray-400 mb-6">
              Chọn một cuộc trò chuyện từ danh sách bên trái để bắt đầu nhắn tin
            </p>
            
            {!isConnected && (
              <div className="text-amber-600 bg-amber-50 p-3 rounded-lg">
                <WifiOff className="w-5 h-5 inline mr-2" />
                Đang kết nối lại...
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
