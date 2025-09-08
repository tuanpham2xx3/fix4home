import { useState, useRef, KeyboardEvent, ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { 
  Send, 
  Paperclip, 
  Image as ImageIcon, 
  X,
  Smile,
  Mic,
  MicOff
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface ChatInputProps {
  onSendMessage: (content: string, type: 'TEXT') => void;
  onSendFile: (file: File, type: 'IMAGE' | 'FILE') => void;
  onTyping?: (isTyping: boolean) => void;
  placeholder?: string;
  disabled?: boolean;
  replyingTo?: {
    id: number;
    content: string;
    senderName: string;
  } | null;
  onCancelReply?: () => void;
}

export default function ChatInput({
  onSendMessage,
  onSendFile,
  onTyping,
  placeholder = "Nhập tin nhắn...",
  disabled = false,
  replyingTo,
  onCancelReply
}: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  const handleMessageChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setMessage(value);

    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }

    // Handle typing indicator
    if (onTyping) {
      onTyping(true);
      
      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Set new timeout to stop typing indicator
      typingTimeoutRef.current = setTimeout(() => {
        onTyping(false);
      }, 1000);
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSendMessage = () => {
    const trimmedMessage = message.trim();
    
    if (!trimmedMessage && !attachedFile) return;
    
    if (attachedFile) {
      const fileType = attachedFile.type.startsWith('image/') ? 'IMAGE' : 'FILE';
      onSendFile(attachedFile, fileType);
      setAttachedFile(null);
    }
    
    if (trimmedMessage) {
      onSendMessage(trimmedMessage, 'TEXT');
    }
    
    setMessage('');
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    // Stop typing indicator
    if (onTyping) {
      onTyping(false);
    }
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('File quá lớn. Vui lòng chọn file dưới 10MB.');
        return;
      }
      setAttachedFile(file);
    }
    // Reset input
    e.target.value = '';
  };

  const handleRemoveFile = () => {
    setAttachedFile(null);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleVoiceRecord = () => {
    // TODO: Implement voice recording
    setIsRecording(!isRecording);
  };

  return (
    <div className="border-t border-gray-200 bg-white p-4">
      {/* Reply Preview */}
      {replyingTo && (
        <div className="mb-3 p-3 bg-gray-50 rounded-lg border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-xs text-gray-500 mb-1">
                Trả lời {replyingTo.senderName}
              </p>
              <p className="text-sm text-gray-700 truncate">
                {replyingTo.content}
              </p>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onCancelReply}
              className="h-6 w-6 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* File Preview */}
      {attachedFile && (
        <div className="mb-3 p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                {attachedFile.type.startsWith('image/') ? (
                  <ImageIcon className="w-5 h-5 text-blue-600" />
                ) : (
                  <Paperclip className="w-5 h-5 text-blue-600" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {attachedFile.name}
                </p>
                <p className="text-xs text-gray-500">
                  {formatFileSize(attachedFile.size)}
                </p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleRemoveFile}
              className="h-6 w-6 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="flex items-end space-x-2">
        {/* File Upload Buttons */}
        <div className="flex space-x-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={disabled}
                  className="h-10 w-10 p-0"
                >
                  <Paperclip className="w-5 h-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Đính kèm file</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => imageInputRef.current?.click()}
                  disabled={disabled}
                  className="h-10 w-10 p-0"
                >
                  <ImageIcon className="w-5 h-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Gửi hình ảnh</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Message Input */}
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={handleMessageChange}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            disabled={disabled}
            className="min-h-[40px] max-h-[120px] resize-none pr-12 py-2"
            rows={1}
          />
          
          {/* Emoji Button */}
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
            disabled={disabled}
          >
            <Smile className="w-4 h-4" />
          </Button>
        </div>

        {/* Voice Record Button */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleVoiceRecord}
                disabled={disabled}
                className={cn(
                  "h-10 w-10 p-0",
                  isRecording && "bg-red-100 text-red-600"
                )}
              >
                {isRecording ? (
                  <MicOff className="w-5 h-5" />
                ) : (
                  <Mic className="w-5 h-5" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{isRecording ? 'Dừng ghi âm' : 'Ghi âm'}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Send Button */}
        <Button
          onClick={handleSendMessage}
          disabled={disabled || (!message.trim() && !attachedFile)}
          className="h-10 w-10 p-0"
        >
          <Send className="w-5 h-5" />
        </Button>
      </div>

      {/* Hidden File Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx,.txt,.zip,.rar"
        onChange={handleFileSelect}
        className="hidden"
      />
      
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}
