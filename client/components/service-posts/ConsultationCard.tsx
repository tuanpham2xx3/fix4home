import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { Consultation } from '@/lib/api';
import { 
  Star,
  Clock,
  DollarSign,
  Calendar,
  Award,
  MessageCircle,
  CheckCircle,
  XCircle,
  Eye,
  MapPin
} from 'lucide-react';

interface ConsultationCardProps {
  consultation: Consultation;
  canAccept?: boolean;
  canReject?: boolean;
  onAccept?: (consultationId: number) => void;
  onReject?: (consultationId: number) => void;
  onContact?: (technicianId: number) => void;
  className?: string;
}

export default function ConsultationCard({
  consultation,
  canAccept = false,
  canReject = false,
  onAccept,
  onReject,
  onContact,
  className
}: ConsultationCardProps) {
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const formatBudget = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDuration = (hours: number) => {
    if (hours < 1) {
      return `${Math.round(hours * 60)} phút`;
    } else if (hours >= 24) {
      return `${Math.round(hours / 24)} ngày`;
    } else {
      return `${Math.round(hours)} giờ`;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'ACCEPTED': return 'bg-green-100 text-green-700 border-green-200';
      case 'REJECTED': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PENDING': return 'Chờ phản hồi';
      case 'ACCEPTED': return 'Đã chấp nhận';
      case 'REJECTED': return 'Đã từ chối';
      default: return status;
    }
  };

  return (
    <Card className={cn("hover:shadow-md transition-shadow duration-200", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            {/* Technician Avatar */}
            <Avatar className="w-12 h-12">
              <AvatarImage src={consultation.technician.avatar} />
              <AvatarFallback className="text-sm">
                {getInitials(consultation.technician.fullName)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              {/* Technician Info */}
              <h4 className="text-lg font-semibold text-gray-900 mb-1">
                {consultation.technician.fullName}
              </h4>
              
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="font-medium">{consultation.technician.rating.toFixed(1)}</span>
                </div>
                
                <div className="flex items-center space-x-1">
                  <Award className="w-4 h-4" />
                  <span>{consultation.technician.experience} năm kinh nghiệm</span>
                </div>
              </div>
            </div>
          </div>

          {/* Status Badge */}
          <Badge className={getStatusColor(consultation.status)}>
            {getStatusLabel(consultation.status)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Price & Duration */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center space-x-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-sm text-gray-500">Báo giá</p>
              <p className="text-lg font-bold text-green-600">
                {formatBudget(consultation.price)}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-sm text-gray-500">Thời gian ước tính</p>
              <p className="text-lg font-semibold text-blue-600">
                {formatDuration(consultation.estimatedDuration)}
              </p>
            </div>
          </div>
        </div>

        {/* Available Date */}
        <div className="flex items-center space-x-2 mb-4 p-3 bg-gray-50 rounded-lg">
          <Calendar className="w-5 h-5 text-purple-600" />
          <div>
            <p className="text-sm text-gray-500">Có thể bắt đầu</p>
            <p className="font-medium text-purple-600">
              {formatDate(consultation.availableDate)}
            </p>
          </div>
        </div>

        {/* Description Preview */}
        <div className="mb-4">
          <p className="text-gray-700 text-sm line-clamp-3">
            {consultation.description}
          </p>
          {consultation.description.length > 150 && (
            <Button 
              variant="link" 
              size="sm" 
              className="p-0 h-auto text-blue-600"
              onClick={() => setIsDetailOpen(true)}
            >
              Xem thêm
            </Button>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex space-x-2">
            {/* View Detail */}
            <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Eye className="w-4 h-4 mr-2" />
                  Chi tiết
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    Đề xuất từ {consultation.technician.fullName}
                  </DialogTitle>
                  <DialogDescription>
                    Chi tiết đề xuất và thông tin thợ
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                  {/* Technician Details */}
                  <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                    <Avatar className="w-16 h-16">
                      <AvatarImage src={consultation.technician.avatar} />
                      <AvatarFallback>
                        {getInitials(consultation.technician.fullName)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-2">
                        {consultation.technician.fullName}
                      </h3>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center space-x-2">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span>{consultation.technician.rating.toFixed(1)} sao</span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Award className="w-4 h-4 text-blue-600" />
                          <span>{consultation.technician.experience} năm</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Consultation Details */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <DollarSign className="w-8 h-8 text-green-600 mx-auto mb-2" />
                      <p className="text-sm text-gray-500 mb-1">Báo giá</p>
                      <p className="text-xl font-bold text-green-600">
                        {formatBudget(consultation.price)}
                      </p>
                    </div>

                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <Clock className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                      <p className="text-sm text-gray-500 mb-1">Thời gian</p>
                      <p className="text-xl font-bold text-blue-600">
                        {formatDuration(consultation.estimatedDuration)}
                      </p>
                    </div>

                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <Calendar className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                      <p className="text-sm text-gray-500 mb-1">Bắt đầu</p>
                      <p className="text-lg font-bold text-purple-600">
                        {new Date(consultation.availableDate).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                  </div>

                  {/* Full Description */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">
                      Mô tả chi tiết
                    </h4>
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {consultation.description}
                    </p>
                  </div>

                  {/* Action Buttons in Dialog */}
                  {consultation.status === 'PENDING' && (canAccept || canReject) && (
                    <div className="flex space-x-3">
                      {canReject && (
                        <Button
                          variant="outline"
                          onClick={() => {
                            onReject?.(consultation.id);
                            setIsDetailOpen(false);
                          }}
                          className="flex-1"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Từ chối
                        </Button>
                      )}
                      
                      {canAccept && (
                        <Button
                          onClick={() => {
                            onAccept?.(consultation.id);
                            setIsDetailOpen(false);
                          }}
                          className="flex-1"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Chấp nhận
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>

            {/* Contact Button */}
            {onContact && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onContact(consultation.technician.id)}
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Nhắn tin
              </Button>
            )}
          </div>

          {/* Accept/Reject Actions */}
          {consultation.status === 'PENDING' && (canAccept || canReject) && (
            <div className="flex space-x-2">
              {canReject && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onReject?.(consultation.id)}
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  <XCircle className="w-4 h-4 mr-1" />
                  Từ chối
                </Button>
              )}
              
              {canAccept && (
                <Button
                  size="sm"
                  onClick={() => onAccept?.(consultation.id)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Chấp nhận
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Created Date */}
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-400">
            Đề xuất vào {new Date(consultation.createdAt).toLocaleString('vi-VN')}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
