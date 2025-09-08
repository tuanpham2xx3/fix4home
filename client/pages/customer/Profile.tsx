import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Layout from "@/components/shared/Layout";
import { useAuth } from "@/contexts/AuthContext";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Bell,
  Shield,
  Save,
  Edit,
  Camera,
  Trash2,
  Plus,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
  Loader2,
  Home,
  Building,
  X,
  Upload,
} from "lucide-react";

interface Address {
  id: string;
  type: "home" | "work" | "other";
  label: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  isDefault: boolean;
}

interface NotificationState {
  type: "success" | "error" | "info";
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
  address?: string;
}

export default function CustomerProfile() {
  const { user } = useAuth();

  // Form states
  const [isEditing, setIsEditing] = useState(false);
  const [isLoadingSave, setIsLoadingSave] = useState(false);
  const [isLoadingPassword, setIsLoadingPassword] = useState(false);
  const [notification, setNotification] = useState<NotificationState | null>(
    null,
  );
  const [errors, setErrors] = useState<FormErrors>({});

  // User data state
  const [formData, setFormData] = useState({
    name: user?.fullName || "",
    email: user?.email || "",
    phone: "+1 (555) 123-4567",
    avatarUrl: "",
    bio: "Regular customer who values quality home maintenance services.",
    emailNotifications: true,
    smsNotifications: false,
    marketingEmails: true,
  });

  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Address management state
  const [addresses, setAddresses] = useState<Address[]>([
    {
      id: "addr-1",
      type: "home",
      label: "Home",
      street: "123 Main Street, Apt 4B",
      city: "Springfield",
      state: "IL",
      zipCode: "62701",
      isDefault: true,
    },
    {
      id: "addr-2",
      type: "work",
      label: "Office",
      street: "456 Business Blvd, Suite 200",
      city: "Springfield",
      state: "IL",
      zipCode: "62702",
      isDefault: false,
    },
  ]);

  const [showAddressDialog, setShowAddressDialog] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [deleteAddressId, setDeleteAddressId] = useState<string | null>(null);
  const [newAddress, setNewAddress] = useState<Partial<Address>>({
    type: "home",
    label: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    isDefault: false,
  });

  // Avatar upload state
  const [showAvatarDialog, setShowAvatarDialog] = useState(false);

  // Auto-hide notifications
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const showNotification = (
    type: "success" | "error" | "info",
    message: string,
  ) => {
    setNotification({ type, message });
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Phone validation
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (
      !/^[+]?[\d\s\-\(\)]{10,}$/.test(formData.phone.replace(/\s/g, ""))
    ) {
      newErrors.phone = "Please enter a valid phone number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePasswordForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!passwordData.currentPassword) {
      newErrors.currentPassword = "Current password is required";
    }

    if (!passwordData.newPassword) {
      newErrors.newPassword = "New password is required";
    } else if (passwordData.newPassword.length < 8) {
      newErrors.newPassword = "Password must be at least 8 characters";
    } else if (
      !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(passwordData.newPassword)
    ) {
      newErrors.newPassword =
        "Password must contain uppercase, lowercase, and number";
    }

    if (!passwordData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsLoadingSave(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setIsEditing(false);
      showNotification("success", "Profile updated successfully!");
    } catch (error) {
      showNotification("error", "Failed to update profile. Please try again.");
    } finally {
      setIsLoadingSave(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!validatePasswordForm()) return;

    setIsLoadingPassword(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      showNotification("success", "Password changed successfully!");
    } catch (error) {
      showNotification("error", "Failed to change password. Please try again.");
    } finally {
      setIsLoadingPassword(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear field error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handlePasswordInputChange = (field: string, value: string) => {
    setPasswordData((prev) => ({ ...prev, [field]: value }));
    // Clear field error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleAddAddress = () => {
    setEditingAddress(null);
    setNewAddress({
      type: "home",
      label: "",
      street: "",
      city: "",
      state: "",
      zipCode: "",
      isDefault: false,
    });
    setShowAddressDialog(true);
  };

  const handleEditAddress = (address: Address) => {
    setEditingAddress(address);
    setNewAddress(address);
    setShowAddressDialog(true);
  };

  const handleSaveAddress = () => {
    if (
      !newAddress.label ||
      !newAddress.street ||
      !newAddress.city ||
      !newAddress.state ||
      !newAddress.zipCode
    ) {
      showNotification("error", "Please fill in all address fields");
      return;
    }

    if (editingAddress) {
      // Update existing address
      setAddresses((prev) =>
        prev.map((addr) =>
          addr.id === editingAddress.id
            ? { ...(newAddress as Address), id: editingAddress.id }
            : addr,
        ),
      );
      showNotification("success", "Address updated successfully!");
    } else {
      // Add new address
      const newAddr: Address = {
        ...(newAddress as Address),
        id: `addr-${Date.now()}`,
      };
      setAddresses((prev) => [...prev, newAddr]);
      showNotification("success", "Address added successfully!");
    }

    setShowAddressDialog(false);
  };

  const handleDeleteAddress = (addressId: string) => {
    setAddresses((prev) => prev.filter((addr) => addr.id !== addressId));
    showNotification("success", "Address deleted successfully!");
    setDeleteAddressId(null);
  };

  const handleSetDefaultAddress = (addressId: string) => {
    setAddresses((prev) =>
      prev.map((addr) => ({
        ...addr,
        isDefault: addr.id === addressId,
      })),
    );
    showNotification("success", "Default address updated!");
  };

  const getAddressTypeIcon = (type: string) => {
    switch (type) {
      case "home":
        return <Home className="w-4 h-4" />;
      case "work":
        return <Building className="w-4 h-4" />;
      default:
        return <MapPin className="w-4 h-4" />;
    }
  };

  return (
    <Layout
      breadcrumbs={[
        { label: "Customer Dashboard", href: "/customer/dashboard" },
        { label: "Profile" },
      ]}
    >
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950 dark:to-indigo-900">
        <div className="container mx-auto px-4 py-6 space-y-6">
          {/* Notification */}
          {notification && (
            <Alert
              variant={
                notification.type === "error" ? "destructive" : "default"
              }
              className="max-w-md ml-auto"
            >
              {notification.type === "success" ? (
                <CheckCircle className="h-4 w-4" />
              ) : notification.type === "error" ? (
                <AlertCircle className="h-4 w-4" />
              ) : (
                <Bell className="h-4 w-4" />
              )}
              <AlertDescription>{notification.message}</AlertDescription>
            </Alert>
          )}

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                My Profile
              </h1>
              <p className="text-muted-foreground">
                Manage your account information, addresses, and preferences
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Picture & Quick Info */}
            <div className="lg:col-span-1 space-y-6">
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="relative mb-6">
                    <Avatar className="w-24 h-24 mx-auto">
                      <AvatarImage src={formData.avatarUrl} />
                      <AvatarFallback className="text-2xl">
                        {formData.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <Button
                      size="sm"
                      variant="outline"
                      className="absolute bottom-0 right-1/2 translate-x-6 translate-y-2"
                      onClick={() => setShowAvatarDialog(true)}
                    >
                      <Camera className="w-4 h-4" />
                    </Button>
                  </div>

                  <h2 className="text-xl font-semibold mb-1">
                    {formData.name}
                  </h2>
                  <Badge variant="secondary" className="mb-4">
                    Customer
                  </Badge>

                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span className="truncate">{formData.email}</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span>{formData.phone}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Account Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Total Orders
                    </span>
                    <span className="font-semibold">12</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Addresses
                    </span>
                    <span className="font-semibold">{addresses.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Member Since
                    </span>
                    <span className="font-semibold">Jan 2024</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Personal Information */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5 text-primary" />
                    Personal Information
                  </CardTitle>
                  {!isEditing ? (
                    <Button
                      variant="outline"
                      onClick={() => setIsEditing(true)}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsEditing(false);
                          setErrors({});
                        }}
                        disabled={isLoadingSave}
                      >
                        Cancel
                      </Button>
                      <Button onClick={handleSave} disabled={isLoadingSave}>
                        {isLoadingSave ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4 mr-2" />
                            Save Changes
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) =>
                          handleInputChange("name", e.target.value)
                        }
                        disabled={!isEditing}
                        className={errors.name ? "border-red-500" : ""}
                      />
                      {errors.name && (
                        <p className="text-sm text-red-500">{errors.name}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          handleInputChange("email", e.target.value)
                        }
                        disabled={!isEditing}
                        className={errors.email ? "border-red-500" : ""}
                      />
                      {errors.email && (
                        <p className="text-sm text-red-500">{errors.email}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) =>
                          handleInputChange("phone", e.target.value)
                        }
                        disabled={!isEditing}
                        className={errors.phone ? "border-red-500" : ""}
                      />
                      {errors.phone && (
                        <p className="text-sm text-red-500">{errors.phone}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio (Optional)</Label>
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => handleInputChange("bio", e.target.value)}
                      disabled={!isEditing}
                      rows={3}
                      placeholder="Tell us a bit about yourself..."
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Address Management */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary" />
                    Addresses
                  </CardTitle>
                  <Button onClick={handleAddAddress}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Address
                  </Button>
                </CardHeader>
                <CardContent>
                  {addresses.length === 0 ? (
                    <div className="text-center py-8">
                      <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">
                        No addresses saved
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        Add an address to make booking services easier
                      </p>
                      <Button onClick={handleAddAddress}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Your First Address
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {addresses.map((address) => (
                        <div
                          key={address.id}
                          className={`p-4 border rounded-lg ${
                            address.isDefault
                              ? "border-primary bg-primary/5"
                              : "border-border"
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                {getAddressTypeIcon(address.type)}
                                <span className="font-medium">
                                  {address.label}
                                </span>
                                {address.isDefault && (
                                  <Badge variant="default" className="text-xs">
                                    Default
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {address.street}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {address.city}, {address.state}{" "}
                                {address.zipCode}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              {!address.isDefault && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    handleSetDefaultAddress(address.id)
                                  }
                                >
                                  Set Default
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditAddress(address)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setDeleteAddressId(address.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Change Password */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-primary" />
                    Change Password
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        type={showCurrentPassword ? "text" : "password"}
                        value={passwordData.currentPassword}
                        onChange={(e) =>
                          handlePasswordInputChange(
                            "currentPassword",
                            e.target.value,
                          )
                        }
                        className={
                          errors.currentPassword
                            ? "border-red-500 pr-10"
                            : "pr-10"
                        }
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() =>
                          setShowCurrentPassword(!showCurrentPassword)
                        }
                      >
                        {showCurrentPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                    {errors.currentPassword && (
                      <p className="text-sm text-red-500">
                        {errors.currentPassword}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <div className="relative">
                        <Input
                          id="newPassword"
                          type={showNewPassword ? "text" : "password"}
                          value={passwordData.newPassword}
                          onChange={(e) =>
                            handlePasswordInputChange(
                              "newPassword",
                              e.target.value,
                            )
                          }
                          className={
                            errors.newPassword
                              ? "border-red-500 pr-10"
                              : "pr-10"
                          }
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                        >
                          {showNewPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                      {errors.newPassword && (
                        <p className="text-sm text-red-500">
                          {errors.newPassword}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">
                        Confirm New Password
                      </Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          value={passwordData.confirmPassword}
                          onChange={(e) =>
                            handlePasswordInputChange(
                              "confirmPassword",
                              e.target.value,
                            )
                          }
                          className={
                            errors.confirmPassword
                              ? "border-red-500 pr-10"
                              : "pr-10"
                          }
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                      {errors.confirmPassword && (
                        <p className="text-sm text-red-500">
                          {errors.confirmPassword}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground">
                    Password must be at least 8 characters and contain
                    uppercase, lowercase, and number.
                  </div>

                  <Button
                    onClick={handlePasswordChange}
                    disabled={isLoadingPassword}
                    className="w-full"
                  >
                    {isLoadingPassword ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Changing Password...
                      </>
                    ) : (
                      <>
                        <Shield className="w-4 h-4 mr-2" />
                        Change Password
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Notification Preferences */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="w-5 h-5 text-primary" />
                    Notification Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="font-medium">Email Notifications</p>
                      <p className="text-sm text-muted-foreground">
                        Receive updates about your orders via email
                      </p>
                    </div>
                    <Switch
                      checked={formData.emailNotifications}
                      onCheckedChange={(checked) =>
                        handleInputChange("emailNotifications", checked)
                      }
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="font-medium">SMS Notifications</p>
                      <p className="text-sm text-muted-foreground">
                        Receive important updates via text message
                      </p>
                    </div>
                    <Switch
                      checked={formData.smsNotifications}
                      onCheckedChange={(checked) =>
                        handleInputChange("smsNotifications", checked)
                      }
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="font-medium">Marketing Emails</p>
                      <p className="text-sm text-muted-foreground">
                        Receive promotional offers and service updates
                      </p>
                    </div>
                    <Switch
                      checked={formData.marketingEmails}
                      onCheckedChange={(checked) =>
                        handleInputChange("marketingEmails", checked)
                      }
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Avatar Upload Dialog */}
      <Dialog open={showAvatarDialog} onOpenChange={setShowAvatarDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Change Profile Picture</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center space-y-4">
            <Avatar className="w-32 h-32">
              <AvatarImage src={formData.avatarUrl} />
              <AvatarFallback className="text-4xl">
                {formData.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <Button variant="outline" className="w-full">
              <Upload className="w-4 h-4 mr-2" />
              Upload New Photo
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              Recommended: Square image, at least 400x400 pixels
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAvatarDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                showNotification("success", "Profile picture updated!");
                setShowAvatarDialog(false);
              }}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Address Dialog */}
      <Dialog open={showAddressDialog} onOpenChange={setShowAddressDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingAddress ? "Edit Address" : "Add New Address"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Address Type</Label>
                <Select
                  value={newAddress.type}
                  onValueChange={(value) =>
                    setNewAddress((prev) => ({
                      ...prev,
                      type: value as Address["type"],
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="home">Home</SelectItem>
                    <SelectItem value="work">Work</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Label</Label>
                <Input
                  value={newAddress.label}
                  onChange={(e) =>
                    setNewAddress((prev) => ({
                      ...prev,
                      label: e.target.value,
                    }))
                  }
                  placeholder="e.g. Home, Office"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Street Address</Label>
              <Input
                value={newAddress.street}
                onChange={(e) =>
                  setNewAddress((prev) => ({ ...prev, street: e.target.value }))
                }
                placeholder="123 Main Street, Apt 4B"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>City</Label>
                <Input
                  value={newAddress.city}
                  onChange={(e) =>
                    setNewAddress((prev) => ({ ...prev, city: e.target.value }))
                  }
                  placeholder="Springfield"
                />
              </div>
              <div className="space-y-2">
                <Label>State</Label>
                <Input
                  value={newAddress.state}
                  onChange={(e) =>
                    setNewAddress((prev) => ({
                      ...prev,
                      state: e.target.value,
                    }))
                  }
                  placeholder="IL"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Zip Code</Label>
              <Input
                value={newAddress.zipCode}
                onChange={(e) =>
                  setNewAddress((prev) => ({
                    ...prev,
                    zipCode: e.target.value,
                  }))
                }
                placeholder="62701"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isDefault"
                checked={newAddress.isDefault}
                onChange={(e) =>
                  setNewAddress((prev) => ({
                    ...prev,
                    isDefault: e.target.checked,
                  }))
                }
                className="rounded"
              />
              <Label htmlFor="isDefault">Set as default address</Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAddressDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveAddress}>
              {editingAddress ? "Update Address" : "Add Address"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Address Confirmation */}
      <AlertDialog
        open={!!deleteAddressId}
        onOpenChange={() => setDeleteAddressId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Address</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this address? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                deleteAddressId && handleDeleteAddress(deleteAddressId)
              }
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Address
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
}
