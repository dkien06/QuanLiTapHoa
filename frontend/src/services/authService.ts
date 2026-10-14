import api from './api';
import type {
  LoginCredentials,
  RegisterCredentials,
  LoginResponse,
  RegisterResponse,
  User,
  AuthError,
  AuthErrorResponse,
  AuthErrorDetail,
  FastApiValidationErrorItem,
} from '../types/auth';

// Chuyển sang false khi backend đã sẵn sàng
const MOCK_MODE = true;

class CustomAuthError extends Error implements AuthError {
  code?: string;
  fields?: Record<string, string>;
  status?: number;

  constructor(message: string, code?: string, fields?: Record<string, string>, status?: number) {
    super(message);
    this.name = 'AuthError';
    this.code = code;
    this.fields = fields;
    this.status = status;
  }
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    if (MOCK_MODE) {
      await new Promise((resolve) => setTimeout(resolve, 600));

      const fieldErrors: Record<string, string> = {};
      if (!credentials.username?.trim()) {
        fieldErrors.username = 'Vui lòng nhập tên đăng nhập.';
      }
      if (!credentials.password) {
        fieldErrors.password = 'Vui lòng nhập mật khẩu.';
      }

      if (Object.keys(fieldErrors).length > 0) {
        throw new CustomAuthError(
          'Dữ liệu không hợp lệ.',
          'VALIDATION_ERROR',
          fieldErrors,
          422
        );
      }

      // Giả lập tài khoản bị khóa
      if (credentials.username === 'locked_user') {
        throw new CustomAuthError(
          'Tài khoản không hoạt động.',
          'ACCOUNT_INACTIVE',
          {},
          403
        );
      }

      // Giả lập sai thông tin đăng nhập
      if (credentials.password === 'wrong_password') {
        throw new CustomAuthError(
          'Sai thông tin đăng nhập.',
          'UNAUTHORIZED',
          {},
          401
        );
      }

      const mockUser: User = {
        id: '8d45950f-a79c-4891-a413-b8e80515c624',
        username: credentials.username || 'tiem_binh_an',
        fullName: 'Nguyễn Văn An',
        phone: '0901234567',
        role: 'OWNER',
        storeId: 'df935abc-4021-4c20-bad4-3241e85ca2b2',
        storeType: 'GROCERY',
        storeName: 'Tạp hóa Bình An',
        storeAddress: '123 Nguyễn Trãi',
      };

      const token = `access-token-${Date.now()}`;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(mockUser));

      return {
        success: true,
        message: 'Đăng nhập thành công.',
        token,
        tokenType: 'bearer',
        expiresIn: 3600,
        user: mockUser,
      };
    }

    try {
      const response = await api.post<LoginResponse>('/auth/login', credentials);
      const data = response.data;

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      return data;
    } catch (error: unknown) {
      throw this.handleAuthError(error);
    }
  },

  async register(data: RegisterCredentials): Promise<RegisterResponse> {
    if (MOCK_MODE) {
      await new Promise((resolve) => setTimeout(resolve, 600));

      const fieldErrors: Record<string, string> = {};
      if (!data.username?.trim()) fieldErrors.username = 'Tên đăng nhập không được để trống.';
      if (!data.password) fieldErrors.password = 'Mật khẩu không được để trống.';
      if (!data.fullName?.trim()) fieldErrors.fullName = 'Họ và tên không được để trống.';
      if (!data.phone?.trim()) fieldErrors.phone = 'Số điện thoại chủ không được để trống.';
      if (!data.storeName?.trim()) fieldErrors.storeName = 'Tên cửa hàng không được để trống.';
      if (!data.storePhone?.trim()) fieldErrors.storePhone = 'Số điện thoại cửa hàng không được để trống.';
      if (!data.storeAddress?.trim()) fieldErrors.storeAddress = 'Địa chỉ cửa hàng không được để trống.';

      if (Object.keys(fieldErrors).length > 0) {
        throw new CustomAuthError(
          'Dữ liệu không hợp lệ.',
          'VALIDATION_ERROR',
          fieldErrors,
          422
        );
      }

      // Giả lập username đã tồn tại khi test
      if (data.username === 'taken_user') {
        throw new CustomAuthError(
          'Tên đăng nhập đã tồn tại.',
          'USERNAME_TAKEN',
          { username: 'Vui lòng chọn tên khác.' },
          409
        );
      }

      return {
        success: true,
        message: 'Tạo tài khoản thành công. Vui lòng đăng nhập.',
      };
    }

    try {
      const response = await api.post<RegisterResponse>('/auth/register', data);
      return response.data;
    } catch (error: unknown) {
      throw this.handleAuthError(error);
    }
  },

  async getCurrentUser(): Promise<User | null> {
    const token = localStorage.getItem('token');
    if (!token) {
      return null;
    }

    if (MOCK_MODE) {
      const user = this.getStoredUser();
      if (!user) {
        this.logout();
        return null;
      }
      return user;
    }

    try {
      // Header Authorization Bearer token được gắn tự động qua interceptor trong api.ts
      const response = await api.get<User>('/auth/me');
      const user = response.data;
      localStorage.setItem('user', JSON.stringify(user));
      return user;
    } catch (error: unknown) {
      const status = this.getErrorStatus(error);

      // Token không hợp lệ hoặc hết hạn
      if (status === 401) {
        this.logout();
        return null;
      }

      throw this.handleAuthError(error);
    }
  },

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getStoredUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      return null;
    }

    try {
      return JSON.parse(userStr) as User;
    } catch {
      return null;
    }
  },

  handleAuthError(error: unknown): AuthError {
    if (error instanceof CustomAuthError) {
      return error;
    }

    const status = this.getErrorStatus(error);
    const responseData = this.getErrorData(error);
    const detail = responseData?.detail;

    let code: string | undefined;
    let message = 'Đã có lỗi xảy ra. Vui lòng thử lại.';
    let fields: Record<string, string> | undefined;

    // Xử lý các kiểu định dạng của detail
    if (typeof detail === 'string') {
      message = detail;
    } else if (Array.isArray(detail)) {
      // FastAPI default 422 validation errors array
      code = 'VALIDATION_ERROR';
      message = 'Dữ liệu không hợp lệ.';
      fields = {};
      detail.forEach((item: FastApiValidationErrorItem) => {
        const fieldName = String(item.loc[item.loc.length - 1]);
        fields![fieldName] = item.msg;
      });
    } else if (typeof detail === 'object' && detail !== null) {
      // Thống nhất chuẩn theo hợp đồng: { code, message, fields }
      const detailObj = detail as AuthErrorDetail;
      code = detailObj.code;
      if (detailObj.message) {
        message = detailObj.message;
      }
      if (detailObj.fields) {
        fields = detailObj.fields;
      }
    }

    // Áp dụng chuẩn hóa theo status code
    if (status === 409) {
      code = code || 'USERNAME_TAKEN';
      message = message || 'Tên đăng nhập đã tồn tại.';
      if (!fields || Object.keys(fields).length === 0) {
        fields = { username: 'Vui lòng chọn tên khác.' };
      }
    } else if (status === 422) {
      code = code || 'VALIDATION_ERROR';
      message = message || 'Dữ liệu không hợp lệ.';
    } else if (status === 401) {
      code = code || 'UNAUTHORIZED';
      message = message || 'Sai thông tin đăng nhập.';
    } else if (status === 403) {
      code = code || 'ACCOUNT_INACTIVE';
      message = message || 'Tài khoản không hoạt động.';
    } else if (status === undefined) {
      message = 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại đường truyền.';
    } else if (status >= 500) {
      message = 'Có lỗi xảy ra trên máy chủ. Vui lòng thử lại sau.';
    }

    return new CustomAuthError(message, code, fields, status);
  },

  getErrorStatus(error: unknown): number | undefined {
    if (typeof error === 'object' && error !== null && 'response' in error) {
      const response = (error as { response?: { status?: number } }).response;
      return response?.status;
    }
    return undefined;
  },

  getErrorData(error: unknown): AuthErrorResponse | undefined {
    if (typeof error === 'object' && error !== null && 'response' in error) {
      const response = (error as { response?: { data?: AuthErrorResponse } }).response;
      return response?.data;
    }
    return undefined;
  },
};