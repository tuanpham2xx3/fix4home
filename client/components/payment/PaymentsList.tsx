import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { 
  paymentsAPI, 
  handleAPIError,
  Payment,
  paymentUtils
} from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import PaymentReceipt from './PaymentReceipt';
import { 
  Search,
  Filter,
  Download,
  Eye,
  Calendar,
  DollarSign,
  CreditCard,
  RefreshCw,
  FileText,
  TrendingUp,
  TrendingDown,
  Receipt
} from 'lucide-react';

interface PaymentsListProps {
  type?: 'sent' | 'received'; // sent for customers, received for technicians
  showStats?: boolean;
  className?: string;
}

interface Filters {
  search: string;
  status: string;
  method: string;
  dateRange: string;
}

export default function PaymentsList({ 
  type = 'sent',
  showStats = true,
  className 
}: PaymentsListProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [payments, setPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  
  const [filters, setFilters] = useState<Filters>({
    search: '',
    status: '',
    method: '',
    dateRange: ''
  });

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    hasMore: true
  });

  useEffect(() => {
    loadData();
  }, [type, filters]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      // Load payments
      const paymentsResponse = type === 'received' 
        ? await paymentsAPI.getReceivedPayments(pagination.page, pagination.limit, filters.status || undefined)
        : await paymentsAPI.getMyPayments(pagination.page, pagination.limit, filters.status || undefined);
      
      if (paymentsResponse.success) {
        let filteredPayments = paymentsResponse.data.payments;
        
        // Apply client-side filters
        if (filters.search) {
          filteredPayments = filteredPayments.filter(payment => 
            payment.serviceRequest.service.name.toLowerCase().includes(filters.search.toLowerCase()) ||
            payment.serviceRequest.description.toLowerCase().includes(filters.search.toLowerCase()) ||
            payment.id.toString().includes(filters.search)
          );
        }
        
        if (filters.method) {
          filteredPayments = filteredPayments.filter(payment => 
            payment.paymentMethod === filters.method
          );
        }
        
        setPayments(filteredPayments);
        setPagination(prev => ({
          ...prev,
          total: paymentsResponse.data.total
        }));
      }
      
      // Load stats if needed
      if (showStats) {
        const statsResponse = type === 'received'
          ? await paymentsAPI.getEarningsStats()
          : await paymentsAPI.getMyPaymentStats();
          
        if (statsResponse.success) {
          setStats(statsResponse.data);
        }
      }
    } catch (error) {
      console.error('Failed to load payments:', error);
      toast({
        title: "Lỗi tải dữ liệu",
        description: handleAPIError(error).message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleExport = async () => {
    try {
      const blob = await paymentsAPI.exportPaymentHistory(
        new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 90 days ago
        new Date().toISOString().split('T')[0], // today
        'CSV'
      );
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `payments-${type}-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Xuất dữ liệu thành công",
        description: "File đã được tải về máy của bạn"
      });
    } catch (error) {
      toast({
        title: "Lỗi xuất dữ liệu",
        description: handleAPIError(error).message,
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => (
    <Badge className={paymentUtils.getStatusColor(status)}>
      {status === 'COMPLETED' ? 'Thành công' :
       status === 'PENDING' ? 'Chờ xử lý' :
       status === 'PROCESSING' ? 'Đang xử lý' :
       status === 'FAILED' ? 'Thất bại' :
       status === 'CANCELLED' ? 'Đã hủy' :
       status === 'REFUNDED' ? 'Đã hoàn tiền' : status}
    </Badge>
  );

  if (isLoading) {
    return <PaymentsListSkeleton />;
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Stats Cards */}
      {showStats && stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <DollarSign className="w-8 h-8 text-green-600" />
                <div>
                  <p className="text-sm text-gray-500">
                    {type === 'received' ? 'Tổng thu nhập' : 'Tổng chi tiêu'}
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    {paymentUtils.formatAmount(stats.totalAmount)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Receipt className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-500">Tổng giao dịch</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {stats.totalPayments}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-8 h-8 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-500">Thành công</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {stats.completedPayments}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <TrendingDown className="w-8 h-8 text-amber-600" />
                <div>
                  <p className="text-sm text-gray-500">Chờ xử lý</p>
                  <p className="text-2xl font-bold text-amber-600">
                    {stats.pendingPayments}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {type === 'received' ? 'Thu nhập' : 'Lịch sử thanh toán'}
          </h2>
          <p className="text-gray-600">
            {payments.length} giao dịch
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={loadData}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Làm mới
          </Button>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleExport}
          >
            <Download className="w-4 h-4 mr-2" />
            Xuất file
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            Bộ lọc
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Tìm kiếm..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="pl-10"
              />
            </div>

            <Select 
              value={filters.status} 
              onValueChange={(value) => handleFilterChange('status', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tất cả</SelectItem>
                <SelectItem value="COMPLETED">Thành công</SelectItem>
                <SelectItem value="PENDING">Chờ xử lý</SelectItem>
                <SelectItem value="PROCESSING">Đang xử lý</SelectItem>
                <SelectItem value="FAILED">Thất bại</SelectItem>
                <SelectItem value="CANCELLED">Đã hủy</SelectItem>
                <SelectItem value="REFUNDED">Đã hoàn tiền</SelectItem>
              </SelectContent>
            </Select>

            <Select 
              value={filters.method} 
              onValueChange={(value) => handleFilterChange('method', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Phương thức" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tất cả</SelectItem>
                <SelectItem value="CASH">Tiền mặt</SelectItem>
                <SelectItem value="BANK_TRANSFER">Chuyển khoản</SelectItem>
                <SelectItem value="MOMO">MoMo</SelectItem>
                <SelectItem value="VNPAY">VNPay</SelectItem>
              </SelectContent>
            </Select>

            <Select 
              value={filters.dateRange} 
              onValueChange={(value) => handleFilterChange('dateRange', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Thời gian" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tất cả</SelectItem>
                <SelectItem value="today">Hôm nay</SelectItem>
                <SelectItem value="week">Tuần này</SelectItem>
                <SelectItem value="month">Tháng này</SelectItem>
                <SelectItem value="quarter">Quý này</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Payments Table */}
      <Card>
        <CardContent className="p-0">
          {payments.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-500 mb-2">
                Chưa có giao dịch nào
              </h3>
              <p className="text-gray-400">
                {type === 'received' 
                  ? 'Bạn chưa nhận được thanh toán nào'
                  : 'Bạn chưa thực hiện thanh toán nào'
                }
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã GD</TableHead>
                  <TableHead>Dịch vụ</TableHead>
                  <TableHead>{type === 'received' ? 'Khách hàng' : 'Thợ'}</TableHead>
                  <TableHead>Số tiền</TableHead>
                  <TableHead>Phương thức</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Ngày</TableHead>
                  <TableHead>Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-mono">
                      #{payment.id.toString().padStart(6, '0')}
                    </TableCell>
                    
                    <TableCell>
                      <div>
                        <p className="font-medium truncate max-w-xs">
                          {payment.serviceRequest.service.name}
                        </p>
                        <p className="text-sm text-gray-500 truncate max-w-xs">
                          {payment.serviceRequest.description}
                        </p>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      {type === 'received' 
                        ? payment.serviceRequest.customer.fullName
                        : payment.serviceRequest.technician?.fullName || 'Chưa xác định'
                      }
                    </TableCell>
                    
                    <TableCell className="font-semibold text-green-600">
                      {paymentUtils.formatAmount(payment.amount)}
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <CreditCard className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">
                          {paymentUtils.getPaymentMethodName(payment.paymentMethod)}
                        </span>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      {getStatusBadge(payment.status)}
                    </TableCell>
                    
                    <TableCell>
                      <div className="text-sm">
                        <p>{new Date(payment.createdAt).toLocaleDateString('vi-VN')}</p>
                        <p className="text-gray-500">
                          {new Date(payment.createdAt).toLocaleTimeString('vi-VN')}
                        </p>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-1" />
                            Xem
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                          <PaymentReceipt 
                            paymentId={payment.id}
                            showActions={true}
                          />
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function PaymentsListSkeleton() {
  return (
    <div className="space-y-6">
      {/* Stats Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Skeleton className="w-8 h-8" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-6 w-16" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Header Skeleton */}
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="flex space-x-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>

      {/* Filters Skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-24" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-10" />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Table Skeleton */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                {Array.from({ length: 8 }).map((_, i) => (
                  <TableHead key={i}>
                    <Skeleton className="h-4 w-20" />
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 8 }).map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
