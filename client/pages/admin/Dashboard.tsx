import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Layout from "@/components/shared/Layout";
import { useAuth } from "@/contexts/AuthContext";
import {
  Users,
  Wrench,
  DollarSign,
  ShoppingCart,
  Plus,
  FileText,
  LogOut,
  Settings,
  UserCheck,
  Star,
  TrendingUp,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Quick stats data
  const quickStats = [
    {
      title: "Total Users",
      value: "2,847",
      change: "+12%",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Total Orders",
      value: "1,234",
      change: "+8%",
      icon: ShoppingCart,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Total Revenue",
      value: "$89,420",
      change: "+15%",
      icon: DollarSign,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: "Active Technicians",
      value: "184",
      change: "+5%",
      icon: Wrench,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
  ];

  // Popular services data for pie chart
  const popularServicesData = [
    { name: "Electrical", value: 35, color: "#3b82f6" },
    { name: "Plumbing", value: 28, color: "#10b981" },
    { name: "HVAC", value: 20, color: "#f59e0b" },
    { name: "Appliance Repair", value: 12, color: "#ef4444" },
    { name: "General", value: 5, color: "#8b5cf6" },
  ];

  // Order status data for bar chart
  const orderStatusData = [
    { status: "Pending", count: 45, color: "#f59e0b" },
    { status: "In Progress", count: 32, color: "#3b82f6" },
    { status: "Completed", count: 178, color: "#10b981" },
    { status: "Cancelled", count: 8, color: "#ef4444" },
  ];

  // Latest activities
  const latestActivities = [
    {
      id: 1,
      type: "user_registration",
      message: "New customer Sarah Johnson registered",
      timestamp: "2 minutes ago",
      icon: UserCheck,
      color: "text-green-600",
    },
    {
      id: 2,
      type: "order_completed",
      message: "Order #ORD-1234 completed by Mike Smith",
      timestamp: "15 minutes ago",
      icon: ShoppingCart,
      color: "text-blue-600",
    },
    {
      id: 3,
      type: "technician_joined",
      message: "New technician Alex Brown verified",
      timestamp: "1 hour ago",
      icon: Wrench,
      color: "text-purple-600",
    },
    {
      id: 4,
      type: "review_received",
      message: "5-star review received from customer",
      timestamp: "2 hours ago",
      icon: Star,
      color: "text-yellow-600",
    },
    {
      id: 5,
      type: "order_created",
      message: "New order #ORD-1235 placed",
      timestamp: "3 hours ago",
      icon: Plus,
      color: "text-indigo-600",
    },
  ];

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        fontSize="12"
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <Layout breadcrumbs={[{ label: "Admin Dashboard" }]}>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 dark:from-purple-950 dark:to-indigo-900">
        <div className="container mx-auto px-4 py-8">
          {/* Welcome Header and Quick Navigation */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  Welcome back, {user?.fullName}!
                </h1>
                <p className="text-muted-foreground">
                  Monitor and manage the FIX4HOME platform
                </p>
              </div>

              {/* Quick Navigation Menu */}
              <div className="flex flex-wrap gap-2">
                <Button asChild variant="outline" size="sm">
                  <Link to="/admin/users">
                    <Users className="w-4 h-4 mr-2" />
                    Users
                  </Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link to="/admin/technicians">
                    <Wrench className="w-4 h-4 mr-2" />
                    Technicians
                  </Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link to="/admin/services">
                    <Settings className="w-4 h-4 mr-2" />
                    Services
                  </Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link to="/admin/orders">
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Orders
                  </Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link to="/admin/reports">
                    <FileText className="w-4 h-4 mr-2" />
                    Reports
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  disabled={isLoading}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {quickStats.map((stat, index) => (
              <Card key={index} className="relative overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        {stat.title}
                      </p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <div className="flex items-center mt-2">
                        <TrendingUp className="w-3 h-3 text-green-600 mr-1" />
                        <span className="text-xs text-green-600 font-medium">
                          {stat.change} this month
                        </span>
                      </div>
                    </div>
                    <div
                      className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}
                    >
                      <stat.icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Popular Services Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Popular Services</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={popularServicesData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={renderCustomizedLabel}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {popularServicesData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Order Status Bar Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Order Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={orderStatusData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="status" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Latest Activities */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Latest Activities</CardTitle>
                </CardHeader>
                <CardContent>
                  {latestActivities.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                        <TrendingUp className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">
                        No recent activities
                      </h3>
                      <p className="text-muted-foreground">
                        Activities will appear here as they happen
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {latestActivities.map((activity) => (
                        <div
                          key={activity.id}
                          className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                            <activity.icon
                              className={`w-5 h-5 ${activity.color}`}
                            />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{activity.message}</p>
                            <p className="text-sm text-muted-foreground">
                              {activity.timestamp}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Shortcut Buttons */}
            <div>
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button asChild className="w-full" size="lg">
                    <Link to="/admin/services/new">
                      <Plus className="w-4 h-4 mr-2" />
                      Add New Service
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="w-full"
                    size="lg"
                  >
                    <Link to="/admin/reports/detailed">
                      <FileText className="w-4 h-4 mr-2" />
                      View Detailed Reports
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="w-full"
                    size="lg"
                  >
                    <Link to="/admin/users">
                      <Users className="w-4 h-4 mr-2" />
                      Manage Users
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="w-full"
                    size="lg"
                  >
                    <Link to="/admin/analytics">
                      <TrendingUp className="w-4 h-4 mr-2" />
                      View Analytics
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              {/* System Status */}
              <Card>
                <CardHeader>
                  <CardTitle>System Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Server Status</span>
                    <Badge className="bg-green-100 text-green-800">
                      Operational
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Database</span>
                    <Badge className="bg-green-100 text-green-800">
                      Healthy
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Payment System</span>
                    <Badge className="bg-green-100 text-green-800">
                      Connected
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Uptime</span>
                    <span className="text-sm font-medium">99.9%</span>
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
