import React, { useState, useEffect, useRef } from 'react';
import type { PaymentMethod, BankConfig } from '../../types/pos';
import { DEFAULT_BANK_CONFIG, generateVietQRUrl } from '../../services/posService';
import {
  X,
  Banknote,
  QrCode,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Building2,
  CreditCard,
  User,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderCode: string;
  finalTotal: number;
  itemCount: number;
  totalQuantity: number;
  onConfirmPayment: (paymentData: {
    paymentMethod: PaymentMethod;
    customerPaid: number;
    changeAmount: number;
    bankInfo?: BankConfig;
  }) => Promise<void> | void;
  isProcessing?: boolean;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  orderCode,
  finalTotal,
  itemCount,
  totalQuantity,
  onConfirmPayment,
  isProcessing = false,
}) => {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [customerPaidInput, setCustomerPaidInput] = useState<string>('');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isQrPaidConfirmed, setIsQrPaidConfirmed] = useState<boolean>(false);
  const cashInputRef = useRef<HTMLInputElement>(null);

  // Khi modal mở, tự động gán giá trị mặc định và focus
  useEffect(() => {
    if (isOpen) {
      setPaymentMethod('CASH');
      setCustomerPaidInput(finalTotal > 0 ? finalTotal.toString() : '');
      setIsQrPaidConfirmed(false);
      setCopiedField(null);

      // Focus ô nhập tiền khách đưa
      const timer = setTimeout(() => {
        cashInputRef.current?.focus();
        cashInputRef.current?.select();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen, finalTotal]);

  if (!isOpen) return null;

  const customerPaid = parseFloat(customerPaidInput) || 0;
  const isUnderpaid = paymentMethod === 'CASH' && customerPaid < finalTotal;
  const changeAmount = Math.max(0, customerPaid - finalTotal);
  const underpaidAmount = Math.max(0, finalTotal - customerPaid);

  const bankConfig: BankConfig = DEFAULT_BANK_CONFIG;
  const vietQrUrl = generateVietQRUrl(bankConfig, finalTotal, orderCode);

  // Danh sách các phím chọn nhanh tiền mặt (đầy đủ các mệnh giá phổ biến của Việt Nam)
  const quickCashOptions = [
    { label: 'Đủ tiền', value: finalTotal },
    { label: '10.000', value: 10000 },
    { label: '20.000', value: 20000 },
    { label: '50.000', value: 50000 },
    { label: '100.000', value: 100000 },
    { label: '200.000', value: 200000 },
    { label: '500.000', value: 500000 },
  ];

  // Xử lý sao chép thông tin chuyển khoản
  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    });
  };

  // Xác nhận thanh toán
  const handleConfirm = () => {
    if (isProcessing) return;

    if (paymentMethod === 'CASH') {
      if (customerPaid < finalTotal) return; // Chặn nếu khách đưa thiếu
      onConfirmPayment({
        paymentMethod: 'CASH',
        customerPaid,
        changeAmount,
      });
    } else {
      // Chuyển khoản QR
      onConfirmPayment({
        paymentMethod: 'TRANSFER',
        customerPaid: finalTotal,
        changeAmount: 0,
        bankInfo: bankConfig,
      });
    }
  };

  // Xử lý phím tắt trong modal (Enter để xác nhận, Esc để thoát)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    } else if (e.key === 'Enter') {
      if (!isUnderpaid && !isProcessing) {
        e.preventDefault();
        handleConfirm();
      }
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs"
      onKeyDown={handleKeyDown}
    >
      <div className="bg-white w-full max-w-lg rounded-xl shadow-xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-4 sm:p-4.5 flex items-center justify-between border-b border-slate-800">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 text-xs font-mono font-bold border border-blue-400/30">
                #{orderCode}
              </span>
              <span className="text-xs text-slate-400 font-medium">
                ({itemCount} món - {totalQuantity} cái)
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white mt-1">
              Xác Nhận Thanh Toán Đơn Hàng
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

        {/* Tổng tiền nổi bật */}
        <div className="bg-blue-50/90 px-5 py-3 border-b border-blue-200/80 flex items-center justify-between">
          <span className="text-xs font-bold text-blue-950 uppercase tracking-wide">
            Tổng Tiền Phải Thu:
          </span>
          <div className="text-right">
            <span className="text-2xl sm:text-3xl font-black text-blue-700 font-mono tabular-nums tracking-tight">
              {finalTotal.toLocaleString('vi-VN')}
            </span>
            <span className="text-sm font-bold text-blue-700 ml-1.5">VNĐ</span>
          </div>
        </div>

        {/* Thân Modal */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {/* Lựa chọn phương thức thanh toán */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Phương Thức Thanh Toán
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {/* Nút Tiền mặt */}
              <button
                type="button"
                onClick={() => {
                  setPaymentMethod('CASH');
                  setTimeout(() => cashInputRef.current?.focus(), 50);
                }}
                className={`py-2.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer border-2 ${
                  paymentMethod === 'CASH'
                    ? 'bg-blue-50 border-blue-600 text-blue-800 shadow-2xs'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <div
                  className={`p-1.5 rounded-md ${
                    paymentMethod === 'CASH' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  <Banknote className="w-4 h-4" />
                </div>
                <span>TIỀN MẶT (CASH)</span>
              </button>

              {/* Nút Chuyển khoản QR */}
              <button
                type="button"
                onClick={() => setPaymentMethod('TRANSFER')}
                className={`py-2.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer border-2 ${
                  paymentMethod === 'TRANSFER'
                    ? 'bg-emerald-50 border-emerald-600 text-emerald-800 shadow-2xs'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <div
                  className={`p-1.5 rounded-md ${
                    paymentMethod === 'TRANSFER'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  <QrCode className="w-4 h-4" />
                </div>
                <span>VIETQR / CHUYỂN KHOẢN</span>
              </button>
            </div>
          </div>

          {/* TAB 1: TIỀN MẶT */}
          {paymentMethod === 'CASH' && (
            <div className="space-y-3.5 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                  Tiền khách đưa (VNĐ):
                </label>
                <div className="relative">
                  <input
                    ref={cashInputRef}
                    type="number"
                    min="0"
                    step="1000"
                    value={customerPaidInput}
                    onChange={(e) => setCustomerPaidInput(e.target.value)}
                    placeholder="Nhập số tiền khách đưa..."
                    className={`w-full py-2.5 pl-3.5 pr-14 text-right font-bold text-xl rounded-lg border font-mono tabular-nums focus:outline-none focus:ring-2 transition ${
                      isUnderpaid
                        ? 'border-rose-400 bg-rose-50 text-rose-800 focus:ring-rose-500'
                        : 'border-slate-300 bg-white text-slate-900 focus:ring-blue-500'
                    }`}
                  />
                  <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-xs font-bold text-slate-400">
                    VNĐ
                  </div>
                </div>
              </div>

              {/* Nút chọn nhanh mệnh giá */}
              <div>
                <span className="block text-xs font-medium text-slate-600 mb-1.5">
                  Chọn nhanh mệnh giá tiền:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {quickCashOptions.map((opt) => (
                    <button
                      key={opt.label}
                      type="button"
                      onClick={() => {
                        setCustomerPaidInput(opt.value.toString());
                        cashInputRef.current?.focus();
                      }}
                      className="px-2.5 py-1.5 bg-white hover:bg-blue-50 hover:text-blue-700 text-slate-800 text-xs font-semibold rounded-md border border-slate-300 shadow-2xs transition cursor-pointer active:translate-y-0.5 font-mono tabular-nums"
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Kết quả tính tiền thối lại hoặc cảnh báo thiếu */}
              <div className="pt-2 border-t border-slate-200">
                {isUnderpaid ? (
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-rose-100 text-rose-900 border border-rose-300 text-xs font-medium">
                    <div className="flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span className="font-semibold">Khách đưa chưa đủ tiền:</span>
                    </div>
                    <span className="font-bold text-sm text-rose-700 font-mono tabular-nums">
                      Thiếu {underpaidAmount.toLocaleString('vi-VN')} đ
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-100 text-emerald-950 border border-emerald-300 text-xs">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="font-semibold">Tiền thối lại cho khách:</span>
                    </div>
                    <span className="font-black text-base text-emerald-700 font-mono tabular-nums">
                      {changeAmount.toLocaleString('vi-VN')} đ
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: CHUYỂN KHOẢN QR (VIETQR) */}
          {paymentMethod === 'TRANSFER' && (
            <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                {/* Khung ảnh QR VietQR */}
                <div className="w-48 h-48 bg-white p-2 rounded-xl border-2 border-emerald-500 shadow-sm flex items-center justify-center shrink-0 relative group">
                  <img
                    src={vietQrUrl}
                    alt="VietQR Code"
                    className="w-full h-full object-contain rounded-lg"
                    loading="lazy"
                  />
                  <div className="absolute -bottom-2.5 bg-emerald-700 text-white text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider shadow-xs">
                    App Ngân Hàng / MoMo
                  </div>
                </div>

                {/* Chi tiết tài khoản nhận tiền */}
                <div className="flex-1 w-full space-y-2 text-xs">
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200 space-y-1">
                    <div className="flex items-center justify-between text-slate-500 text-xs">
                      <span className="flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-blue-500" /> Ngân hàng:
                      </span>
                      <strong className="text-slate-900">{bankConfig.bankName}</strong>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1 text-slate-500 text-xs">
                        <CreditCard className="w-3.5 h-3.5 text-blue-500" /> Số TK:
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-slate-950 text-xs">
                          {bankConfig.accountNo}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy(bankConfig.accountNo, 'accNo')}
                          className="p-1 hover:bg-slate-100 rounded text-slate-600 transition cursor-pointer"
                          title="Sao chép số TK"
                        >
                          {copiedField === 'accNo' ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1 text-slate-500">
                        <User className="w-3.5 h-3.5 text-blue-500" /> Chủ TK:
                      </span>
                      <span className="font-semibold text-slate-900">{bankConfig.accountName}</span>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
                      <span className="text-slate-500">Số tiền:</span>
                      <strong className="text-emerald-700 text-xs font-bold font-mono tabular-nums">
                        {finalTotal.toLocaleString('vi-VN')} đ
                      </strong>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Nội dung CK:</span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-blue-700">{orderCode}</span>
                        <button
                          type="button"
                          onClick={() => handleCopy(orderCode, 'code')}
                          className="p-1 hover:bg-slate-100 rounded text-slate-600 transition cursor-pointer"
                          title="Sao chép nội dung CK"
                        >
                          {copiedField === 'code' ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Xác nhận đã nhận tiền */}
                  <label className="flex items-center gap-2 p-2 bg-emerald-50 rounded-lg border border-emerald-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isQrPaidConfirmed}
                      onChange={(e) => setIsQrPaidConfirmed(e.target.checked)}
                      className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                    />
                    <span className="text-xs font-semibold text-emerald-950 select-none">
                      Đã nhận đủ {finalTotal.toLocaleString('vi-VN')} đ trong tài khoản
                    </span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300 transition cursor-pointer"
          >
            Hủy Bỏ (Esc)
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={
              isProcessing ||
              (paymentMethod === 'CASH' && isUnderpaid) ||
              (paymentMethod === 'TRANSFER' && !isQrPaidConfirmed)
            }
            className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:translate-y-0.5"
          >
            {isProcessing ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Đang xử lý đơn hàng...</span>
              </div>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4 text-emerald-200" />
                <span>XÁC NHẬN THANH TOÁN (Enter)</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
