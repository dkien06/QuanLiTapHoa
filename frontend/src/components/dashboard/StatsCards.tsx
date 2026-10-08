import React from 'react';
import { DollarSign, TrendingUp, Layers, PackageCheck, ArrowUpRight, AlertTriangle } from 'lucide-react';

export const StatsCards: React.FC = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Metric 1: Revenue */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500">Tổng Doanh Thu</span>
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <p className="text-2xl font-bold text-slate-900">89.430.000 đ</p>
          <div className="flex items-center space-x-1.5 mt-1 text-xs text-emerald-600 font-semibold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+14.2% so với tháng trước</span>
          </div>
        </div>
      </div>

      {/* Metric 2: Distinct Products Sold (SỐ SẢN PHẨM KHÁC NHAU ĐƯỢC MUA) */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500">Sản Phẩm Khác Nhau Đã Bán</span>
          <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Layers className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="flex items-baseline space-x-2">
            <p className="text-2xl font-bold text-slate-900">109</p>
            <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
              Mặt hàng
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Độ đa dạng giỏ hàng đạt 84.5%</p>
        </div>
      </div>

      {/* Metric 3: Total Orders / Items */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500">Tổng Đơn Đã Bán</span>
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <PackageCheck className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <p className="text-2xl font-bold text-slate-900">542 đơn</p>
          <p className="text-xs text-emerald-600 font-semibold mt-1 flex items-center space-x-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>1.139 lượt sản phẩm xuất</span>
          </p>
        </div>
      </div>

      {/* Metric 4: Inventory Low Stock Alert */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500">Cảnh Báo Tồn Kho</span>
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="flex items-baseline space-x-2">
            <p className="text-2xl font-bold text-amber-600">3</p>
            <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
              Cần nhập gấp
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Mì gói, Sữa chua, Bột giặt</p>
        </div>
      </div>
    </div>
  );
};
