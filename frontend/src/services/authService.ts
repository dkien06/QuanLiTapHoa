import api from './api';
import type { LoginCredentials, RegisterCredentials, AuthResponse, User } from '../types/auth';

// Toggle mock mode when backend is offline or during frontend development
const MOCK_MODE = true;

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    if (MOCK_MODE) {
      // Simulate API latency
      await new Promise((resolve) => setTimeout(resolve, 800));

      if (!credentials.username || !credentials.password) {
        return {
          success: false,
          message: 'Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu!',
        };
      }

      if (credentials.password.length < 4) {
        return {
          success: false,
          message: 'Mật khẩu phải có ít nhất 4 ký tự!',
        };
      }

      const mockUser: User = {
        id: 1,
        username: credentials.username,
        fullName: credentials.role === 'GROCERY_OWNER' ? 'Chủ Tiệm Tạp Hóa A' : 'Quản Lý Xưởng B',
        phone: '0901234567',
        role: credentials.role,
        storeName: credentials.role === 'GROCERY_OWNER' ? 'Tạp Hóa Bình An' : 'Xưởng Thực Phẩm Việt',
      };

      const token = 'mock_jwt_token_' + Date.now();
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(mockUser));

      return {
        success: true,
        message: 'Đăng nhập thành công!',
        token,
        user: mockUser,
      };
    }

    try {
      const response = await api.post<AuthResponse>('/auth/login', credentials);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        if (response.data.user) {
          localStorage.setItem('user', JSON.stringify(response.data.user));
        }
      }
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.detail || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin!',
      };
    }
  },

  async register(data: RegisterCredentials): Promise<AuthResponse> {
    if (MOCK_MODE) {
      await new Promise((resolve) => setTimeout(resolve, 800));

      if (!data.username || !data.password || !data.fullName || !data.phone || !data.storeName) {
        return {
          success: false,
          message: 'Vui lòng điền đầy đủ các thông tin bắt buộc (*)!',
        };
      }

      const mockUser: User = {
        id: Date.now(),
        username: data.username,
        fullName: data.fullName,
        phone: data.phone,
        email: data.email,
        role: data.role,
        storeName: data.storeName,
        storeAddress: data.storeAddress,
      };

      return {
        success: true,
        message: 'Tạo tài khoản và yêu cầu tạo kho thành công! Đã gửi duyệt.',
        user: mockUser,
      };
    }

    try {
      const response = await api.post<AuthResponse>('/auth/register', data);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.detail || 'Đăng ký thất bại. Vui lòng thử lại!',
      };
    }
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }
};
