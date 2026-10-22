import React, { useState, useEffect } from 'react';
import type { InventoryProduct, UpdateProductPayload } from '../../types/inventory';
import {
  X,
  Save,
  AlertTriangle,
  Boxes,
  DollarSign,
  TrendingUp,
} from 'lucide-react';

interface EditProductModalProps {
  product: InventoryProduct | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, payload: UpdateProductPayload) => void;
}

export const EditProductModal: React.FC<EditProductModalProps> = ({
  product,
  isOpen,
  onClose,
  onSave,
}) => {
  const [sellingPriceInput, setSellingPriceInput] = useState<string>('');
  const [minAlertInput, setMinAlertInput] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (product && isOpen) {
      setSellingPriceInput(product.sellingPrice.toString());
      setMinAlertInput(product.minStockAlert.toString());
      setErrorMsg(null);
    }
  }, [product, isOpen]);

  if (!isOpen || !product) return null;

  const sellingPrice = parseFloat(sellingPriceInput) || 0;
  const minStockAlert = parseInt(minAlertInput, 10) || 0;
  const costPrice = product.costPrice || 0;

  const profitPerItem = sellingPrice - costPrice;
  const profitMargin =
    costPrice > 0 ? Math.round((profitPerItem / costPrice) * 100) : 0;
  const isLoss = profitPerItem < 0;

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (sellingPrice < 0) {
      setErrorMsg('Giá bán niêm yết không được nhỏ hơn 0 đ.');
      return;
    }
    if (minStockAlert < 0) {
      setErrorMsg('Ngưỡng cảnh báo tồn kho tối thiểu không được nhỏ hơn 0.');
      return;
    }

    onSave(product.id, {
      sellingPrice,
      minStockAlert,
    });
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs"
      onKeyDown={handleKeyDown}
    >
      <div className="bg-white w-full max-w-lg rounded-xl shadow-xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-800">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 text-xs font-mono font-bold border border-blue-400/30">
                {product.barcode}
              </span>
              <span className="text-xs text-slate-400 font-medium">
                {product.categoryName}
              </span>
            </div>
            <h2 className="text-base font-bold text-white mt-1">
              Chỉnh Sửa Giá Bán & Ngưỡng Tồn
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition cursor-pointer"
            title="Đóng (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleFormSubmit}>
          <div className="p-4 sm:p-5 space-y-4">
            {/* Tên sản phẩm & Thông tin cố định */}
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
              <h3 className="font-bold text-sm text-slate-900 leading-snug">
                {product.name}
              </h3>
              <div className="flex items-center justify-between text-xs text-slate-600 pt-1 border-t border-slate-200/80">
                <span className="flex items-center gap-1">
                  <Boxes className="w-3.5 h-3.5 text-blue-600" />
                  <span>Tồn kho hiện tại:</span>
                  <strong className="text-slate-900 font-mono tabular-nums">
                    {product.stockQuantity} {product.unit}
                  </strong>
                </span>
                <span className="flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5 text-slate-500" />
                  <span>Giá vốn nhập:</span>
                  <strong className="text-slate-900 font-mono tabular-nums">
                    {costPrice.toLocaleString('vi-VN')} đ
                  </strong>
                </span>
              </div>
            </div>

            {/* Trường 1: Giá bán lẻ niêm yết */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Giá Bán Lẻ Niêm Yết (VNĐ):
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={sellingPriceInput}
                  onChange={(e) => setSellingPriceInput(e.target.value)}
                  className="w-full py-2.5 pl-3 pr-14 bg-white border border-slate-300 rounded-lg text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono tabular-nums"
                  placeholder="Nhập giá bán mới..."
                  required
                />
                <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-xs font-bold text-slate-400">
                  VNĐ
                </div>
              </div>

              {/* Tính toán lợi nhuận thời gian thực */}
              <div className="mt-2 flex items-center justify-between p-2 rounded-lg bg-slate-100/80 border border-slate-200 text-xs">
                <span className="text-slate-600 flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Lợi nhuận ước tính:</span>
                </span>
                <div className="flex items-center gap-2">
                  <span
                    className={`font-mono tabular-nums font-bold ${
                      isLoss ? 'text-rose-700' : 'text-emerald-700'
                    }`}
                  >
                    {isLoss ? '' : '+'}
                    {profitPerItem.toLocaleString('vi-VN')} đ / {product.unit}
                  </span>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[11px] font-bold ${
                      isLoss
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {isLoss ? 'Lỗ ' : '+'}
                    {profitMargin}%
                  </span>
                </div>
              </div>

              {isLoss && (
                <p className="text-xs text-rose-600 font-medium mt-1 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                  <span>Cảnh báo: Giá bán này đang thấp hơn giá vốn nhập hàng!</span>
                </p>
              )}
            </div>

            {/* Trường 2: Ngưỡng tồn tối thiểu */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Ngưỡng Cảnh Báo Tồn Kho Tối Thiểu (min_stock_alert):
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={minAlertInput}
                  onChange={(e) => setMinAlertInput(e.target.value)}
                  className="w-full py-2.5 pl-3 pr-14 bg-white border border-slate-300 rounded-lg text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono tabular-nums"
                  placeholder="Ví dụ: 5 hoặc 10..."
                  required
                />
                <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-xs font-bold text-slate-400">
                  {product.unit}
                </div>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Khi số lượng tồn trong kho ≤ <strong>{minStockAlert} {product.unit}</strong>, hệ thống sẽ tự động bật cảnh báo đỏ <strong>"Sắp hết hàng"</strong>.
              </p>
            </div>

            {errorMsg && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300 transition cursor-pointer"
            >
              Hủy Bỏ (Esc)
            </button>

            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-xs transition cursor-pointer flex items-center gap-1.5 active:translate-y-0.5"
            >
              <Save className="w-4 h-4" />
              <span>Lưu Thay Đổi (Enter)</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
