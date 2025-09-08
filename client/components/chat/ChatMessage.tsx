import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ChatMessage as ChatMessageType } from '@/lib/socket-client';
import { 
  Copy, 
  Download, 
  MoreVertical, 
  Reply, 
  Trash2,
  Check,
  CheckCheck
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ChatMessageProps {
  message: ChatMessageType;
  isOwn: boolean;
  showAvatar?: boolean;
  onReply?: (message: ChatMessageType) => void;
  onDelete?: (messageId: number) => void;
}

export default function ChatMessage({ 
  message, 
  isOwn, 
  showAvatar = true,
  onReply,
  onDelete 
}: ChatMessageProps) {
  const [isHovered, setIsHovered] = useState(false);

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(message.content);
  };

  const handleDownloadFile = () => {
    if (message.fileUrl) {
      const link = document.createElement('a');
      link.href = message.fileUrl;
      link.download = message.fileName || 'file';
      link.click();
    }
  };

  const renderMessageContent = () => {
    switch (message.messageType) {
      case 'IMAGE':
        return (
          <div className="max-w-sm">
            <img 
              src={message.fileUrl} 
              alt="Shared image"
              className="rounded-lg w-full h-auto cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => window.open(message.fileUrl, '_blank')}
            />
            {message.content && (
              <p className="mt-2 text-sm">{message.content}</p>
            )}
          </div>
        );
      
      case 'FILE':
        return (
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg max-w-sm">
            <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Download className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {message.fileName || 'File'}
              </p>
              <Button 
                variant="link" 
                size="sm" 
                className="p-0 h-auto text-blue-600"
                onClick={handleDownloadFile}
              >
                Tải xuống
              </Button>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="whitespace-pre-wrap break-words">
            {message.content}
          </div>
        );
    }
  };

  return (
    <div 
      className={cn(
        "flex w-full mb-4 group",
        isOwn ? "justify-end" : "justify-start"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={cn(
        "flex max-w-[70%] space-x-3",
        isOwn ? "flex-row-reverse space-x-reverse" : "flex-row"
      )}>
        {/* Avatar */}
        {showAvatar && !isOwn && (
          <Avatar className="w-8 h-8 flex-shrink-0">
            <AvatarImage src={message.sender.avatar} />
            <AvatarFallback className="text-xs">
              {getInitials(message.sender.fullName)}
            </AvatarFallback>
          </Avatar>
        )}

        {/* Message Content */}
        <div className={cn(
          "flex flex-col",
          isOwn ? "items-end" : "items-start"
        )}>
          {/* Sender Name (only for received messages) */}
          {!isOwn && showAvatar && (
            <span className="text-xs text-gray-500 mb-1 px-3">
              {message.sender.fullName}
            </span>
          )}

          {/* Message Bubble */}
          <div
            className={cn(
              "relative px-4 py-2 rounded-2xl shadow-sm",
              isOwn 
                ? "bg-blue-600 text-white rounded-br-md" 
                : "bg-white border border-gray-200 text-gray-900 rounded-bl-md"
            )}
          >
            {renderMessageContent()}

            {/* Message Actions */}
            {isHovered && (
              <div className={cn(
                "absolute top-0 flex items-center space-x-1",
                isOwn ? "-left-20" : "-right-20"
              )}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="h-6 w-6 p-0 bg-white shadow-md border border-gray-200 hover:bg-gray-50"
                    >
                      <MoreVertical className="w-3 h-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align={isOwn ? "end" : "start"}>
                    {onReply && (
                      <DropdownMenuItem onClick={() => onReply(message)}>
                        <Reply className="w-4 h-4 mr-2" />
                        Trả lời
                      </DropdownMenuItem>
                    )}
                    {message.messageType === 'TEXT' && (
                      <DropdownMenuItem onClick={handleCopyText}>
                        <Copy className="w-4 h-4 mr-2" />
                        Sao chép
                      </DropdownMenuItem>
                    )}
                    {isOwn && onDelete && (
                      <DropdownMenuItem 
                        onClick={() => onDelete(message.id)}
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

          {/* Message Status & Time */}
          <div className={cn(
            "flex items-center space-x-1 mt-1 px-3",
            isOwn ? "flex-row-reverse space-x-reverse" : "flex-row"
          )}>
            <span className="text-xs text-gray-400">
              {formatTime(message.createdAt)}
            </span>
            
            {isOwn && (
              <div className="flex items-center">
                {message.isRead ? (
                  <CheckCheck className="w-3 h-3 text-blue-500" />
                ) : (
                  <Check className="w-3 h-3 text-gray-400" />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
