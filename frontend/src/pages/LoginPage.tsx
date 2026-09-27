import React, { useState, useEffect } from 'react';
import type { UserRole, LoginCredentials, RegisterCredentials, User } from '../types/auth';
import { authService } from '../services/authService';
import { LoginForm } from '../components/auth/LoginForm';
import { RegisterForm } from '../components/auth/RegisterForm';
import { Store, Factory, ShoppingCart, CheckCircle2, AlertCircle, LogOut, Sparkles } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [role, setRole] = useState<UserRole>('GROCERY_OWNER');
  const [tab, setTab] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }
  }, []);

  const handleLogin = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    setMessage(null);

    const result = await authService.login(credentials);
    setIsLoading(false);

    if (result.success && result.user) {
      setCurrentUser(result.user);
      setMessage({ type: 'success', text: result.message });
    } else {
      setMessage({ type: 'error', text: result.message });
    }
  };

  const handleRegister = async (data: RegisterCredentials) => {
    setIsLoading(true);
    setMessage(null);

    const result = await authService.register(data);
    setIsLoading(false);

    if (result.success) {
      setMessage({ type: 'success', text: result.message });
      setTab('LOGIN');
    } else {
      setMessage({ type: 'error', text: result.message });
    }
  };

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    setMessage({ type: 'success', text: 'Đã đăng xuất thành công!' });
  };

  if (currentUser) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-800 border border-slate-700 rounded-3xl p-8 shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/30">
            <CheckCircle2 className="w-9 h-9 text-white" />
          </div>

          <div>
            <span className="inline-block px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-semibold text-xs rounded-full mb-2">
              {currentUser.role === 'GROCERY_OWNER' ? 'Chủ Tiệm Tạp Hóa' : 'Nhà Cung Cấp / Xưởng'}
            </span>
            <h2 className="text-2xl font-bold text-white mb-1">Xin chào, {currentUser.fullName}!</h2>
            <p className="text-slate-400 text-sm">{currentUser.storeName || 'Hệ thống Quản lý Bán hàng'}</p>
          </div>

          <div className="bg-slate-900/60 rounded-2xl p-4 text-left space-y-2 text-xs text-slate-300 border border-slate-700/50">
            <div className="flex justify-between">
              <span className="text-slate-500">Tên đăng nhập:</span>
              <span className="font-medium text-slate-200">{currentUser.username}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Số điện thoại:</span>
              <span className="font-medium text-slate-200">{currentUser.phone}</span>
            </div>
            {currentUser.storeAddress && (
              <div className="flex justify-between">
                <span className="text-slate-500">Địa chỉ kho:</span>
                <span className="font-medium text-slate-200">{currentUser.storeAddress}</span>
              </div>
            )}
          </div>

          <p className="text-xs text-slate-400 italic">
            Bạn đang đăng nhập vào phiên làm việc Mock Auth. Giao diện POS & Quản lý Kho đang được phát triển tiếp theo.
          </p>

          <button
            onClick={handleLogout}
            className="w-full py-3 px-4 bg-slate-700 hover:bg-slate-600 text-white font-semibold text-sm rounded-xl transition flex items-center justify-center space-x-2 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Đăng Xuất</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100/50">
        {/* Header Hero Section */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-indigo-900 p-6 text-white text-center relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -left-6 -top-6 w-32 h-32 bg-blue-400/10 rounded-full blur-2xl pointer-events-none" />

          <div className="inline-flex items-center justify-center p-3 bg-white/10 backdrop-blur-md rounded-2xl mb-3 shadow-inner">
            <ShoppingCart className="w-8 h-8 text-blue-200" />
          </div>
          <h1 className="text-xl font-extrabold tracking-tight">QUẢN LÝ TẠP HÓA & B2B</h1>
          <p className="text-xs text-blue-200 mt-1 font-medium">Kết nối tiệm tạp hóa với xưởng nhà cung cấp</p>
        </div>

        {/* Body Content */}
        <div className="p-6 md:p-8 space-y-6">

          {/* Role Switcher */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 text-center">
              Chọn Vai Trò Đăng Nhập
            </label>
            <div className="grid grid-cols-2 gap-2.5 p-1 bg-slate-100 rounded-2xl">
              <button
                type="button"
                onClick={() => {
                  setRole('GROCERY_OWNER');
                  setMessage(null);
                }}
                className={`py-2.5 px-3 rounded-xl font-semibold text-xs transition-all flex items-center justify-center space-x-2 cursor-pointer ${
                  role === 'GROCERY_OWNER'
                    ? 'bg-white text-blue-700 shadow-sm border border-slate-200/60'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Store className="w-4 h-4" />
                <span>Chủ Tiệm Tạp Hóa</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setRole('SUPPLIER_OWNER');
                  setMessage(null);
                }}
                className={`py-2.5 px-3 rounded-xl font-semibold text-xs transition-all flex items-center justify-center space-x-2 cursor-pointer ${
                  role === 'SUPPLIER_OWNER'
                    ? 'bg-white text-indigo-700 shadow-sm border border-slate-200/60'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Factory className="w-4 h-4" />
                <span>Nhà Cung Cấp / Xưởng</span>
              </button>
            </div>
          </div>

          {/* Login / Register Tab Toggle */}
          <div className="flex border-b border-slate-200 text-sm font-semibold">
            <button
              onClick={() => {
                setTab('LOGIN');
                setMessage(null);
              }}
              className={`flex-1 pb-3 text-center transition-all cursor-pointer ${
                tab === 'LOGIN'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              Đăng Nhập
            </button>
            <button
              onClick={() => {
                setTab('REGISTER');
                setMessage(null);
              }}
              className={`flex-1 pb-3 text-center transition-all cursor-pointer ${
                tab === 'REGISTER'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              Đăng Ký Tài Khoản
            </button>
          </div>

          {/* Alert Banner */}
          {message && (
            <div
              className={`p-3.5 rounded-2xl text-xs flex items-start space-x-2.5 transition-all ${
                message.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              {message.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
              )}
              <span className="font-medium leading-relaxed">{message.text}</span>
            </div>
          )}

          {/* Form Render */}
          {tab === 'LOGIN' ? (
            <LoginForm role={role} onSubmit={handleLogin} isLoading={isLoading} />
          ) : (
            <RegisterForm role={role} onSubmit={handleRegister} isLoading={isLoading} />
          )}

          {/* Footer Note */}
          <div className="pt-2 text-center text-xs text-slate-400 flex items-center justify-center space-x-1">
            <Sparkles className="w-3.5 h-3.5 text-blue-500" />
            <span>FastAPI Backend & React TypeScript Decoupled Architecture</span>
          </div>
        </div>
      </div>
    </div>
  );
};
