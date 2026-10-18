import React from 'react';
import type { CartItem } from '../../types/pos';
import {
  Trash2,
  Plus,
  Minus,
  ShoppingCart,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';

interface CartTableProps {
  items: CartItem[];
  onUpdateQuantity: (productId: string, newQuantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  onFocusScanner?: () => void;
}

export const CartTable: React.FC<CartTableProps> = ({
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onFocusScanner,
}) => {
  const totalItemLines = items.length;
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col h-full min-h-[480px] overflow-hidden">
      {/* Table Header Action Bar */}
      <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-blue-50 text-blue-700 rounded-lg border border-blue-200/60">
            <ShoppingCart className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Giỏ Hàng Thanh Toán
            </h2>
            <p className="text-xs text-slate-500">
              {totalItemLines > 0 ? (
                <>
                  <span className="font-semibold text-blue-700">{totalItemLines}</span> mặt hàng (
                  <span className="font-semibold text-blue-700">{totalQuantity}</span> món)
                </>
              ) : (
                'Chưa có sản phẩm nào trong giỏ'
              )}
            </p>
          </div>
        </div>

        {totalItemLines > 0 && (
          <button
            type="button"
            onClick={() => {
              if (window.confirm('Bạn có chắc muốn làm trống toàn bộ giỏ hàng này không?')) {
                onClearCart();
              }
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition cursor-pointer border border-rose-200"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Làm trống giỏ</span>
          </button>
        )}
      </div>

      {/* Main Table / Empty State */}
      <div className="flex-1 overflow-x-auto overflow-y-auto">
        {items.length === 0 ? (
          <div className="h-full min-h-[360px] flex flex-col items-center justify-center p-8 text-center text-slate-400">
            <div className="w-14 h-14 bg-slate-100 rounded-xl flex items-center justify-center mb-3 text-slate-400 border border-slate-200">
              <ShoppingCart className="w-7 h-7 stroke-[1.5]" />
            </div>
            <p className="text-sm font-bold text-slate-800">Giỏ hàng đang trống</p>
            <p className="text-xs text-slate-500 mt-1 max-w-sm">
              Hãy dùng máy quét mã vạch hoặc nhấn phím <kbd className="keycap">F2</kbd> để quét thêm mặt hàng.
            </p>
            {onFocusScanner && (
              <button
                type="button"
                onClick={onFocusScanner}
                className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition cursor-pointer flex items-center gap-2"
              >
                <span>Quét mã ngay</span>
                <kbd className="keycap text-slate-800">F2</kbd>
              </button>
            )}
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100/90 border-b border-slate-200 text-xs font-bold text-slate-700 uppercase tracking-wider">
                <th className="py-2.5 px-3 text-center w-10">#</th>
                <th className="py-2.5 px-3">Mặt hàng</th>
                <th className="py-2.5 px-3 text-right">Đơn giá</th>
                <th className="py-2.5 px-3 text-center w-36">Số lượng</th>
                <th className="py-2.5 px-3 text-right">Thành tiền</th>
                <th className="py-2.5 px-3 text-center w-12">Xóa</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {items.map((item, index) => {
                const isOverStock = item.quantity > item.stockQuantity;

                return (
                  <tr
                    key={item.productId}
                    className={`transition-colors hover:bg-blue-50/40 even:bg-slate-50/40 ${
                      isOverStock ? 'bg-rose-50/60 hover:bg-rose-50/80' : ''
                    }`}
                  >
                    {/* STT */}
                    <td className="py-2.5 px-3 text-center text-slate-500 font-mono text-xs">
                      {index + 1}
                    </td>

                    {/* Tên & Mã vạch */}
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-slate-900 leading-tight">
                        {item.name}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                        <span className="font-mono bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded text-slate-700">
                          {item.barcode}
                        </span>
                        <span>ĐVT: <strong className="text-slate-700">{item.unit}</strong></span>
                        <span
                          className={`font-semibold ${
                            isOverStock
                              ? 'text-rose-700'
                              : item.stockQuantity <= 3
                              ? 'text-amber-700'
                              : 'text-slate-600'
                          }`}
                        >
                          Tồn kho: {item.stockQuantity}
                        </span>
                      </div>

                      {/* Cảnh báo vượt tồn kho */}
                      {isOverStock && (
                        <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 text-xs font-semibold border border-rose-300">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                          <span>Vượt tồn kho thực tế ({item.quantity}/{item.stockQuantity})!</span>
                        </div>
                      )}
                    </td>

                    {/* Đơn giá */}
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums font-medium text-slate-800 text-xs">
                      {item.price.toLocaleString('vi-VN')} đ
                    </td>

                    {/* Số lượng + / - */}
                    <td className="py-2.5 px-3">
                      <div className="flex items-center justify-center space-x-1.5">
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(item.productId, item.quantity - 1)}
                          className="w-7 h-7 flex items-center justify-center rounded-md bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 transition cursor-pointer active:scale-95"
                          title="Giảm 1"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => {
                            const val = parseInt(e.target.value, 10);
                            onUpdateQuantity(item.productId, isNaN(val) ? 1 : Math.max(1, val));
                          }}
                          className={`w-12 py-1 text-center font-bold text-xs rounded-md border focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono tabular-nums ${
                            isOverStock
                              ? 'border-rose-400 text-rose-800 bg-rose-50'
                              : 'border-slate-300 text-slate-900 bg-white'
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(item.productId, item.quantity + 1)}
                          className="w-7 h-7 flex items-center justify-center rounded-md bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 transition cursor-pointer active:scale-95"
                          title="Tăng 1"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                    {/* Thành tiền */}
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums font-bold text-slate-950 text-sm">
                      {item.subtotal.toLocaleString('vi-VN')} đ
                    </td>

                    {/* Nút xóa dòng */}
                    <td className="py-2.5 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => onRemoveItem(item.productId)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition cursor-pointer"
                        title="Xóa món khỏi giỏ"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Table Footer Warning Sticky */}
      {items.some((i) => i.quantity > i.stockQuantity) && (
        <div className="p-2.5 bg-rose-50 border-t border-rose-200 text-xs text-rose-800 flex items-center gap-2 font-medium">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>Chú ý: Có mặt hàng trong giỏ vượt quá tồn kho thực tế của tiệm. Vui lòng kiểm tra lại trước khi in bill.</span>
        </div>
      )}
    </div>
  );
};
