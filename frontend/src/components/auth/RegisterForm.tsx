import React, { useState } from 'react';
import type { UserRole, RegisterCredentials } from '../../types/auth';
import { User, Lock, Phone, Mail, Store, MapPin, UserPlus, Loader2 } from 'lucide-react';

interface RegisterFormProps {
  role: UserRole;
  onSubmit: (data: RegisterCredentials) => void;
  isLoading: boolean;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ role, onSubmit, isLoading }) => {
  const [formData, setFormData] = useState<RegisterCredentials>({
    fullName: '',
    phone: '',
    email: '',
    username: '',
    password: '',
    role: role,
    storeName: '',
    storeAddress: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ ...formData, role });
  };

  const isGrocery = role === 'GROCERY_OWNER';

  return (
    <form onSubmit={handleSubmit} className="space-y-3.5 text-left">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Họ và tên <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <User className="w-4 h-4" />
            </div>
            <input
              type="text"
              name="fullName"
              required
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Nguyễn Văn A"
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-800 text-xs transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Số điện thoại <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Phone className="w-4 h-4" />
            </div>
            <input
              type="tel"
              name="phone"
              required
              value={formData.phone}
              onChange={handleChange}
              placeholder="0901234567"
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-800 text-xs transition-all"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Mail className="w-4 h-4" />
          </div>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="example@gmail.com"
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-800 text-xs transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            {isGrocery ? 'Tên cửa hàng / tiệm' : 'Tên xưởng / nhà cung cấp'} <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Store className="w-4 h-4" />
            </div>
            <input
              type="text"
              name="storeName"
              required
              value={formData.storeName}
              onChange={handleChange}
              placeholder={isGrocery ? 'Tạp hóa An Bình' : 'Xưởng Nông Sản Việt'}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-800 text-xs transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Địa chỉ kho/tiệm</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <MapPin className="w-4 h-4" />
            </div>
            <input
              type="text"
              name="storeAddress"
              value={formData.storeAddress}
              onChange={handleChange}
              placeholder="Quận 1, TP. Hồ Chí Minh"
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-800 text-xs transition-all"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 border-t border-slate-100 pt-2.5">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Tên đăng nhập <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <User className="w-4 h-4" />
            </div>
            <input
              type="text"
              name="username"
              required
              value={formData.username}
              onChange={handleChange}
              placeholder="username123"
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-800 text-xs transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Mật khẩu <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Lock className="w-4 h-4" />
            </div>
            <input
              type="password"
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              placeholder="Mật khẩu ít nhất 4 ký tự"
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-800 text-xs transition-all"
            />
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full mt-3 py-2.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold text-xs rounded-xl shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/35 hover:from-emerald-700 hover:to-teal-700 active:scale-[0.99] transition-all flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Đang xử lý đăng ký...</span>
          </>
        ) : (
          <>
            <UserPlus className="w-4 h-4" />
            <span>Tạo Tài Khoản & Gửi Duyệt Kho</span>
          </>
        )}
      </button>
    </form>
  );
};
