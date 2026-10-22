import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { User } from '../../types/auth';
import { Store, ShoppingCart, Boxes, BarChart3, LogOut, MapPin } from 'lucide-react';
import { inventoryService } from '../../services/inventoryService';

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
  const navigate = useNavigate();
  const lowStockCount = inventoryService.getInventoryStats().lowStockCount;
  return (
    <aside className="w-full md:w-64 bg-slate-900 text-white flex flex-col shrink-0 border-r border-slate-800">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800 flex items-center space-x-3">
        <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center shadow-sm">
          <Store className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="font-bold text-sm tracking-tight text-white leading-tight">QUẢN LÝ TẠP HÓA</h1>
          <span className="text-xs text-slate-400 font-medium">Bán lẻ & Quản lý Kho</span>
        </div>
      </div>

      {/* User Info Capsule - Gọn gàng, dễ đọc */}
      <div className="p-3 mx-3 my-2.5 bg-slate-800/90 rounded-xl border border-slate-700/70 space-y-2">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold text-xs uppercase shrink-0">
            {user.fullName ? user.fullName.charAt(0) : 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">{user.fullName}</p>
            <p className="text-xs text-slate-400 truncate font-mono">@{user.username}</p>
          </div>
          <span className="text-[11px] px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-medium">
            {user.storeType === 'SUPPLIER' ? 'Nhà Cung Cấp' : 'Chủ Tiệm'}
          </span>
        </div>

        <div className="pt-1.5 border-t border-slate-700/60 text-xs text-slate-300">
          <div className="font-medium text-white truncate flex items-center gap-1.5">
            <Store className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <span className="truncate">{user.storeName || 'Tạp hóa Bình An'}</span>
          </div>
          {user.storeAddress && (
            <div className="text-[11px] text-slate-400 truncate flex items-center gap-1.5 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span className="truncate">{user.storeAddress}</span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-3 py-2 space-y-1">
        <p className="px-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Chức Năng Chính</p>

        <button
          type="button"
          onClick={() => onSelectMenu('OVERVIEW')}
          className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-medium transition cursor-pointer ${
            activeMenu === 'OVERVIEW'
              ? 'bg-blue-600 text-white font-semibold shadow-sm'
              : 'text-slate-300 hover:bg-slate-800 hover:text-white'
          }`}
        >
          <BarChart3 className="w-4 h-4 text-slate-300" />
          <span>Tổng Quan & Thống Kê</span>
        </button>

        <button
          type="button"
          onClick={() => navigate('/pos')}
          className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition cursor-pointer text-slate-300 hover:bg-slate-800 hover:text-white"
        >
          <div className="flex items-center space-x-3">
            <ShoppingCart className="w-4 h-4 text-blue-400" />
            <span>Bán Hàng (POS)</span>
          </div>
          <kbd className="keycap text-slate-800">F2</kbd>
        </button>

        <button
          type="button"
          onClick={() => onSelectMenu('INVENTORY')}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition cursor-pointer ${
            activeMenu === 'INVENTORY'
              ? 'bg-blue-600 text-white font-semibold shadow-sm'
              : 'text-slate-300 hover:bg-slate-800 hover:text-white'
          }`}
        >
          <div className="flex items-center space-x-3">
            <Boxes className="w-4 h-4 text-amber-400" />
            <span>Quản Lý Kho</span>
          </div>
          {lowStockCount > 0 && (
            <span className="text-[11px] px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold font-mono">
              {lowStockCount} sắp hết
            </span>
          )}
        </button>
      </nav>

      {/* Footer Logout Action */}
      <div className="p-3 border-t border-slate-800">
        <button
          type="button"
          onClick={onLogout}
          className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-500/15 rounded-lg transition cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Đăng Xuất</span>
        </button>
      </div>
    </aside>
  );
};
