import React, { useState } from 'react';
import type { CartSummaryData, DiscountType } from '../../types/pos';
import { Tag, ArrowRight, ShieldCheck, Banknote, QrCode } from 'lucide-react';

interface CartSummaryProps {
  summary: CartSummaryData;
  onUpdateDiscount: (discount: number, type: DiscountType) => void;
  onCheckout: () => void;
  isDisabled: boolean;
}

export const CartSummary: React.FC<CartSummaryProps> = ({
  summary,
  onUpdateDiscount,
  onCheckout,
  isDisabled,
}) => {
  const [discountInput, setDiscountInput] = useState<string>('0');
  const [discountType, setDiscountType] = useState<DiscountType>('FIXED');

  const handleApplyDiscount = (val: string, type: DiscountType) => {
    setDiscountInput(val);
    setDiscountType(type);
    const num = parseFloat(val) || 0;
    onUpdateDiscount(Math.max(0, num), type);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 space-y-3.5">
      {/* Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
          Chi Tiết Thanh Toán
        </h3>
        <span className="text-xs font-medium text-slate-600">
          Tổng cộng: <strong className="text-slate-900">{summary.totalQuantity} món</strong>
        </span>
      </div>

      {/* Breakdown Giá trị */}
      <div className="space-y-3 text-xs">
        {/* Tổng tiền hàng */}
        <div className="flex items-center justify-between text-slate-600">
          <span>Tổng tiền hàng (Tạm tính):</span>
          <span className="font-semibold text-slate-900 font-mono tabular-nums text-sm">
            {summary.subtotal.toLocaleString('vi-VN')} đ
          </span>
        </div>

        {/* Giảm giá */}
        <div className="space-y-1.5 pt-0.5">
          <div className="flex items-center justify-between text-slate-600">
            <span className="flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-amber-500" />
              <span>Chiết khấu / Giảm giá:</span>
            </span>
            <span className="font-semibold text-rose-700 font-mono tabular-nums">
              -{summary.discountAmount.toLocaleString('vi-VN')} đ
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <input
              type="number"
              min="0"
              value={discountInput}
              onChange={(e) => handleApplyDiscount(e.target.value, discountType)}
              placeholder="0"
              className="flex-1 py-1.5 px-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono tabular-nums"
            />
            <div className="flex bg-slate-100 p-0.5 rounded-lg text-xs font-semibold border border-slate-200">
              <button
                type="button"
                onClick={() => handleApplyDiscount(discountInput, 'FIXED')}
                className={`px-2.5 py-1 rounded transition cursor-pointer ${
                  discountType === 'FIXED' ? 'bg-white text-blue-700 shadow-2xs font-bold' : 'text-slate-600'
                }`}
              >
                đ (VND)
              </button>
              <button
                type="button"
                onClick={() => handleApplyDiscount(discountInput, 'PERCENT')}
                className={`px-2.5 py-1 rounded transition cursor-pointer ${
                  discountType === 'PERCENT' ? 'bg-white text-blue-700 shadow-2xs font-bold' : 'text-slate-600'
                }`}
              >
                %
              </button>
            </div>
          </div>
        </div>

        {/* Tổng thanh toán TO RÕ RÀNG */}
        <div className="pt-3 pb-3 border-t border-slate-200 flex items-center justify-between bg-blue-50/80 -mx-4 px-4 rounded-lg border border-blue-200/60">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-blue-950">
              Tổng Cần Thu
            </p>
            <p className="text-xs text-blue-700 font-medium">Tiền mặt / VietQR</p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-black text-blue-700 font-mono tabular-nums tracking-tight">
              {summary.finalTotal.toLocaleString('vi-VN')}
            </span>
            <span className="text-xs font-bold text-blue-700 ml-1">VNĐ</span>
          </div>
        </div>
      </div>

      {/* Thông tin hỗ trợ thanh toán nhanh */}
      <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between text-xs text-slate-600">
        <span>Phương thức:</span>
        <div className="flex items-center gap-1.5">
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 bg-white px-2 py-0.5 rounded-md border border-slate-200">
            <Banknote className="w-3.5 h-3.5 text-blue-600" /> Tiền mặt
          </span>
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 bg-white px-2 py-0.5 rounded-md border border-slate-200">
            <QrCode className="w-3.5 h-3.5 text-emerald-600" /> VietQR
          </span>
        </div>
      </div>

      {/* Nút Kích Hoạt Thanh Toán F9 */}
      <div className="pt-1">
        <button
          type="button"
          onClick={onCheckout}
          disabled={isDisabled || summary.finalTotal <= 0}
          className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-sm rounded-lg shadow-sm active:translate-y-0.5 transition-all flex items-center justify-between cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-emerald-100" />
            <span>THANH TOÁN ĐƠN HÀNG</span>
          </div>
          <div className="flex items-center space-x-2">
            <kbd className="keycap text-emerald-950 font-bold">
              F9
            </kbd>
            <ArrowRight className="w-4 h-4" />
          </div>
        </button>
      </div>
    </div>
  );
};
