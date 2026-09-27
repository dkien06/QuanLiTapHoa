import React, { useState } from 'react';
import type { UserRole, LoginCredentials } from '../../types/auth';
import { User, Lock, Eye, EyeOff, LogIn, Loader2 } from 'lucide-react';

interface LoginFormProps {
  role: UserRole;
  onSubmit: (credentials: LoginCredentials) => void;
  isLoading: boolean;
}

export const LoginForm: React.FC<LoginFormProps> = ({ role, onSubmit, isLoading }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ username, password, role });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-left">
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
          Tên đăng nhập hoặc Số điện thoại <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <User className="w-5 h-5" />
          </div>
          <input
            type="text"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Nhập username hoặc SĐT..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-800 text-sm transition-all duration-200"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
          Mật khẩu <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Lock className="w-5 h-5" />
          </div>
          <input
            type={showPassword ? 'text' : 'password'}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Nhập mật khẩu..."
            className="w-full pl-10 pr-11 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-800 text-sm transition-all duration-200"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs pt-1">
        <label className="flex items-center text-slate-600 cursor-pointer">
          <input
            type="checkbox"
            className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
          />
          <span className="ml-2 font-medium">Ghi nhớ đăng nhập</span>
        </label>
        <a href="#" className="font-semibold text-blue-600 hover:text-blue-700 hover:underline">
          Quên mật khẩu?
        </a>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-sm rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:from-blue-700 hover:to-indigo-700 active:scale-[0.99] transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Đang xác thực...</span>
          </>
        ) : (
          <>
            <LogIn className="w-5 h-5" />
            <span>Đăng Nhập {role === 'GROCERY_OWNER' ? 'Tạp Hóa' : 'Nhà Cung Cấp'}</span>
          </>
        )}
      </button>
    </form>
  );
};
