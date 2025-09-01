import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { 
  chatAPI, 
  socketClient, 
  useSocket,
  ChatMessage as ChatMessageType,
  Conversation 
} from '@/lib/api';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import { 
  Phone, 
  Video, 
  MoreVertical, 
  ArrowLeft,
  Info,
  Search,
  Volume2,
  VolumeX
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ChatWindowProps {
  conversation: Conversation;
  onBack?: () => void;
  className?: string;
}

export default function ChatWindow({ 
  conversation, 
  onBack,
  className 
}: ChatWindowProps) {
  const { user } = useAuth();
  const { socket, isConnected } = useSocket();
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [replyingTo, setReplyingTo] = useState<{
    id: number;
    content: string;
    senderName: string;
  } | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  // Load messages
  const loadMessages = useCallback(async (pageNum = 1, append = false) => {
    try {
      if (pageNum === 1) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      const response = await chatAPI.getMessages(conversation.id, pageNum, 50);
      
      if (response.success) {
        const { messages: newMessages, hasMore: moreAvailable } = response.data;
        
        if (append) {
          setMessages(prev => [...newMessages.reverse(), ...prev]);
        } else {
          setMessages(newMessages.reverse());
        }
        
        setHasMore(moreAvailable);
        setPage(pageNum);
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [conversation.id]);

  // Initialize messages and socket events
  useEffect(() => {
    loadMessages(1);

    // Join conversation
    if (isConnected) {
      socketClient.joinConversation(conversation.id);
    }

    // Socket event listeners
    const handleNewMessage = (message: ChatMessageType) => {
      if (message.conversationId === conversation.id) {
        setMessages(prev => [...prev, message]);
        
        // Mark as read if not from current user
        if (message.senderId !== user?.id) {
          chatAPI.markMessageRead(conversation.id, message.id);
        }
      }
    };

    const handleTyping = (data: { conversationId: number; userId: number; isTyping: boolean }) => {
      if (data.conversationId === conversation.id && data.userId !== user?.id) {
        setOtherUserTyping(data.isTyping);
        
        if (data.isTyping) {
          // Clear existing timeout
          if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
          }
          
          // Auto-stop typing indicator after 3 seconds
          typingTimeoutRef.current = setTimeout(() => {
            setOtherUserTyping(false);
          }, 3000);
        }
      }
    };

    socketClient.on('chat:message', handleNewMessage);
    socketClient.on('chat:typing', handleTyping);

    // Cleanup
    return () => {
      socketClient.off('chat:message', handleNewMessage);
      socketClient.off('chat:typing', handleTyping);
      socketClient.leaveConversation(conversation.id);
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [conversation.id, user?.id, isConnected, loadMessages]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (content: string, type: 'TEXT') => {
    if (!content.trim() || isSending) return;

    setIsSending(true);
    
    try {
      const messageData = {
        conversationId: conversation.id,
        content: content.trim(),
        messageType: type
      };

      // Send via socket for real-time delivery
      socketClient.sendMessage(messageData);
      
      // Also send via API for persistence
      await chatAPI.sendMessage(messageData);
      
      // Clear reply if any
      setReplyingTo(null);
      
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleSendFile = async (file: File, type: 'IMAGE' | 'FILE') => {
    if (isSending) return;

    setIsSending(true);
    
    try {
      await chatAPI.sendFileMessage(conversation.id, file, type);
    } catch (error) {
      console.error('Failed to send file:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleTyping = (isTyping: boolean) => {
    setIsTyping(isTyping);
    socketClient.sendTyping(conversation.id, isTyping);
  };

  const handleReply = (message: ChatMessageType) => {
    setReplyingTo({
      id: message.id,
      content: message.content,
      senderName: message.sender.fullName
    });
  };

  const handleDeleteMessage = async (messageId: number) => {
    try {
      await chatAPI.deleteMessage(conversation.id, messageId);
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
    } catch (error) {
      console.error('Failed to delete message:', error);
    }
  };

  const handleLoadMore = () => {
    if (hasMore && !isLoadingMore) {
      loadMessages(page + 1, true);
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const formatLastSeen = (timestamp?: string) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = (now.getTime() - date.getTime()) / (1000 * 60);
    
    if (diffInMinutes < 1) return 'Vừa xem';
    if (diffInMinutes < 60) return `${Math.floor(diffInMinutes)} phút trước`;
    if (diffInMinutes < 24 * 60) return `${Math.floor(diffInMinutes / 60)} giờ trước`;
    
    return date.toLocaleDateString('vi-VN');
  };

  if (isLoading) {
    return <ChatWindowSkeleton />;
  }

  return (
    <div className={cn("h-full flex flex-col bg-white", className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center space-x-3">
          {onBack && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onBack}
              className="h-8 w-8 p-0 md:hidden"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
          )}
          
          <div className="relative">
            <Avatar className="w-10 h-10">
              <AvatarImage src={conversation.participant.avatar} />
              <AvatarFallback>
                {getInitials(conversation.participant.fullName)}
              </AvatarFallback>
            </Avatar>
            
            {conversation.participant.isOnline && (
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
            )}
          </div>
          
          <div>
            <h3 className="font-medium text-gray-900">
              {conversation.participant.fullName}
            </h3>
            <p className="text-sm text-gray-500">
              {conversation.participant.isOnline 
                ? (otherUserTyping ? 'Đang nhập...' : 'Đang hoạt động')
                : `Hoạt động ${formatLastSeen(conversation.participant.lastSeen)}`
              }
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Search className="w-4 h-4" />
          </Button>
          
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Phone className="w-4 h-4" />
          </Button>
          
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Video className="w-4 h-4" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setIsMuted(!isMuted)}>
                {isMuted ? (
                  <>
                    <Volume2 className="w-4 h-4 mr-2" />
                    Bật thông báo
                  </>
                ) : (
                  <>
                    <VolumeX className="w-4 h-4 mr-2" />
                    Tắt thông báo
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Info className="w-4 h-4 mr-2" />
                Thông tin chi tiết
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        {/* Load More Button */}
        {hasMore && (
          <div className="text-center mb-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleLoadMore}
              disabled={isLoadingMore}
            >
              {isLoadingMore ? 'Đang tải...' : 'Tải tin nhắn cũ hơn'}
            </Button>
          </div>
        )}

        {/* Messages List */}
        <div className="space-y-2">
          {messages.map((message, index) => {
            const prevMessage = messages[index - 1];
            const showAvatar = !prevMessage || 
              prevMessage.senderId !== message.senderId ||
              (new Date(message.createdAt).getTime() - new Date(prevMessage.createdAt).getTime()) > 300000; // 5 minutes

            return (
              <ChatMessage
                key={message.id}
                message={message}
                isOwn={message.senderId === user?.id}
                showAvatar={showAvatar}
                onReply={handleReply}
                onDelete={handleDeleteMessage}
              />
            );
          })}
        </div>

        {/* Typing Indicator */}
        {otherUserTyping && (
          <div className="flex items-center space-x-2 ml-11 mb-4">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <span className="text-xs text-gray-500">
              {conversation.participant.fullName} đang nhập...
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </ScrollArea>

      {/* Input */}
      <ChatInput
        onSendMessage={handleSendMessage}
        onSendFile={handleSendFile}
        onTyping={handleTyping}
        disabled={isSending || !isConnected}
        placeholder={
          !isConnected 
            ? "Đang kết nối..." 
            : "Nhập tin nhắn..."
        }
        replyingTo={replyingTo}
        onCancelReply={() => setReplyingTo(null)}
      />
    </div>
  );
}

function ChatWindowSkeleton() {
  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <Skeleton className="w-10 h-10 rounded-full" />
          <div className="space-y-1">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
        <div className="flex space-x-2">
          <Skeleton className="h-8 w-8 rounded" />
          <Skeleton className="h-8 w-8 rounded" />
          <Skeleton className="h-8 w-8 rounded" />
        </div>
      </div>

      {/* Messages Skeleton */}
      <div className="flex-1 p-4 space-y-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className={`flex ${i % 3 === 0 ? 'justify-end' : 'justify-start'}`}>
            <div className="flex items-start space-x-2 max-w-[70%]">
              {i % 3 !== 0 && <Skeleton className="w-8 h-8 rounded-full" />}
              <div className="space-y-1">
                <Skeleton className={`h-12 ${i % 2 === 0 ? 'w-32' : 'w-48'} rounded-2xl`} />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Input Skeleton */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-2">
          <Skeleton className="h-10 w-10 rounded" />
          <Skeleton className="h-10 flex-1 rounded" />
          <Skeleton className="h-10 w-10 rounded" />
        </div>
      </div>
    </div>
  );
}
