import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Wrench,
  Phone,
  Menu,
  X,
  User,
  LogOut,
  Settings,
  Shield,
  Users,
  ShoppingCart,
  FileText,
  LayoutDashboard,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import UserMenu from "./UserMenu";

export default function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { isAuthenticated, userRole, user, logout } = useAuth();

  const isActive = (path: string) => {
    if (path === "/" || path === "/home") {
      return location.pathname === "/" || location.pathname === "/home";
    }
    return location.pathname === path;
  };

  const navigationLinks = [
    { path: "/", label: "Home" },
    { path: "/services", label: "Services" },
    { path: "/about", label: "About" },
    { path: "/contact", label: "Contact" },
  ];

  const legalLinks = [
    { path: "/privacy", label: "Privacy" },
    { path: "/terms", label: "Terms" },
  ];

  // Role-based navigation links
  const roleBasedLinks = {
    customer: [
      { path: "/customer/dashboard", label: "Dashboard" },
      { path: "/customer/orders", label: "My Orders" },
      { path: "/customer/profile", label: "Profile" },
    ],
    technician: [
      { path: "/technician/dashboard", label: "Dashboard" },
      { path: "/technician/jobs", label: "My Jobs" },
      { path: "/technician/profile", label: "Profile" },
    ],
    admin: [
      { path: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { path: "/admin/users", label: "Users", icon: Users },
      { path: "/admin/technicians", label: "Technicians", icon: Wrench },
      { path: "/admin/services", label: "Services", icon: Settings },
      { path: "/admin/orders", label: "Orders", icon: ShoppingCart },
      { path: "/admin/reports", label: "Reports", icon: FileText },
    ],
  };

  const authLinks = isAuthenticated ? [] : [{ path: "/login", label: "Login" }];

  const userLinks =
    isAuthenticated && userRole ? roleBasedLinks[userRole] || [] : [];

  return (
    <nav className="border-b bg-white sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between lg:grid lg:grid-cols-3 lg:gap-8">
          {/* Logo - Left */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
              <Wrench className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-foreground">FIX4HOME</span>
          </Link>

          {/* Desktop Navigation - Center */}
          <div className="hidden lg:flex items-center justify-center space-x-8">
            {/* Main Navigation */}
            {navigationLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`font-medium transition-colors hover:text-primary ${
                  isActive(link.path)
                    ? "text-primary border-b-2 border-primary pb-1"
                    : "text-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}

            {/* Legal Links */}
            <div className="h-6 w-px bg-border mx-2" />
            {legalLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`relative z-10 px-3 py-2 text-sm font-medium transition-colors hover:text-primary cursor-pointer ${
                  isActive(link.path)
                    ? "text-primary border-b-2 border-primary pb-1"
                    : "text-muted-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Section - Auth/User */}
          <div className="flex items-center justify-end space-x-4">
            {/* Desktop Auth/User Menu */}
            <div className="hidden lg:flex items-center space-x-4">
              {/* Login Link */}
              {authLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`font-medium transition-colors hover:text-primary px-4 py-2 rounded-md border border-primary ${
                    isActive(link.path)
                      ? "bg-primary text-primary-foreground"
                      : "text-primary hover:bg-primary hover:text-primary-foreground"
                  }`}
                >
                  {link.label}
                </Link>
              ))}

              {/* User Menu */}
              {isAuthenticated && user && <UserMenu />}
            </div>

            {/* Mobile Login Button (when not authenticated) */}
            {!isAuthenticated && authLinks.length > 0 && (
              <Link
                to="/login"
                className="lg:hidden text-sm font-medium text-primary hover:text-primary/80"
              >
                Login
              </Link>
            )}

            {/* Mobile User Menu (when authenticated) */}
            {isAuthenticated && user && (
              <div className="lg:hidden">
                <UserMenu />
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-4 pb-4 border-t pt-4">
            <div className="flex flex-col space-y-4">
              {/* User Info */}
              {isAuthenticated && user && (
                <div className="border-b pb-4 mb-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
                      {userRole === "admin" ? (
                        <Shield className="w-4 h-4 text-white" />
                      ) : userRole === "technician" ? (
                        <Settings className="w-4 h-4 text-white" />
                      ) : (
                        <User className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{user.fullName}</p>
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          userRole === "admin"
                            ? "bg-purple-100 text-purple-800 border-purple-200"
                            : userRole === "technician"
                              ? "bg-blue-100 text-blue-800 border-blue-200"
                              : "bg-green-100 text-green-800 border-green-200"
                        }`}
                      >
                        {userRole}
                      </Badge>
                    </div>
                  </div>
                </div>
              )}

              {/* Main Navigation */}
              {navigationLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`font-medium transition-colors hover:text-primary ${
                    isActive(link.path) ? "text-primary" : "text-foreground"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}

              {/* Role-based Links */}
              {userLinks.length > 0 && (
                <div className="border-t pt-4 mt-4">
                  <div className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
                    {userRole} Dashboard
                  </div>
                  {userLinks.map((link) => (
                    <Link
                      key={link.path}
                      to={link.path}
                      className={`block py-1 font-medium transition-colors hover:text-primary ${
                        isActive(link.path) ? "text-primary" : "text-foreground"
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              )}

              {/* Legal Links */}
              <div className="border-t pt-4 mt-4">
                <div className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
                  Legal
                </div>
                {legalLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`block py-1 text-sm font-medium transition-colors hover:text-primary ${
                      isActive(link.path)
                        ? "text-primary"
                        : "text-muted-foreground"
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              {/* Auth Links */}
              {authLinks.length > 0 && (
                <div className="border-t pt-4 mt-4">
                  {authLinks.map((link) => (
                    <Link
                      key={link.path}
                      to={link.path}
                      className={`font-medium transition-colors hover:text-primary ${
                        isActive(link.path) ? "text-primary" : "text-foreground"
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              )}

              {/* Logout Button */}
              {isAuthenticated && (
                <div className="border-t pt-4 mt-4">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full justify-start text-muted-foreground hover:text-foreground"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
