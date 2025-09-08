import { useState } from "react";
import {
  User,
  LogOut,
  Settings,
  Shield,
  Home,
  ClipboardList,
  UserCircle,
  Wrench,
  BarChart3,
  Users,
  X,
  Calendar,
  Star,
  TrendingUp,
  ChevronRight,
  ShoppingCart,
  FileText,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function UserMenu() {
  const { user, userRole, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  if (!user || !userRole) {
    return null;
  }

  const isActiveRoute = (href: string) => {
    return location.pathname === href;
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <Shield className="w-4 h-4" />;
      case "technician":
        return <Settings className="w-4 h-4" />;
      case "customer":
        return <User className="w-4 h-4" />;
      default:
        return <User className="w-4 h-4" />;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900 dark:text-purple-300";
      case "technician":
        return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-300";
      case "customer":
        return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const getAvatarFallback = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getMenuItems = (role: string) => {
    const baseItems = [
      {
        icon: <Home className="w-4 h-4" />,
        label: "Dashboard",
        href: `/${role}/dashboard`,
      },
    ];

    switch (role) {
      case "customer":
        return [
          ...baseItems,
          {
            icon: <ClipboardList className="w-4 h-4" />,
            label: "My Orders",
            href: "/customer/orders",
          },
          {
            icon: <UserCircle className="w-4 h-4" />,
            label: "Profile",
            href: "/customer/profile",
          },
        ];
      case "technician":
        return [
          ...baseItems,
          {
            icon: <Wrench className="w-4 h-4" />,
            label: "My Jobs",
            href: "/technician/jobs",
          },
          {
            icon: <Calendar className="w-4 h-4" />,
            label: "Calendar",
            href: "/technician/calendar",
          },
          {
            icon: <BarChart3 className="w-4 h-4" />,
            label: "Statistics",
            href: "/technician/statistics",
          },
          {
            icon: <Star className="w-4 h-4" />,
            label: "Reviews",
            href: "/technician/reviews",
          },
          {
            icon: <UserCircle className="w-4 h-4" />,
            label: "Profile",
            href: "/technician/profile",
          },
        ];
      case "admin":
        return [
          ...baseItems,
          {
            icon: <Users className="w-4 h-4" />,
            label: "Users",
            href: "/admin/users",
          },
          {
            icon: <Wrench className="w-4 h-4" />,
            label: "Technicians",
            href: "/admin/technicians",
          },
          {
            icon: <Settings className="w-4 h-4" />,
            label: "Services",
            href: "/admin/services",
          },
          {
            icon: <ShoppingCart className="w-4 h-4" />,
            label: "Orders",
            href: "/admin/orders",
          },
          {
            icon: <FileText className="w-4 h-4" />,
            label: "Reports",
            href: "/admin/reports",
          },
        ];
      default:
        return baseItems;
    }
  };

  const menuItems = getMenuItems(userRole);

  return (
    <>
      {/* Avatar Button */}
      <Button
        variant="ghost"
        className="relative h-11 w-11 rounded-full hover:bg-accent/20 focus:bg-accent/20 transition-all duration-200 hover:scale-105"
        onClick={() => setSidebarOpen(true)}
      >
        <Avatar className="h-10 w-10 border-2 border-primary/30 shadow-sm">
          <AvatarImage
            src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.fullName}`}
            alt={user.fullName}
          />
          <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-primary-foreground font-semibold">
            {getAvatarFallback(user.fullName)}
          </AvatarFallback>
        </Avatar>
      </Button>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-all duration-300 ease-out"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-80 bg-background/95 backdrop-blur-xl border-l border-border/50 shadow-2xl z-50 transform transition-all duration-300 ease-out rounded-l-2xl ${
          sidebarOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full relative">
          {/* Gradient Background Accent */}
          <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-bl from-primary/5 to-secondary/5 rounded-tl-2xl" />

          {/* Header */}
          <div className="relative flex items-center justify-between p-6 pb-4">
            <h2 className="text-2xl font-bold text-foreground">Menu</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(false)}
              className="h-9 w-9 rounded-full hover:bg-accent/20 transition-all duration-200 hover:scale-105"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* User Info */}
          <div className="relative px-6 pb-6">
            <div className="flex items-start space-x-4">
              <div className="relative">
                <Avatar className="h-16 w-16 border-3 border-primary/20 shadow-lg ring-2 ring-background">
                  <AvatarImage
                    src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.fullName}`}
                    alt={user.fullName}
                  />
                  <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-primary-foreground text-lg font-bold">
                    {getAvatarFallback(user.fullName)}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-background rounded-full" />
              </div>
              <div className="flex-1 min-w-0 mt-1">
                <h3 className="text-lg font-bold text-foreground truncate">
                  {user.fullName}
                </h3>
                <p className="text-sm text-muted-foreground/80 truncate mb-2">
                  {user.email}
                </p>
                <Badge
                  variant="outline"
                  className={`text-xs font-medium px-3 py-1 ${getRoleBadgeColor(userRole)} border-none shadow-sm`}
                >
                  <span className="mr-1.5">{getRoleIcon(userRole)}</span>
                  {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
                </Badge>
              </div>
            </div>
          </div>

          <Separator className="mx-6 opacity-30" />

          {/* Navigation Items */}
          <div className="flex-1 overflow-y-auto px-4 py-6">
            <div className="space-y-1">
              {menuItems.map((item, index) => {
                const isActive = isActiveRoute(item.href);
                return (
                  <Link
                    key={index}
                    to={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`group flex items-center justify-between px-4 py-3.5 text-sm rounded-xl transition-all duration-200 hover:scale-[1.02] ${
                      isActive
                        ? "bg-primary/10 text-primary border-l-4 border-primary shadow-sm"
                        : "hover:bg-accent/50 text-foreground"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span
                        className={`transition-colors duration-200 ${
                          isActive
                            ? "text-primary"
                            : "text-muted-foreground group-hover:text-foreground"
                        }`}
                      >
                        {item.icon}
                      </span>
                      <span className="font-semibold">{item.label}</span>
                    </div>
                    {isActive && (
                      <ChevronRight className="w-4 h-4 text-primary" />
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Quick Actions for Technicians */}
            {userRole === "technician" && (
              <>
                <Separator className="my-6 opacity-30" />
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-4 mb-4">
                    Quick Actions
                  </h4>
                  <Link
                    to="/technician/jobs?filter=pending"
                    onClick={() => setSidebarOpen(false)}
                    className="group flex items-center space-x-3 px-4 py-3.5 text-sm rounded-xl hover:bg-accent/50 transition-all duration-200 hover:scale-[1.02]"
                  >
                    <span className="text-blue-500 group-hover:text-blue-600 transition-colors duration-200">
                      <ClipboardList className="w-4 h-4" />
                    </span>
                    <span className="font-semibold text-foreground">
                      Browse Available Jobs
                    </span>
                  </Link>
                  <Link
                    to="/technician/calendar"
                    onClick={() => setSidebarOpen(false)}
                    className="group flex items-center space-x-3 px-4 py-3.5 text-sm rounded-xl hover:bg-accent/50 transition-all duration-200 hover:scale-[1.02]"
                  >
                    <span className="text-green-500 group-hover:text-green-600 transition-colors duration-200">
                      <Calendar className="w-4 h-4" />
                    </span>
                    <span className="font-semibold text-foreground">
                      Today's Schedule
                    </span>
                  </Link>
                </div>
              </>
            )}
          </div>

          {/* Bottom Actions */}
          <div className="p-4">
            <Separator className="mb-4 opacity-30" />
            <Button
              onClick={() => {
                logout();
                setSidebarOpen(false);
              }}
              variant="ghost"
              className="w-full justify-start py-3.5 px-4 text-destructive hover:text-destructive hover:bg-destructive/10 rounded-xl transition-all duration-200 hover:scale-[1.02] font-semibold"
            >
              <LogOut className="w-5 h-5 mr-3" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
