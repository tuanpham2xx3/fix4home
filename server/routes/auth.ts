import { RequestHandler } from "express";
import { ApiResponse } from "@shared/api";

// Mock user database
const mockUsers = [
  {
    id: 1,
    email: "customer@test.com",
    password: "123456",
    role: "customer",
    fullName: "Nguyen Van Customer",
    phone: "0901234567",
    isActive: true,
    avatar: null
  },
  {
    id: 2,
    email: "technician@test.com", 
    password: "123456",
    role: "technician",
    fullName: "Tran Van Technician",
    phone: "0901234568",
    isActive: true,
    avatar: null
  },
  {
    id: 3,
    email: "admin@test.com",
    password: "123456", 
    role: "admin",
    fullName: "Le Van Admin",
    phone: "0901234569",
    isActive: true,
    avatar: null
  }
];

// Generate simple JWT-like token (for demo purposes only)
function generateToken(user: any): string {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
  };
  
  // Simple base64 encoding (NOT secure, for demo only)
  return Buffer.from(JSON.stringify(payload)).toString('base64');
}

// Login endpoint
export const handleLogin: RequestHandler = (req, res) => {
  const { usernameOrEmail, password } = req.body;

  // Find user by email
  const user = mockUsers.find(u => 
    u.email === usernameOrEmail || u.phone === usernameOrEmail
  );

  if (!user || user.password !== password) {
    const response: ApiResponse<null> = {
      success: false,
      message: "Email hoặc mật khẩu không đúng",
      data: null,
      timestamp: new Date().toISOString()
    };
    return res.status(401).json(response);
  }

  if (!user.isActive) {
    const response: ApiResponse<null> = {
      success: false,
      message: "Tài khoản đã bị khóa",
      data: null,
      timestamp: new Date().toISOString()
    };
    return res.status(403).json(response);
  }

  // Generate tokens
  const accessToken = generateToken(user);
  const refreshToken = generateToken(user); // In real app, this would be different

  // Remove password from user data
  const { password: _, ...userData } = user;

  const response: ApiResponse<any> = {
    success: true,
    message: "Đăng nhập thành công",
    data: {
      accessToken,
      refreshToken,
      user: userData
    },
    timestamp: new Date().toISOString()
  };

  res.status(200).json(response);
};

// Get current user endpoint
export const handleGetCurrentUser: RequestHandler = (req, res) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    const response: ApiResponse<null> = {
      success: false,
      message: "Token không hợp lệ",
      data: null,
      timestamp: new Date().toISOString()
    };
    return res.status(401).json(response);
  }

  try {
    const token = authHeader.substring(7); // Remove 'Bearer '
    const payload = JSON.parse(Buffer.from(token, 'base64').toString());
    
    // Check if token is expired
    if (payload.exp < Math.floor(Date.now() / 1000)) {
      const response: ApiResponse<null> = {
        success: false,
        message: "Token đã hết hạn",
        data: null,
        timestamp: new Date().toISOString()
      };
      return res.status(401).json(response);
    }

    // Find user
    const user = mockUsers.find(u => u.id === payload.id);
    if (!user) {
      const response: ApiResponse<null> = {
        success: false,
        message: "Người dùng không tồn tại",
        data: null,
        timestamp: new Date().toISOString()
      };
      return res.status(404).json(response);
    }

    // Remove password from user data
    const { password: _, ...userData } = user;

    const response: ApiResponse<any> = {
      success: true,
      message: "Lấy thông tin người dùng thành công",
      data: userData,
      timestamp: new Date().toISOString()
    };

    res.status(200).json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      message: "Token không hợp lệ",
      data: null,
      timestamp: new Date().toISOString()
    };
    return res.status(401).json(response);
  }
};

// Logout endpoint
export const handleLogout: RequestHandler = (req, res) => {
  const response: ApiResponse<null> = {
    success: true,
    message: "Đăng xuất thành công",
    data: null,
    timestamp: new Date().toISOString()
  };

  res.status(200).json(response);
};

// Refresh token endpoint
export const handleRefreshToken: RequestHandler = (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    const response: ApiResponse<null> = {
      success: false,
      message: "Refresh token không hợp lệ",
      data: null,
      timestamp: new Date().toISOString()
    };
    return res.status(401).json(response);
  }

  try {
    const payload = JSON.parse(Buffer.from(refreshToken, 'base64').toString());
    
    // Find user
    const user = mockUsers.find(u => u.id === payload.id);
    if (!user) {
      const response: ApiResponse<null> = {
        success: false,
        message: "Người dùng không tồn tại",
        data: null,
        timestamp: new Date().toISOString()
      };
      return res.status(404).json(response);
    }

    // Generate new tokens
    const newAccessToken = generateToken(user);
    const newRefreshToken = generateToken(user);

    const response: ApiResponse<any> = {
      success: true,
      message: "Làm mới token thành công",
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
      },
      timestamp: new Date().toISOString()
    };

    res.status(200).json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      message: "Refresh token không hợp lệ",
      data: null,
      timestamp: new Date().toISOString()
    };
    return res.status(401).json(response);
  }
};
