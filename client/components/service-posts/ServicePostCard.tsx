import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { ServicePost } from '@/lib/api';
import { 
  Calendar,
  MapPin,
  DollarSign,
  MessageSquare,
  Clock,
  MoreVertical,
  Eye,
  Star,
  AlertTriangle
} from 'lucide-react';

interface ServicePostCardProps {
  post: ServicePost;
  showActions?: boolean;
  onEdit?: (post: ServicePost) => void;
  onDelete?: (postId: number) => void;
  onClose?: (postId: number) => void;
  className?: string;
}

export default function ServicePostCard({
  post,
  showActions = false,
  onEdit,
  onDelete,
  onClose,
  className
}: ServicePostCardProps) {
  const [isActionsOpen, setIsActionsOpen] = useState(false);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const formatBudget = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return `${Math.floor(diffInHours * 60)} phút trước`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} giờ trước`;
    } else if (diffInHours < 24 * 7) {
      return `${Math.floor(diffInHours / 24)} ngày trước`;
    } else {
      return date.toLocaleDateString('vi-VN');
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'HIGH': return 'bg-red-100 text-red-700 border-red-200';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'LOW': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getUrgencyLabel = (urgency: string) => {
    switch (urgency) {
      case 'HIGH': return 'Khẩn cấp';
      case 'MEDIUM': return 'Bình thường'; 
      case 'LOW': return 'Không vội';
      default: return urgency;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return 'bg-green-100 text-green-700 border-green-200';
      case 'IN_NEGOTIATION': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'ASSIGNED': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'COMPLETED': return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'CANCELLED': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'OPEN': return 'Đang mở';
      case 'IN_NEGOTIATION': return 'Đang thương lượng';
      case 'ASSIGNED': return 'Đã giao việc';
      case 'COMPLETED': return 'Hoàn thành';
      case 'CANCELLED': return 'Đã hủy';
      default: return status;
    }
  };

  return (
    <Card className={cn("hover:shadow-md transition-shadow duration-200", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            {/* Customer Avatar */}
            <Avatar className="w-10 h-10">
              <AvatarImage src={post.customer.avatar} />
              <AvatarFallback className="text-sm">
                {getInitials(post.customer.fullName)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              {/* Customer Info */}
              <div className="flex items-center space-x-2 mb-1">
                <h4 className="text-sm font-medium text-gray-900 truncate">
                  {post.customer.fullName}
                </h4>
                <div className="flex items-center space-x-1">
                  <Star className="w-3 h-3 text-yellow-400 fill-current" />
                  <span className="text-xs text-gray-500">
                    {post.customer.rating.toFixed(1)}
                  </span>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-center space-x-1 text-xs text-gray-500">
                <MapPin className="w-3 h-3" />
                <span>{post.address.district}, {post.address.city}</span>
                <span>•</span>
                <span>{formatDate(post.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Status & Actions */}
          <div className="flex items-center space-x-2">
            <Badge className={getStatusColor(post.status)}>
              {getStatusLabel(post.status)}
            </Badge>

            {showActions && (
              <DropdownMenu open={isActionsOpen} onOpenChange={setIsActionsOpen}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link to={`/service-posts/${post.id}`}>
                      <Eye className="w-4 h-4 mr-2" />
                      Xem chi tiết
                    </Link>
                  </DropdownMenuItem>
                  
                  {post.status === 'OPEN' && onEdit && (
                    <DropdownMenuItem onClick={() => onEdit(post)}>
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Chỉnh sửa
                    </DropdownMenuItem>
                  )}
                  
                  {post.status === 'OPEN' && onClose && (
                    <DropdownMenuItem onClick={() => onClose(post.id)}>
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      Đóng bài
                    </DropdownMenuItem>
                  )}
                  
                  {onDelete && (
                    <DropdownMenuItem 
                      onClick={() => onDelete(post.id)}
                      className="text-red-600"
                    >
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      Xóa bài
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Title */}
        <Link 
          to={`/service-posts/${post.id}`}
          className="block hover:text-blue-600 transition-colors"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
            {post.title}
          </h3>
        </Link>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {post.description}
        </p>

        {/* Service & Budget Info */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <Badge variant="outline" className="text-xs">
            {post.service.name}
          </Badge>
          
          <Badge className={getUrgencyColor(post.urgency)}>
            {getUrgencyLabel(post.urgency)}
          </Badge>

          <div className="flex items-center space-x-1 text-sm text-gray-600">
            <DollarSign className="w-4 h-4" />
            <span className="font-medium">{formatBudget(post.budget)}</span>
          </div>
        </div>

        {/* Preferred Date */}
        {post.preferredDate && (
          <div className="flex items-center space-x-1 text-sm text-gray-500 mb-4">
            <Calendar className="w-4 h-4" />
            <span>Mong muốn: {new Date(post.preferredDate).toLocaleDateString('vi-VN')}</span>
          </div>
        )}

        {/* Images */}
        {post.images && post.images.length > 0 && (
          <div className="flex space-x-2 mb-4 overflow-x-auto">
            {post.images.slice(0, 3).map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`Post image ${index + 1}`}
                className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
              />
            ))}
            {post.images.length > 3 && (
              <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-xs text-gray-500">
                +{post.images.length - 3}
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <MessageSquare className="w-4 h-4" />
              <span>{post.consultationsCount} ứng tuyển</span>
            </div>
            
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>{formatDate(post.createdAt)}</span>
            </div>
          </div>

          {/* Action Button */}
          {post.status === 'OPEN' && !showActions && (
            <Link to={`/service-posts/${post.id}`}>
              <Button size="sm" variant="outline">
                Ứng tuyển
              </Button>
            </Link>
          )}

          {showActions && (
            <Link to={`/service-posts/${post.id}`}>
              <Button size="sm" variant="outline">
                Xem chi tiết
              </Button>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
