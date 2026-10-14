import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import type { LoginCredentials, AuthError } from '../types/auth';
import { authService } from '../services/authService';
import { AuthLayout } from '../components/auth/AuthLayout';
import { LoginForm } from '../components/auth/LoginForm';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [generalMessage, setGeneralMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Kiểm tra nếu đã có phiên đăng nhập hợp lệ
    const user = authService.getStoredUser();
    if (user && localStorage.getItem('token')) {
      navigate('/dashboard', { replace: true });
    }

    // Nhận thông báo thành công nếu được chuyển hướng từ Đăng ký
    if (location.state?.message) {
      setGeneralMessage({ type: 'success', text: location.state.message });
    }
  }, [navigate, location]);

  const handleLogin = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    setGeneralMessage(null);
    setFieldErrors({});

    try {
      const result = await authService.login(credentials);
      setIsLoading(false);

      if (result.success && result.user) {
        setGeneralMessage({ type: 'success', text: result.message });
        navigate('/dashboard', { replace: true });
      }
    } catch (err: unknown) {
      setIsLoading(false);
      const authError = err as AuthError;

      if (authError.fields && Object.keys(authError.fields).length > 0) {
        setFieldErrors(authError.fields);
      }

      setGeneralMessage({
        type: 'error',
        text: authError.message || 'Đăng nhập thất bại. Vui lòng thử lại.',
      });
    }
  };

  return (
    <AuthLayout>
      {generalMessage && (
        <div
          className={`p-3.5 rounded-2xl text-xs flex items-start space-x-2.5 transition-all ${
            generalMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {generalMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
          )}
          <span className="font-medium leading-relaxed">{generalMessage.text}</span>
        </div>
      )}

      <LoginForm
        onSubmit={handleLogin}
        isLoading={isLoading}
        fieldErrors={fieldErrors}
      />
    </AuthLayout>
  );
};
