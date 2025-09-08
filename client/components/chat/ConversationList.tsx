import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { Conversation } from '@/lib/socket-client';
import { 
  Search, 
  MessageCircle, 
  MoreVertical,
  Archive,
  Trash2,
  Volume2,
  VolumeX
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ConversationListProps {
  conversations: Conversation[];
  selectedConversationId?: number;
  onSelectConversation: (conversation: Conversation) => void;
  onArchiveConversation?: (conversationId: number) => void;
  onDeleteConversation?: (conversationId: number) => void;
  isLoading?: boolean;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

export default function ConversationList({
  conversations,
  selectedConversationId,
  onSelectConversation,
  onArchiveConversation,
  onDeleteConversation,
  isLoading = false,
  searchQuery = '',
  onSearchChange
}: ConversationListProps) {
  const [mutedConversations, setMutedConversations] = useState<Set<number>>(new Set());

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const formatLastMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } else if (diffInHours < 24 * 7) {
      return date.toLocaleDateString('vi-VN', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit'
      });
    }
  };

  const getLastMessagePreview = (conversation: Conversation) => {
    if (!conversation.lastMessage) {
      return 'Chưa có tin nhắn';
    }

    const { messageType, content, fileName } = conversation.lastMessage;
    
    switch (messageType) {
      case 'IMAGE':
        return '📷 Hình ảnh';
      case 'FILE':
        return `📎 ${fileName || 'File'}`;
      default:
        return content.length > 50 ? content.substring(0, 50) + '...' : content;
    }
  };

  const handleMuteToggle = (conversationId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const newMuted = new Set(mutedConversations);
    if (newMuted.has(conversationId)) {
      newMuted.delete(conversationId);
    } else {
      newMuted.add(conversationId);
    }
    setMutedConversations(newMuted);
  };

  const filteredConversations = conversations.filter(conversation =>
    conversation.participant.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return <ConversationListSkeleton />;
  }

  return (
    <div className="h-full flex flex-col bg-white border-r border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900">Tin nhắn</h2>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </div>
        
        {/* Search */}
        {onSearchChange && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Tìm kiếm cuộc trò chuyện..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
        )}
      </div>

      {/* Conversation List */}
      <ScrollArea className="flex-1">
        {filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <MessageCircle className="w-12 h-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-500 mb-2">
              {searchQuery ? 'Không tìm thấy cuộc trò chuyện' : 'Chưa có tin nhắn'}
            </h3>
            <p className="text-sm text-gray-400">
              {searchQuery 
                ? 'Thử tìm kiếm với từ khóa khác' 
                : 'Bắt đầu cuộc trò chuyện đầu tiên của bạn'
              }
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredConversations.map((conversation) => (
              <ConversationItem
                key={conversation.id}
                conversation={conversation}
                isSelected={selectedConversationId === conversation.id}
                isMuted={mutedConversations.has(conversation.id)}
                onClick={() => onSelectConversation(conversation)}
                onMuteToggle={(e) => handleMuteToggle(conversation.id, e)}
                onArchive={onArchiveConversation}
                onDelete={onDeleteConversation}
                getInitials={getInitials}
                formatTime={formatLastMessageTime}
                getPreview={getLastMessagePreview}
              />
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}

interface ConversationItemProps {
  conversation: Conversation;
  isSelected: boolean;
  isMuted: boolean;
  onClick: () => void;
  onMuteToggle: (e: React.MouseEvent) => void;
  onArchive?: (conversationId: number) => void;
  onDelete?: (conversationId: number) => void;
  getInitials: (name: string) => string;
  formatTime: (timestamp: string) => string;
  getPreview: (conversation: Conversation) => string;
}

function ConversationItem({
  conversation,
  isSelected,
  isMuted,
  onClick,
  onMuteToggle,
  onArchive,
  onDelete,
  getInitials,
  formatTime,
  getPreview
}: ConversationItemProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={cn(
        "p-4 cursor-pointer transition-colors relative",
        isSelected 
          ? "bg-blue-50 border-r-2 border-blue-500" 
          : "hover:bg-gray-50"
      )}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-start space-x-3">
        {/* Avatar with Online Status */}
        <div className="relative flex-shrink-0">
          <Avatar className="w-12 h-12">
            <AvatarImage src={conversation.participant.avatar} />
            <AvatarFallback>
              {getInitials(conversation.participant.fullName)}
            </AvatarFallback>
          </Avatar>
          
          {/* Online Status */}
          {conversation.participant.isOnline && (
            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
          )}
        </div>

        {/* Conversation Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className={cn(
              "text-sm font-medium truncate",
              conversation.unreadCount > 0 ? "text-gray-900" : "text-gray-700"
            )}>
              {conversation.participant.fullName}
            </h3>
            
            <div className="flex items-center space-x-2">
              {/* Mute Icon */}
              {isMuted && (
                <VolumeX className="w-3 h-3 text-gray-400" />
              )}
              
              {/* Time */}
              {conversation.lastMessage && (
                <span className="text-xs text-gray-400">
                  {formatTime(conversation.lastMessage.createdAt)}
                </span>
              )}
              
              {/* Unread Count */}
              {conversation.unreadCount > 0 && (
                <Badge className="h-5 min-w-[20px] text-xs px-1.5 bg-blue-600">
                  {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
                </Badge>
              )}
            </div>
          </div>

          {/* Last Message Preview */}
          <p className={cn(
            "text-sm truncate",
            conversation.unreadCount > 0 ? "text-gray-900 font-medium" : "text-gray-500"
          )}>
            {getPreview(conversation)}
          </p>

          {/* Last Seen (when offline) */}
          {!conversation.participant.isOnline && conversation.participant.lastSeen && (
            <p className="text-xs text-gray-400 mt-1">
              Hoạt động {formatTime(conversation.participant.lastSeen)}
            </p>
          )}
        </div>

        {/* Actions Menu */}
        {isHovered && (
          <div className="absolute top-2 right-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="h-6 w-6 p-0 bg-white shadow-sm border border-gray-200"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onMuteToggle}>
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
                
                {onArchive && (
                  <DropdownMenuItem 
                    onClick={(e) => {
                      e.stopPropagation();
                      onArchive(conversation.id);
                    }}
                  >
                    <Archive className="w-4 h-4 mr-2" />
                    Lưu trữ
                  </DropdownMenuItem>
                )}
                
                {onDelete && (
                  <DropdownMenuItem 
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(conversation.id);
                    }}
                    className="text-red-600"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Xóa
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    </div>
  );
}

function ConversationListSkeleton() {
  return (
    <div className="h-full flex flex-col bg-white border-r border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <Skeleton className="h-6 w-20 mb-3" />
        <Skeleton className="h-10 w-full" />
      </div>
      
      <div className="flex-1 p-4 space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-start space-x-3">
            <Skeleton className="w-12 h-12 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-12" />
              </div>
              <Skeleton className="h-3 w-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
