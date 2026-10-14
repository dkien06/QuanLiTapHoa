import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
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

  return <>{children}</>;
};
