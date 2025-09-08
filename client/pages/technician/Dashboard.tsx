import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Layout from "@/components/shared/Layout";
import { useAuth } from "@/contexts/AuthContext";
import {
  User,
  Calendar,
  Clock,
  CheckCircle,
  DollarSign,
  MapPin,
  Phone,
  Wrench,
  Star,
  TrendingUp,
  Eye,
  Bell,
  CalendarDays,
  Plus,
  AlertCircle,
  Briefcase,
  BarChart3,
  FileText,
  MessageSquare,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function TechnicianDashboard() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: "job_alert",
      title: "New Job Available",
      message: "Kitchen sink repair in your area - $85",
      time: "5 minutes ago",
      isRead: false,
    },
    {
      id: 2,
      type: "schedule_update",
      title: "Schedule Update",
      message: "Job JOB-002 time changed to 2:30 PM",
      time: "1 hour ago",
      isRead: false,
    },
    {
      id: 3,
      type: "payment",
      title: "Payment Received",
      message: "Payment of $120 received for JOB-001",
      time: "2 hours ago",
      isRead: true,
    },
  ]);

  // Mock data - in a real app, this would come from an API
  const dashboardStats = {
    totalJobs: 156,
    jobsInProgress: 3,
    upcomingJobs: 7,
    weeklyEarnings: 1840,
    monthlyEarnings: 7650,
    rating: 4.8,
    completionRate: 94,
  };

  const recentJobs = [
    {
      id: "JOB-001",
      service: "AC Repair",
      customer: "Jane Smith",
      time: "09:00 AM",
      date: "Today",
      address: "123 Main St, Apt 4B",
      status: "scheduled",
      payment: "$120",
      priority: "high",
    },
    {
      id: "JOB-002",
      service: "Plumbing Fix",
      customer: "Bob Johnson",
      time: "02:00 PM",
      date: "Today",
      address: "456 Oak Ave",
      status: "in-progress",
      payment: "$85",
      priority: "medium",
    },
    {
      id: "JOB-003",
      service: "Electrical Inspection",
      customer: "Alice Wilson",
      time: "04:30 PM",
      date: "Today",
      address: "789 Pine Road",
      status: "scheduled",
      payment: "$95",
      priority: "low",
    },
    {
      id: "JOB-004",
      service: "Appliance Repair",
      customer: "Mike Davis",
      time: "10:00 AM",
      date: "Tomorrow",
      address: "321 Elm Street",
      status: "scheduled",
      payment: "$110",
      priority: "medium",
    },
    {
      id: "JOB-005",
      service: "HVAC Maintenance",
      customer: "Sarah Johnson",
      time: "03:00 PM",
      date: "Tomorrow",
      address: "654 Maple Ave",
      status: "scheduled",
      payment: "$150",
      priority: "low",
    },
  ];

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "scheduled":
        return <Calendar className="w-4 h-4 text-orange-600" />;
      case "in-progress":
        return <Clock className="w-4 h-4 text-blue-600" />;
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "in-progress":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const markNotificationRead = (id: number) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
    );
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  if (isLoading) {
    return (
      <Layout breadcrumbs={[{ label: "Technician Dashboard" }]}>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950 dark:to-indigo-900">
          <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
              <Skeleton className="h-10 w-96 mb-2" />
              <Skeleton className="h-6 w-64" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <Skeleton className="h-16 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <Skeleton className="h-6 w-32" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[...Array(3)].map((_, i) => (
                        <Skeleton key={i} className="h-24 w-full" />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div className="space-y-6">
                {[...Array(3)].map((_, i) => (
                  <Card key={i}>
                    <CardHeader>
                      <Skeleton className="h-6 w-24" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-32 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout breadcrumbs={[{ label: "Technician Dashboard" }]}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950 dark:to-indigo-900">
        <div className="container mx-auto px-4 py-8">
          {/* Welcome Header with Navigation */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  Welcome back, {user?.fullName || "Alex Thompson"}!
                </h1>
                <p className="text-muted-foreground">
                  Ready to tackle today's challenges
                </p>
              </div>

              {/* Quick Navigation Menu */}
              <div className="flex items-center gap-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="relative">
                      <Bell className="w-4 h-4 mr-2" />
                      Notifications
                      {unreadCount > 0 && (
                        <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs flex items-center justify-center">
                          {unreadCount}
                        </Badge>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-80">
                    <div className="p-2">
                      <h4 className="font-medium mb-2">Notifications</h4>
                      {notifications.length === 0 ? (
                        <p className="text-sm text-muted-foreground p-2">
                          No notifications
                        </p>
                      ) : (
                        <div className="space-y-1">
                          {notifications.map((notification) => (
                            <div
                              key={notification.id}
                              className={`p-3 rounded-lg cursor-pointer transition-colors ${
                                notification.isRead
                                  ? "bg-muted/50"
                                  : "bg-blue-50 dark:bg-blue-900/20 border-l-2 border-blue-500"
                              }`}
                              onClick={() =>
                                markNotificationRead(notification.id)
                              }
                            >
                              <div className="flex items-start gap-2">
                                {notification.type === "job_alert" && (
                                  <Briefcase className="w-4 h-4 text-blue-500 mt-0.5" />
                                )}
                                {notification.type === "schedule_update" && (
                                  <Calendar className="w-4 h-4 text-orange-500 mt-0.5" />
                                )}
                                {notification.type === "payment" && (
                                  <DollarSign className="w-4 h-4 text-green-500 mt-0.5" />
                                )}
                                <div className="flex-1">
                                  <p className="font-medium text-sm">
                                    {notification.title}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    {notification.message}
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {notification.time}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="hover:shadow-lg transition-all duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Jobs</p>
                    <p className="text-2xl font-bold">
                      {dashboardStats.totalJobs}
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      +12 this month
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                    <Briefcase className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Jobs in Progress
                    </p>
                    <p className="text-2xl font-bold">
                      {dashboardStats.jobsInProgress}
                    </p>
                    <p className="text-xs text-orange-600 mt-1">
                      Currently active
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
                    <Clock className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Upcoming Jobs
                    </p>
                    <p className="text-2xl font-bold">
                      {dashboardStats.upcomingJobs}
                    </p>
                    <p className="text-xs text-blue-600 mt-1">Next 7 days</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Weekly Earnings
                    </p>
                    <p className="text-2xl font-bold">
                      ${dashboardStats.weeklyEarnings.toLocaleString()}
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      +18% vs last week
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Shortcut Buttons */}
          <div className="mb-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Button asChild size="lg" className="h-16">
                <Link
                  to="/technician/calendar"
                  className="flex flex-col items-center gap-2"
                >
                  <CalendarDays className="w-6 h-6" />
                  <span>View Today's Calendar</span>
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-16">
                <Link
                  to="/technician/jobs?filter=available"
                  className="flex flex-col items-center gap-2"
                >
                  <Plus className="w-6 h-6" />
                  <span>Accept New Job</span>
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-16">
                <Link
                  to="/technician/profile"
                  className="flex flex-col items-center gap-2"
                >
                  <User className="w-6 h-6" />
                  <span>Edit Profile</span>
                </Link>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Jobs */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Recent Jobs
                  </CardTitle>
                  <Button asChild variant="outline" size="sm">
                    <Link to="/technician/jobs">
                      <Eye className="w-4 h-4 mr-2" />
                      View All Jobs
                    </Link>
                  </Button>
                </CardHeader>
                <CardContent>
                  {recentJobs.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                        <Briefcase className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">
                        No Jobs Yet
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        You don't have any jobs assigned yet. Check back later
                        for new opportunities.
                      </p>
                      <Button asChild>
                        <Link to="/technician/jobs?filter=available">
                          <Plus className="w-4 h-4 mr-2" />
                          Browse Available Jobs
                        </Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {recentJobs.slice(0, 5).map((job) => (
                        <div
                          key={job.id}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center space-x-4">
                            {getStatusIcon(job.status)}
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <p className="font-medium">{job.service}</p>
                                <Badge
                                  variant="outline"
                                  className={getPriorityColor(job.priority)}
                                >
                                  {job.priority}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {job.customer} • {job.date} at {job.time}
                              </p>
                              <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {job.address}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-lg">{job.payment}</p>
                            <Badge
                              variant="outline"
                              className={getStatusColor(job.status)}
                            >
                              {job.status.replace("-", " ")}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar Content */}
            <div className="space-y-6">
              {/* Performance Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Performance Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        Job Completion Rate
                      </span>
                      <span className="font-medium">
                        {dashboardStats.completionRate}%
                      </span>
                    </div>
                    <Progress
                      value={dashboardStats.completionRate}
                      className="h-2"
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        Customer Rating
                      </span>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="font-medium">
                          {dashboardStats.rating}/5.0
                        </span>
                      </div>
                    </div>
                    <Progress
                      value={(dashboardStats.rating / 5) * 100}
                      className="h-2"
                    />
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Monthly Earnings
                      </span>
                      <span className="font-semibold text-green-600">
                        ${dashboardStats.monthlyEarnings.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        This Week
                      </span>
                      <span className="font-semibold">
                        ${dashboardStats.weeklyEarnings.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Notifications Panel */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="w-5 h-5" />
                    Recent Notifications
                    {unreadCount > 0 && (
                      <Badge className="ml-auto">{unreadCount}</Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {notifications.length === 0 ? (
                    <div className="text-center py-8">
                      <Bell className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">
                        No notifications
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {notifications.slice(0, 3).map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                            notification.isRead
                              ? "bg-muted/50"
                              : "bg-blue-50 dark:bg-blue-900/20 border-blue-200"
                          }`}
                          onClick={() => markNotificationRead(notification.id)}
                        >
                          <div className="flex items-start gap-2">
                            {notification.type === "job_alert" && (
                              <AlertCircle className="w-4 h-4 text-blue-500 mt-0.5" />
                            )}
                            {notification.type === "schedule_update" && (
                              <Calendar className="w-4 h-4 text-orange-500 mt-0.5" />
                            )}
                            {notification.type === "payment" && (
                              <DollarSign className="w-4 h-4 text-green-500 mt-0.5" />
                            )}
                            <div className="flex-1">
                              <p className="font-medium text-sm">
                                {notification.title}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {notification.message}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {notification.time}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                      {notifications.length > 3 && (
                        <Button variant="outline" size="sm" className="w-full">
                          View All Notifications
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Support & Emergency */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-orange-600">
                    <Phone className="w-5 h-5" />
                    Support & Emergency
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      24/7 technician support available for urgent issues
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start">
                      <Phone className="w-4 h-4 mr-2" />
                      Call Support: 1900-5678
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Live Chat Support
                    </Button>
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
