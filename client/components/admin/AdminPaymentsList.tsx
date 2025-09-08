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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { 
  paymentManagementAPI, 
  handleAPIError,
  Payment,
  paymentUtils
} from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { PaymentReceipt } from '@/components/payment';
import { 
  Search,
  Filter,
  Download,
  Eye,
  RefreshCw,
  FileText,
  DollarSign,
  CreditCard,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RotateCcw,
  Edit,
  TrendingUp,
  Users,
  Calendar
} from 'lucide-react';

interface AdminPaymentsListProps {
  className?: string;
}

interface Filters {
  search: string;
  status: string;
  method: string;
  startDate: string;
  endDate: string;
}

export default function AdminPaymentsList({ className }: AdminPaymentsListProps) {
  const { toast } = useToast();
  
  const [payments, setPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [refundDialogOpen, setRefundDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  
  const [filters, setFilters] = useState<Filters>({
    search: '',
    status: '',
    method: '',
    startDate: '',
    endDate: ''
  });

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0
  });

  const [refundForm, setRefundForm] = useState({
    amount: '',
    notes: ''
  });

  const [statusForm, setStatusForm] = useState({
    status: '',
    notes: ''
  });

  useEffect(() => {
    loadData();
  }, [filters, pagination.page]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        status: filters.status || undefined,
        method: filters.method || undefined,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined
      };

      const response = await paymentManagementAPI.getPayments(params);

      if (response.success) {
        let filteredPayments = response.data.payments;
        
        // Apply client-side search filter
        if (filters.search) {
          filteredPayments = filteredPayments.filter(payment => 
            payment.serviceRequest.service.name.toLowerCase().includes(filters.search.toLowerCase()) ||
            payment.serviceRequest.customer.fullName.toLowerCase().includes(filters.search.toLowerCase()) ||
            payment.serviceRequest.technician?.fullName.toLowerCase().includes(filters.search.toLowerCase()) ||
            payment.id.toString().includes(filters.search) ||
            (payment.transactionId && payment.transactionId.includes(filters.search))
          );
        }
        
        setPayments(filteredPayments);
        setPagination(prev => ({
          ...prev,
          total: response.data.total
        }));
      }

      // Load basic stats
      setStats({
        totalPayments: payments.length,
        totalAmount: payments.reduce((sum, p) => sum + p.amount, 0),
        completedPayments: payments.filter(p => p.status === 'COMPLETED').length,
        pendingPayments: payments.filter(p => p.status === 'PENDING').length
      });
      
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
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
  };

  const handleProcessRefund = async () => {
    if (!selectedPayment) return;
    
    try {
      const amount = parseFloat(refundForm.amount);
      if (isNaN(amount) || amount <= 0 || amount > selectedPayment.amount) {
        toast({
          title: "Số tiền không hợp lệ",
          description: "Vui lòng nhập số tiền hợp lệ",
          variant: "destructive"
        });
        return;
      }

      const response = await paymentManagementAPI.processRefund(
        selectedPayment.id,
        amount,
        refundForm.notes
      );

      if (response.success) {
        toast({
          title: "Hoàn tiền thành công",
          description: `Đã hoàn ${paymentUtils.formatAmount(amount)}`
        });

        // Update local state
        setPayments(prev => prev.map(p => 
          p.id === selectedPayment.id ? response.data : p
        ));

        setRefundDialogOpen(false);
        setRefundForm({ amount: '', notes: '' });
        setSelectedPayment(null);
      }
    } catch (error) {
      toast({
        title: "Lỗi hoàn tiền",
        description: handleAPIError(error).message,
        variant: "destructive"
      });
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedPayment) return;
    
    try {
      const response = await paymentManagementAPI.updatePaymentStatus(
        selectedPayment.id,
        statusForm.status as any,
        statusForm.notes
      );

      if (response.success) {
        toast({
          title: "Cập nhật trạng thái thành công",
          description: "Trạng thái thanh toán đã được cập nhật"
        });

        // Update local state
        setPayments(prev => prev.map(p => 
          p.id === selectedPayment.id ? response.data : p
        ));

        setStatusDialogOpen(false);
        setStatusForm({ status: '', notes: '' });
        setSelectedPayment(null);
      }
    } catch (error) {
      toast({
        title: "Lỗi cập nhật",
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
    return <AdminPaymentsListSkeleton />;
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <DollarSign className="w-8 h-8 text-green-600" />
                <div>
                  <p className="text-sm text-gray-500">Tổng giá trị</p>
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
                <CreditCard className="w-8 h-8 text-blue-600" />
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
                <CheckCircle className="w-8 h-8 text-green-600" />
                <div>
                  <p className="text-sm text-gray-500">Thành công</p>
                  <p className="text-2xl font-bold text-green-600">
                    {stats.completedPayments}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-8 h-8 text-amber-600" />
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
            Quản lý thanh toán
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
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
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

            <Input
              type="date"
              placeholder="Từ ngày"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
            />

            <Input
              type="date"
              placeholder="Đến ngày"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
            />
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
                Không có giao dịch nào
              </h3>
              <p className="text-gray-400">
                Chưa có giao dịch nào thỏa mãn điều kiện lọc
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã GD</TableHead>
                  <TableHead>Dịch vụ</TableHead>
                  <TableHead>Khách hàng</TableHead>
                  <TableHead>Thợ</TableHead>
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
                      {payment.serviceRequest.customer.fullName}
                    </TableCell>
                    
                    <TableCell>
                      {payment.serviceRequest.technician?.fullName || 'Chưa xác định'}
                    </TableCell>
                    
                    <TableCell className="font-semibold text-green-600">
                      {paymentUtils.formatAmount(payment.amount)}
                    </TableCell>
                    
                    <TableCell>
                      {paymentUtils.getPaymentMethodName(payment.paymentMethod)}
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
                      <div className="flex items-center space-x-2">
                        {/* View Receipt */}
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                            <PaymentReceipt 
                              paymentId={payment.id}
                              showActions={false}
                            />
                          </DialogContent>
                        </Dialog>

                        {/* Update Status */}
                        <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setSelectedPayment(payment);
                                setStatusForm({ status: payment.status, notes: '' });
                              }}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Cập nhật trạng thái thanh toán</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label>Trạng thái mới</Label>
                                <Select 
                                  value={statusForm.status} 
                                  onValueChange={(value) => setStatusForm(prev => ({ ...prev, status: value }))}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="PENDING">Chờ xử lý</SelectItem>
                                    <SelectItem value="PROCESSING">Đang xử lý</SelectItem>
                                    <SelectItem value="COMPLETED">Thành công</SelectItem>
                                    <SelectItem value="FAILED">Thất bại</SelectItem>
                                    <SelectItem value="CANCELLED">Đã hủy</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              
                              <div>
                                <Label>Ghi chú</Label>
                                <Textarea
                                  value={statusForm.notes}
                                  onChange={(e) => setStatusForm(prev => ({ ...prev, notes: e.target.value }))}
                                  placeholder="Lý do thay đổi trạng thái..."
                                />
                              </div>
                              
                              <div className="flex space-x-2">
                                <Button onClick={handleUpdateStatus} className="flex-1">
                                  Cập nhật
                                </Button>
                                <Button 
                                  variant="outline" 
                                  onClick={() => setStatusDialogOpen(false)}
                                  className="flex-1"
                                >
                                  Hủy
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>

                        {/* Process Refund */}
                        {payment.status === 'COMPLETED' && (
                          <Dialog open={refundDialogOpen} onOpenChange={setRefundDialogOpen}>
                            <DialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  setSelectedPayment(payment);
                                  setRefundForm({ amount: payment.amount.toString(), notes: '' });
                                }}
                              >
                                <RotateCcw className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Hoàn tiền</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label>Số tiền hoàn (VNĐ)</Label>
                                  <Input
                                    type="number"
                                    value={refundForm.amount}
                                    onChange={(e) => setRefundForm(prev => ({ ...prev, amount: e.target.value }))}
                                    max={payment.amount}
                                    placeholder="Nhập số tiền hoàn..."
                                  />
                                  <p className="text-sm text-gray-500 mt-1">
                                    Tối đa: {paymentUtils.formatAmount(payment.amount)}
                                  </p>
                                </div>
                                
                                <div>
                                  <Label>Lý do hoàn tiền</Label>
                                  <Textarea
                                    value={refundForm.notes}
                                    onChange={(e) => setRefundForm(prev => ({ ...prev, notes: e.target.value }))}
                                    placeholder="Nhập lý do hoàn tiền..."
                                    required
                                  />
                                </div>
                                
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button className="w-full">
                                      Xác nhận hoàn tiền
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Xác nhận hoàn tiền</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Bạn có chắc chắn muốn hoàn {paymentUtils.formatAmount(parseFloat(refundForm.amount) || 0)} 
                                        cho giao dịch #{payment.id}? Hành động này không thể hoàn tác.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Hủy</AlertDialogCancel>
                                      <AlertDialogAction onClick={handleProcessRefund}>
                                        Xác nhận hoàn tiền
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </DialogContent>
                          </Dialog>
                        )}
                      </div>
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

function AdminPaymentsListSkeleton() {
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

      {/* Filters Skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-24" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
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
                {Array.from({ length: 9 }).map((_, i) => (
                  <TableHead key={i}>
                    <Skeleton className="h-4 w-20" />
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 10 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 9 }).map((_, j) => (
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
