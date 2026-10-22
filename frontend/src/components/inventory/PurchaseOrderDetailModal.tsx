import React, { useEffect, useState } from 'react';
import type { PurchaseOrderRecord, PurchaseOrderStatus } from '../../types/purchaseOrder';
import { purchaseOrderService } from '../../services/purchaseOrderService';
import {
  X,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Truck,
  AlertTriangle,
  XCircle,
  Package,
  FileText,
  DollarSign,
  AlertCircle,
} from 'lucide-react';

interface PurchaseOrderDetailModalProps {
  order: PurchaseOrderRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmReceived: (orderId: string) => void;
}

export const PurchaseOrderDetailModal: React.FC<PurchaseOrderDetailModalProps> = ({
  order,
  isOpen,
  onClose,
  onConfirmReceived,
}) => {
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);

  // Keyboard shortcut: Escape to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        if (showConfirmPopup) {
          setShowConfirmPopup(false);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, showConfirmPopup, onClose]);

  if (!isOpen || !order) return null;

  // Lấy thêm thông tin xưởng nếu có supplierId
  const supplierInfo = order.supplierId
    ? purchaseOrderService.getSupplierById(order.supplierId)
    : null;

  const totalQuantity = order.items.reduce((sum, i) => sum + i.quantity, 0);

  // Status Badge Rendering
  const renderStatusBadge = (status: PurchaseOrderStatus) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-300">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <Clock className="w-3.5 h-3.5" />
            <span>Chờ xưởng duyệt</span>
          </span>
        );
      case 'CONFIRMED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-300">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <FileText className="w-3.5 h-3.5" />
            <span>Xưởng đã duyệt</span>
          </span>
        );
      case 'SHIPPING':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-800 border border-purple-300">
            <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
            <Truck className="w-3.5 h-3.5" />
            <span>Đang vận chuyển</span>
          </span>
        );
      case 'RECEIVED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Đã nhận hàng (Đã nhập kho)</span>
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-300">
            <span className="w-2 h-2 rounded-full bg-slate-400" />
            <XCircle className="w-3.5 h-3.5" />
            <span>Đã hủy</span>
          </span>
        );
    }
  };

  const isEligibleToReceive =
    order.status === 'SHIPPING' || order.status === 'CONFIRMED';

  const handleConfirmReceiveSubmit = () => {
    onConfirmReceived(order.id);
    setShowConfirmPopup(false);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-150"
    >
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold font-mono text-white">
                  {order.orderCode}
                </h2>
                <span
                  className={`px-2 py-0.5 text-[10px] font-bold rounded-md uppercase tracking-wider ${
                    order.type === 'B2B'
                      ? 'bg-blue-900/80 text-blue-200 border border-blue-700'
                      : 'bg-emerald-900/80 text-emerald-200 border border-emerald-700'
                  }`}
                >
                  {order.type === 'B2B' ? 'Xưởng B2B' : 'Nhập Ngoài'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Chi tiết đơn đặt hàng và danh sách mặt hàng nhập kho
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition cursor-pointer"
            title="Đóng (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-slate-50/40">
          {/* Status & Key Info Card */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <span className="text-xs text-slate-500 font-medium">Trạng thái đơn:</span>
              <div className="mt-1">{renderStatusBadge(order.status)}</div>
            </div>

            <div>
              <span className="text-xs text-slate-500 font-medium">Thời gian đặt hàng:</span>
              <div className="flex items-center gap-1.5 mt-1 text-xs font-semibold text-slate-800 font-mono">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{new Date(order.createdAt).toLocaleString('vi-VN')}</span>
              </div>
            </div>

            <div>
              <span className="text-xs text-slate-500 font-medium">Thời gian nhận hàng:</span>
              <div className="flex items-center gap-1.5 mt-1 text-xs font-semibold text-slate-800 font-mono">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>
                  {order.receivedAt
                    ? new Date(order.receivedAt).toLocaleString('vi-VN')
                    : 'Chưa nhận hàng'}
                </span>
              </div>
            </div>
          </div>

          {/* Supplier Info Box */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-blue-600" />
              <span>Đơn vị cung cấp / Xưởng sản xuất</span>
            </h3>
            <div className="space-y-1">
              <p className="text-sm font-bold text-slate-900">{order.supplierName}</p>
              {supplierInfo && (
                <div className="text-xs text-slate-600 space-y-0.5 pt-1">
                  <p>
                    <span className="text-slate-400">Số điện thoại: </span>
                    <strong className="font-mono">{supplierInfo.phone}</strong>
                  </p>
                  <p>
                    <span className="text-slate-400">Kho xuất hàng: </span>
                    <span>{supplierInfo.address}</span>
                  </p>
                </div>
              )}
              {order.note && (
                <div className="mt-2 p-2.5 bg-amber-50/70 border border-amber-200/70 rounded-lg text-xs text-amber-900">
                  <span className="font-semibold">Ghi chú đơn hàng: </span>
                  <span>{order.note}</span>
                </div>
              )}
            </div>
          </div>

          {/* Items Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 text-slate-500" />
                <span>Danh sách mặt hàng ({order.items.length} món)</span>
              </h3>
              <span className="text-xs text-slate-500 font-medium">
                Tổng số lượng: <strong className="text-slate-800 font-mono">{totalQuantity}</strong>
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100/70 text-slate-600 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3 w-10 text-center">#</th>
                    <th className="py-2.5 px-3">Mã Barcode</th>
                    <th className="py-2.5 px-3">Tên sản phẩm</th>
                    <th className="py-2.5 px-3 text-center">ĐVT</th>
                    <th className="py-2.5 px-3 text-right">Số lượng</th>
                    <th className="py-2.5 px-3 text-right">Đơn giá sỉ</th>
                    <th className="py-2.5 px-3 text-right">Thành tiền</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800 font-medium">
                  {order.items.map((item, idx) => (
                    <tr key={`${item.barcode}-${idx}`} className="hover:bg-slate-50/80 transition">
                      <td className="py-2.5 px-3 text-center text-slate-400 font-mono">{idx + 1}</td>
                      <td className="py-2.5 px-3">
                        <span className="font-mono text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded text-[11px] border border-slate-200">
                          {item.barcode}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">{item.name}</td>
                      <td className="py-2.5 px-3 text-center text-slate-600">{item.unit}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 tabular-nums">
                        {item.quantity}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-700 tabular-nums">
                        {item.unitPrice.toLocaleString('vi-VN')} đ
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-blue-700 tabular-nums">
                        {item.subtotal.toLocaleString('vi-VN')} đ
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Financial Summary Footer */}
            <div className="bg-slate-50 px-4 py-3 border-t border-slate-200 space-y-1.5">
              <div className="flex justify-between text-xs text-slate-600">
                <span>Tạm tính tiền hàng:</span>
                <span className="font-mono font-semibold tabular-nums">
                  {order.totalAmount.toLocaleString('vi-VN')} đ
                </span>
              </div>
              {order.type === 'B2B' && (
                <div className="flex justify-between text-xs text-slate-600">
                  <span>Thuế VAT (ước tính 8%):</span>
                  <span className="font-mono tabular-nums">
                    {Math.round(order.totalAmount * 0.08).toLocaleString('vi-VN')} đ
                  </span>
                </div>
              )}
              <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-sm font-bold text-slate-900">
                <span className="flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  <span>Tổng Tiền Thanh Toán:</span>
                </span>
                <span className="text-base font-mono font-black text-blue-800 tabular-nums">
                  {(order.type === 'B2B'
                    ? Math.round(order.totalAmount * 1.08)
                    : order.totalAmount
                  ).toLocaleString('vi-VN')}{' '}
                  đ
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Action Bar */}
        <div className="bg-white px-6 py-3.5 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500">
            {isEligibleToReceive ? (
              <span className="text-amber-700 font-medium flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                Đơn đang chờ kiểm đếm và nhận hàng vào kho
              </span>
            ) : order.status === 'RECEIVED' ? (
              <span className="text-emerald-700 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Đơn hàng đã hoàn tất nhập kho
              </span>
            ) : null}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg transition cursor-pointer"
            >
              Đóng (Esc)
            </button>

            {isEligibleToReceive && (
              <button
                type="button"
                onClick={() => setShowConfirmPopup(true)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer transition"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Đã Nhận Được Hàng</span>
              </button>
            )}
          </div>
        </div>

        {/* Nested Confirmation Dialog for Receiving Order */}
        {showConfirmPopup && (
          <div
            role="alertdialog"
            aria-modal="true"
            className="absolute inset-0 bg-slate-900/70 backdrop-blur-2xs flex items-center justify-center p-4 z-60 animate-in fade-in duration-100"
          >
            <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-5 space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Xác nhận đã nhận đủ hàng?
                  </h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Bạn đang xác nhận đã nhận đủ hàng cho đơn{' '}
                    <strong className="font-mono text-slate-900">
                      #{order.orderCode}
                    </strong>{' '}
                    từ <strong className="text-slate-900">{order.supplierName}</strong>.
                  </p>
                  <div className="mt-2 p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-900 font-medium flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>
                      Tổng cộng <strong>{totalQuantity} món</strong> sẽ được tự động cộng dồn
                      trực tiếp vào số lượng tồn kho tiệm!
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowConfirmPopup(false)}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg transition cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  onClick={handleConfirmReceiveSubmit}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs rounded-lg transition shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Xác Nhận Nhập Kho</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
