import React from 'react';
import type { DashboardTab } from './Sidebar';
import { Calendar, Search, Bell } from 'lucide-react';

interface HeaderProps {
  activeMenu: DashboardTab;
}

export const Header: React.FC<HeaderProps> = ({ activeMenu }) => {
  const getTitle = () => {
    switch (activeMenu) {
      case 'OVERVIEW':
        return 'Bảng Điều Khiển & Thống Kê';
      case 'POS':
        return 'Màn Hình Bán Hàng (Thu Ngân POS)';
      case 'INVENTORY':
        return 'Quản Lý Danh Mục & Nhập Xuất Kho';
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0">
      <div className="flex items-center space-x-3">
        <h2 className="text-lg font-bold text-slate-800">{getTitle()}</h2>
        <span className="hidden sm:inline-flex items-center space-x-1 text-xs px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 border border-slate-200">
          <Calendar className="w-3.5 h-3.5 text-slate-500" />
          <span>Hôm nay, {new Date().toLocaleDateString('vi-VN')}</span>
        </span>
      </div>

      <div className="flex items-center space-x-3">
        <div className="relative hidden md:block">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm sản phẩm, hóa đơn..."
            className="pl-9 pr-4 py-1.5 bg-slate-100 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition w-56"
          />
        </div>
        <button className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition relative cursor-pointer">
          <Bell className="w-4 h-4" />
          <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-1.5 right-1.5" />
        </button>
      </div>
    </header>
  );
};
