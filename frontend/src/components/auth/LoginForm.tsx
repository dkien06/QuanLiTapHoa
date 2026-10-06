import React, { useState } from 'react';
import type { LoginCredentials } from '../../types/auth';
import { User, Lock, Eye, EyeOff, LogIn, Loader2, AlertCircle } from 'lucide-react';

interface LoginFormProps {
  onSubmit: (credentials: LoginCredentials) => void;
  isLoading: boolean;
  fieldErrors?: Record<string, string>;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onSubmit,
  isLoading,
  fieldErrors = {},
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ username: username.trim(), password });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-left">
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
          Tên đăng nhập <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <User className="w-5 h-5" />
          </div>
          <input
            type="text"
            required
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="tiem_binh_an"
            className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:bg-white text-slate-800 text-sm transition-all duration-200 ${
              fieldErrors.username
                ? 'border-red-400 focus:ring-red-500 bg-red-50/40'
                : 'border-slate-200 focus:ring-blue-500'
            }`}
          />
        </div>
        {fieldErrors.username && (
          <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1 font-medium">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{fieldErrors.username}</span>
          </p>
        )}
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
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Nhập mật khẩu..."
            className={`w-full pl-10 pr-11 py-2.5 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:bg-white text-slate-800 text-sm transition-all duration-200 ${
              fieldErrors.password
                ? 'border-red-400 focus:ring-red-500 bg-red-50/40'
                : 'border-slate-200 focus:ring-blue-500'
            }`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
        {fieldErrors.password && (
          <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1 font-medium">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{fieldErrors.password}</span>
          </p>
        )}
      </div>

      <div className="flex items-center justify-between text-xs pt-1">
        <label className="flex items-center text-slate-600 cursor-pointer select-none">
          <input
            type="checkbox"
            className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
          />
          <span className="ml-2 font-medium">Ghi nhớ đăng nhập</span>
        </label>
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            alert('Vui lòng liên hệ quản trị viên để khôi phục mật khẩu.');
          }}
          className="font-semibold text-blue-600 hover:text-blue-700 hover:underline"
        >
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
            <span>Đăng Nhập Quản Lý</span>
          </>
        )}
      </button>
    </form>
  );
};
