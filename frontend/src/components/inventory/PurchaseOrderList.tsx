import React, { useState, useEffect, useCallback } from 'react';
import type { PurchaseOrderRecord, PurchaseOrderStatus } from '../../types/purchaseOrder';
import { purchaseOrderService } from '../../services/purchaseOrderService';
import { PurchaseOrderDetailModal } from './PurchaseOrderDetailModal';
import {
  ClipboardList,
  Clock,
  Truck,
  CheckCircle2,
  Search,
  X,
  Eye,
  Plus,
  Building2,
  AlertTriangle,
  RotateCcw,
  Calendar,
  Layers,
} from 'lucide-react';

interface PurchaseOrderListProps {
  onOpenCreatePOModal?: () => void;
  onOrderReceivedSuccess?: (orderCode: string) => void;
}

export const PurchaseOrderList: React.FC<PurchaseOrderListProps> = ({
  onOpenCreatePOModal,
  onOrderReceivedSuccess,
}) => {
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [keyword, setKeyword] = useState<string>('');
  const [orders, setOrders] = useState<PurchaseOrderRecord[]>([]);
  const [stats, setStats] = useState(() => purchaseOrderService.getOrderStats());

  // Pagination
  const [page, setPage] = useState(1);
  const pageSize = 8;

  // Detail Modal State
  const [selectedOrderForDetail, setSelectedOrderForDetail] =
    useState<PurchaseOrderRecord | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Quick Receive Confirm Popup State
  const [orderToReceive, setOrderToReceive] =
    useState<PurchaseOrderRecord | null>(null);
  const [showReceivePopup, setShowReceivePopup] = useState(false);

  // Load orders
  const loadOrders = useCallback(() => {
    const filtered = purchaseOrderService.getFilteredOrders({
      status: selectedStatus,
      keyword,
    });
    setOrders(filtered);
    setStats(purchaseOrderService.getOrderStats());
  }, [selectedStatus, keyword]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  // Status Filter tabs
  const statusTabs: Array<{
    id: string;
    label: string;
    count: number;
    color: string;
  }> = [
    {
      id: 'ALL',
      label: 'Tất cả đơn',
      count: stats.total,
      color: 'slate',
    },
    {
      id: 'PENDING',
      label: 'Chờ duyệt',
      count: stats.pendingCount,
      color: 'amber',
    },
    {
      id: 'CONFIRMED',
      label: 'Đã duyệt',
      count: stats.confirmedCount,
      color: 'blue',
    },
    {
      id: 'SHIPPING',
      label: 'Đang giao',
      count: stats.shippingCount,
      color: 'purple',
    },
    {
      id: 'RECEIVED',
      label: 'Đã nhận',
      count: stats.receivedCount,
      color: 'emerald',
    },
    {
      id: 'CANCELLED',
      label: 'Đã huỷ',
      count: stats.cancelledCount,
      color: 'rose',
    },
  ];

  // Render status badge for table
  const renderStatusBadge = (status: PurchaseOrderStatus) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-300">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            <span>Chờ duyệt</span>
          </span>
        );
      case 'CONFIRMED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-300">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            <span>Đã duyệt</span>
          </span>
        );
      case 'SHIPPING':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-800 border border-purple-300">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
            <span>Đang giao</span>
          </span>
        );
      case 'RECEIVED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Đã nhận</span>
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-300">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            <span>Đã hủy</span>
          </span>
        );
    }
  };

  // Handle Confirm Receive Order
  const handleConfirmReceiveOrder = (orderId: string) => {
    try {
      const updated = purchaseOrderService.confirmReceivedOrder(orderId);
      loadOrders();

      // Cập nhật selectedOrderForDetail nếu modal đang mở
      if (selectedOrderForDetail && selectedOrderForDetail.id === orderId) {
        setSelectedOrderForDetail(updated);
      }

      setShowReceivePopup(false);
      setOrderToReceive(null);

      if (onOrderReceivedSuccess) {
        onOrderReceivedSuccess(updated.orderCode);
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Có lỗi khi xác nhận nhận hàng.');
    }
  };

  // Pagination calculation
  const totalOrders = orders.length;
  const totalPages = Math.max(1, Math.ceil(totalOrders / pageSize));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedOrders = orders.slice(startIndex, startIndex + pageSize);

  return (
    <div className="space-y-4">
      {/* 4 Mini KPI Cards Ribbon */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Card 1: Tổng số đơn */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Tổng Đơn Đặt Hàng</p>
            <p className="text-xl font-bold text-slate-900 font-mono tabular-nums mt-0.5">
              {stats.total} <span className="text-xs font-normal text-slate-500">đơn</span>
            </p>
          </div>
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-200/60">
            <ClipboardList className="w-4 h-4" />
          </div>
        </div>

        {/* Card 2: Chờ xử lý */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Chờ Duyệt & Đã Duyệt</p>
            <p className="text-xl font-bold text-amber-700 font-mono tabular-nums mt-0.5">
              {stats.pendingCount + stats.confirmedCount}{' '}
              <span className="text-xs font-normal text-slate-500">đơn</span>
            </p>
          </div>
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200/60">
            <Clock className="w-4 h-4" />
          </div>
        </div>

        {/* Card 3: Đang vận chuyển */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Đang Vận Chuyển</p>
            <p className="text-xl font-bold text-purple-700 font-mono tabular-nums mt-0.5">
              {stats.shippingCount}{' '}
              <span className="text-xs font-normal text-slate-500">đơn</span>
            </p>
          </div>
          <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center border border-purple-200/60">
            <Truck className="w-4 h-4" />
          </div>
        </div>

        {/* Card 4: Đã hoàn tất nhập kho */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Đã Nhập Kho</p>
            <p className="text-xl font-bold text-emerald-700 font-mono tabular-nums mt-0.5">
              {stats.receivedCount}{' '}
              <span className="text-xs font-normal text-slate-500">đơn</span>
            </p>
          </div>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200/60">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs space-y-3">
        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-100 pb-2.5">
          {statusTabs.map((tab) => {
            const isActive = selectedStatus === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setSelectedStatus(tab.id);
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/80'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full ${
                    isActive
                      ? 'bg-slate-700 text-white'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Input & Action Button */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={keyword}
              onChange={(e) => {
                setKeyword(e.target.value);
                setPage(1);
              }}
              placeholder="Tìm theo mã đơn (PO-...), tên xưởng hoặc sản phẩm..."
              className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
            />
            {keyword && (
              <button
                type="button"
                onClick={() => {
                  setKeyword('');
                  setPage(1);
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                title="Xóa tìm kiếm"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {(keyword || selectedStatus !== 'ALL') && (
              <button
                type="button"
                onClick={() => {
                  setKeyword('');
                  setSelectedStatus('ALL');
                  setPage(1);
                }}
                className="px-2.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Đặt lại</span>
              </button>
            )}

            {onOpenCreatePOModal && (
              <button
                type="button"
                onClick={onOpenCreatePOModal}
                className="px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-xs transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ Tạo Đơn Nhập Hàng</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-3.5 w-10 text-center">#</th>
                <th className="py-3 px-3.5">Mã Đơn Hàng</th>
                <th className="py-3 px-3.5">Xưởng / Nguồn Hàng</th>
                <th className="py-3 px-3.5">Ngày Đặt Hàng</th>
                <th className="py-3 px-3.5 text-center">Mặt Hàng</th>
                <th className="py-3 px-3.5 text-right">Tổng Tiền (VNĐ)</th>
                <th className="py-3 px-3.5 text-center">Trạng Thái</th>
                <th className="py-3 px-3.5 text-center w-36">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800 font-medium">
              {paginatedOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <ClipboardList className="w-8 h-8 text-slate-300" />
                      <p className="text-xs font-medium">Không tìm thấy đơn nhập hàng nào phù hợp.</p>
                      {(keyword || selectedStatus !== 'ALL') && (
                        <button
                          type="button"
                          onClick={() => {
                            setKeyword('');
                            setSelectedStatus('ALL');
                          }}
                          className="text-xs text-blue-600 hover:underline font-semibold cursor-pointer"
                        >
                          Xóa bộ lọc để xem toàn bộ
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedOrders.map((order, idx) => {
                  const isEligibleToReceive =
                    order.status === 'SHIPPING' || order.status === 'CONFIRMED';
                  const totalItemsQty = order.items.reduce((s, i) => s + i.quantity, 0);

                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="py-3 px-3.5 text-center text-slate-400 font-mono">
                        {startIndex + idx + 1}
                      </td>

                      {/* Mã đơn */}
                      <td className="py-3 px-3.5">
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedOrderForDetail(order);
                              setIsDetailModalOpen(true);
                            }}
                            className="font-mono font-bold text-blue-700 hover:text-blue-900 hover:underline cursor-pointer text-left"
                            title="Xem chi tiết đơn"
                          >
                            {order.orderCode}
                          </button>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                              order.type === 'B2B'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            }`}
                          >
                            {order.type === 'B2B' ? 'Xưởng' : 'Ngoài'}
                          </span>
                        </div>
                      </td>

                      {/* Xưởng / Nguồn */}
                      <td className="py-3 px-3.5">
                        <div className="flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="font-semibold text-slate-900 truncate max-w-[200px]">
                            {order.supplierName}
                          </span>
                        </div>
                      </td>

                      {/* Ngày đặt */}
                      <td className="py-3 px-3.5 text-slate-600 font-mono text-[11px]">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>
                            {new Date(order.createdAt).toLocaleDateString('vi-VN', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </td>

                      {/* Số mặt hàng */}
                      <td className="py-3 px-3.5 text-center">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-mono">
                          <Layers className="w-3 h-3 text-slate-400" />
                          <strong>{order.items.length} món</strong> ({totalItemsQty})
                        </span>
                      </td>

                      {/* Tổng tiền */}
                      <td className="py-3 px-3.5 text-right font-mono font-bold text-slate-900 tabular-nums">
                        {(order.type === 'B2B'
                          ? Math.round(order.totalAmount * 1.08)
                          : order.totalAmount
                        ).toLocaleString('vi-VN')}{' '}
                        đ
                      </td>

                      {/* Trạng thái */}
                      <td className="py-3 px-3.5 text-center">
                        {renderStatusBadge(order.status)}
                      </td>

                      {/* Thao tác */}
                      <td className="py-3 px-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Nút Xem chi tiết */}
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedOrderForDetail(order);
                              setIsDetailModalOpen(true);
                            }}
                            className="p-1.5 text-slate-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition cursor-pointer border border-slate-200"
                            title="Xem chi tiết đơn hàng"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Nút Đã nhận hàng */}
                          {isEligibleToReceive ? (
                            <button
                              type="button"
                              onClick={() => {
                                setOrderToReceive(order);
                                setShowReceivePopup(true);
                              }}
                              className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold text-[11px] rounded-lg transition cursor-pointer shadow-2xs flex items-center gap-1"
                              title="Xác nhận đã nhận hàng và cập nhật tồn kho"
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Nhận hàng</span>
                            </button>
                          ) : order.status === 'RECEIVED' ? (
                            <span className="text-[10px] text-emerald-700 font-semibold px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200/60">
                              Đã nhập kho
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400 px-2 py-0.5 rounded bg-slate-100">
                              {order.status === 'PENDING' ? 'Chờ duyệt' : 'Đã hủy'}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalOrders > 0 && (
          <div className="bg-slate-50 px-4 py-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
            <div>
              Hiển thị{' '}
              <strong className="font-mono text-slate-900">
                {startIndex + 1} - {Math.min(startIndex + pageSize, totalOrders)}
              </strong>{' '}
              trong tổng số{' '}
              <strong className="font-mono text-slate-900">{totalOrders}</strong> đơn hàng
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-2.5 py-1 rounded border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed font-medium cursor-pointer"
              >
                Trước
              </button>
              <span className="px-2 font-mono font-semibold text-slate-800">
                Trang {currentPage} / {totalPages}
              </span>
              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="px-2.5 py-1 rounded border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed font-medium cursor-pointer"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Chi Tiết Đơn Hàng */}
      <PurchaseOrderDetailModal
        order={selectedOrderForDetail}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedOrderForDetail(null);
        }}
        onConfirmReceived={handleConfirmReceiveOrder}
      />

      {/* Popup Xác Nhận Nhận Hàng Nhanh Từ Dòng Bảng */}
      {showReceivePopup && orderToReceive && (
        <div
          role="alertdialog"
          aria-modal="true"
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center p-4 z-60 animate-in fade-in duration-100"
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
                    #{orderToReceive.orderCode}
                  </strong>{' '}
                  từ <strong className="text-slate-900">{orderToReceive.supplierName}</strong>.
                </p>
                <div className="mt-2.5 p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-900 font-medium flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    Tổng cộng{' '}
                    <strong>
                      {orderToReceive.items.reduce((s, i) => s + i.quantity, 0)} món hàng
                    </strong>{' '}
                    sẽ được tự động cộng dồn vào tồn kho cửa hàng!
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setShowReceivePopup(false);
                  setOrderToReceive(null);
                }}
                className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg transition cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={() => handleConfirmReceiveOrder(orderToReceive.id)}
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
  );
};
