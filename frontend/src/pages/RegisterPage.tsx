import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { RegisterCredentials, AuthError } from '../types/auth';
import { authService } from '../services/authService';
import { AuthLayout } from '../components/auth/AuthLayout';
import { RegisterForm } from '../components/auth/RegisterForm';
import { AlertCircle } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Kiểm tra nếu đã có phiên đăng nhập hợp lệ
    const user = authService.getStoredUser();
    if (user && localStorage.getItem('token')) {
      navigate('/dashboard', { replace: true });
    }
  }, [navigate]);

  const handleRegister = async (data: RegisterCredentials) => {
    setIsLoading(true);
    setGeneralError(null);
    setFieldErrors({});

    try {
      const result = await authService.register(data);
      setIsLoading(false);

      if (result.success) {
        // Chuyển hướng sang /login và truyền message thành công
        navigate('/login', {
          state: { message: result.message },
          replace: true,
        });
      }
    } catch (err: unknown) {
      setIsLoading(false);
      const authError = err as AuthError;

      if (authError.fields && Object.keys(authError.fields).length > 0) {
        setFieldErrors(authError.fields);
      }

      setGeneralError(authError.message || 'Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.');
    }
  };

  return (
    <AuthLayout>
      {generalError && (
        <div className="p-3.5 rounded-2xl text-xs flex items-start space-x-2.5 bg-red-50 text-red-800 border border-red-200 transition-all">
          <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
          <span className="font-medium leading-relaxed">{generalError}</span>
        </div>
      )}

      <RegisterForm
        onSubmit={handleRegister}
        isLoading={isLoading}
        fieldErrors={fieldErrors}
      />
    </AuthLayout>
  );
};
