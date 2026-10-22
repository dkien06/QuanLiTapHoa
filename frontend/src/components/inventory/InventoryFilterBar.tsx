import React from 'react';
import type { InventoryStats } from '../../types/inventory';
import {
  Search,
  X,
  AlertTriangle,
  Boxes,
  Layers,
  CircleDollarSign,
  Filter,
  Plus,
} from 'lucide-react';

interface InventoryFilterBarProps {
  stats: InventoryStats;
  keyword: string;
  onKeywordChange: (val: string) => void;
  selectedCategory: string;
  onCategoryChange: (cat: string) => void;
  categories: string[];
  onlyLowStock: boolean;
  onToggleLowStock: () => void;
  totalFiltered: number;
  totalAll: number;
  onOpenCreatePOModal?: () => void;
}

export const InventoryFilterBar: React.FC<InventoryFilterBarProps> = ({
  stats,
  keyword,
  onKeywordChange,
  selectedCategory,
  onCategoryChange,
  categories,
  onlyLowStock,
  onToggleLowStock,
  totalFiltered,
  totalAll,
  onOpenCreatePOModal,
}) => {
  return (
    <div className="space-y-4">
      {/* 4 Mini KPI Cards Ribbon */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Card 1: Tổng mã hàng */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Tổng Mặt Hàng</p>
            <p className="text-xl font-bold text-slate-900 font-mono tabular-nums mt-0.5">
              {stats.totalProducts} <span className="text-xs font-normal text-slate-500">mã</span>
            </p>
          </div>
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-200/60">
            <Layers className="w-4 h-4" />
          </div>
        </div>

        {/* Card 2: Tổng tồn kho */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Tổng Số Lượng Tồn</p>
            <p className="text-xl font-bold text-slate-900 font-mono tabular-nums mt-0.5">
              {stats.totalStockQuantity.toLocaleString('vi-VN')}{' '}
              <span className="text-xs font-normal text-slate-500">cái/lon</span>
            </p>
          </div>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200/60">
            <Boxes className="w-4 h-4" />
          </div>
        </div>

        {/* Card 3: Cảnh báo sắp hết hàng */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Sắp Hết & Cần Nhập</p>
            <p className="text-xl font-bold text-amber-700 font-mono tabular-nums mt-0.5">
              {stats.lowStockCount}{' '}
              <span className="text-xs font-medium text-amber-800">
                ({stats.criticalCount} chạm đáy)
              </span>
            </p>
          </div>
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200/60">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>

        {/* Card 4: Tổng giá trị vốn */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Giá Trị Kho (Giá Vốn)</p>
            <p className="text-lg font-bold text-slate-900 font-mono tabular-nums mt-0.5">
              {stats.totalCostValue.toLocaleString('vi-VN')} <span className="text-xs font-normal text-slate-500">đ</span>
            </p>
          </div>
          <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center border border-purple-200/60">
            <CircleDollarSign className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Control Bar: Search + Category Filter + Low Stock Toggle */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={keyword}
              onChange={(e) => onKeywordChange(e.target.value)}
              placeholder="Tìm theo tên sản phẩm hoặc mã vạch barcode..."
              className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
            />
            {keyword && (
              <button
                type="button"
                onClick={() => onKeywordChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                title="Xóa tìm kiếm"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Dropdown */}
          <div className="relative min-w-[180px]">
            <select
              value={selectedCategory}
              onChange={(e) => onCategoryChange(e.target.value)}
              aria-label="Lọc theo nhóm danh mục hàng hóa"
              className="w-full py-2 pl-3 pr-8 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition cursor-pointer"
            >
              <option value="ALL">Tất cả danh mục ({categories.length})</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Quick Toggle: Sắp hết hàng */}
          <button
            type="button"
            onClick={onToggleLowStock}
            className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer border ${
              onlyLowStock
                ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300'
            }`}
          >
            <AlertTriangle className={`w-3.5 h-3.5 ${onlyLowStock ? 'text-white' : 'text-amber-600'}`} />
            <span>Sắp hết hàng</span>
            {stats.lowStockCount > 0 && (
              <span
                className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                  onlyLowStock
                    ? 'bg-white text-amber-800'
                    : 'bg-amber-100 text-amber-900 border border-amber-300'
                }`}
              >
                {stats.lowStockCount}
              </span>
            )}
          </button>
        </div>

        {/* Actions & Counter Summary */}
        <div className="flex flex-wrap items-center justify-between sm:justify-end gap-3 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
          <div className="text-xs text-slate-500 flex items-center gap-2">
            <span className="flex items-center gap-1">
              <Filter className="w-3 h-3 text-slate-400" />
              <span>
                Hiển thị <strong>{totalFiltered}</strong> / {totalAll} mặt hàng
              </span>
            </span>
            {(keyword || selectedCategory !== 'ALL' || onlyLowStock) && (
              <button
                type="button"
                onClick={() => {
                  onKeywordChange('');
                  onCategoryChange('ALL');
                  if (onlyLowStock) onToggleLowStock();
                }}
                className="text-blue-600 hover:text-blue-800 font-semibold cursor-pointer text-xs"
              >
                (Đặt lại)
              </button>
            )}
          </div>

          {onOpenCreatePOModal && (
            <button
              type="button"
              onClick={onOpenCreatePOModal}
              className="px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-xs transition cursor-pointer shrink-0"
              title="Tạo đơn nhập hàng mới (B2B hoặc Thủ công)"
            >
              <Plus className="w-4 h-4" />
              <span>+ Nhập Hàng Mới</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
