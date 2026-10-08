import React from 'react';
import type { User } from '../../types/auth';
import { Store, ShoppingCart, Boxes, BarChart3, LogOut, MapPin } from 'lucide-react';

export type DashboardTab = 'OVERVIEW' | 'POS' | 'INVENTORY';

interface SidebarProps {
  user: User;
  activeMenu: DashboardTab;
  onSelectMenu: (menu: DashboardTab) => void;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  user,
  activeMenu,
  onSelectMenu,
  onLogout,
}) => {
  return (
    <aside className="w-full md:w-64 bg-slate-900 text-white flex flex-col shrink-0 border-r border-slate-800">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800 flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
          <Store className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="font-bold text-sm tracking-tight text-white leading-tight">QUẢN LÝ TẠP HÓA</h1>
          <span className="text-[11px] text-slate-400 font-medium">Bán lẻ & Quản lý Kho</span>
        </div>
      </div>

      {/* User Info Capsule */}
      <div className="p-4 mx-3 my-3 bg-slate-800/80 rounded-2xl border border-slate-700/60 space-y-2">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold text-xs uppercase shrink-0">
            {user.fullName ? user.fullName.charAt(0) : 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">{user.fullName}</p>
            <p className="text-[10px] text-slate-400 truncate font-mono">@{user.username}</p>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
            {user.storeType === 'SUPPLIER' ? 'Nhà Cung Cấp' : 'Chủ Tiệm'}
          </span>
        </div>

        <div className="pt-1 border-t border-slate-700/40 text-[11px] text-slate-300">
          <div className="font-medium text-white truncate flex items-center gap-1">
            <Store className="w-3 h-3 text-blue-400 shrink-0" />
            <span className="truncate">{user.storeName || 'Tạp hóa Bình An'}</span>
          </div>
          {user.storeAddress && (
            <div className="text-[10px] text-slate-400 truncate flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
              <span className="truncate">{user.storeAddress}</span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-3 py-2 space-y-1.5">
        <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Chức Năng Chính</p>

        <button
          type="button"
          onClick={() => onSelectMenu('OVERVIEW')}
          className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
            activeMenu === 'OVERVIEW'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : 'text-slate-300 hover:bg-slate-800 hover:text-white'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Tổng Quan & Thống Kê</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectMenu('POS')}
          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
            activeMenu === 'POS'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : 'text-slate-300 hover:bg-slate-800 hover:text-white'
          }`}
        >
          <div className="flex items-center space-x-3">
            <ShoppingCart className="w-4 h-4" />
            <span>Bán Hàng (POS)</span>
          </div>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700 text-slate-300">F2</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectMenu('INVENTORY')}
          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
            activeMenu === 'INVENTORY'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : 'text-slate-300 hover:bg-slate-800 hover:text-white'
          }`}
        >
          <div className="flex items-center space-x-3">
            <Boxes className="w-4 h-4" />
            <span>Quản Lý Kho</span>
          </div>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
            3 sắp hết
          </span>
        </button>
      </nav>

      {/* Footer Logout Action */}
      <div className="p-3 border-t border-slate-800">
        <button
          type="button"
          onClick={onLogout}
          className="w-full flex items-center justify-center space-x-2 px-3 py-2.5 text-xs font-semibold text-rose-400 hover:bg-rose-500/10 rounded-xl transition cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Đăng Xuất</span>
        </button>
      </div>
    </aside>
  );
};
