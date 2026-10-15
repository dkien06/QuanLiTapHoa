import React from 'react';
import type { SaleOrderDraft } from '../../types/pos';
import { Printer, CheckCircle, X, RotateCcw } from 'lucide-react';

interface ReceiptModalProps {
  order: SaleOrderDraft | null;
  isOpen: boolean;
  onClose: () => void;
  onNewOrder: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  order,
  isOpen,
  onClose,
  onNewOrder,
}) => {
  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]">
        {/* Header Modal */}
        <div className="bg-emerald-600 text-white p-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-emerald-100" />
            <h3 className="font-bold text-sm">Thanh Toán Hoàn Tất</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 hover:bg-emerald-700 rounded-lg text-emerald-100 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Khung Hóa đơn in nhiệt mô phỏng */}
        <div className="p-6 overflow-y-auto flex-1 font-mono text-xs text-slate-800 space-y-4 bg-slate-50/50">
          <div className="text-center space-y-1 pb-3 border-b border-dashed border-slate-300">
            <h2 className="text-base font-black tracking-tight uppercase text-slate-900">
              {order.storeName}
            </h2>
            <p className="text-[11px] text-slate-500">{order.storeAddress}</p>
            <p className="text-[11px] text-slate-500">Mã đơn: #{order.orderCode}</p>
            <p className="text-[10px] text-slate-400">{order.createdAt}</p>
            <p className="text-[11px] text-slate-600 pt-1 font-sans">
              Thu ngân: <strong>{order.cashierName}</strong>
            </p>
          </div>

          {/* Danh sách món */}
          <div className="space-y-2 pb-3 border-b border-dashed border-slate-300">
            <div className="flex justify-between font-bold text-[11px] text-slate-600 uppercase">
              <span>Mặt hàng</span>
              <span>T.Tiền</span>
            </div>
            {order.items.map((item) => (
              <div key={item.productId} className="flex justify-between items-start text-xs">
                <div className="pr-2">
                  <p className="font-bold text-slate-900">{item.name}</p>
                  <p className="text-[10px] text-slate-500">
                    {item.quantity} {item.unit} x {item.price.toLocaleString('vi-VN')} đ
                  </p>
                </div>
                <span className="font-bold shrink-0 text-slate-800">
                  {item.subtotal.toLocaleString('vi-VN')} đ
                </span>
              </div>
            ))}
          </div>

          {/* Tổng tiền */}
          <div className="space-y-1.5 pb-3 border-b border-dashed border-slate-300 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Tổng tiền hàng:</span>
              <span>{order.summary.subtotal.toLocaleString('vi-VN')} đ</span>
            </div>
            {order.summary.discountAmount > 0 && (
              <div className="flex justify-between text-rose-600 font-semibold">
                <span>Giảm giá / Chiết khấu:</span>
                <span>-{order.summary.discountAmount.toLocaleString('vi-VN')} đ</span>
              </div>
            )}
            <div className="flex justify-between font-black text-sm text-slate-900 pt-1">
              <span>TỔNG CỘNG:</span>
              <span className="text-emerald-700">
                {order.summary.finalTotal.toLocaleString('vi-VN')} đ
              </span>
            </div>
          </div>

          {/* Thông tin thanh toán */}
          <div className="space-y-1 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Hình thức:</span>
              <span className="font-bold">
                {order.paymentMethod === 'CASH'
                  ? 'Tiền mặt'
                  : order.paymentMethod === 'TRANSFER'
                  ? 'Chuyển khoản'
                  : 'Quét mã VietQR'}
              </span>
            </div>
            {order.paymentMethod === 'CASH' && (
              <>
                <div className="flex justify-between">
                  <span>Tiền khách đưa:</span>
                  <span>{order.summary.customerPaid.toLocaleString('vi-VN')} đ</span>
                </div>
                <div className="flex justify-between font-bold text-slate-800">
                  <span>Tiền thối lại:</span>
                  <span className="text-blue-600">
                    {order.summary.changeAmount.toLocaleString('vi-VN')} đ
                  </span>
                </div>
              </>
            )}
          </div>

          <div className="text-center pt-2 text-[11px] text-slate-400 font-sans italic">
            Cảm ơn quý khách và hẹn gặp lại!
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-white border-t border-slate-200 flex gap-2">
          <button
            type="button"
            onClick={handlePrint}
            className="flex-1 py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>In Hóa Đơn</span>
          </button>

          <button
            type="button"
            onClick={onNewOrder}
            className="flex-1 py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Tạo Đơn Mới</span>
          </button>
        </div>
      </div>
    </div>
  );
};
