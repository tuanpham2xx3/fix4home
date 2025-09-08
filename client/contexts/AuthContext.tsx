import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";
import { 
  authAPI, 
  authUtils, 
  TokenManager,
  handleAPIError,
  UserData 
} from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export type UserRole = "customer" | "technician" | "admin";

interface User extends UserData {
  // Extending UserData from API
}

interface AuthContextType {
  user: User | null;
  userRole: UserRole | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check for existing session on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = TokenManager.getAccessToken();
    
    if (!token || TokenManager.isTokenExpired(token)) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await authAPI.getCurrentUser();
      
      if (response.success) {
        setUser(response.data);
        setUserRole(response.data.role as UserRole);
      } else {
        throw new Error('Failed to get user data');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      // Clear tokens if auth fails
      TokenManager.clearTokens();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);

    try {
      const response = await authAPI.login({
        usernameOrEmail: email.trim(),
        password: password.trim()
      });

      if (response.success) {
        const { user: userData } = response.data;
        
        setUser(userData);
        setUserRole(userData.role as UserRole);

        toast({
          title: "Đăng nhập thành công",
          description: `Chào mừng bạn trở lại, ${userData.fullName}!`
        });

        // Redirect to appropriate dashboard
        const dashboardRoute = getDashboardRoute(userData.role as UserRole);
        navigate(dashboardRoute);
      } else {
        throw new Error(response.message || 'Đăng nhập thất bại');
      }
    } catch (error) {
      console.error('Login failed:', error);
      const errorMessage = handleAPIError(error).message;
      
      toast({
        title: "Đăng nhập thất bại",
        description: errorMessage,
        variant: "destructive"
      });
      
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Call API logout (optional - for server-side session cleanup)
      await authAPI.logout();
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      // Clear local state and tokens
      setUser(null);
      setUserRole(null);
      TokenManager.clearTokens();
      
      toast({
        title: "Đăng xuất thành công",
        description: "Hẹn gặp lại bạn!"
      });
      
      navigate("/login");
    }
  };

  const getDashboardRoute = (role: UserRole): string => {
    switch (role) {
      case "customer":
        return "/customer/dashboard";
      case "technician":
        return "/technician/dashboard";
      case "admin":
        return "/admin/dashboard";
      default:
        return "/";
    }
  };

  const value: AuthContextType = {
    user,
    userRole,
    isAuthenticated: !!user && !!TokenManager.getAccessToken(),
    login,
    logout,
    checkAuth,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
