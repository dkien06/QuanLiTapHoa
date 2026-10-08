import React from 'react';
import type { DashboardTab } from './Sidebar';
import { ShoppingCart, Boxes, FileSpreadsheet, PlusCircle, ArrowUpRight } from 'lucide-react';

interface QuickActionsProps {
  onNavigate: (tab: DashboardTab) => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({ onNavigate }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <button
        type="button"
        onClick={() => onNavigate('POS')}
        className="p-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl shadow-md hover:shadow-lg transition flex items-center justify-between cursor-pointer"
      >
        <div className="flex items-center space-x-3 text-left">
          <div className="p-2 bg-white/10 rounded-xl">
            <ShoppingCart className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-xs">Mở Màn Hình Bán Hàng</p>
            <p className="text-[11px] text-blue-100">Quét mã vạch, in bill, thanh toán</p>
          </div>
        </div>
        <PlusCircle className="w-5 h-5 text-white/80" />
      </button>

      <button
        type="button"
        onClick={() => onNavigate('INVENTORY')}
        className="p-4 bg-white border border-slate-200 text-slate-800 rounded-2xl shadow-xs hover:border-blue-400 hover:shadow-sm transition flex items-center justify-between cursor-pointer"
      >
        <div className="flex items-center space-x-3 text-left">
          <div className="p-2 bg-slate-100 rounded-xl text-slate-700">
            <Boxes className="w-5 h-5" />
          </div>
          <div>
            <p className="font-bold text-xs">Nhập Kho Hàng Mới</p>
            <p className="text-[11px] text-slate-500">Tạo phiếu nhập từ nhà cung cấp</p>
          </div>
        </div>
        <PlusCircle className="w-5 h-5 text-slate-400" />
      </button>

      <div className="p-4 bg-white border border-slate-200 text-slate-800 rounded-2xl shadow-xs flex items-center justify-between">
        <div className="flex items-center space-x-3 text-left">
          <div className="p-2 bg-slate-100 rounded-xl text-slate-700">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <p className="font-bold text-xs">Xuất Báo Cáo Doanh Thu</p>
            <p className="text-[11px] text-slate-500">Định dạng file Excel / PDF</p>
          </div>
        </div>
        <ArrowUpRight className="w-5 h-5 text-slate-400" />
      </div>
    </div>
  );
};
