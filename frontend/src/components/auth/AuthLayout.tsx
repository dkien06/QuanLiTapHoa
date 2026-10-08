import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Store, ShoppingBag, ShieldCheck } from 'lucide-react';

interface AuthLayoutProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  title = 'HỆ THỐNG QUẢN LÝ TẠP HÓA',
  subtitle = 'Phần mềm quản lý bán hàng & vận hành cửa hàng tạp hóa',
  children,
}) => {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100/50">
        {/* Header Hero Section */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-indigo-900 p-6 text-white text-center relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -left-6 -top-6 w-32 h-32 bg-blue-400/10 rounded-full blur-2xl pointer-events-none" />

          <div className="inline-flex items-center justify-center p-3 bg-white/10 backdrop-blur-md rounded-2xl mb-3 shadow-inner">
            <Store className="w-8 h-8 text-blue-200" />
          </div>
          <h1 className="text-xl font-extrabold tracking-tight">{title}</h1>
          <p className="text-xs text-blue-200 mt-1 font-medium">{subtitle}</p>

          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-[11px] text-blue-100 font-medium">
            <ShoppingBag className="w-3.5 h-3.5 text-blue-300" />
            <span>Dành cho Chủ Tiệm Tạp Hóa & Nhà Cung Cấp B2B</span>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-6 md:p-8 space-y-6">
          {/* Router Tab Toggle between /login and /register */}
          <div className="flex border-b border-slate-200 text-sm font-semibold">
            <Link
              to="/login"
              className={`flex-1 pb-3 text-center transition-all cursor-pointer ${
                isLoginPage
                  ? 'text-blue-600 border-b-2 border-blue-600 font-bold'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              Đăng Nhập
            </Link>
            <Link
              to="/register"
              className={`flex-1 pb-3 text-center transition-all cursor-pointer ${
                !isLoginPage
                  ? 'text-blue-600 border-b-2 border-blue-600 font-bold'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              Đăng Ký Cơ Sở & Tài Khoản
            </Link>
          </div>

          {/* Form Content */}
          {children}

          {/* Footer Note */}
          <div className="pt-2 text-center text-xs text-slate-400 flex items-center justify-center space-x-1.5">
            <ShieldCheck className="w-4 h-4 text-blue-500" />
            <span>Hệ thống bảo mật xác thực JWT & Phân quyền tiêu chuẩn</span>
          </div>
        </div>
      </div>
    </div>
  );
};
