import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { 
  paymentsAPI, 
  handleAPIError,
  PaymentMethod,
  ServiceRequest
} from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import PaymentMethodCard from './PaymentMethodCard';
import { 
  CreditCard,
  DollarSign,
  Clock,
  MapPin,
  User,
  AlertTriangle,
  CheckCircle,
  Loader2,
  Receipt
} from 'lucide-react';

interface CheckoutFormProps {
  serviceRequest: ServiceRequest;
  onSuccess?: (paymentId: number) => void;
  onCancel?: () => void;
  className?: string;
}

interface PaymentFormData {
  paymentMethodId: number | null;
  notes: string;
}

export default function CheckoutForm({
  serviceRequest,
  onSuccess,
  onCancel,
  className
}: CheckoutFormProps) {
  const { toast } = useToast();
  
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [formData, setFormData] = useState<PaymentFormData>({
    paymentMethodId: null,
    notes: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async () => {
    try {
      setIsLoading(true);
      const response = await paymentsAPI.getPaymentMethods();
      
      if (response.success) {
        const activeMethods = response.data.filter(method => method.isActive);
        setPaymentMethods(activeMethods);
        
        // Auto-select first method
        if (activeMethods.length > 0) {
          setFormData(prev => ({ ...prev, paymentMethodId: activeMethods[0].id }));
        }
      }
    } catch (error) {
      console.error('Failed to load payment methods:', error);
      toast({
        title: "Lỗi tải phương thức thanh toán",
        description: handleAPIError(error).message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.paymentMethodId) {
      newErrors.paymentMethodId = 'Vui lòng chọn phương thức thanh toán';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsProcessing(true);
    
    try {
      const selectedMethod = paymentMethods.find(m => m.id === formData.paymentMethodId);
      
      const paymentData = {
        serviceRequestId: serviceRequest.id,
        paymentMethodType: selectedMethod!.type,
        amount: serviceRequest.finalPrice || serviceRequest.estimatedPrice,
        notes: formData.notes.trim() || undefined
      };

      const response = await paymentsAPI.createPayment(paymentData as any);

      if (response.success) {
        const { payment, paymentUrl, qrCode } = response.data;
        
        // Handle different payment methods
        if (selectedMethod!.type === 'CASH') {
          toast({
            title: "Thanh toán bằng tiền mặt",
            description: "Vui lòng chuẩn bị số tiền để thanh toán cho thợ khi hoàn thành dịch vụ"
          });
          onSuccess?.(payment.id);
          
        } else if (paymentUrl) {
          // Redirect to payment gateway
          window.open(paymentUrl, '_blank');
          
          toast({
            title: "Đang chuyển hướng",
            description: "Vui lòng hoàn tất thanh toán trên trang được mở"
          });
          
        } else if (qrCode) {
          // Show QR code for scanning
          toast({
            title: "Quét mã QR để thanh toán",
            description: "Sử dụng ứng dụng của bạn để quét mã QR"
          });
          
        } else {
          toast({
            title: "Đơn thanh toán đã được tạo",
            description: "Vui lòng làm theo hướng dẫn để hoàn tất thanh toán"
          });
          onSuccess?.(payment.id);
        }
      }
    } catch (error) {
      console.error('Failed to create payment:', error);
      toast({
        title: "Lỗi tạo thanh toán",
        description: handleAPIError(error).message,
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const selectedMethod = paymentMethods.find(m => m.id === formData.paymentMethodId);
  const totalAmount = serviceRequest.finalPrice || serviceRequest.estimatedPrice;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Thanh toán dịch vụ
        </h2>
        <p className="text-gray-600">
          Hoàn tất thanh toán để xác nhận việc sử dụng dịch vụ
        </p>
      </div>

      {/* Service Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Receipt className="w-5 h-5 mr-2" />
            Thông tin dịch vụ
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">
              {serviceRequest.service.name}
            </h3>
            <p className="text-gray-600 text-sm">
              {serviceRequest.description}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4 text-gray-400" />
              <span>Thợ: {serviceRequest.technician?.fullName || 'Chưa xác định'}</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-gray-400" />
              <span>Thời gian: {serviceRequest.scheduledDate 
                ? new Date(serviceRequest.scheduledDate).toLocaleDateString('vi-VN')
                : 'Chưa xác định'
              }</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span>{serviceRequest.address?.fullAddress || 'Địa chỉ đã lưu'}</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <DollarSign className="w-4 h-4 text-green-600" />
              <span className="font-semibold text-green-600">
                {formatPrice(totalAmount)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Methods */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Chọn phương thức thanh toán
        </h3>
        
        {paymentMethods.length === 0 ? (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Hiện tại không có phương thức thanh toán nào khả dụng. 
              Vui lòng liên hệ hỗ trợ.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-3">
            {paymentMethods.map((method) => (
              <PaymentMethodCard
                key={method.id}
                method={method}
                isSelected={formData.paymentMethodId === method.id}
                onSelect={(method) => setFormData(prev => ({ 
                  ...prev, 
                  paymentMethodId: method.id 
                }))}
              />
            ))}
          </div>
        )}
        
        {errors.paymentMethodId && (
          <p className="text-sm text-red-500 mt-2">{errors.paymentMethodId}</p>
        )}
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes">Ghi chú (tùy chọn)</Label>
        <Textarea
          id="notes"
          placeholder="Thêm ghi chú cho thanh toán..."
          value={formData.notes}
          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
          rows={3}
          maxLength={500}
        />
        <p className="text-xs text-gray-500">
          {formData.notes.length}/500 ký tự
        </p>
      </div>

      {/* Payment Summary */}
      <Card className="bg-gray-50">
        <CardContent className="p-6">
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>Giá dịch vụ:</span>
              <span>{formatPrice(totalAmount)}</span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span>Phí xử lý:</span>
              <span className="text-green-600">Miễn phí</span>
            </div>
            
            <Separator />
            
            <div className="flex justify-between text-lg font-semibold">
              <span>Tổng cộng:</span>
              <span className="text-green-600">{formatPrice(totalAmount)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Method Info */}
      {selectedMethod && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Phương thức được chọn: {selectedMethod.name}</strong>
            <br />
            {selectedMethod.type === 'CASH' && 
              'Bạn sẽ thanh toán bằng tiền mặt cho thợ sau khi hoàn thành dịch vụ.'
            }
            {selectedMethod.type === 'BANK_TRANSFER' && 
              'Bạn sẽ được chuyển hướng đến trang ngân hàng để hoàn tất thanh toán.'
            }
            {selectedMethod.type === 'MOMO' && 
              'Bạn sẽ được chuyển hướng đến ứng dụng MoMo để thanh toán.'
            }
            {selectedMethod.type === 'VNPAY' && 
              'Bạn sẽ được chuyển hướng đến cổng thanh toán VNPay.'
            }
          </AlertDescription>
        </Alert>
      )}

      {/* Actions */}
      <div className="flex space-x-3">
        {onCancel && (
          <Button 
            variant="outline" 
            onClick={onCancel}
            disabled={isProcessing}
            className="flex-1"
          >
            Hủy
          </Button>
        )}
        
        <Button 
          onClick={handleSubmit}
          disabled={isProcessing || !formData.paymentMethodId}
          className="flex-1"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Đang xử lý...
            </>
          ) : (
            <>
              <CreditCard className="w-4 h-4 mr-2" />
              Thanh toán {formatPrice(totalAmount)}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
