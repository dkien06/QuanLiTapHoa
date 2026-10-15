import React, { useState } from 'react';
import type {
  CartSummaryData,
  DiscountType,
  PaymentMethod,
} from '../../types/pos';
import {
  CreditCard,
  Banknote,
  QrCode,
  Tag,
  ArrowRight,
  CheckCircle,
} from 'lucide-react';

interface CartSummaryProps {
  summary: CartSummaryData;
  onUpdateDiscount: (discount: number, type: DiscountType) => void;
  onUpdateCustomerPaid: (paid: number) => void;
  onPaymentMethodChange: (method: PaymentMethod) => void;
  selectedPaymentMethod: PaymentMethod;
  onCheckout: () => void;
  isDisabled: boolean;
}

export const CartSummary: React.FC<CartSummaryProps> = ({
  summary,
  onUpdateDiscount,
  onUpdateCustomerPaid,
  onPaymentMethodChange,
  selectedPaymentMethod,
  onCheckout,
  isDisabled,
}) => {
  const [discountInput, setDiscountInput] = useState<string>('0');
  const [discountType, setDiscountType] = useState<DiscountType>('FIXED');
  const [customPaidInput, setCustomPaidInput] = useState<string>('');


  const handleApplyDiscount = (val: string, type: DiscountType) => {
    setDiscountInput(val);
    setDiscountType(type);
    const num = parseFloat(val) || 0;
    onUpdateDiscount(Math.max(0, num), type);
  };

  const handlePaidChange = (val: string) => {
    setCustomPaidInput(val);
    const num = parseFloat(val) || 0;
    onUpdateCustomerPaid(Math.max(0, num));
  };

  const quickMoneyOptions = [
    { label: 'Đủ tiền', value: summary.finalTotal },
    { label: '50k', value: 50000 },
    { label: '100k', value: 100000 },
    { label: '200k', value: 200000 },
    { label: '500k', value: 500000 },
  ];

  const isUnderpaid =
    selectedPaymentMethod === 'CASH' &&
    customPaidInput !== '' &&
    summary.customerPaid < summary.finalTotal &&
    summary.finalTotal > 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
          Chi Tiết Thanh Toán
        </h3>
        <span className="text-xs font-medium text-slate-500">
          Tổng cộng: <strong className="text-slate-800">{summary.totalQuantity} món</strong>
        </span>
      </div>

      {/* Breakdown Giá trị */}
      <div className="space-y-2.5 text-xs">
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
              className="flex-1 py-1 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <div className="flex bg-slate-100 p-0.5 rounded-lg text-[11px] font-semibold border border-slate-200">
              <button
                type="button"
                onClick={() => handleApplyDiscount(discountInput, 'FIXED')}
                className={`px-2 py-0.5 rounded transition cursor-pointer ${
                  discountType === 'FIXED' ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-500'
                }`}
              >
                đ (VND)
              </button>
              <button
                type="button"
                onClick={() => handleApplyDiscount(discountInput, 'PERCENT')}
                className={`px-2 py-0.5 rounded transition cursor-pointer ${
                  discountType === 'PERCENT' ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-500'
                }`}
              >
                %
              </button>
            </div>
          </div>
        </div>

        {/* Tổng thanh toán TO RÕ RÀNG */}
        <div className="pt-3 pb-2 border-t border-dashed border-slate-200 flex items-center justify-between bg-blue-50/50 -mx-5 px-5 py-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-blue-900">
              Tổng Cần Thanh Toán
            </p>
            <p className="text-[10px] text-blue-600">Đã bao gồm thuế & giảm giá</p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-black text-blue-700 tracking-tight">
              {summary.finalTotal.toLocaleString('vi-VN')}
            </span>
            <span className="text-xs font-bold text-blue-600 ml-1">đ</span>
          </div>
        </div>
      </div>

      {/* Phương thức thanh toán */}
      <div className="space-y-2 pt-1">
        <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
          Phương thức thanh toán
        </label>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => onPaymentMethodChange('CASH')}
            className={`py-2 px-2.5 rounded-xl text-xs font-semibold flex flex-col items-center justify-center gap-1 transition cursor-pointer border ${
              selectedPaymentMethod === 'CASH'
                ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Banknote className="w-4 h-4" />
            <span className="text-[11px]">Tiền mặt</span>
          </button>

          <button
            type="button"
            onClick={() => onPaymentMethodChange('TRANSFER')}
            className={`py-2 px-2.5 rounded-xl text-xs font-semibold flex flex-col items-center justify-center gap-1 transition cursor-pointer border ${
              selectedPaymentMethod === 'TRANSFER'
                ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span className="text-[11px]">Chuyển khoản</span>
          </button>

          <button
            type="button"
            onClick={() => onPaymentMethodChange('QR')}
            className={`py-2 px-2.5 rounded-xl text-xs font-semibold flex flex-col items-center justify-center gap-1 transition cursor-pointer border ${
              selectedPaymentMethod === 'QR'
                ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span className="text-[11px]">Quét QR</span>
          </button>
        </div>
      </div>

      {/* Tiền khách đưa & Tiền thối lại (Dành cho tiền mặt) */}
      {selectedPaymentMethod === 'CASH' && (
        <div className="space-y-2 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-700">Tiền khách đưa:</span>
            <div className="relative w-36">
              <input
                type="number"
                min="0"
                value={customPaidInput}
                onChange={(e) => handlePaidChange(e.target.value)}
                placeholder="Nhập số tiền..."
                className="w-full py-1.5 px-2 text-right font-bold text-slate-900 bg-white border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Nút chọn nhanh mệnh giá tiền mặt */}
          <div className="flex flex-wrap gap-1 pt-1 justify-end">
            {quickMoneyOptions.map((opt) => (
              <button
                key={opt.label}
                type="button"
                onClick={() => {
                  handlePaidChange(opt.value.toString());
                }}
                className="px-2 py-0.5 bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 text-[10px] font-semibold rounded border border-slate-200 transition cursor-pointer"
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Tiền thừa / Tiền thối */}
          <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
            <span className="font-semibold text-slate-700">Tiền thối lại:</span>
            <span
              className={`font-bold text-sm ${
                isUnderpaid ? 'text-rose-600' : 'text-emerald-600'
              }`}
            >
              {isUnderpaid
                ? `(Thiếu ${(summary.finalTotal - summary.customerPaid).toLocaleString('vi-VN')} đ)`
                : `${summary.changeAmount.toLocaleString('vi-VN')} đ`}
            </span>
          </div>
        </div>
      )}

      {/* Nút Thanh toán F9 */}
      <div className="pt-2">
        <button
          type="button"
          onClick={onCheckout}
          disabled={isDisabled || isUnderpaid}
          className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-600/30 hover:shadow-emerald-600/40 hover:from-emerald-700 hover:to-teal-700 active:scale-[0.99] transition-all flex items-center justify-between cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-emerald-100" />
            <span>XÁC NHẬN THANH TOÁN</span>
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
