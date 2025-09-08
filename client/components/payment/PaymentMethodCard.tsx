import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { PaymentMethod } from '@/lib/api';
import { 
  CreditCard,
  Banknote,
  Smartphone,
  Building,
  CheckCircle
} from 'lucide-react';

interface PaymentMethodCardProps {
  method: PaymentMethod;
  isSelected?: boolean;
  onSelect?: (method: PaymentMethod) => void;
  disabled?: boolean;
  className?: string;
}

export default function PaymentMethodCard({
  method,
  isSelected = false,
  onSelect,
  disabled = false,
  className
}: PaymentMethodCardProps) {
  
  const getMethodIcon = (type: string) => {
    switch (type) {
      case 'CASH':
        return <Banknote className="w-8 h-8 text-green-600" />;
      case 'BANK_TRANSFER':
        return <Building className="w-8 h-8 text-blue-600" />;
      case 'MOMO':
        return <Smartphone className="w-8 h-8 text-pink-600" />;
      case 'VNPAY':
        return <CreditCard className="w-8 h-8 text-orange-600" />;
      default:
        return <CreditCard className="w-8 h-8 text-gray-600" />;
    }
  };

  const getMethodDescription = (type: string) => {
    switch (type) {
      case 'CASH':
        return 'Thanh toán bằng tiền mặt khi hoàn thành dịch vụ';
      case 'BANK_TRANSFER':
        return 'Chuyển khoản qua ngân hàng trực tuyến';
      case 'MOMO':
        return 'Thanh toán qua ví điện tử MoMo';
      case 'VNPAY':
        return 'Thanh toán qua cổng VNPay (Visa, Mastercard, ATM)';
      default:
        return method.description;
    }
  };

  return (
    <Card 
      className={cn(
        "cursor-pointer transition-all duration-200 hover:shadow-md",
        isSelected && "ring-2 ring-blue-500 bg-blue-50",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      onClick={() => !disabled && onSelect?.(method)}
    >
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          {/* Icon */}
          <div className="flex-shrink-0">
            {getMethodIcon(method.type)}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-900">
                {method.name}
              </h3>
              
              {/* Status Indicators */}
              <div className="flex items-center space-x-2">
                {isSelected && (
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                )}
                
                {method.isActive ? (
                  <Badge className="bg-green-100 text-green-700">
                    Khả dụng
                  </Badge>
                ) : (
                  <Badge variant="secondary">
                    Tạm ngưng
                  </Badge>
                )}
              </div>
            </div>

            <p className="text-gray-600 text-sm mb-3">
              {getMethodDescription(method.type)}
            </p>

            {/* Method-specific info */}
            {method.type === 'CASH' && (
              <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded">
                💡 Lưu ý: Vui lòng chuẩn bị đúng số tiền để thanh toán
              </div>
            )}

            {method.type === 'BANK_TRANSFER' && (
              <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
                🏦 Hỗ trợ tất cả ngân hàng trong nước
              </div>
            )}

            {method.type === 'MOMO' && (
              <div className="text-xs text-pink-600 bg-pink-50 p-2 rounded">
                📱 Quét mã QR để thanh toán nhanh chóng
              </div>
            )}

            {method.type === 'VNPAY' && (
              <div className="text-xs text-orange-600 bg-orange-50 p-2 rounded">
                💳 Hỗ trợ Visa, Mastercard và thẻ ATM nội địa
              </div>
            )}
          </div>
        </div>

        {/* Additional Features */}
        {method.config && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="text-xs text-gray-500">
              {method.config.processingTime && (
                <span>⚡ Xử lý trong {method.config.processingTime}</span>
              )}
              {method.config.fee && (
                <span className="ml-4">💰 Phí: {method.config.fee}</span>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
