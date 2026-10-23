import React, { useState } from 'react';
import type { InventoryProduct } from '../../types/inventory';
import { Edit3, Package, ChevronRight, ChevronsLeft, X, Boxes, Barcode, Tag } from 'lucide-react';

interface InventoryTableProps {
  products: InventoryProduct[]; total: number; page: number; pageSize: number; totalPages: number;
  onPageChange: (newPage: number) => void; onPageSizeChange: (newPageSize: number) => void;
  onEditProduct: (product: InventoryProduct) => void; onResetFilters?: () => void;
}

const money = (value: number) => `${value.toLocaleString('vi-VN')} đ`;

export const InventoryTable: React.FC<InventoryTableProps> = ({ products, total, page, pageSize, totalPages, onPageChange, onPageSizeChange, onEditProduct, onResetFilters }) => {
  const [detail, setDetail] = useState<InventoryProduct | null>(null);
  const startIndex = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const endIndex = Math.min(page * pageSize, total);

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {products.length === 0 ? (
        <div className="flex min-h-[320px] flex-col items-center justify-center p-8 text-center">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400"><Package className="h-7 w-7" /></div>
          <p className="font-bold text-slate-800">Không tìm thấy sản phẩm nào</p>
          <p className="mt-1 text-sm text-slate-500">Thử đổi từ khóa hoặc bộ lọc danh mục.</p>
          {onResetFilters && <button type="button" onClick={onResetFilters} className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white">Xóa bộ lọc</button>}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 p-3 sm:grid-cols-3 sm:gap-4 sm:p-4 lg:grid-cols-4 xl:grid-cols-5">
          {products.map((product, index) => {
            const low = product.stockQuantity <= product.minStockAlert;
            const art = ['🥫', '🥤', '🍜', '🧴', '🍪', '🧃', '🧼', '🍚'][((page - 1) * pageSize + index) % 8];
            return (
              <article key={product.id} className="group overflow-hidden rounded-xl border border-slate-200 bg-white transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md">
                <button type="button" onClick={() => setDetail(product)} className="block w-full text-left" aria-label={`Xem chi tiết ${product.name}`}>
                  <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-100">
                    <span className="text-6xl drop-shadow-sm transition duration-200 group-hover:scale-110" aria-hidden="true">{art}</span>
                    <span className={`absolute left-2 top-2 rounded-full px-2 py-1 text-[10px] font-bold ${low ? 'bg-amber-100 text-amber-800' : 'bg-white/90 text-emerald-700'}`}>{low ? 'Sắp hết' : 'Còn hàng'}</span>
                    <span className="absolute bottom-2 right-2 rounded-full bg-white/90 p-1.5 text-slate-500"><Package className="h-3.5 w-3.5" /></span>
                  </div>
                  <div className="p-3">
                    <p className="line-clamp-2 min-h-10 text-sm font-semibold leading-5 text-slate-800">{product.name}</p>
                    <p className="mt-2 text-base font-extrabold text-blue-700">{money(product.sellingPrice)}</p>
                    <p className="mt-1 text-xs text-slate-500">{product.categoryName}</p>
                  </div>
                </button>
                <div className="flex items-center justify-between border-t border-slate-100 px-3 py-2">
                  <span className="text-xs text-slate-500">Tồn: <strong className={low ? 'text-amber-700' : 'text-slate-700'}>{product.stockQuantity} {product.unit}</strong></span>
                  <button type="button" onClick={() => onEditProduct(product)} className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-50" title="Sửa giá bán và ngưỡng tồn"><Edit3 className="h-3.5 w-3.5" />Sửa</button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {total > 0 && <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600 sm:flex-row">
        <div className="flex items-center gap-2"><span>Hiển thị</span><select value={pageSize} onChange={e => onPageSizeChange(Number(e.target.value))} aria-label="Số sản phẩm trên mỗi trang" className="rounded-md border border-slate-300 bg-white px-2 py-1"><option value={10}>10 thẻ/trang</option><option value={20}>20 thẻ/trang</option><option value={50}>50 thẻ/trang</option></select><span>{startIndex}–{endIndex} trong {total} mặt hàng</span></div>
        <div className="flex items-center gap-1"><button type="button" onClick={() => onPageChange(Math.max(1, page - 1))} disabled={page <= 1} className="rounded-md border bg-white p-1.5 disabled:opacity-40"><ChevronsLeft className="h-4 w-4" /></button><span className="px-2 font-semibold">Trang {page} / {totalPages}</span><button type="button" onClick={() => onPageChange(Math.min(totalPages, page + 1))} disabled={page >= totalPages} className="rounded-md border bg-white p-1.5 disabled:opacity-40"><ChevronRight className="h-4 w-4" /></button></div>
      </div>}

      {detail && <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/50 p-4" onMouseDown={e => { if (e.target === e.currentTarget) setDetail(null); }}>
        <section role="dialog" aria-modal="true" aria-labelledby="inventory-detail-title" className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
          <div className="flex items-start justify-between border-b border-slate-100 p-5"><div><p className="text-xs font-bold uppercase tracking-wider text-blue-600">Chi tiết sản phẩm</p><h2 id="inventory-detail-title" className="mt-1 text-xl font-bold text-slate-900">{detail.name}</h2></div><button type="button" onClick={() => setDetail(null)} aria-label="Đóng" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><X className="h-5 w-5" /></button></div>
          <div className="grid gap-4 p-5 sm:grid-cols-[140px_1fr]"><div className="flex aspect-square items-center justify-center rounded-2xl bg-gradient-to-br from-sky-50 to-indigo-100 text-7xl">🛍️</div><div className="space-y-3"><div><p className="text-xs text-slate-500">Giá bán</p><p className="text-2xl font-extrabold text-blue-700">{money(detail.sellingPrice)}</p></div><div className="grid grid-cols-2 gap-2"><div className="rounded-lg bg-slate-50 p-3"><p className="flex items-center gap-1 text-xs text-slate-500"><Boxes className="h-3.5 w-3.5" />Tồn kho</p><p className="mt-1 font-bold">{detail.stockQuantity} {detail.unit}</p></div><div className="rounded-lg bg-slate-50 p-3"><p className="flex items-center gap-1 text-xs text-slate-500"><Tag className="h-3.5 w-3.5" />Danh mục</p><p className="mt-1 text-sm font-semibold">{detail.categoryName}</p></div></div><p className="flex items-center gap-2 text-xs text-slate-500"><Barcode className="h-4 w-4" />Mã vạch: <span className="font-mono font-semibold text-slate-700">{detail.barcode}</span></p><p className="text-xs text-slate-500">Giá vốn: <strong className="text-slate-700">{money(detail.costPrice)}</strong> · Ngưỡng cảnh báo: <strong>{detail.minStockAlert} {detail.unit}</strong></p></div></div>
          <div className="flex justify-end gap-2 border-t border-slate-100 bg-slate-50 p-4"><button type="button" onClick={() => setDetail(null)} className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700">Đóng</button><button type="button" onClick={() => { onEditProduct(detail); setDetail(null); }} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white"><Edit3 className="h-4 w-4" />Sửa sản phẩm</button></div>
        </section>
      </div>}
    </div>
  );
};
