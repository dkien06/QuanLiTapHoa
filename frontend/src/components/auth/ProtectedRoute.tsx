import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { authService } from '../../services/authService';
import { Loader2 } from 'lucide-react';
import { MOCK_MODE } from '../../mock/mockConfig';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const location = useLocation();
  const [isValidating, setIsValidating] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return Boolean(localStorage.getItem('token') && authService.getStoredUser());
  });

  useEffect(() => {
    const verifySession = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsAuthenticated(false);
        setIsValidating(false);
        return;
      }

      try {
        const user = await authService.getCurrentUser();
        if (user) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch {
        // Token không hợp lệ hoặc lỗi
        setIsAuthenticated(false);
      } finally {
        setIsValidating(false);
      }
    };

    verifySession();
  }, []);

  if (isValidating) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <p className="text-xs text-slate-400">Đang kiểm tra phiên làm việc...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Dashboard analytics APIs exist; inventory, POS and purchase-order APIs are not yet wired.
  if (!MOCK_MODE && location.pathname !== '/dashboard') {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
        <section className="max-w-lg rounded-2xl border border-amber-200 bg-white p-6 shadow-sm">
          <h1 className="text-lg font-bold text-slate-900">API chưa sẵn sàng cho màn hình này</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            MOCK_MODE đang tắt nên ứng dụng không dùng dữ liệu mẫu. Dashboard vẫn tải dữ liệu qua API;
            kho, POS và đơn nhập cần endpoint backend trước khi có thể sử dụng ở chế độ này.
          </p>
        </section>
      </main>
    );
  }

  return <>{children}</>;
};
