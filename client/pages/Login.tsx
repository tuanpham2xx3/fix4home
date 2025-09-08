import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Layout from "@/components/shared/Layout";
import { useAuth, UserRole } from "@/contexts/AuthContext";
import {
  Wrench,
  Phone,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  User,
  Settings,
  Mail,
  Lock,
  ArrowRight,
  Home,
  ChevronRight,
  Shield,
} from "lucide-react";
import { Link, Navigate } from "react-router-dom";

interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

interface LoginErrors {
  email?: string;
  password?: string;
  general?: string;
}

export default function Login() {
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [errors, setErrors] = useState<LoginErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const [userType, setUserType] = useState<"customer" | "technician">("customer");

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const validateForm = (): boolean => {
    const newErrors: LoginErrors = {};

    // Email/Phone validation
    if (!formData.email.trim()) {
      newErrors.email = "Email or phone number is required";
    } else {
      // Check if it's email format
      const isEmail = formData.email.includes("@");
      if (isEmail) {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          newErrors.email = "Please enter a valid email address";
        }
      } else {
        // Phone number validation
        if (!/^[0-9+\-\s()]{10,15}$/.test(formData.email.replace(/\s/g, ""))) {
          newErrors.email = "Please enter a valid phone number";
        }
      }
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof LoginFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear specific field error when user starts typing
    if (errors[field as keyof LoginErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
    // Clear general error
    if (errors.general) {
      setErrors((prev) => ({ ...prev, general: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      await login(formData.email, formData.password);
      // Navigation is handled by AuthContext
    } catch (error) {
      setAttemptCount((prev) => prev + 1);
      setErrors({
        general:
          error instanceof Error
            ? error.message
            : "Login failed. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isBlocked = attemptCount >= 3;

  return (
    <Layout breadcrumbs={[{ label: "Login" }]}>
      <div className="bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        {/* Login Form */}
        <section className="flex-1 py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-md mx-auto">
              {/* Header */}
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-6">
                  <Lock className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  Welcome Back
                </h1>
                <p className="text-muted-foreground">
                  Sign in to access your FIX4HOME account
                </p>
              </div>

              <Card className="shadow-xl border-0">
                <CardHeader className="space-y-1 pb-4">
                  <CardTitle className="text-center text-xl">
                    Đăng nhập
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <LoginForm
                    formData={formData}
                    errors={errors}
                    showPassword={showPassword}
                    isLoading={isLoading}
                    isBlocked={isBlocked}
                    attemptCount={attemptCount}
                    userType={userType}
                    onInputChange={handleInputChange}
                    onTogglePassword={() => setShowPassword(!showPassword)}
                    onSubmit={handleSubmit}
                    onUserTypeChange={setUserType}
                  />
                </CardContent>
              </Card>

              {/* Additional Links */}
              <div className="mt-8 text-center space-y-4">
                <div className="text-sm text-muted-foreground">
                  Don't have an account?
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button variant="outline" className="flex-1" asChild>
                    <Link to="/register-customer">
                      <User className="w-4 h-4 mr-2" />
                      Register as Customer
                    </Link>
                  </Button>
                  <Button variant="outline" className="flex-1" asChild>
                    <Link to="/register-technician">
                      <Settings className="w-4 h-4 mr-2" />
                      Register as Technician
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}

// Login Form Component
interface LoginFormProps {
  formData: LoginFormData;
  errors: LoginErrors;
  showPassword: boolean;
  isLoading: boolean;
  isBlocked: boolean;
  attemptCount: number;
  userType: "customer" | "technician";
  onInputChange: (field: keyof LoginFormData, value: any) => void;
  onTogglePassword: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onUserTypeChange: (type: "customer" | "technician") => void;
}

function LoginForm({
  formData,
  errors,
  showPassword,
  isLoading,
  isBlocked,
  attemptCount,
  userType,
  onInputChange,
  onTogglePassword,
  onSubmit,
  onUserTypeChange,
}: LoginFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* User Type Toggle */}
      <div className="flex p-1 bg-muted rounded-lg">
        <button
          type="button"
          onClick={() => onUserTypeChange("customer")}
          className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-all ${
            userType === "customer"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <User className="w-4 h-4 inline mr-2" />
          Customer
        </button>
        <button
          type="button"
          onClick={() => onUserTypeChange("technician")}
          className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-all ${
            userType === "technician"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Settings className="w-4 h-4 inline mr-2" />
          Technician
        </button>
      </div>

      {/* Error Alert */}
      {errors.general && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errors.general}</AlertDescription>
        </Alert>
      )}

      {/* Attempt Warning */}
      {attemptCount > 0 && attemptCount < 3 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {attemptCount === 1
              ? "Incorrect credentials. 2 attempts remaining."
              : "Incorrect credentials. 1 attempt remaining."}
          </AlertDescription>
        </Alert>
      )}

      {/* Blocked Alert */}
      {isBlocked && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Account temporarily locked due to multiple failed attempts. Please
            try again in 15 minutes or reset your password.
          </AlertDescription>
        </Alert>
      )}

      {/* Email/Phone Field */}
      <div className="space-y-2">
        <Label htmlFor="email">Email or Phone Number</Label>
        <div className="relative">
          <Input
            id="email"
            type="text"
            placeholder={
              userType === "customer"
                ? "your.email@example.com or 0901234567"
                : "technician@example.com or 0901234567"
            }
            value={formData.email}
            onChange={(e) => onInputChange("email", e.target.value)}
            className={errors.email ? "border-destructive pr-10" : "pr-10"}
            disabled={isLoading || isBlocked}
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            {formData.email.includes("@") ? (
              <Mail className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Phone className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </div>
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email}</p>
        )}
      </div>

      {/* Password Field */}
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            value={formData.password}
            onChange={(e) => onInputChange("password", e.target.value)}
            className={errors.password ? "border-destructive pr-10" : "pr-10"}
            disabled={isLoading || isBlocked}
          />
          <button
            type="button"
            onClick={onTogglePassword}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
            disabled={isLoading || isBlocked}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        {errors.password && (
          <p className="text-sm text-destructive">{errors.password}</p>
        )}
      </div>

      {/* Remember Me & Forgot Password */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="remember"
            checked={formData.rememberMe}
            onCheckedChange={(checked) => onInputChange("rememberMe", checked)}
            disabled={isLoading || isBlocked}
          />
          <Label
            htmlFor="remember"
            className="text-sm font-normal text-muted-foreground"
          >
            Remember me
          </Label>
        </div>
        <Link
          to="/forgot-password"
          className="text-sm text-primary hover:underline"
        >
          Forgot password?
        </Link>
      </div>

      {/* Login Button */}
      <Button
        type="submit"
        className="w-full"
        size="lg"
        disabled={isLoading || isBlocked}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Signing in...
          </>
        ) : (
          <>
            Sign in as {userType}
            <ArrowRight className="w-4 h-4 ml-2" />
          </>
        )}
      </Button>

      {/* User Type Info */}
      <div className="text-center">
        <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
          {userType === "customer" ? (
            <>
              <User className="w-4 h-4 inline mr-1" />
              Customer accounts can book services and manage orders
            </>
          ) : userType === "technician" ? (
            <>
              <Settings className="w-4 h-4 inline mr-1" />
              Technician accounts can receive jobs and manage service requests
            </>
          ) : (
            <>
              <Shield className="w-4 h-4 inline mr-1" />
              Admin accounts have full system access and management capabilities
            </>
          )}
        </div>
      </div>
    </form>
  );
}
