import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { 
  servicePostsAPI, 
  consultationsAPI,
  chatAPI,
  handleAPIError,
  ServicePost,
  Consultation
} from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import ConsultationCard from './ConsultationCard';
import CreateConsultation from './CreateConsultation';
import { 
  Calendar,
  MapPin,
  DollarSign,
  Clock,
  Star,
  MessageCircle,
  AlertTriangle,
  User,
  Briefcase,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Share2,
  Heart,
  HeartOff
} from 'lucide-react';

interface ServicePostDetailProps {
  postId: number;
  className?: string;
}

export default function ServicePostDetail({ 
  postId,
  className 
}: ServicePostDetailProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [post, setPost] = useState<ServicePost | null>(null);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConsultationsLoading, setIsConsultationsLoading] = useState(true);
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    loadData();
  }, [postId]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [postRes, consultationsRes] = await Promise.all([
        servicePostsAPI.getById(postId),
        consultationsAPI.getByServicePost(postId)
      ]);

      if (postRes.success) {
        setPost(postRes.data);
      }

      if (consultationsRes.success) {
        setConsultations(consultationsRes.data);
      }
    } catch (error) {
      console.error('Failed to load post details:', error);
      toast({
        title: "Lỗi tải dữ liệu",
        description: handleAPIError(error).message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setIsConsultationsLoading(false);
    }
  };

  const handleAcceptConsultation = async (consultationId: number) => {
    try {
      const response = await consultationsAPI.accept(consultationId);
      
      if (response.success) {
        toast({
          title: "Đã chấp nhận đề xuất",
          description: "Bạn đã chấp nhận đề xuất từ thợ. Hãy liên hệ để thỏa thuận chi tiết."
        });
        
        // Update local state
        setConsultations(prev => prev.map(c => 
          c.id === consultationId 
            ? { ...c, status: 'ACCEPTED' }
            : c
        ));
        
        // Update post status
        if (post) {
          setPost({ ...post, status: 'ASSIGNED' });
        }
      }
    } catch (error) {
      toast({
        title: "Lỗi chấp nhận đề xuất",
        description: handleAPIError(error).message,
        variant: "destructive"
      });
    }
  };

  const handleRejectConsultation = async (consultationId: number) => {
    try {
      const response = await consultationsAPI.reject(consultationId);
      
      if (response.success) {
        toast({
          title: "Đã từ chối đề xuất",
          description: "Đề xuất đã được từ chối"
        });
        
        // Update local state
        setConsultations(prev => prev.map(c => 
          c.id === consultationId 
            ? { ...c, status: 'REJECTED' }
            : c
        ));
      }
    } catch (error) {
      toast({
        title: "Lỗi từ chối đề xuất",
        description: handleAPIError(error).message,
        variant: "destructive"
      });
    }
  };

  const handleContactTechnician = async (technicianId: number) => {
    try {
      const response = await chatAPI.getOrCreateConversation(technicianId);
      
      if (response.success) {
        navigate(`/chat/${response.data.id}`);
      }
    } catch (error) {
      toast({
        title: "Lỗi mở chat",
        description: handleAPIError(error).message,
        variant: "destructive"
      });
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post?.title,
          text: post?.description,
          url: window.location.href,
        });
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Đã sao chép link",
        description: "Link đã được sao chép vào clipboard"
      });
    }
  };

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
    return new Date(dateString).toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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

  const canApply = user?.role === 'TECHNICIAN' && post?.status === 'OPEN';
  const isOwner = user?.id === post?.customer.id;
  const canManageConsultations = isOwner && post?.status === 'OPEN';

  // Check if current technician already applied
  const hasApplied = consultations.some(c => c.technician.id === user?.id);

  if (isLoading) {
    return <ServicePostDetailSkeleton />;
  }

  if (!post) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-500 mb-2">
          Không tìm thấy bài đăng
        </h3>
        <p className="text-gray-400 mb-4">
          Bài đăng có thể đã bị xóa hoặc không tồn tại
        </p>
        <Button onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại
        </Button>
      </div>
    );
  }

  return (
    <div className={cn("max-w-6xl mx-auto space-y-6", className)}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại
        </Button>

        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setIsFavorited(!isFavorited)}
          >
            {isFavorited ? (
              <Heart className="w-4 h-4 fill-current text-red-500" />
            ) : (
              <HeartOff className="w-4 h-4" />
            )}
          </Button>
          
          <Button variant="outline" size="sm" onClick={handleShare}>
            <Share2 className="w-4 h-4 mr-2" />
            Chia sẻ
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Post Details */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-gray-900 mb-3">
                    {post.title}
                  </h1>
                  
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    <Badge className={getStatusColor(post.status)}>
                      {getStatusLabel(post.status)}
                    </Badge>
                    
                    <Badge className={getUrgencyColor(post.urgency)}>
                      {getUrgencyLabel(post.urgency)}
                    </Badge>
                    
                    <Badge variant="outline">
                      {post.service.name}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="w-4 h-4 text-green-600" />
                      <span className="text-green-600 font-semibold">
                        {formatBudget(post.budget)}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <span>{post.address.district}, {post.address.city}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <MessageCircle className="w-4 h-4 text-blue-600" />
                      <span>{consultations.length} đề xuất</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              {/* Description */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Mô tả công việc</h3>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {post.description}
                </p>
              </div>

              {/* Preferred Date */}
              {post.preferredDate && (
                <div className="mb-6">
                  <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-blue-600 font-medium">
                        Ngày mong muốn
                      </p>
                      <p className="text-blue-800">
                        {formatDate(post.preferredDate)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Images */}
              {post.images && post.images.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">Hình ảnh</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {post.images.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`Post image ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => window.open(image, '_blank')}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Apply Button for Technicians */}
              {canApply && (
                <div className="pt-4 border-t border-gray-200">
                  {hasApplied ? (
                    <div className="flex items-center justify-center space-x-2 p-3 bg-blue-50 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-blue-600" />
                      <span className="text-blue-800 font-medium">
                        Bạn đã gửi đề xuất cho công việc này
                      </span>
                    </div>
                  ) : (
                    <CreateConsultation
                      servicePost={post}
                      onSuccess={loadData}
                    />
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Consultations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Đề xuất từ thợ ({consultations.length})</span>
                {isConsultationsLoading && (
                  <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                )}
              </CardTitle>
            </CardHeader>

            <CardContent>
              {consultations.length === 0 ? (
                <div className="text-center py-8">
                  <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">
                    Chưa có đề xuất nào cho công việc này
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {consultations.map((consultation) => (
                    <ConsultationCard
                      key={consultation.id}
                      consultation={consultation}
                      canAccept={canManageConsultations}
                      canReject={canManageConsultations}
                      onAccept={handleAcceptConsultation}
                      onReject={handleRejectConsultation}
                      onContact={handleContactTechnician}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Thông tin khách hàng</CardTitle>
            </CardHeader>
            
            <CardContent>
              <div className="flex items-start space-x-3">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={post.customer.avatar} />
                  <AvatarFallback>
                    {getInitials(post.customer.fullName)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-1">
                    {post.customer.fullName}
                  </h4>
                  
                  <div className="flex items-center space-x-1 mb-3">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm text-gray-600">
                      {post.customer.rating.toFixed(1)} sao
                    </span>
                  </div>
                  
                  {user?.role === 'TECHNICIAN' && (
                    <Button 
                      size="sm" 
                      className="w-full"
                      onClick={() => handleContactTechnician(post.customer.id)}
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Nhắn tin
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Thông tin bài đăng</CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Ngày đăng:</span>
                <span className="font-medium">
                  {new Date(post.createdAt).toLocaleDateString('vi-VN')}
                </span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Lượt xem:</span>
                <span className="font-medium">--</span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Trạng thái:</span>
                <Badge className={getStatusColor(post.status)}>
                  {getStatusLabel(post.status)}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Related Posts - Future enhancement */}
          {/* <Card>
            <CardHeader>
              <CardTitle className="text-lg">Công việc tương tự</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">
                Chức năng đang phát triển...
              </p>
            </CardContent>
          </Card> */}
        </div>
      </div>
    </div>
  );
}

function ServicePostDetailSkeleton() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Skeleton className="h-10 w-32" />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <div className="flex space-x-2">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-28" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/6" />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <div className="flex items-start space-x-3">
                <Skeleton className="w-12 h-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-8 w-full" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
