import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { 
  servicesAPI, 
  servicePostsAPI, 
  categoriesAPI,
  handleAPIError,
  ServiceData,
  ServiceCategory 
} from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { 
  Calendar as CalendarIcon,
  Upload,
  X,
  Plus,
  MapPin,
  DollarSign,
  Clock,
  AlertTriangle
} from 'lucide-react';

interface CreateServicePostProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  trigger?: React.ReactNode;
}

interface ServicePostForm {
  title: string;
  description: string;
  serviceId: number | null;
  budget: string;
  urgency: 'LOW' | 'MEDIUM' | 'HIGH';
  preferredDate: Date | null;
  addressId: number | null;
  images: File[];
}

export default function CreateServicePost({ 
  onSuccess, 
  onCancel,
  trigger 
}: CreateServicePostProps) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [services, setServices] = useState<ServiceData[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  
  const [form, setForm] = useState<ServicePostForm>({
    title: '',
    description: '',
    serviceId: null,
    budget: '',
    urgency: 'MEDIUM',
    preferredDate: null,
    addressId: null,
    images: []
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load data
  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [servicesRes, categoriesRes] = await Promise.all([
        servicesAPI.getAll(),
        categoriesAPI.getAll()
      ]);

      if (servicesRes.success) {
        setServices(servicesRes.data);
      }
      
      if (categoriesRes.success) {
        setCategories(categoriesRes.data);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      toast({
        title: "Lỗi tải dữ liệu",
        description: "Không thể tải danh sách dịch vụ",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!form.title.trim()) {
      newErrors.title = 'Vui lòng nhập tiêu đề';
    }

    if (!form.description.trim()) {
      newErrors.description = 'Vui lòng nhập mô tả';
    } else if (form.description.length < 50) {
      newErrors.description = 'Mô tả phải có ít nhất 50 ký tự';
    }

    if (!form.serviceId) {
      newErrors.serviceId = 'Vui lòng chọn dịch vụ';
    }

    if (!form.budget.trim()) {
      newErrors.budget = 'Vui lòng nhập ngân sách';
    } else {
      const budget = parseFloat(form.budget);
      if (isNaN(budget) || budget <= 0) {
        newErrors.budget = 'Ngân sách phải là số dương';
      } else if (budget < 50000) {
        newErrors.budget = 'Ngân sách tối thiểu là 50,000 VNĐ';
      }
    }

    if (form.images.length > 5) {
      newErrors.images = 'Tối đa 5 hình ảnh';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const postData = {
        title: form.title.trim(),
        description: form.description.trim(),
        serviceId: form.serviceId!,
        budget: parseFloat(form.budget),
        urgency: form.urgency,
        preferredDate: form.preferredDate?.toISOString(),
        // For now, we'll use a default address - in real app this would be user's selected address
        images: form.images // This would be uploaded to storage first
      };

      const response = await servicePostsAPI.create(postData as any);

      if (response.success) {
        toast({
          title: "Đăng bài thành công",
          description: "Bài đăng của bạn đã được tạo và đang chờ thợ ứng tuyển"
        });

        // Reset form
        setForm({
          title: '',
          description: '',
          serviceId: null,
          budget: '',
          urgency: 'MEDIUM',
          preferredDate: null,
          addressId: null,
          images: []
        });

        setIsOpen(false);
        onSuccess?.();
      }
    } catch (error) {
      console.error('Failed to create post:', error);
      toast({
        title: "Lỗi đăng bài",
        description: handleAPIError(error).message,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    // Validate files
    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        toast({
          title: "File không hợp lệ",
          description: `${file.name} không phải là hình ảnh`,
          variant: "destructive"
        });
        return false;
      }
      
      if (file.size > 5 * 1024 * 1024) { // 5MB
        toast({
          title: "File quá lớn",
          description: `${file.name} vượt quá 5MB`,
          variant: "destructive"
        });
        return false;
      }
      
      return true;
    });

    if (form.images.length + validFiles.length > 5) {
      toast({
        title: "Quá nhiều hình ảnh",
        description: "Tối đa 5 hình ảnh cho mỗi bài đăng",
        variant: "destructive"
      });
      return;
    }

    setForm(prev => ({
      ...prev,
      images: [...prev.images, ...validFiles]
    }));
  };

  const removeImage = (index: number) => {
    setForm(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const formatBudget = (value: string) => {
    const number = parseFloat(value.replace(/[^0-9]/g, ''));
    if (isNaN(number)) return '';
    return new Intl.NumberFormat('vi-VN').format(number);
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

  const filteredServices = selectedCategory 
    ? services.filter(service => service.categoryId === Number(selectedCategory) || service.category === selectedCategory)
    : services;

  const content = (
    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Đăng bài tìm thợ</DialogTitle>
      </DialogHeader>

      <div className="space-y-6">
        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="title">Tiêu đề *</Label>
          <Input
            id="title"
            placeholder="VD: Cần thợ sửa điều hòa tại nhà"
            value={form.title}
            onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
            className={errors.title ? 'border-red-500' : ''}
          />
          {errors.title && (
            <p className="text-sm text-red-500">{errors.title}</p>
          )}
        </div>

        {/* Category & Service Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Danh mục</Label>
            <Select onValueChange={(value) => {
              setSelectedCategory(parseInt(value));
              setForm(prev => ({ ...prev, serviceId: null }));
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn danh mục" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Dịch vụ *</Label>
            <Select 
              onValueChange={(value) => setForm(prev => ({ ...prev, serviceId: parseInt(value) }))}
              disabled={!selectedCategory}
            >
              <SelectTrigger className={errors.serviceId ? 'border-red-500' : ''}>
                <SelectValue placeholder="Chọn dịch vụ" />
              </SelectTrigger>
              <SelectContent>
                {filteredServices.map(service => (
                  <SelectItem key={service.id} value={service.id.toString()}>
                    {service.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.serviceId && (
              <p className="text-sm text-red-500">{errors.serviceId}</p>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">Mô tả chi tiết *</Label>
          <Textarea
            id="description"
            placeholder="Mô tả chi tiết vấn đề cần giải quyết, yêu cầu cụ thể..."
            value={form.description}
            onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
            rows={4}
            className={errors.description ? 'border-red-500' : ''}
          />
          <div className="flex justify-between text-sm">
            {errors.description ? (
              <p className="text-red-500">{errors.description}</p>
            ) : (
              <p className="text-gray-500">Tối thiểu 50 ký tự</p>
            )}
            <p className="text-gray-400">{form.description.length}/1000</p>
          </div>
        </div>

        {/* Budget & Urgency */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="budget">Ngân sách (VNĐ) *</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                id="budget"
                placeholder="500,000"
                value={form.budget ? formatBudget(form.budget) : ''}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, '');
                  setForm(prev => ({ ...prev, budget: value }));
                }}
                className={cn("pl-10", errors.budget && 'border-red-500')}
              />
            </div>
            {errors.budget && (
              <p className="text-sm text-red-500">{errors.budget}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Mức độ ưu tiên</Label>
            <Select 
              value={form.urgency} 
              onValueChange={(value: 'LOW' | 'MEDIUM' | 'HIGH') => 
                setForm(prev => ({ ...prev, urgency: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LOW">
                  <div className="flex items-center space-x-2">
                    <Badge className={getUrgencyColor('LOW')}>Không vội</Badge>
                  </div>
                </SelectItem>
                <SelectItem value="MEDIUM">
                  <div className="flex items-center space-x-2">
                    <Badge className={getUrgencyColor('MEDIUM')}>Bình thường</Badge>
                  </div>
                </SelectItem>
                <SelectItem value="HIGH">
                  <div className="flex items-center space-x-2">
                    <Badge className={getUrgencyColor('HIGH')}>Khẩn cấp</Badge>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Preferred Date */}
        <div className="space-y-2">
          <Label>Ngày mong muốn (tùy chọn)</Label>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full justify-start">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {form.preferredDate 
                  ? form.preferredDate.toLocaleDateString('vi-VN')
                  : "Chọn ngày"
                }
              </Button>
            </DialogTrigger>
            <DialogContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={form.preferredDate || undefined}
                onSelect={(date) => setForm(prev => ({ ...prev, preferredDate: date || null }))}
                disabled={(date) => date < new Date()}
                initialFocus
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Images Upload */}
        <div className="space-y-2">
          <Label>Hình ảnh (tùy chọn)</Label>
          <div className="space-y-4">
            {/* Upload Button */}
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-2 text-gray-400" />
                  <p className="text-sm text-gray-500">
                    <span className="font-semibold">Nhấp để tải lên</span> hoặc kéo thả
                  </p>
                  <p className="text-xs text-gray-400">PNG, JPG, GIF (tối đa 5MB)</p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </label>
            </div>

            {/* Image Preview */}
            {form.images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {form.images.map((file, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-20 object-cover rounded-lg"
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeImage(index)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
            
            {errors.images && (
              <p className="text-sm text-red-500">{errors.images}</p>
            )}
          </div>
        </div>

        {/* Warning */}
        <div className="flex items-start space-x-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-amber-800">
            <p className="font-medium">Lưu ý quan trọng:</p>
            <ul className="mt-1 space-y-1 list-disc list-inside">
              <li>Bài đăng sẽ được hiển thị với tất cả thợ trong khu vực</li>
              <li>Bạn sẽ nhận được thông báo khi có thợ ứng tuyển</li>
              <li>Có thể chỉnh sửa hoặc đóng bài đăng bất cứ lúc nào</li>
            </ul>
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-3 pt-4">
          <Button 
            variant="outline" 
            onClick={() => {
              setIsOpen(false);
              onCancel?.();
            }}
            disabled={isSubmitting}
            className="flex-1"
          >
            Hủy
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={isSubmitting || isLoading}
            className="flex-1"
          >
            {isSubmitting ? 'Đang đăng...' : 'Đăng bài'}
          </Button>
        </div>
      </div>
    </DialogContent>
  );

  if (trigger) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          {trigger}
        </DialogTrigger>
        {content}
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">
          <Plus className="w-4 h-4 mr-2" />
          Đăng bài tìm thợ
        </Button>
      </DialogTrigger>
      {content}
    </Dialog>
  );
}
