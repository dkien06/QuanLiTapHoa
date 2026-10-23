import React, { useEffect, useRef } from 'react';
import type { SaleOrderDraft } from '../../types/pos';
import { MOCK_DEFAULT_USER } from '../../mock/mockConfig';
import { Printer, CheckCircle, RotateCcw, X, Store, QrCode } from 'lucide-react';

interface ReceiptPreviewModalProps {
  order: SaleOrderDraft | null;
  isOpen: boolean;
  onClose: () => void;
  onNewOrder: () => void;
}

export const ReceiptPreviewModal: React.FC<ReceiptPreviewModalProps> = ({
  order,
  isOpen,
  onClose,
  onNewOrder,
}) => {
  const receiptRef = useRef<HTMLDivElement>(null);

  // Lắng nghe phím tắt Ctrl+P và Enter / Esc
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        window.print();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        onNewOrder();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, onNewOrder]);

  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      {/* Khối CSS chuyên biệt chỉ áp dụng khi In Nhiệt K80 (@media print) */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #pos-receipt-print-area,
          #pos-receipt-print-area * {
            visibility: visible;
          }
          #pos-receipt-print-area {
            position: fixed;
            left: 0;
            top: 0;
            width: 78mm !important;
            max-width: 80mm !important;
            margin: 0 !important;
            padding: 4mm !important;
            background: #ffffff !important;
            color: #000000 !important;
            box-shadow: none !important;
            border: none !important;
            font-size: 11px !important;
            line-height: 1.3 !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Modal Backdrop & Container */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs animate-fade-in no-print">
        <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[92vh]">
          {/* Header Thông Báo Thành Công */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-4 flex items-center justify-between shrink-0">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-sm leading-tight">Thanh Toán Thành Công</h3>
                <p className="text-[11px] text-emerald-100">
                  Đã tạo hóa đơn #{order.orderCode}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 hover:bg-white/20 rounded-xl text-emerald-100 hover:text-white transition cursor-pointer"
              title="Đóng (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Vùng xem trước Hóa đơn K80 (Kích thước chuẩn in nhiệt 80mm ~ 340px) */}
          <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-slate-100/70 flex justify-center">
            <div
              id="pos-receipt-print-area"
              ref={receiptRef}
              className="bg-white w-full max-w-[340px] p-4 sm:p-5 rounded-2xl shadow-md border border-slate-200 font-mono text-slate-800 text-xs space-y-3.5 select-text"
            >
              {/* Header Cửa Hàng */}
              <div className="text-center space-y-1 pb-3 border-b border-dashed border-slate-300">
                <div className="w-8 h-8 mx-auto bg-slate-100 rounded-lg flex items-center justify-center text-slate-700 mb-1">
                  <Store className="w-4 h-4" />
                </div>
                <h2 className="text-sm font-black tracking-tight uppercase text-slate-900 leading-tight">
                  {order.storeName || MOCK_DEFAULT_USER.storeName}
                </h2>
                <p className="text-[10px] text-slate-500 leading-tight">
                  {order.storeAddress || MOCK_DEFAULT_USER.storeAddress}
                </p>
                <p className="text-[10px] text-slate-500">Hotline: 0901.234.567</p>

                <div className="pt-2">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-900 pb-0.5">
                    HÓA ĐƠN BÁN LẺ
                  </span>
                </div>

                <div className="pt-1.5 flex justify-between text-[10px] text-slate-500">
                  <span>Mã: #{order.orderCode}</span>
                  <span>{order.createdAt}</span>
                </div>
                <div className="text-left text-[10px] text-slate-600 font-sans">
                  Thu ngân: <strong className="font-mono">{order.cashierName}</strong>
                </div>
              </div>

              {/* Bảng Mặt Hàng */}
              <div className="space-y-2 pb-3 border-b border-dashed border-slate-300">
                <div className="flex justify-between font-bold text-[10px] text-slate-500 uppercase tracking-wider">
                  <span className="w-1/2">Tên Mặt Hàng</span>
                  <span className="text-right w-1/4">SL x Giá</span>
                  <span className="text-right w-1/4">T.Tiền</span>
                </div>

                {order.items.map((item, idx) => (
                  <div key={item.productId || idx} className="text-[11px] leading-tight">
                    <div className="font-bold text-slate-900">{item.name}</div>
                    <div className="flex justify-between text-[10px] text-slate-500 pt-0.5">
                      <span>
                        {item.quantity} {item.unit} x {item.price.toLocaleString('vi-VN')}
                      </span>
                      <span className="font-bold text-slate-800">
                        {item.subtotal.toLocaleString('vi-VN')} đ
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Tính Tiền & Giảm Giá */}
              <div className="space-y-1.5 pb-3 border-b border-dashed border-slate-300 text-[11px]">
                <div className="flex justify-between text-slate-600">
                  <span>Tổng tiền hàng:</span>
                  <span>{order.summary.subtotal.toLocaleString('vi-VN')} đ</span>
                </div>

                {order.summary.discountAmount > 0 && (
                  <div className="flex justify-between text-rose-600 font-semibold">
                    <span>Chiết khấu / Giảm giá:</span>
                    <span>-{order.summary.discountAmount.toLocaleString('vi-VN')} đ</span>
                  </div>
                )}

                <div className="flex justify-between font-black text-sm text-slate-900 pt-1.5 border-t border-dotted border-slate-200">
                  <span>TỔNG CỘNG:</span>
                  <span className="text-emerald-700 text-base">
                    {order.summary.finalTotal.toLocaleString('vi-VN')} đ
                  </span>
                </div>
              </div>

              {/* Chi Tiết Thanh Toán */}
              <div className="space-y-1 text-[11px] text-slate-600 pb-2 border-b border-dashed border-slate-300">
                <div className="flex justify-between">
                  <span>Hình thức thanh toán:</span>
                  <strong className="text-slate-900">
                    {order.paymentMethod === 'CASH'
                      ? 'TIỀN MẶT'
                      : order.paymentMethod === 'TRANSFER'
                      ? 'CHUYỂN KHOẢN VIETQR'
                      : 'QUÉT MÃ QR'}
                  </strong>
                </div>

                {order.paymentMethod === 'CASH' ? (
                  <>
                    <div className="flex justify-between">
                      <span>Tiền khách đưa:</span>
                      <span>{order.summary.customerPaid.toLocaleString('vi-VN')} đ</span>
                    </div>
                    <div className="flex justify-between font-bold text-slate-800 pt-0.5">
                      <span>Tiền thối lại:</span>
                      <span className="text-blue-700 font-black">
                        {order.summary.changeAmount.toLocaleString('vi-VN')} đ
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Trạng thái:</span>
                    <span>Đã nhận đủ tiền</span>
                  </div>
                )}
              </div>

              {/* Chân Bill & Lời Cảm Ơn */}
              <div className="text-center pt-2 space-y-1.5 font-sans">
                <div className="inline-flex items-center justify-center gap-1 text-[10px] text-slate-400">
                  <QrCode className="w-3.5 h-3.5" />
                  <span className="font-mono">{order.orderCode}</span>
                </div>
                <p className="text-[11px] font-semibold text-slate-800">
                  Cảm ơn Quý Khách - Hẹn Gặp Lại!
                </p>
                <p className="text-[9px] text-slate-400 italic">
                  (Hóa đơn điện tử khởi tạo từ máy tính tiền POS)
                </p>
              </div>
            </div>
          </div>

          {/* Thanh Nút Tác Vụ Footer (Ẩn khi In) */}
          <div className="p-4 bg-white border-t border-slate-200 flex gap-2.5 shrink-0 no-print">
            <button
              type="button"
              onClick={handlePrint}
              className="flex-1 py-3 px-3 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 cursor-pointer border border-slate-300"
            >
              <Printer className="w-4 h-4 text-slate-600" />
              <span>In Hóa Đơn</span>
              <kbd className="px-1.5 py-0.5 bg-white rounded border border-slate-300 text-[10px] font-mono text-slate-600">
                Ctrl+P
              </kbd>
            </button>

            <button
              type="button"
              onClick={onNewOrder}
              className="flex-1 py-3 px-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Tạo Đơn Mới</span>
              <kbd className="px-1.5 py-0.5 bg-white/20 rounded text-[10px] font-mono text-white">
                Enter
              </kbd>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
