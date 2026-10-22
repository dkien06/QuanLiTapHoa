import React from 'react';
import type { InventoryProduct } from '../../types/inventory';
import {
  Edit3,
  Package,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  TrendingUp,
} from 'lucide-react';

interface InventoryTableProps {
  products: InventoryProduct[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  onPageChange: (newPage: number) => void;
  onPageSizeChange: (newPageSize: number) => void;
  onEditProduct: (product: InventoryProduct) => void;
  onResetFilters?: () => void;
}

export const InventoryTable: React.FC<InventoryTableProps> = ({
  products,
  total,
  page,
  pageSize,
  totalPages,
  onPageChange,
  onPageSizeChange,
  onEditProduct,
  onResetFilters,
}) => {
  const startIndex = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const endIndex = Math.min(page * pageSize, total);

  // Helper render badge trạng thái tồn kho chuẩn 3 màu
  const renderStockBadge = (product: InventoryProduct) => {
    if (product.stockQuantity === 0) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-rose-100 text-rose-900 border border-rose-300">
          <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping" />
          <span>Hết hàng (0)</span>
        </span>
      );
    }

    if (product.status === 'CRITICAL') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-rose-50 text-rose-900 border border-rose-300">
          <span className="w-2 h-2 rounded-full bg-rose-600" />
          <span>Sắp hết (≤ {product.minStockAlert})</span>
        </span>
      );
    }

    if (product.status === 'LOW') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-50 text-amber-900 border border-amber-300">
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          <span>Còn ít (≤ 10)</span>
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-900 border border-emerald-300">
        <span className="w-2 h-2 rounded-full bg-emerald-600" />
        <span>Còn nhiều (&gt; 10)</span>
      </span>
    );
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col overflow-hidden">
      {/* Table Container */}
      <div className="overflow-x-auto min-h-[380px]">
        {products.length === 0 ? (
          <div className="h-full min-h-[360px] flex flex-col items-center justify-center p-8 text-center text-slate-400">
            <div className="w-14 h-14 bg-slate-100 rounded-xl flex items-center justify-center mb-3 text-slate-400 border border-slate-200">
              <Package className="w-7 h-7 stroke-[1.5]" />
            </div>
            <p className="text-sm font-bold text-slate-800">Không tìm thấy sản phẩm nào</p>
            <p className="text-xs text-slate-500 mt-1 max-w-sm">
              Không có mặt hàng nào khớp với từ khóa tìm kiếm hoặc bộ lọc danh mục hiện tại.
            </p>
            {onResetFilters && (
              <button
                type="button"
                onClick={onResetFilters}
                className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition cursor-pointer"
              >
                Xóa bộ lọc & Tải lại
              </button>
            )}
          </div>
        ) : (
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100/90 border-b border-slate-200 text-xs font-bold text-slate-700 uppercase tracking-wider">
                <th className="py-2.5 px-3 text-center w-10">#</th>
                <th className="py-2.5 px-3 w-36">Mã Barcode</th>
                <th className="py-2.5 px-3 min-w-[200px]">Tên sản phẩm</th>
                <th className="py-2.5 px-3 w-40">Danh mục</th>
                <th className="py-2.5 px-3 text-right w-28">Tồn kho</th>
                <th className="py-2.5 px-3 text-right w-28">Giá vốn</th>
                <th className="py-2.5 px-3 text-right w-32">Giá bán niêm yết</th>
                <th className="py-2.5 px-3 text-center w-36">Trạng thái</th>
                <th className="py-2.5 px-3 text-center w-20">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {products.map((item, index) => {
                const profitMargin =
                  item.costPrice > 0
                    ? Math.round(((item.sellingPrice - item.costPrice) / item.costPrice) * 100)
                    : 0;

                const isCritical = item.status === 'CRITICAL';
                const isLow = item.status === 'LOW';

                return (
                  <tr
                    key={item.id}
                    className={`transition-colors hover:bg-blue-50/50 even:bg-slate-50/40 ${
                      isCritical ? 'bg-rose-50/40' : isLow ? 'bg-amber-50/20' : ''
                    }`}
                  >
                    {/* STT */}
                    <td className="py-2.5 px-3 text-center text-slate-400 font-mono text-xs">
                      {startIndex + index}
                    </td>

                    {/* Mã Barcode */}
                    <td className="py-2.5 px-3">
                      <span className="font-mono bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-slate-800 text-xs font-semibold">
                        {item.barcode}
                      </span>
                    </td>

                    {/* Tên sản phẩm & Đơn vị */}
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-slate-900 leading-tight">
                        {item.name}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Đơn vị tính: <strong className="text-slate-700">{item.unit}</strong>
                        <span className="mx-1.5">•</span>
                        <span>Ngưỡng báo động: <strong>≤ {item.minStockAlert}</strong></span>
                      </div>
                    </td>

                    {/* Danh mục */}
                    <td className="py-2.5 px-3">
                      <span className="inline-block px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200 truncate max-w-[150px]">
                        {item.categoryName}
                      </span>
                    </td>

                    {/* Số lượng tồn kho */}
                    <td className="py-2.5 px-3 text-right">
                      <div
                        className={`font-mono tabular-nums font-black text-sm ${
                          isCritical
                            ? 'text-rose-700'
                            : isLow
                            ? 'text-amber-700'
                            : 'text-slate-900'
                        }`}
                      >
                        {item.stockQuantity.toLocaleString('vi-VN')}
                      </div>
                      <div className="text-[10px] text-slate-400 font-medium">
                        {item.unit}
                      </div>
                    </td>

                    {/* Giá vốn nhập */}
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums font-medium text-slate-600 text-xs">
                      {item.costPrice.toLocaleString('vi-VN')} đ
                    </td>

                    {/* Giá bán lẻ niêm yết */}
                    <td className="py-2.5 px-3 text-right">
                      <div className="font-mono tabular-nums font-bold text-slate-950 text-xs">
                        {item.sellingPrice.toLocaleString('vi-VN')} đ
                      </div>
                      <div className="text-[10px] text-emerald-700 font-semibold flex items-center justify-end gap-0.5">
                        <TrendingUp className="w-2.5 h-2.5" />
                        <span>+{profitMargin}% lời</span>
                      </div>
                    </td>

                    {/* Trạng thái tồn kho */}
                    <td className="py-2.5 px-3 text-center">
                      {renderStockBadge(item)}
                    </td>

                    {/* Thao tác Chỉnh sửa */}
                    <td className="py-2.5 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => onEditProduct(item)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-blue-700 hover:text-white bg-blue-50 hover:bg-blue-600 rounded-md border border-blue-200 hover:border-blue-600 transition cursor-pointer"
                        title="Chỉnh sửa giá bán lẻ & ngưỡng cảnh báo"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Sửa</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination Footer */}
      {total > 0 && (
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span>Hiển thị</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              aria-label="Số dòng hiển thị trên mỗi trang"
              className="py-1 px-2 bg-white border border-slate-300 rounded-md text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              <option value={5}>5 dòng/trang</option>
              <option value={10}>10 dòng/trang</option>
              <option value={20}>20 dòng/trang</option>
              <option value={50}>50 dòng/trang</option>
            </select>
            <span className="text-slate-500">
              (Từ <strong>{startIndex}</strong> đến <strong>{endIndex}</strong> trong tổng{' '}
              <strong>{total}</strong> mặt hàng)
            </span>
          </div>

          {/* Navigation Page Buttons */}
          <div className="flex items-center space-x-1">
            <button
              type="button"
              onClick={() => onPageChange(1)}
              disabled={page <= 1}
              className="p-1.5 rounded-md border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
              title="Trang đầu"
            >
              <ChevronsLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              className="p-1.5 rounded-md border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
              title="Trang trước"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            <span className="px-3 py-1 font-semibold text-slate-800 bg-white border border-slate-300 rounded-md font-mono">
              Trang {page} / {totalPages}
            </span>

            <button
              type="button"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
              className="p-1.5 rounded-md border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
              title="Trang kế tiếp"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onPageChange(totalPages)}
              disabled={page >= totalPages}
              className="p-1.5 rounded-md border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
              title="Trang cuối"
            >
              <ChevronsRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
