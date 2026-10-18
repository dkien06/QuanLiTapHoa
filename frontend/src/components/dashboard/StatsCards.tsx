import React from 'react';
import { DollarSign, TrendingUp, Layers, PackageCheck, ArrowUpRight, AlertTriangle } from 'lucide-react';

export const StatsCards: React.FC = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Metric 1: Revenue */}
      <div className="bg-white p-4.5 rounded-xl border border-slate-200 shadow-xs hover:shadow-sm transition">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-600">Doanh Thu Bán Lẻ</span>
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-200/60">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2.5">
          <p className="text-2xl font-bold text-slate-900 font-mono tabular-nums">89.430.000 đ</p>
          <div className="flex items-center space-x-1.5 mt-1 text-xs text-emerald-700 font-semibold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+14.2% so với tháng trước</span>
          </div>
        </div>
      </div>

      {/* Metric 2: Distinct Products Sold */}
      <div className="bg-white p-4.5 rounded-xl border border-slate-200 shadow-xs hover:shadow-sm transition">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-600">Số Mặt Hàng Đã Bán</span>
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center border border-indigo-200/60">
            <Layers className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2.5">
          <div className="flex items-baseline space-x-2">
            <p className="text-2xl font-bold text-slate-900 font-mono tabular-nums">109</p>
            <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md">
              Mặt hàng
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Đang hoạt động trong kỳ</p>
        </div>
      </div>

      {/* Metric 3: Total Orders */}
      <div className="bg-white p-4.5 rounded-xl border border-slate-200 shadow-xs hover:shadow-sm transition">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-600">Tổng Đơn Đã Bán</span>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200/60">
            <PackageCheck className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2.5">
          <p className="text-2xl font-bold text-slate-900 font-mono tabular-nums">542 đơn</p>
          <p className="text-xs text-emerald-700 font-semibold mt-1 flex items-center space-x-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>1.139 lượt sản phẩm xuất quầy</span>
          </p>
        </div>
      </div>

      {/* Metric 4: Inventory Low Stock Alert */}
      <div className="bg-white p-4.5 rounded-xl border border-slate-200 shadow-xs hover:shadow-sm transition">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-600">Cảnh Báo Tồn Kho</span>
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200/60">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2.5">
          <div className="flex items-baseline space-x-2">
            <p className="text-2xl font-bold text-amber-700 font-mono tabular-nums">3</p>
            <span className="text-xs font-semibold text-amber-800 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-md">
              Cần nhập gấp
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Comfort, Cool Air, Lifebuoy</p>
        </div>
      </div>
    </div>
  );
};
