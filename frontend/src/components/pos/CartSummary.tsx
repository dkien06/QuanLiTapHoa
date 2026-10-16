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
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
          Chi Tiết Thanh Toán
        </h3>
        <span className="text-xs font-medium text-slate-500">
          Tổng cộng: <strong className="text-slate-800">{summary.totalQuantity} món</strong>
        </span>
      </div>

      {/* Breakdown Giá trị */}
      <div className="space-y-3 text-xs">
        {/* Tổng tiền hàng */}
        <div className="flex items-center justify-between text-slate-600">
          <span>Tổng tiền hàng (Tạm tính):</span>
          <span className="font-semibold text-slate-900 text-sm">
            {summary.subtotal.toLocaleString('vi-VN')} đ
          </span>
        </div>

        {/* Giảm giá */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-slate-600">
            <span className="flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-amber-500" />
              <span>Chiết khấu / Giảm giá:</span>
            </span>
            <span className="font-semibold text-rose-600">
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
              className="flex-1 py-1.5 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <div className="flex bg-slate-100 p-0.5 rounded-lg text-[11px] font-semibold border border-slate-200">
              <button
                type="button"
                onClick={() => handleApplyDiscount(discountInput, 'FIXED')}
                className={`px-2.5 py-1 rounded transition cursor-pointer ${
                  discountType === 'FIXED' ? 'bg-white text-blue-600 shadow-2xs font-bold' : 'text-slate-500'
                }`}
              >
                đ (VND)
              </button>
              <button
                type="button"
                onClick={() => handleApplyDiscount(discountInput, 'PERCENT')}
                className={`px-2.5 py-1 rounded transition cursor-pointer ${
                  discountType === 'PERCENT' ? 'bg-white text-blue-600 shadow-2xs font-bold' : 'text-slate-500'
                }`}
              >
                %
              </button>
            </div>
          </div>
        </div>

        {/* Tổng thanh toán TO RÕ RÀNG */}
        <div className="pt-3 pb-3 border-t border-dashed border-slate-200 flex items-center justify-between bg-blue-50/70 -mx-5 px-5 rounded-lg">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-blue-900">
              Tổng Cần Thu
            </p>
            <p className="text-[10px] text-blue-600">Hỗ trợ Tiền mặt & VietQR</p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-black text-blue-700 tracking-tight">
              {summary.finalTotal.toLocaleString('vi-VN')}
            </span>
            <span className="text-xs font-bold text-blue-600 ml-1">đ</span>
          </div>
        </div>
      </div>

      {/* Thông tin hỗ trợ thanh toán nhanh */}
      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs text-slate-500">
        <span className="text-[11px]">Phương thức chấp nhận:</span>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700 bg-white px-2 py-0.5 rounded-md border border-slate-200">
            <Banknote className="w-3 h-3 text-blue-600" /> Tiền mặt
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700 bg-white px-2 py-0.5 rounded-md border border-slate-200">
            <QrCode className="w-3 h-3 text-emerald-600" /> VietQR
          </span>
        </div>
      </div>

      {/* Nút Kích Hoạt Thanh Toán F9 */}
      <div className="pt-1">
        <button
          type="button"
          onClick={onCheckout}
          disabled={isDisabled || summary.finalTotal <= 0}
          className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-600/30 hover:shadow-emerald-600/40 active:scale-[0.99] transition-all flex items-center justify-between cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-emerald-100" />
            <span>THANH TOÁN ĐƠN HÀNG</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <kbd className="px-2 py-0.5 bg-white/20 text-white rounded text-[11px] font-mono">
              F9
            </kbd>
            <ArrowRight className="w-4 h-4" />
          </div>
        </button>
      </div>
    </div>
  );
};
