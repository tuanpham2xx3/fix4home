import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { 
  consultationsAPI, 
  handleAPIError,
  ServicePost 
} from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Calendar as CalendarIcon,
  DollarSign,
  Clock,
  FileText,
  Send,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

interface CreateConsultationProps {
  servicePost: ServicePost;
  onSuccess?: () => void;
  trigger?: React.ReactNode;
  disabled?: boolean;
}

interface ConsultationForm {
  price: string;
  estimatedDuration: string;
  durationUnit: 'hours' | 'days';
  availableDate: Date | null;
  description: string;
}

export default function CreateConsultation({
  servicePost,
  onSuccess,
  trigger,
  disabled = false
}: CreateConsultationProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [form, setForm] = useState<ConsultationForm>({
    price: '',
    estimatedDuration: '',
    durationUnit: 'hours',
    availableDate: null,
    description: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Price validation
    if (!form.price.trim()) {
      newErrors.price = 'Vui lòng nhập giá';
    } else {
      const price = parseFloat(form.price.replace(/[^0-9]/g, ''));
      if (isNaN(price) || price <= 0) {
        newErrors.price = 'Giá phải là số dương';
      } else if (price < 50000) {
        newErrors.price = 'Giá tối thiểu là 50,000 VNĐ';
      } else if (price > servicePost.budget * 2) {
        newErrors.price = `Giá không nên vượt quá ${formatBudget(servicePost.budget * 2)}`;
      }
    }

    // Duration validation
    if (!form.estimatedDuration.trim()) {
      newErrors.estimatedDuration = 'Vui lòng nhập thời gian ước tính';
    } else {
      const duration = parseFloat(form.estimatedDuration);
      if (isNaN(duration) || duration <= 0) {
        newErrors.estimatedDuration = 'Thời gian phải là số dương';
      } else if (form.durationUnit === 'hours' && duration > 24) {
        newErrors.estimatedDuration = 'Nếu trên 24 giờ, vui lòng chọn đơn vị ngày';
      } else if (form.durationUnit === 'days' && duration > 30) {
        newErrors.estimatedDuration = 'Thời gian tối đa là 30 ngày';
      }
    }

    // Available date validation
    if (!form.availableDate) {
      newErrors.availableDate = 'Vui lòng chọn ngày có thể bắt đầu';
    } else if (form.availableDate < new Date()) {
      newErrors.availableDate = 'Ngày bắt đầu không thể trong quá khứ';
    }

    // Description validation
    if (!form.description.trim()) {
      newErrors.description = 'Vui lòng nhập mô tả';
    } else if (form.description.length < 50) {
      newErrors.description = 'Mô tả phải có ít nhất 50 ký tự';
    } else if (form.description.length > 1000) {
      newErrors.description = 'Mô tả không được quá 1000 ký tự';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const durationInHours = form.durationUnit === 'days' 
        ? parseFloat(form.estimatedDuration) * 24 
        : parseFloat(form.estimatedDuration);

      const consultationData = {
        servicePostId: servicePost.id,
        price: parseFloat(form.price.replace(/[^0-9]/g, '')),
        estimatedDuration: durationInHours,
        availableDate: form.availableDate!.toISOString(),
        description: form.description.trim()
      };

      const response = await consultationsAPI.create(consultationData);

      if (response.success) {
        toast({
          title: "Gửi đề xuất thành công",
          description: "Đề xuất của bạn đã được gửi đến khách hàng"
        });

        // Reset form
        setForm({
          price: '',
          estimatedDuration: '',
          durationUnit: 'hours',
          availableDate: null,
          description: ''
        });

        setIsOpen(false);
        onSuccess?.();
      }
    } catch (error) {
      console.error('Failed to create consultation:', error);
      toast({
        title: "Lỗi gửi đề xuất",
        description: handleAPIError(error).message,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatBudget = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatInputBudget = (value: string) => {
    const number = parseFloat(value.replace(/[^0-9]/g, ''));
    if (isNaN(number)) return '';
    return new Intl.NumberFormat('vi-VN').format(number);
  };

  const getBudgetComparison = () => {
    if (!form.price) return null;
    
    const inputPrice = parseFloat(form.price.replace(/[^0-9]/g, ''));
    if (isNaN(inputPrice)) return null;

    const ratio = inputPrice / servicePost.budget;
    
    if (ratio < 0.8) {
      return { type: 'low', message: 'Thấp hơn ngân sách khách hàng', color: 'text-green-600' };
    } else if (ratio <= 1.2) {
      return { type: 'match', message: 'Phù hợp với ngân sách', color: 'text-blue-600' };
    } else if (ratio <= 1.5) {
      return { type: 'high', message: 'Cao hơn ngân sách dự kiến', color: 'text-amber-600' };
    } else {
      return { type: 'very_high', message: 'Cao hơn nhiều so với ngân sách', color: 'text-red-600' };
    }
  };

  const budgetComparison = getBudgetComparison();

  // Check if user is technician
  if (user?.role !== 'technician') {
    return null;
  }

  const content = (
    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Gửi đề xuất cho công việc</DialogTitle>
        <DialogDescription>
          Tạo đề xuất chi tiết để được khách hàng xem xét
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-6">
        {/* Service Post Info */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">
            {servicePost.title}
          </h4>
          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <span className="font-medium">Ngân sách: </span>
              <span className="text-green-600 font-semibold">
                {formatBudget(servicePost.budget)}
              </span>
            </div>
            <div>
              <span className="font-medium">Khách hàng: </span>
              {servicePost.customer.fullName}
            </div>
          </div>
        </div>

        {/* Price Input */}
        <div className="space-y-2">
          <Label htmlFor="price">Giá đề xuất (VNĐ) *</Label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              id="price"
              placeholder="500,000"
              value={form.price ? formatInputBudget(form.price) : ''}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9]/g, '');
                setForm(prev => ({ ...prev, price: value }));
              }}
              className={cn("pl-10", errors.price && 'border-red-500')}
            />
          </div>
          
          {/* Budget Comparison */}
          {budgetComparison && (
            <div className={cn("flex items-center space-x-2 text-sm", budgetComparison.color)}>
              <CheckCircle className="w-4 h-4" />
              <span>{budgetComparison.message}</span>
            </div>
          )}
          
          {errors.price && (
            <p className="text-sm text-red-500">{errors.price}</p>
          )}
        </div>

        {/* Duration Input */}
        <div className="space-y-2">
          <Label>Thời gian ước tính *</Label>
          <div className="grid grid-cols-2 gap-3">
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="2"
                value={form.estimatedDuration}
                onChange={(e) => setForm(prev => ({ ...prev, estimatedDuration: e.target.value }))}
                className={cn("pl-10", errors.estimatedDuration && 'border-red-500')}
                type="number"
                min="0.5"
                step="0.5"
              />
            </div>
            <Select 
              value={form.durationUnit} 
              onValueChange={(value: 'hours' | 'days') => 
                setForm(prev => ({ ...prev, durationUnit: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hours">Giờ</SelectItem>
                <SelectItem value="days">Ngày</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {errors.estimatedDuration && (
            <p className="text-sm text-red-500">{errors.estimatedDuration}</p>
          )}
        </div>

        {/* Available Date */}
        <div className="space-y-2">
          <Label>Ngày có thể bắt đầu *</Label>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className={cn(
                "w-full justify-start",
                errors.availableDate && 'border-red-500'
              )}>
                <CalendarIcon className="mr-2 h-4 w-4" />
                {form.availableDate 
                  ? form.availableDate.toLocaleDateString('vi-VN')
                  : "Chọn ngày có thể bắt đầu"
                }
              </Button>
            </DialogTrigger>
            <DialogContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={form.availableDate || undefined}
                onSelect={(date) => setForm(prev => ({ ...prev, availableDate: date || null }))}
                disabled={(date) => date < new Date()}
                initialFocus
              />
            </DialogContent>
          </Dialog>
          {errors.availableDate && (
            <p className="text-sm text-red-500">{errors.availableDate}</p>
          )}
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">Mô tả chi tiết đề xuất *</Label>
          <Textarea
            id="description"
            placeholder="Mô tả chi tiết về cách bạn sẽ thực hiện công việc, kinh nghiệm liên quan, vật liệu cần thiết..."
            value={form.description}
            onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
            rows={5}
            className={errors.description ? 'border-red-500' : ''}
            maxLength={1000}
          />
          <div className="flex justify-between text-sm">
            {errors.description ? (
              <p className="text-red-500">{errors.description}</p>
            ) : (
              <p className="text-gray-500">Tối thiểu 50 ký tự, giúp khách hàng hiểu rõ đề xuất của bạn</p>
            )}
            <p className="text-gray-400">{form.description.length}/1000</p>
          </div>
        </div>

        {/* Tips */}
        <div className="flex items-start space-x-2 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <AlertTriangle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Mẹo để tăng cơ hội được chọn:</p>
            <ul className="space-y-1 list-disc list-inside">
              <li>Giá cạnh tranh nhưng hợp lý với chất lượng</li>
              <li>Mô tả chi tiết quy trình thực hiện</li>
              <li>Đề cập đến kinh nghiệm và công việc tương tự</li>
              <li>Cam kết thời gian hoàn thành rõ ràng</li>
            </ul>
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-3 pt-4">
          <Button 
            variant="outline" 
            onClick={() => setIsOpen(false)}
            disabled={isSubmitting}
            className="flex-1"
          >
            Hủy
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1"
          >
            {isSubmitting ? (
              'Đang gửi...'
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Gửi đề xuất
              </>
            )}
          </Button>
        </div>
      </div>
    </DialogContent>
  );

  if (trigger) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild disabled={disabled}>
          {trigger}
        </DialogTrigger>
        {content}
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button disabled={disabled} className="w-full">
          <Send className="w-4 h-4 mr-2" />
          Gửi đề xuất
        </Button>
      </DialogTrigger>
      {content}
    </Dialog>
  );
}
