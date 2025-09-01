import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { 
  paymentsAPI, 
  handleAPIError,
  Payment,
  paymentUtils
} from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { 
  Receipt,
  Download,
  Mail,
  Share2,
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle,
  Calendar,
  DollarSign,
  CreditCard,
  FileText,
  User,
  MapPin,
  RefreshCw
} from 'lucide-react';

interface PaymentReceiptProps {
  paymentId: number;
  showActions?: boolean;
  onClose?: () => void;
  className?: string;
}

export default function PaymentReceipt({
  paymentId,
  showActions = true,
  onClose,
  className
}: PaymentReceiptProps) {
  const { toast } = useToast();
  
  const [payment, setPayment] = useState<Payment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    loadPayment();
  }, [paymentId]);

  const loadPayment = async () => {
    try {
      setIsLoading(true);
      const response = await paymentsAPI.getPayment(paymentId);
      
      if (response.success) {
        setPayment(response.data);
      }
    } catch (error) {
      console.error('Failed to load payment:', error);
      toast({
        title: "Lỗi tải thông tin thanh toán",
        description: handleAPIError(error).message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadReceipt = async () => {
    if (!payment) return;
    
    try {
      setIsDownloading(true);
      const blob = await paymentsAPI.downloadReceipt(payment.id);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `receipt-${payment.id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Tải xuống thành công",
        description: "Hóa đơn đã được tải về máy của bạn"
      });
    } catch (error) {
      toast({
        title: "Lỗi tải xuống",
        description: handleAPIError(error).message,
        variant: "destructive"
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShare = async () => {
    if (!payment) return;
    
    const shareText = `Hóa đơn thanh toán #${payment.id} - ${paymentUtils.formatAmount(payment.amount)}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Hóa đơn thanh toán',
          text: shareText,
          url: window.location.href,
        });
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      navigator.clipboard.writeText(shareText);
      toast({
        title: "Đã sao chép",
        description: "Thông tin hóa đơn đã được sao chép"
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'PENDING':
      case 'PROCESSING':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'FAILED':
      case 'CANCELLED':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'REFUNDED':
        return <RefreshCw className="w-5 h-5 text-blue-600" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'Thành công';
      case 'PENDING':
        return 'Chờ xử lý';
      case 'PROCESSING':
        return 'Đang xử lý';
      case 'FAILED':
        return 'Thất bại';
      case 'CANCELLED':
        return 'Đã hủy';
      case 'REFUNDED':
        return 'Đã hoàn tiền';
      default:
        return status;
    }
  };

  if (isLoading) {
    return <PaymentReceiptSkeleton />;
  }

  if (!payment) {
    return (
      <Card className={className}>
        <CardContent className="text-center py-8">
          <AlertTriangle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-500 mb-2">
            Không tìm thấy thông tin thanh toán
          </h3>
          <p className="text-gray-400">
            Thanh toán có thể đã bị xóa hoặc không tồn tại
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("max-w-2xl mx-auto", className)}>
      <CardHeader className="text-center">
        <div className="flex items-center justify-center mb-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <Receipt className="w-8 h-8 text-green-600" />
          </div>
        </div>
        
        <CardTitle className="text-2xl text-gray-900 mb-2">
          Hóa đơn thanh toán
        </CardTitle>
        
        <div className="flex items-center justify-center space-x-2">
          {getStatusIcon(payment.status)}
          <Badge className={cn(
            "text-sm",
            paymentUtils.getStatusColor(payment.status)
          )}>
            {getStatusText(payment.status)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Payment Info */}
        <div className="text-center">
          <p className="text-sm text-gray-500 mb-1">Mã thanh toán</p>
          <p className="text-lg font-mono font-semibold text-gray-900">
            #{payment.id.toString().padStart(6, '0')}
          </p>
        </div>

        {/* Amount */}
        <div className="text-center py-4 bg-green-50 rounded-lg">
          <p className="text-sm text-green-600 mb-1">Số tiền</p>
          <p className="text-3xl font-bold text-green-700">
            {paymentUtils.formatAmount(payment.amount)}
          </p>
        </div>

        {/* Service Details */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
            <FileText className="w-4 h-4 mr-2" />
            Chi tiết dịch vụ
          </h4>
          
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Dịch vụ:</span>
              <span className="font-medium">{payment.serviceRequest.service.name}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-500">Mô tả:</span>
              <span className="font-medium text-right max-w-xs">
                {payment.serviceRequest.description.length > 50 
                  ? payment.serviceRequest.description.substring(0, 50) + '...'
                  : payment.serviceRequest.description
                }
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-500">Khách hàng:</span>
              <span className="font-medium">{payment.serviceRequest.customer.fullName}</span>
            </div>
            
            {payment.serviceRequest.technician && (
              <div className="flex justify-between">
                <span className="text-gray-500">Thợ:</span>
                <span className="font-medium">{payment.serviceRequest.technician.fullName}</span>
              </div>
            )}
          </div>
        </div>

        <Separator />

        {/* Payment Details */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
            <CreditCard className="w-4 h-4 mr-2" />
            Thông tin thanh toán
          </h4>
          
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Phương thức:</span>
              <span className="font-medium">
                {paymentUtils.getPaymentMethodName(payment.paymentMethod)}
              </span>
            </div>
            
            {payment.transactionId && (
              <div className="flex justify-between">
                <span className="text-gray-500">Mã giao dịch:</span>
                <span className="font-mono text-xs">{payment.transactionId}</span>
              </div>
            )}
            
            <div className="flex justify-between">
              <span className="text-gray-500">Ngày tạo:</span>
              <span className="font-medium">
                {new Date(payment.createdAt).toLocaleString('vi-VN')}
              </span>
            </div>
            
            {payment.paidAt && (
              <div className="flex justify-between">
                <span className="text-gray-500">Ngày thanh toán:</span>
                <span className="font-medium">
                  {new Date(payment.paidAt).toLocaleString('vi-VN')}
                </span>
              </div>
            )}
            
            {payment.refundedAt && (
              <div className="flex justify-between">
                <span className="text-gray-500">Ngày hoàn tiền:</span>
                <span className="font-medium">
                  {new Date(payment.refundedAt).toLocaleString('vi-VN')}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Notes */}
        {payment.notes && (
          <>
            <Separator />
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Ghi chú</h4>
              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                {payment.notes}
              </p>
            </div>
          </>
        )}

        {/* Refund Info */}
        {payment.refundAmount && (
          <>
            <Separator />
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2 flex items-center">
                <RefreshCw className="w-4 h-4 mr-2" />
                Thông tin hoàn tiền
              </h4>
              <div className="text-sm text-blue-800">
                <div className="flex justify-between">
                  <span>Số tiền hoàn:</span>
                  <span className="font-semibold">
                    {paymentUtils.formatAmount(payment.refundAmount)}
                  </span>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Actions */}
        {showActions && (
          <>
            <Separator />
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                variant="outline" 
                onClick={handleDownloadReceipt}
                disabled={isDownloading}
                className="flex-1"
              >
                {isDownloading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Đang tải...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Tải PDF
                  </>
                )}
              </Button>
              
              <Button 
                variant="outline" 
                onClick={handleShare}
                className="flex-1"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Chia sẻ
              </Button>
              
              {onClose && (
                <Button onClick={onClose} className="flex-1">
                  Đóng
                </Button>
              )}
            </div>
          </>
        )}

        {/* Footer */}
        <div className="text-center text-xs text-gray-400 pt-4 border-t border-gray-100">
          <p>Cảm ơn bạn đã sử dụng dịch vụ Fix4Home</p>
          <p>Mọi thắc mắc vui lòng liên hệ: support@fix4home.vn</p>
        </div>
      </CardContent>
    </Card>
  );
}

function PaymentReceiptSkeleton() {
  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <Skeleton className="w-16 h-16 rounded-full mx-auto mb-4" />
        <Skeleton className="h-8 w-48 mx-auto mb-2" />
        <Skeleton className="h-6 w-32 mx-auto" />
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="text-center">
          <Skeleton className="h-4 w-24 mx-auto mb-2" />
          <Skeleton className="h-6 w-32 mx-auto" />
        </div>
        
        <div className="text-center py-4">
          <Skeleton className="h-4 w-16 mx-auto mb-2" />
          <Skeleton className="h-10 w-40 mx-auto" />
        </div>
        
        <div className="space-y-3">
          <Skeleton className="h-5 w-32" />
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex justify-between">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-32" />
            </div>
          ))}
        </div>
        
        <div className="flex gap-3">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 flex-1" />
        </div>
      </CardContent>
    </Card>
  );
}
