import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import Layout from "@/components/shared/Layout";
import { useAuth } from "@/contexts/AuthContext";
import {
  User,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  Eye,
  Wrench,
  MapPin,
  Phone,
  Settings,
  LogOut,
  Bell,
  BellRing,
  Star,
  TrendingUp,
  Activity,
  Package,
  X,
  RefreshCcw,
  MessageSquare,
  HeartHandshake,
} from "lucide-react";
import { Link } from "react-router-dom";

interface Order {
  id: string;
  service: string;
  technician: {
    name: string;
    avatar: string;
    rating: number;
  };
  status: "scheduled" | "in-progress" | "completed" | "cancelled";
  date: string;
  amount: string;
  estimatedTime?: string;
  address?: string;
}

interface Notification {
  id: string;
  type: "update" | "reminder" | "promo" | "system";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

interface DashboardStats {
  totalOrders: number;
  ordersInProgress: number;
  completedOrders: number;
  totalSpent: string;
  lastOrderStatus: string;
}

export default function CustomerDashboard() {
  const { user, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [hasError, setHasError] = useState(false);

  // Simulate data loading
  useEffect(() => {
    const loadDashboardData = async () => {
      setIsLoading(true);
      setHasError(false);

      try {
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // Mock data - in real app this would come from API
        const mockStats: DashboardStats = {
          totalOrders: 12,
          ordersInProgress: 2,
          completedOrders: 10,
          totalSpent: "$1,240",
          lastOrderStatus: "completed",
        };

        const mockOrders: Order[] = [
          {
            id: "ORD-001",
            service: "AC Repair & Maintenance",
            technician: {
              name: "John Smith",
              avatar: "JS",
              rating: 4.9,
            },
            status: "completed",
            date: "2024-01-15",
            amount: "$120",
            address: "123 Main St, Apt 4B",
          },
          {
            id: "ORD-002",
            service: "Kitchen Plumbing Fix",
            technician: {
              name: "Mike Johnson",
              avatar: "MJ",
              rating: 4.7,
            },
            status: "in-progress",
            date: "2024-01-20",
            amount: "$85",
            estimatedTime: "2 hours remaining",
            address: "123 Main St, Apt 4B",
          },
          {
            id: "ORD-003",
            service: "Electrical Safety Inspection",
            technician: {
              name: "Sarah Wilson",
              avatar: "SW",
              rating: 4.8,
            },
            status: "scheduled",
            date: "2024-01-25",
            amount: "$95",
            estimatedTime: "Tomorrow at 2:00 PM",
            address: "123 Main St, Apt 4B",
          },
          {
            id: "ORD-004",
            service: "Ceiling Fan Installation",
            technician: {
              name: "David Brown",
              avatar: "DB",
              rating: 4.6,
            },
            status: "scheduled",
            date: "2024-01-28",
            amount: "$150",
            estimatedTime: "Jan 28 at 10:00 AM",
            address: "123 Main St, Apt 4B",
          },
        ];

        const mockNotifications: Notification[] = [
          {
            id: "1",
            type: "update",
            title: "Order Update",
            message:
              "Your plumbing repair is now in progress. Mike Johnson has arrived at your location.",
            timestamp: "5 minutes ago",
            read: false,
          },
          {
            id: "2",
            type: "reminder",
            title: "Upcoming Service",
            message:
              "Reminder: Electrical inspection scheduled for tomorrow at 2:00 PM.",
            timestamp: "2 hours ago",
            read: false,
          },
          {
            id: "3",
            type: "system",
            title: "Service Completed",
            message:
              "Your AC repair has been completed successfully. Please rate your experience.",
            timestamp: "1 day ago",
            read: true,
          },
        ];

        setStats(mockStats);
        setRecentOrders(mockOrders);
        setNotifications(mockNotifications);
      } catch (error) {
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const handleRetry = () => {
    setHasError(false);
    setIsLoading(true);
    // Trigger reload
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  const dismissNotification = (notificationId: string) => {
    setNotifications(notifications.filter((n) => n.id !== notificationId));
  };

  const markNotificationAsRead = (notificationId: string) => {
    setNotifications(
      notifications.map((n) =>
        n.id === notificationId ? { ...n, read: true } : n,
      ),
    );
  };

  const unreadNotifications = notifications.filter((n) => !n.read).length;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "in-progress":
        return <Clock className="w-4 h-4 text-blue-600" />;
      case "scheduled":
        return <Calendar className="w-4 h-4 text-orange-600" />;
      case "cancelled":
        return <X className="w-4 h-4 text-red-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "in-progress":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "scheduled":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "update":
        return <Activity className="w-4 h-4 text-blue-600" />;
      case "reminder":
        return <Bell className="w-4 h-4 text-orange-600" />;
      case "promo":
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case "system":
        return <Settings className="w-4 h-4 text-gray-600" />;
      default:
        return <Bell className="w-4 h-4 text-gray-600" />;
    }
  };

  // Loading skeleton component
  const StatSkeleton = () => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-8 w-12" />
          </div>
          <Skeleton className="h-12 w-12 rounded-lg" />
        </div>
      </CardContent>
    </Card>
  );

  const OrderSkeleton = () => (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div className="flex items-center space-x-4">
        <Skeleton className="h-4 w-4 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      <div className="text-right space-y-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-6 w-20" />
      </div>
    </div>
  );

  // Error state component
  if (hasError) {
    return (
      <Layout breadcrumbs={[{ label: "Customer Dashboard" }]}>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950 dark:to-indigo-900">
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-center min-h-[60vh]">
              <Card className="w-full max-w-md text-center">
                <CardContent className="p-8">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertCircle className="w-8 h-8 text-red-600" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">
                    Unable to Load Dashboard
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    We're having trouble loading your dashboard data. Please try
                    again.
                  </p>
                  <Button onClick={handleRetry} className="w-full">
                    <RefreshCcw className="w-4 h-4 mr-2" />
                    Try Again
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout breadcrumbs={[{ label: "Customer Dashboard" }]}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950 dark:to-indigo-900">
        <div className="container mx-auto px-4 py-6 space-y-8">
          {/* Welcome Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Hello, {user?.fullName || "Customer"}! 👋
              </h1>
              <p className="text-muted-foreground mt-1">
                Welcome back to your FIX4HOME dashboard
              </p>
            </div>

            {/* Quick Navigation Menu */}
            <div className="flex flex-wrap gap-2">
              <Button asChild variant="outline" size="sm">
                <Link to="/customer/orders">
                  <Package className="w-4 h-4 mr-2" />
                  Orders
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link to="/customer/profile">
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link to="/services">
                  <Plus className="w-4 h-4 mr-2" />
                  Book Service
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link to="/customer/reviews">
                  <Star className="w-4 h-4 mr-2" />
                  Reviews
                </Link>
              </Button>
            </div>
          </div>

          {/* At-a-glance Statistics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => <StatSkeleton key={i} />)
            ) : (
              <>
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground font-medium">
                          Total Orders
                        </p>
                        <p className="text-2xl font-bold text-primary">
                          {stats?.totalOrders}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Package className="w-6 h-6 text-blue-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground font-medium">
                          In Progress
                        </p>
                        <p className="text-2xl font-bold text-orange-600">
                          {stats?.ordersInProgress}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                        <Clock className="w-6 h-6 text-orange-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground font-medium">
                          Completed
                        </p>
                        <p className="text-2xl font-bold text-green-600">
                          {stats?.completedOrders}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground font-medium">
                          Total Spent
                        </p>
                        <p className="text-2xl font-bold text-purple-600">
                          {stats?.totalSpent}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                        <TrendingUp className="w-6 h-6 text-purple-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground font-medium">
                          Last Order
                        </p>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(stats?.lastOrderStatus || "")}
                          <Badge
                            variant="outline"
                            className={getStatusColor(
                              stats?.lastOrderStatus || "",
                            )}
                          >
                            {stats?.lastOrderStatus}
                          </Badge>
                        </div>
                      </div>
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Activity className="w-6 h-6 text-gray-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Orders */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5 text-primary" />
                    Recent Orders
                  </CardTitle>
                  <Button asChild variant="outline" size="sm">
                    <Link to="/customer/orders">
                      <Eye className="w-4 h-4 mr-2" />
                      View All
                    </Link>
                  </Button>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-4">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <OrderSkeleton key={i} />
                      ))}
                    </div>
                  ) : recentOrders.length === 0 ? (
                    // Empty state
                    <div className="text-center py-12">
                      <div className="w-24 h-24 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Package className="w-12 h-12 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">
                        No Orders Yet
                      </h3>
                      <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                        You haven't placed any orders yet. Browse our services
                        to get started with professional home maintenance.
                      </p>
                      <Button asChild>
                        <Link to="/services">
                          <Plus className="w-4 h-4 mr-2" />
                          Book Your First Service
                        </Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {recentOrders.map((order) => (
                        <div
                          key={order.id}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                        >
                          <div className="flex items-center space-x-4 flex-1">
                            {getStatusIcon(order.status)}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between mb-1">
                                <p className="font-medium text-foreground truncate pr-2">
                                  {order.service}
                                </p>
                                <Badge
                                  variant="outline"
                                  className={`${getStatusColor(order.status)} flex-shrink-0`}
                                >
                                  {order.status}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                                <Avatar className="w-6 h-6">
                                  <AvatarFallback className="text-xs">
                                    {order.technician.avatar}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="truncate">
                                  {order.technician.name}
                                </span>
                                <div className="flex items-center gap-1">
                                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                  <span className="text-xs">
                                    {order.technician.rating}
                                  </span>
                                </div>
                              </div>
                              <div className="text-xs text-muted-foreground space-y-1">
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  <span>{order.date}</span>
                                </div>
                                {order.estimatedTime && (
                                  <div className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    <span>{order.estimatedTime}</span>
                                  </div>
                                )}
                                {order.address && (
                                  <div className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />
                                    <span className="truncate">
                                      {order.address}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="text-right flex-shrink-0 ml-4">
                              <p className="font-bold text-lg text-primary">
                                {order.amount}
                              </p>
                              {order.status === "in-progress" && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="mt-2"
                                >
                                  <MessageSquare className="w-3 h-3 mr-1" />
                                  Chat
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Notifications & Emergency Contact */}
            <div className="space-y-6">
              {/* Notifications */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    {unreadNotifications > 0 ? (
                      <BellRing className="w-5 h-5 text-primary" />
                    ) : (
                      <Bell className="w-5 h-5 text-muted-foreground" />
                    )}
                    Notifications
                    {unreadNotifications > 0 && (
                      <Badge variant="default" className="ml-2">
                        {unreadNotifications}
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-3">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="p-3 border rounded-lg">
                          <Skeleton className="h-4 w-3/4 mb-2" />
                          <Skeleton className="h-3 w-1/2" />
                        </div>
                      ))}
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="text-center py-6">
                      <Bell className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">
                        No notifications
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                      {notifications.slice(0, 5).map((notification) => (
                        <Alert
                          key={notification.id}
                          className={`relative ${!notification.read ? "border-l-4 border-l-primary bg-primary/5" : ""}`}
                        >
                          <div className="flex items-start gap-3">
                            {getNotificationIcon(notification.type)}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h4 className="text-sm font-medium">
                                    {notification.title}
                                  </h4>
                                  <AlertDescription className="text-xs mt-1">
                                    {notification.message}
                                  </AlertDescription>
                                  <p className="text-xs text-muted-foreground mt-2">
                                    {notification.timestamp}
                                  </p>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    dismissNotification(notification.id)
                                  }
                                  className="h-6 w-6 p-0 flex-shrink-0"
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                          {!notification.read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                markNotificationAsRead(notification.id)
                              }
                              className="absolute top-2 right-8 h-6 px-2 text-xs"
                            >
                              Mark read
                            </Button>
                          )}
                        </Alert>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Emergency Contact */}
              <Card className="border-red-200 bg-red-50/50">
                <CardHeader>
                  <CardTitle className="text-red-700 flex items-center gap-2">
                    <Phone className="w-5 h-5" />
                    24/7 Emergency Service
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-sm text-red-600">
                      Need urgent repair? Our emergency team is available around
                      the clock.
                    </p>
                    <Button variant="destructive" className="w-full" size="lg">
                      <Phone className="w-4 h-4 mr-2" />
                      Call 1900-1234
                    </Button>
                    <div className="text-xs text-muted-foreground text-center">
                      Emergency surcharge applies after 10 PM
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Support Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <HeartHandshake className="w-5 h-5 text-primary" />
                    Need Help?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Have questions about your service or need assistance?
                    </p>
                    <div className="grid grid-cols-1 gap-2">
                      <Button asChild variant="outline" size="sm">
                        <Link to="/contact">
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Contact Support
                        </Link>
                      </Button>
                      <Button asChild variant="ghost" size="sm">
                        <Link to="/help">
                          <Settings className="w-4 h-4 mr-2" />
                          Help Center
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
