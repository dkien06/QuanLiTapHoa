import React, { useState } from 'react';
import type { RegisterCredentials, StoreType } from '../../types/auth';
import {
  User,
  Lock,
  Phone,
  Store,
  Factory,
  MapPin,
  UserPlus,
  Loader2,
  AlertCircle,
  Building2,
  Check,
} from 'lucide-react';

interface RegisterFormProps {
  onSubmit: (data: RegisterCredentials) => void;
  isLoading: boolean;
  fieldErrors?: Record<string, string>;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({
  onSubmit,
  isLoading,
  fieldErrors = {},
}) => {
  const [formData, setFormData] = useState<RegisterCredentials>({
    fullName: '',
    phone: '',
    username: '',
    password: '',
    storeName: '',
    storeType: 'GROCERY',
    storePhone: '',
    storeAddress: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleStoreTypeSelect = (type: StoreType) => {
    setFormData({ ...formData, storeType: type });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      username: formData.username.trim(),
      fullName: formData.fullName.trim(),
      phone: formData.phone.trim(),
      storeName: formData.storeName.trim(),
      storePhone: formData.storePhone.trim(),
      storeAddress: formData.storeAddress.trim(),
    });
  };

  const isGrocery = formData.storeType === 'GROCERY';

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-left">
      {/* Chọn loại hình cơ sở */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
          Loại hình kinh doanh <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 gap-2.5 p-1 bg-slate-100 rounded-2xl">
          <button
            type="button"
            onClick={() => handleStoreTypeSelect('GROCERY')}
            className={`py-2.5 px-3 rounded-xl font-semibold text-xs transition-all flex items-center justify-center space-x-2 cursor-pointer ${
              isGrocery
                ? 'bg-white text-blue-700 shadow-sm border border-slate-200/80 font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Store className={`w-4 h-4 ${isGrocery ? 'text-blue-600' : 'text-slate-400'}`} />
            <span>Tiệm Tạp Hóa</span>
            {isGrocery && <Check className="w-3.5 h-3.5 text-blue-600 ml-1" />}
          </button>

          <button
            type="button"
            onClick={() => handleStoreTypeSelect('SUPPLIER')}
            className={`py-2.5 px-3 rounded-xl font-semibold text-xs transition-all flex items-center justify-center space-x-2 cursor-pointer ${
              !isGrocery
                ? 'bg-white text-indigo-700 shadow-sm border border-slate-200/80 font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Factory className={`w-4 h-4 ${!isGrocery ? 'text-indigo-600' : 'text-slate-400'}`} />
            <span>Nhà Cung Cấp / Xưởng</span>
            {!isGrocery && <Check className="w-3.5 h-3.5 text-indigo-600 ml-1" />}
          </button>
        </div>
        {fieldErrors.storeType && (
          <p className="mt-1 text-[11px] text-red-600 flex items-center gap-1">
            <AlertCircle className="w-3 h-3 shrink-0" />
            <span>{fieldErrors.storeType}</span>
          </p>
        )}
      </div>

      {/* Group 1: Thông tin chủ sở hữu */}
      <div className="space-y-3 pt-1">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 pb-1 border-b border-slate-100">
          <User className="w-3.5 h-3.5 text-blue-600" />
          <span>Thông tin chủ tài khoản</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Họ và tên chủ cơ sở <span className="text-red-500">*</span>
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
                placeholder="Nguyễn Văn An"
                className={`w-full pl-9 pr-3 py-2 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:bg-white text-slate-800 text-xs transition-all ${
                  fieldErrors.fullName
                    ? 'border-red-400 focus:ring-red-500 bg-red-50/40'
                    : 'border-slate-200 focus:ring-blue-500'
                }`}
              />
            </div>
            {fieldErrors.fullName && (
              <p className="mt-1 text-[11px] text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span>{fieldErrors.fullName}</span>
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Số điện thoại chủ <span className="text-red-500">*</span>
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
                className={`w-full pl-9 pr-3 py-2 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:bg-white text-slate-800 text-xs transition-all ${
                  fieldErrors.phone
                    ? 'border-red-400 focus:ring-red-500 bg-red-50/40'
                    : 'border-slate-200 focus:ring-blue-500'
                }`}
              />
            </div>
            {fieldErrors.phone && (
              <p className="mt-1 text-[11px] text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span>{fieldErrors.phone}</span>
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                autoComplete="username"
                value={formData.username}
                onChange={handleChange}
                placeholder={isGrocery ? 'tiem_binh_an' : 'xuong_nong_san'}
                className={`w-full pl-9 pr-3 py-2 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:bg-white text-slate-800 text-xs transition-all ${
                  fieldErrors.username
                    ? 'border-red-400 focus:ring-red-500 bg-red-50/40'
                    : 'border-slate-200 focus:ring-blue-500'
                }`}
              />
            </div>
            {fieldErrors.username && (
              <p className="mt-1 text-[11px] text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span>{fieldErrors.username}</span>
              </p>
            )}
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
                autoComplete="new-password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Mật khẩu bảo mật"
                className={`w-full pl-9 pr-3 py-2 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:bg-white text-slate-800 text-xs transition-all ${
                  fieldErrors.password
                    ? 'border-red-400 focus:ring-red-500 bg-red-50/40'
                    : 'border-slate-200 focus:ring-blue-500'
                }`}
              />
            </div>
            {fieldErrors.password && (
              <p className="mt-1 text-[11px] text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span>{fieldErrors.password}</span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Group 2: Thông tin cơ sở / Cửa hàng / Kho xưởng */}
      <div className="space-y-3 pt-2">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 pb-1 border-b border-slate-100">
          <Building2 className="w-3.5 h-3.5 text-blue-600" />
          <span>{isGrocery ? 'Thông tin Tiệm Tạp Hóa' : 'Thông tin Nhà Cung Cấp / Xưởng'}</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {isGrocery ? 'Tên tiệm tạp hóa' : 'Tên nhà cung cấp / xưởng'} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                {isGrocery ? <Store className="w-4 h-4" /> : <Factory className="w-4 h-4" />}
              </div>
              <input
                type="text"
                name="storeName"
                required
                value={formData.storeName}
                onChange={handleChange}
                placeholder={isGrocery ? 'Tạp hóa Bình An' : 'Xưởng Nông Sản Việt'}
                className={`w-full pl-9 pr-3 py-2 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:bg-white text-slate-800 text-xs transition-all ${
                  fieldErrors.storeName
                    ? 'border-red-400 focus:ring-red-500 bg-red-50/40'
                    : 'border-slate-200 focus:ring-blue-500'
                }`}
              />
            </div>
            {fieldErrors.storeName && (
              <p className="mt-1 text-[11px] text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span>{fieldErrors.storeName}</span>
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {isGrocery ? 'Số điện thoại tiệm' : 'Số hotline xưởng'} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Phone className="w-4 h-4" />
              </div>
              <input
                type="tel"
                name="storePhone"
                required
                value={formData.storePhone}
                onChange={handleChange}
                placeholder="0901234567"
                className={`w-full pl-9 pr-3 py-2 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:bg-white text-slate-800 text-xs transition-all ${
                  fieldErrors.storePhone
                    ? 'border-red-400 focus:ring-red-500 bg-red-50/40'
                    : 'border-slate-200 focus:ring-blue-500'
                }`}
              />
            </div>
            {fieldErrors.storePhone && (
              <p className="mt-1 text-[11px] text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span>{fieldErrors.storePhone}</span>
              </p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            {isGrocery ? 'Địa chỉ tiệm tạp hóa' : 'Địa chỉ kho xưởng'} <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <MapPin className="w-4 h-4" />
            </div>
            <input
              type="text"
              name="storeAddress"
              required
              value={formData.storeAddress}
              onChange={handleChange}
              placeholder={
                isGrocery
                  ? '123 Nguyễn Trãi, Phường 2, Quận 5, TP.HCM'
                  : 'Khu công nghiệp Tân Bình, TP.HCM'
              }
              className={`w-full pl-9 pr-3 py-2 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:bg-white text-slate-800 text-xs transition-all ${
                fieldErrors.storeAddress
                  ? 'border-red-400 focus:ring-red-500 bg-red-50/40'
                  : 'border-slate-200 focus:ring-blue-500'
              }`}
            />
          </div>
          {fieldErrors.storeAddress && (
            <p className="mt-1 text-[11px] text-red-600 flex items-center gap-1">
              <AlertCircle className="w-3 h-3 shrink-0" />
              <span>{fieldErrors.storeAddress}</span>
            </p>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full mt-4 py-3 px-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 text-white font-semibold text-xs rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-blue-500/35 hover:from-blue-700 hover:to-indigo-800 active:scale-[0.99] transition-all flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Đang khởi tạo cơ sở & tài khoản...</span>
          </>
        ) : (
          <>
            <UserPlus className="w-4 h-4" />
            <span>
              {isGrocery
                ? 'Đăng Ký Cơ Sở Tạp Hóa & Tài Khoản Chủ'
                : 'Đăng Ký Nhà Cung Cấp & Tài Khoản Chủ'}
            </span>
          </>
        )}
      </button>
    </form>
  );
};
