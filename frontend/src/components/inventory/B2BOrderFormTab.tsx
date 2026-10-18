import React, { useState, useEffect } from 'react';
import { purchaseOrderService } from '../../services/purchaseOrderService';
import {
  Factory,
  Building2,
  MapPin,
  Check,
  Plus,
  Minus,
  Send,
  AlertCircle,
} from 'lucide-react';

interface B2BOrderFormTabProps {
  onOrderSuccess: (orderCode: string) => void;
  onCancel: () => void;
}

export const B2BOrderFormTab: React.FC<B2BOrderFormTabProps> = ({
  onOrderSuccess,
  onCancel,
}) => {
  const suppliers = purchaseOrderService.getSuppliers();
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>(
    suppliers[0]?.id || ''
  );

  // Lưu số lượng theo productId: { [productId]: number }
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [orderNote, setOrderNote] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Khi đổi xưởng, reset số lượng về mặc định của xưởng đó (DoD 2)
  useEffect(() => {
    const currentSupplier = suppliers.find((s) => s.id === selectedSupplierId);
    if (currentSupplier) {
      const initialQtys: Record<string, number> = {};
      currentSupplier.catalog.forEach((item, idx) => {
        // Mặc định chọn sẵn món đầu tiên với minOrderQuantity để giao diện trực quan
        initialQtys[item.productId] = idx === 0 ? item.minOrderQuantity : 0;
      });
      setQuantities(initialQtys);
      setErrorMessage(null);
    }
  }, [selectedSupplierId, suppliers]);

  const currentSupplier = suppliers.find((s) => s.id === selectedSupplierId);

  // Xử lý thay đổi số lượng
  const handleUpdateQuantity = (productId: string, val: number) => {
    setQuantities((prev) => ({
      ...prev,
      [productId]: Math.max(0, val),
    }));
  };

  // Tính toán tóm tắt đơn hàng
  const selectedItems = (currentSupplier?.catalog || [])
    .map((prod) => {
      const qty = quantities[prod.productId] || 0;
      return {
        ...prod,
        quantity: qty,
        subtotal: qty * prod.wholesalePrice,
      };
    })
    .filter((item) => item.quantity > 0);

  const totalQuantity = selectedItems.reduce((sum, i) => sum + i.quantity, 0);
  const totalAmount = selectedItems.reduce((sum, i) => sum + i.subtotal, 0);

  // Gửi đơn đặt hàng B2B
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!selectedSupplierId) {
      setErrorMessage('Vui lòng chọn xưởng sản xuất.');
      return;
    }

    if (selectedItems.length === 0) {
      setErrorMessage('Vui lòng nhập số lượng cho ít nhất 1 mặt hàng cần đặt.');
      return;
    }

    // Kiểm tra số lượng đặt tối thiểu
    const invalidMinItem = selectedItems.find(
      (item) => item.quantity < item.minOrderQuantity
    );
    if (invalidMinItem) {
      setErrorMessage(
        `"${invalidMinItem.name}" yêu cầu số lượng đặt tối thiểu là ${invalidMinItem.minOrderQuantity} ${invalidMinItem.unit}.`
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const record = await purchaseOrderService.createB2BOrder(
        selectedSupplierId,
        selectedItems.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        orderNote.trim() || undefined
      );
      onOrderSuccess(record.orderCode);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Có lỗi khi tạo đơn.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* 1. Chọn Xưởng Nhà Cung Cấp */}
      <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
        <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
          Chọn Xưởng Sản Xuất / Nhà Cung Cấp Liên Kết:
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          {suppliers.map((sup) => {
            const isSelected = sup.id === selectedSupplierId;
            return (
              <button
                key={sup.id}
                type="button"
                onClick={() => setSelectedSupplierId(sup.id)}
                className={`p-2.5 rounded-lg border text-left transition cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-blue-50/80 border-blue-600 ring-2 ring-blue-600/20'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900 leading-snug">
                      {sup.name}
                    </span>
                    {isSelected && (
                      <span className="p-0.5 rounded-full bg-blue-600 text-white">
                        <Check className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-1">
                    <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                    <span>Mã: <strong className="font-mono">{sup.code}</strong></span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-2 pt-1 border-t border-slate-100">
                  <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                  <span className="truncate">{sup.address}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Bảng Catalog Sản Phẩm Giá Sỉ của Xưởng Được Chọn */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-3.5 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Factory className="w-4 h-4 text-blue-600" />
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Bảng Giá Sỉ Niêm Yết Từ Xưởng ({currentSupplier?.catalog.length || 0} mặt hàng)
            </h4>
          </div>
          <span className="text-[11px] text-slate-500">
            Trạng thái sau khi gửi: <strong className="text-amber-700 font-semibold">Chờ xưởng xác nhận</strong>
          </span>
        </div>

        <div className="overflow-x-auto max-h-72 overflow-y-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="sticky top-0 bg-slate-100 z-10 border-b border-slate-200 text-slate-700 font-bold uppercase text-[11px]">
              <tr>
                <th className="py-2 px-3">Mặt hàng</th>
                <th className="py-2 px-3 text-right">Giá sỉ xưởng</th>
                <th className="py-2 px-3 text-center w-28">Tối thiểu</th>
                <th className="py-2 px-3 text-center w-36">Số lượng đặt</th>
                <th className="py-2 px-3 text-right w-32">Thành tiền</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {currentSupplier?.catalog.map((prod) => {
                const qty = quantities[prod.productId] || 0;
                const isSelected = qty > 0;
                const isUnderMin = qty > 0 && qty < prod.minOrderQuantity;

                return (
                  <tr
                    key={prod.productId}
                    className={`transition-colors hover:bg-blue-50/40 ${
                      isSelected ? 'bg-blue-50/20' : ''
                    }`}
                  >
                    {/* Tên & Barcode */}
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-slate-900">{prod.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                        Mã: {prod.barcode} • ĐVT: <strong className="text-slate-600">{prod.unit}</strong>
                      </div>
                    </td>

                    {/* Giá sỉ xưởng */}
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums font-bold text-blue-700 text-xs">
                      {prod.wholesalePrice.toLocaleString('vi-VN')} đ
                    </td>

                    {/* Số lượng đặt tối thiểu */}
                    <td className="py-2.5 px-3 text-center text-[11px] font-semibold text-slate-500">
                      ≥ {prod.minOrderQuantity} {prod.unit}
                    </td>

                    {/* Stepper số lượng */}
                    <td className="py-2.5 px-3">
                      <div className="flex items-center justify-center space-x-1">
                        <button
                          type="button"
                          onClick={() =>
                            handleUpdateQuantity(
                              prod.productId,
                              Math.max(0, qty - (qty <= prod.minOrderQuantity ? qty : 5))
                            )
                          }
                          className="w-6 h-6 flex items-center justify-center rounded bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <input
                          type="number"
                          min="0"
                          value={qty}
                          onChange={(e) =>
                            handleUpdateQuantity(
                              prod.productId,
                              parseInt(e.target.value, 10) || 0
                            )
                          }
                          className={`w-14 py-1 text-center font-bold text-xs rounded border font-mono tabular-nums ${
                            isUnderMin
                              ? 'border-rose-400 bg-rose-50 text-rose-800'
                              : qty > 0
                              ? 'border-blue-500 bg-white text-blue-900'
                              : 'border-slate-300 bg-slate-50 text-slate-400'
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() =>
                            handleUpdateQuantity(
                              prod.productId,
                              qty === 0 ? prod.minOrderQuantity : qty + 5
                            )
                          }
                          className="w-6 h-6 flex items-center justify-center rounded bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      {isUnderMin && (
                        <p className="text-[10px] text-rose-600 text-center mt-0.5 font-medium">
                          Chưa đủ min ({prod.minOrderQuantity})
                        </p>
                      )}
                    </td>

                    {/* Thành tiền */}
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums font-bold text-slate-900">
                      {(qty * prod.wholesalePrice).toLocaleString('vi-VN')} đ
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. Tóm tắt & Ghi chú đơn hàng */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center bg-slate-50 p-3.5 rounded-xl border border-slate-200">
        <div className="md:col-span-7">
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Ghi chú đơn hàng cho xưởng (nếu có):
          </label>
          <input
            type="text"
            value={orderNote}
            onChange={(e) => setOrderNote(e.target.value)}
            placeholder="Ví dụ: Giao hàng vào buổi sáng, gọi trước 15 phút..."
            className="w-full py-1.5 px-3 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Tổng tiền dự kiến */}
        <div className="md:col-span-5 bg-white p-2.5 rounded-lg border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase">Tổng Tiền Dự Kiến:</p>
            <p className="text-xs text-slate-500">
              {selectedItems.length} mặt hàng ({totalQuantity} cái)
            </p>
          </div>
          <div className="text-right">
            <span className="text-lg font-black text-blue-700 font-mono tabular-nums">
              {totalAmount.toLocaleString('vi-VN')}
            </span>
            <span className="text-xs font-bold text-blue-700 ml-1">đ</span>
          </div>
        </div>
      </div>

      {/* Thông báo lỗi nếu có */}
      {errorMessage && (
        <div className="p-2.5 bg-rose-50 border border-rose-300 rounded-lg text-xs text-rose-800 font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Nút hành động */}
      <div className="flex items-center justify-end gap-2.5 pt-1 border-t border-slate-200">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300 transition cursor-pointer"
        >
          Hủy Bỏ
        </button>

        <button
          type="submit"
          disabled={isSubmitting || selectedItems.length === 0}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs rounded-lg shadow-xs transition flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:translate-y-0.5"
        >
          {isSubmitting ? (
            <div className="flex items-center gap-1.5">
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Đang gửi đơn...</span>
            </div>
          ) : (
            <>
              <Send className="w-3.5 h-3.5" />
              <span>GỬI ĐƠN ĐẶT HÀNG (PENDING)</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};
