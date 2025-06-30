import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import Layout from "@/components/shared/Layout";
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
} from "lucide-react";
import { Link } from "react-router-dom";

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
  const [activeTab, setActiveTab] = useState<"customer" | "technician">(
    "customer",
  );
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [errors, setErrors] = useState<LoginErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);

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
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Simulate different error scenarios
      const scenario = Math.random();

      if (scenario < 0.3) {
        // Invalid credentials
        setAttemptCount((prev) => prev + 1);
        throw new Error("Invalid email/phone or password. Please try again.");
      } else if (scenario < 0.4 && attemptCount >= 2) {
        // Too many attempts
        throw new Error(
          "Too many failed login attempts. Please try again in 15 minutes or reset your password.",
        );
      } else if (scenario < 0.5) {
        // Account not found
        throw new Error(
          `No ${activeTab} account found with this email/phone. Please check your credentials or register a new account.`,
        );
      }

      // Success - redirect to appropriate dashboard
      const dashboardUrl =
        activeTab === "customer"
          ? "/customer-dashboard"
          : "/technician-dashboard";

      // In a real app, you would use router.push() or similar
      console.log(`Redirecting to ${dashboardUrl}`);
      alert(`Login successful! Redirecting to ${activeTab} dashboard...`);

      // Reset form
      setFormData({ email: "", password: "", rememberMe: false });
      setAttemptCount(0);
    } catch (error) {
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
                    Choose Account Type
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs
                    value={activeTab}
                    onValueChange={(value) =>
                      setActiveTab(value as "customer" | "technician")
                    }
                    className="w-full"
                  >
                    <TabsList className="grid w-full grid-cols-2 mb-8">
                      <TabsTrigger
                        value="customer"
                        className="flex items-center space-x-2"
                      >
                        <User className="w-4 h-4" />
                        <span>Customer</span>
                      </TabsTrigger>
                      <TabsTrigger
                        value="technician"
                        className="flex items-center space-x-2"
                      >
                        <Settings className="w-4 h-4" />
                        <span>Technician</span>
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="customer" className="space-y-0">
                      <LoginForm
                        formData={formData}
                        errors={errors}
                        showPassword={showPassword}
                        isLoading={isLoading}
                        isBlocked={isBlocked}
                        attemptCount={attemptCount}
                        userType="customer"
                        onInputChange={handleInputChange}
                        onTogglePassword={() => setShowPassword(!showPassword)}
                        onSubmit={handleSubmit}
                      />
                    </TabsContent>

                    <TabsContent value="technician" className="space-y-0">
                      <LoginForm
                        formData={formData}
                        errors={errors}
                        showPassword={showPassword}
                        isLoading={isLoading}
                        isBlocked={isBlocked}
                        attemptCount={attemptCount}
                        userType="technician"
                        onInputChange={handleInputChange}
                        onTogglePassword={() => setShowPassword(!showPassword)}
                        onSubmit={handleSubmit}
                      />
                    </TabsContent>
                  </Tabs>
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
}: LoginFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
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
          ) : (
            <>
              <Settings className="w-4 h-4 inline mr-1" />
              Technician accounts can receive jobs and manage service requests
            </>
          )}
        </div>
      </div>
    </form>
  );
}
