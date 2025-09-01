import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { 
  systemConfigAPI, 
  notificationsAPI,
  handleAPIError,
  NotificationWithDetails
} from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { 
  Bell,
  Send,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Users,
  Mail,
  Smartphone,
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  Info,
  XCircle,
  Eye,
  Settings,
  Trash2,
  UserCheck,
  UserX,
  Wrench
} from 'lucide-react';

interface AdminNotificationsProps {
  className?: string;
}

interface NotificationForm {
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  targetUsers: 'all' | 'customers' | 'technicians' | 'admins';
  userIds: string;
}

export default function AdminNotifications({ className }: AdminNotificationsProps) {
  const { toast } = useToast();
  
  const [notifications, setNotifications] = useState<NotificationWithDetails[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  
  const [notificationForm, setNotificationForm] = useState<NotificationForm>({
    title: '',
    message: '',
    type: 'INFO',
    targetUsers: 'all',
    userIds: ''
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      // Load notifications and stats
      const [notificationsRes, statsRes] = await Promise.all([
        notificationsAPI.getNotifications(1, 50),
        notificationsAPI.getStats()
      ]);

      if (notificationsRes.success) {
        setNotifications(notificationsRes.data.notifications);
      }

      if (statsRes.success) {
        setStats(statsRes.data);
      }
      
    } catch (error) {
      console.error('Failed to load notifications:', error);
      toast({
        title: "Lỗi tải dữ liệu",
        description: handleAPIError(error).message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendNotification = async () => {
    try {
      if (!notificationForm.title.trim() || !notificationForm.message.trim()) {
        toast({
          title: "Thông tin không đầy đủ",
          description: "Vui lòng nhập tiêu đề và nội dung thông báo",
          variant: "destructive"
        });
        return;
      }

      setIsSending(true);

      const data = {
        title: notificationForm.title.trim(),
        message: notificationForm.message.trim(),
        type: notificationForm.type,
        targetUsers: notificationForm.targetUsers,
        userIds: notificationForm.userIds 
          ? notificationForm.userIds.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id))
          : undefined
      };

      const response = await systemConfigAPI.sendSystemNotification(data);

      if (response.success) {
        toast({
          title: "Gửi thông báo thành công",
          description: "Thông báo đã được gửi đến người dùng"
        });

        // Reset form
        setNotificationForm({
          title: '',
          message: '',
          type: 'INFO',
          targetUsers: 'all',
          userIds: ''
        });

        setSendDialogOpen(false);
        loadData(); // Reload to show new notification
      }
    } catch (error) {
      toast({
        title: "Lỗi gửi thông báo",
        description: handleAPIError(error).message,
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'SUCCESS': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'WARNING': return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'ERROR': return <XCircle className="w-4 h-4 text-red-600" />;
      default: return <Info className="w-4 h-4 text-blue-600" />;
    }
  };

  const getTypeBadge = (type: string) => {
    const colors = {
      'INFO': 'bg-blue-100 text-blue-700',
      'SUCCESS': 'bg-green-100 text-green-700',
      'WARNING': 'bg-yellow-100 text-yellow-700',
      'ERROR': 'bg-red-100 text-red-700'
    };
    
    return (
      <Badge className={colors[type as keyof typeof colors] || colors.INFO}>
        {type}
      </Badge>
    );
  };

  const getTargetUsersIcon = (target: string) => {
    switch (target) {
      case 'customers': return <UserCheck className="w-4 h-4 text-blue-600" />;
      case 'technicians': return <Wrench className="w-4 h-4 text-green-600" />;
      case 'admins': return <Settings className="w-4 h-4 text-purple-600" />;
      default: return <Users className="w-4 h-4 text-gray-600" />;
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = !searchQuery || 
      notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = !typeFilter || notification.type === typeFilter;
    
    return matchesSearch && matchesType;
  });

  if (isLoading) {
    return <AdminNotificationsSkeleton />;
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Bell className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-500">Tổng thông báo</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {stats.total}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Mail className="w-8 h-8 text-green-600" />
                <div>
                  <p className="text-sm text-gray-500">Email gửi</p>
                  <p className="text-2xl font-bold text-green-600">
                    {stats.deliveryStats?.email?.sent || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Smartphone className="w-8 h-8 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-500">Push gửi</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {stats.deliveryStats?.push?.sent || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <MessageSquare className="w-8 h-8 text-amber-600" />
                <div>
                  <p className="text-sm text-gray-500">Chưa đọc</p>
                  <p className="text-2xl font-bold text-amber-600">
                    {stats.unread}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="list" className="space-y-6">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="list">Danh sách thông báo</TabsTrigger>
            <TabsTrigger value="send">Gửi thông báo</TabsTrigger>
          </TabsList>

          <Button 
            variant="outline" 
            size="sm"
            onClick={loadData}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Làm mới
          </Button>
        </div>

        <TabsContent value="list" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Filter className="w-5 h-5 mr-2" />
                Bộ lọc
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Tìm kiếm thông báo..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Loại thông báo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Tất cả</SelectItem>
                    <SelectItem value="INFO">Thông tin</SelectItem>
                    <SelectItem value="SUCCESS">Thành công</SelectItem>
                    <SelectItem value="WARNING">Cảnh báo</SelectItem>
                    <SelectItem value="ERROR">Lỗi</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Notifications Table */}
          <Card>
            <CardContent className="p-0">
              {filteredNotifications.length === 0 ? (
                <div className="text-center py-12">
                  <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-500 mb-2">
                    Không có thông báo nào
                  </h3>
                  <p className="text-gray-400">
                    Chưa có thông báo nào thỏa mãn điều kiện lọc
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Loại</TableHead>
                      <TableHead>Tiêu đề</TableHead>
                      <TableHead>Nội dung</TableHead>
                      <TableHead>Đối tượng</TableHead>
                      <TableHead>Ngày gửi</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead>Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  
                  <TableBody>
                    {filteredNotifications.map((notification) => (
                      <TableRow key={notification.id}>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getTypeIcon(notification.type)}
                            {getTypeBadge(notification.type)}
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <p className="font-medium truncate max-w-xs">
                            {notification.title}
                          </p>
                        </TableCell>
                        
                        <TableCell>
                          <p className="text-sm text-gray-600 truncate max-w-xs">
                            {notification.message}
                          </p>
                        </TableCell>
                        
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getTargetUsersIcon('all')}
                            <span className="text-sm">Tất cả</span>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div className="text-sm">
                            <p>{new Date(notification.createdAt).toLocaleDateString('vi-VN')}</p>
                            <p className="text-gray-500">
                              {new Date(notification.createdAt).toLocaleTimeString('vi-VN')}
                            </p>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <Badge className={notification.isRead ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>
                            {notification.isRead ? 'Đã đọc' : 'Chưa đọc'}
                          </Badge>
                        </TableCell>
                        
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle className="flex items-center space-x-2">
                                    {getTypeIcon(notification.type)}
                                    <span>{notification.title}</span>
                                  </DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div>
                                    <Label>Nội dung</Label>
                                    <div className="mt-2 p-3 bg-gray-50 rounded">
                                      {notification.message}
                                    </div>
                                  </div>
                                  
                                  <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                      <Label>Loại thông báo</Label>
                                      <p className="mt-1">{notification.type}</p>
                                    </div>
                                    <div>
                                      <Label>Ngày gửi</Label>
                                      <p className="mt-1">
                                        {new Date(notification.createdAt).toLocaleString('vi-VN')}
                                      </p>
                                    </div>
                                  </div>

                                  {notification.metadata && (
                                    <div>
                                      <Label>Thông tin bổ sung</Label>
                                      <pre className="mt-2 p-3 bg-gray-50 rounded text-xs overflow-auto">
                                        {JSON.stringify(notification.metadata, null, 2)}
                                      </pre>
                                    </div>
                                  )}
                                </div>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="send" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Send className="w-5 h-5 mr-2" />
                Gửi thông báo hệ thống
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Tiêu đề *</Label>
                    <Input
                      id="title"
                      value={notificationForm.title}
                      onChange={(e) => setNotificationForm(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Nhập tiêu đề thông báo..."
                    />
                  </div>

                  <div>
                    <Label htmlFor="type">Loại thông báo</Label>
                    <Select 
                      value={notificationForm.type} 
                      onValueChange={(value: any) => setNotificationForm(prev => ({ ...prev, type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="INFO">
                          <div className="flex items-center space-x-2">
                            <Info className="w-4 h-4 text-blue-600" />
                            <span>Thông tin</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="SUCCESS">
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span>Thành công</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="WARNING">
                          <div className="flex items-center space-x-2">
                            <AlertTriangle className="w-4 h-4 text-yellow-600" />
                            <span>Cảnh báo</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="ERROR">
                          <div className="flex items-center space-x-2">
                            <XCircle className="w-4 h-4 text-red-600" />
                            <span>Lỗi</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="targetUsers">Đối tượng nhận</Label>
                    <Select 
                      value={notificationForm.targetUsers} 
                      onValueChange={(value: any) => setNotificationForm(prev => ({ ...prev, targetUsers: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">
                          <div className="flex items-center space-x-2">
                            <Users className="w-4 h-4" />
                            <span>Tất cả người dùng</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="customers">
                          <div className="flex items-center space-x-2">
                            <UserCheck className="w-4 h-4" />
                            <span>Khách hàng</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="technicians">
                          <div className="flex items-center space-x-2">
                            <Wrench className="w-4 h-4" />
                            <span>Thợ sửa chữa</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="admins">
                          <div className="flex items-center space-x-2">
                            <Settings className="w-4 h-4" />
                            <span>Quản trị viên</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {notificationForm.targetUsers === 'all' && (
                    <div>
                      <Label htmlFor="userIds">ID người dùng cụ thể (tùy chọn)</Label>
                      <Input
                        id="userIds"
                        value={notificationForm.userIds}
                        onChange={(e) => setNotificationForm(prev => ({ ...prev, userIds: e.target.value }))}
                        placeholder="1, 2, 3... (phân cách bằng dấu phẩy)"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Để trống để gửi cho tất cả, hoặc nhập ID cụ thể
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="message">Nội dung thông báo *</Label>
                  <Textarea
                    id="message"
                    value={notificationForm.message}
                    onChange={(e) => setNotificationForm(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Nhập nội dung thông báo..."
                    rows={8}
                    className="resize-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {notificationForm.message.length}/500 ký tự
                  </p>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <Button 
                  variant="outline"
                  onClick={() => setNotificationForm({
                    title: '',
                    message: '',
                    type: 'INFO',
                    targetUsers: 'all',
                    userIds: ''
                  })}
                >
                  Xóa form
                </Button>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      disabled={!notificationForm.title.trim() || !notificationForm.message.trim() || isSending}
                    >
                      {isSending ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Đang gửi...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Gửi thông báo
                        </>
                      )}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Xác nhận gửi thông báo</AlertDialogTitle>
                      <AlertDialogDescription>
                        Bạn có chắc chắn muốn gửi thông báo "{notificationForm.title}" 
                        đến {notificationForm.targetUsers === 'all' ? 'tất cả người dùng' : 
                            notificationForm.targetUsers === 'customers' ? 'khách hàng' :
                            notificationForm.targetUsers === 'technicians' ? 'thợ sửa chữa' : 'quản trị viên'}?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Hủy</AlertDialogCancel>
                      <AlertDialogAction onClick={handleSendNotification}>
                        Xác nhận gửi
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function AdminNotificationsSkeleton() {
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

      {/* Tabs Skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        
        {/* Table Skeleton */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  {Array.from({ length: 7 }).map((_, i) => (
                    <TableHead key={i}>
                      <Skeleton className="h-4 w-20" />
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 8 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 7 }).map((_, j) => (
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
    </div>
  );
}
