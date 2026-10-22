import React from 'react';
import { DollarSign, TrendingUp, Layers, PackageCheck, AlertTriangle, ShieldAlert } from 'lucide-react';
import type { FinancialSummary, OperationsSummary } from '../../types/analytics';

interface StatsCardsProps {
  financial?: FinancialSummary | null;
  operations?: OperationsSummary | null;
  loading?: boolean;
}

const formatCurrency = (amount: string | number | undefined): string => {
  if (amount === undefined || amount === null) return '0 đ';
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return '0 đ';
  return new Intl.NumberFormat('vi-VN').format(num) + ' đ';
};

const formatNumber = (num: number | undefined): string => {
  if (num === undefined || num === null || isNaN(num)) return '0';
  return new Intl.NumberFormat('vi-VN').format(num);
};

export const StatsCards: React.FC<StatsCardsProps> = ({
  financial,
  operations,
  loading = false,
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs animate-pulse space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="h-4 bg-slate-200 rounded w-24"></div>
              <div className="w-8 h-8 rounded-xl bg-slate-100"></div>
            </div>
            <div className="h-7 bg-slate-200 rounded w-36"></div>
            <div className="h-3.5 bg-slate-100 rounded w-28"></div>
          </div>
        ))}
      </div>
    );
  }

  // Lấy danh sách tên tối đa 3 sản phẩm cần nhập gấp
  const lowStockNames =
    operations?.low_stock_items && operations.low_stock_items.length > 0
      ? operations.low_stock_items
          .slice(0, 3)
          .map((item) => item.product_name)
          .join(', ')
      : 'Kho hàng an toàn';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Metric 1: Revenue, Cost & Profit */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500">Tổng Doanh Thu</span>
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <p className="text-2xl font-bold text-slate-900">
            {formatCurrency(financial?.total_revenue)}
          </p>
          <div className="flex flex-col gap-0.5 mt-2 text-xs">
            <div className="flex items-center space-x-1.5 text-emerald-600 font-semibold">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Lợi nhuận: {formatCurrency(financial?.total_profit)}</span>
              {financial?.profit_margin !== undefined && financial.profit_margin > 0 && (
                <span className="bg-emerald-50 text-emerald-700 px-1.5 py-0.2 rounded text-[11px]">
                  {financial.profit_margin}%
                </span>
              )}
            </div>
            <div className="text-slate-400 text-[11px]">
              Vốn: {formatCurrency(financial?.total_cost)}
            </div>
          </div>
        </div>
      </div>

      {/* Metric 2: Distinct Products Sold & Stock */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500">Sản Phẩm Khác Nhau Đã Bán</span>
          <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Layers className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="flex items-baseline space-x-2">
            <p className="text-2xl font-bold text-slate-900">
              {formatNumber(operations?.total_distinct_products_sold)}
            </p>
            <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
              Mặt hàng
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-2 truncate">
            Tổng tồn kho:{' '}
            <span className="font-semibold text-slate-700">
              {formatNumber(operations?.total_stock_quantity)}
            </span>{' '}
            sản phẩm
          </p>
        </div>
      </div>

      {/* Metric 3: Total Orders */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500">Tổng Đơn Đã Bán</span>
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <PackageCheck className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <p className="text-2xl font-bold text-slate-900">
            {formatNumber(operations?.total_orders_sold)} đơn
          </p>
          <p className="text-xs text-emerald-600 font-semibold mt-2 flex items-center space-x-1">
            <span>Hoàn tất thành công</span>
          </p>
        </div>
      </div>

      {/* Metric 4: Inventory Low Stock Alert */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500">Cảnh Báo Tồn Kho</span>
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center ${
              (operations?.low_stock_count ?? 0) > 0
                ? 'bg-amber-50 text-amber-600'
                : 'bg-emerald-50 text-emerald-600'
            }`}
          >
            {(operations?.low_stock_count ?? 0) > 0 ? (
              <AlertTriangle className="w-4 h-4" />
            ) : (
              <ShieldAlert className="w-4 h-4" />
            )}
          </div>
        </div>
        <div className="mt-3">
          <div className="flex items-baseline space-x-2">
            <p
              className={`text-2xl font-bold ${
                (operations?.low_stock_count ?? 0) > 0
                  ? 'text-amber-600'
                  : 'text-emerald-600'
              }`}
            >
              {formatNumber(operations?.low_stock_count)}
            </p>
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                (operations?.low_stock_count ?? 0) > 0
                  ? 'text-amber-700 bg-amber-50'
                  : 'text-emerald-700 bg-emerald-50'
              }`}
            >
              {(operations?.low_stock_count ?? 0) > 0 ? 'Cần nhập gấp' : 'An toàn'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-2 truncate" title={lowStockNames}>
            {lowStockNames}
          </p>
        </div>
      </div>
    </div>
  );
};
