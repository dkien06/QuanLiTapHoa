import React, { useState, useEffect } from 'react';
import type { ManualImportPayload } from '../../types/purchaseOrder';
import { purchaseOrderService } from '../../services/purchaseOrderService';
import { inventoryService } from '../../services/inventoryService';
import { MOCK_MANUAL_IMPORT_DEFAULTS, MOCK_MANUAL_IMPORT_EXAMPLES, MOCK_MANUAL_IMPORT_SUPPLIERS } from '../../mock/mockPurchaseOrders';
import {
  Boxes,
  Barcode,
  Truck,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Sparkles,
} from 'lucide-react';

interface ManualImportFormTabProps {
  onImportSuccess: (orderCode: string, productName: string, quantity: number) => void;
  onCancel: () => void;
}

export const ManualImportFormTab: React.FC<ManualImportFormTabProps> = ({
  onImportSuccess,
  onCancel,
}) => {
  const [supplierName, setSupplierName] = useState<string>('');
  const [productName, setProductName] = useState<string>('');
  const [barcode, setBarcode] = useState<string>('');
  const [unit, setUnit] = useState<string>(MOCK_MANUAL_IMPORT_DEFAULTS.unit);
  const [quantityInput, setQuantityInput] = useState<string>(MOCK_MANUAL_IMPORT_DEFAULTS.quantity);
  const [costPriceInput, setCostPriceInput] = useState<string>(MOCK_MANUAL_IMPORT_DEFAULTS.costPrice);
  const [sellingPriceInput, setSellingPriceInput] = useState<string>(MOCK_MANUAL_IMPORT_DEFAULTS.sellingPrice);
  const [note, setNote] = useState<string>('');

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [matchedProductNotice, setMatchedProductNotice] = useState<string | null>(null);

  // Khi nhập Barcode, tự động tra cứu xem sản phẩm đã có sẵn trong kho tiệm chưa
  useEffect(() => {
    const trimmed = barcode.trim().toLowerCase();
    if (trimmed.length >= 6) {
      const allProducts = inventoryService.getAllProducts();
      const matched = allProducts.find((p) => p.barcode.toLowerCase() === trimmed);
      if (matched) {
        setProductName(matched.name);
        setUnit(matched.unit);
        setCostPriceInput(matched.costPrice.toString());
        setSellingPriceInput(matched.sellingPrice.toString());
        setMatchedProductNotice(
          `Tìm thấy trong kho: "${matched.name}" (Tồn hiện tại: ${matched.stockQuantity} ${matched.unit})`
        );
      } else {
        setMatchedProductNotice(null);
      }
    } else {
      setMatchedProductNotice(null);
    }
  }, [barcode]);

  const quantity = parseInt(quantityInput, 10) || 0;
  const costPrice = parseFloat(costPriceInput) || 0;
  const sellingPrice = parseFloat(sellingPriceInput) || 0;

  const totalCost = quantity * costPrice;
  const profitPerItem = sellingPrice - costPrice;
  const profitMargin = costPrice > 0 ? Math.round((profitPerItem / costPrice) * 100) : 0;

  // Gợi ý nhanh các nguồn nhập hàng ngoài phổ biến
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!supplierName.trim()) {
      setErrorMessage('Vui lòng nhập tên nhà cung cấp ngoài hoặc nguồn nhập.');
      return;
    }
    if (!barcode.trim()) {
      setErrorMessage('Vui lòng nhập mã vạch barcode sản phẩm.');
      return;
    }
    if (!productName.trim()) {
      setErrorMessage('Vui lòng nhập tên sản phẩm.');
      return;
    }
    if (quantity <= 0) {
      setErrorMessage('Số lượng nhập kho phải lớn hơn 0.');
      return;
    }
    if (costPrice <= 0) {
      setErrorMessage('Đơn giá nhập (giá vốn) phải lớn hơn 0 đ.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: ManualImportPayload = {
        supplierName: supplierName.trim(),
        productName: productName.trim(),
        barcode: barcode.trim(),
        unit: unit.trim() || 'cái',
        quantity,
        costPrice,
        suggestedSellingPrice: sellingPrice,
        note: note.trim() || undefined,
      };

      const record = await purchaseOrderService.createManualImportOrder(payload);
      onImportSuccess(record.orderCode, payload.productName, payload.quantity);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Có lỗi khi nhập kho.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* 1. Thông tin nguồn nhập */}
      <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
        <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
          Nguồn Nhập Hàng Ngoài / Tên Nhà Cung Cấp:
        </label>
        <div className="relative">
          <Truck className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={supplierName}
            onChange={(e) => setSupplierName(e.target.value)}
            placeholder={MOCK_MANUAL_IMPORT_EXAMPLES.supplier}
            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
            required
          />
        </div>

        {/* Chip gợi ý nhanh tên nguồn */}
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
          <span className="text-[11px] text-slate-500 font-medium">Gợi ý nhanh:</span>
          {MOCK_MANUAL_IMPORT_SUPPLIERS.map((sup) => (
            <button
              key={sup}
              type="button"
              onClick={() => setSupplierName(sup)}
              className="px-2 py-0.5 text-[11px] font-medium bg-white hover:bg-blue-50 hover:text-blue-700 text-slate-700 rounded border border-slate-200 transition cursor-pointer"
            >
              {sup}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Thông tin mặt hàng & Barcode */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <Boxes className="w-4 h-4 text-emerald-600" />
            <span>Thông Tin Mặt Hàng Nhập Kho</span>
          </h4>
          <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            Tồn kho sẽ được cộng trực tiếp ngay sau khi bấm
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Mã vạch Barcode */}
          <div className="sm:col-span-5">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Mã Barcode: <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Barcode className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                placeholder="Quét mã hoặc gõ mã..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          {/* Tên sản phẩm */}
          <div className="sm:col-span-5">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tên mặt hàng: <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder={MOCK_MANUAL_IMPORT_EXAMPLES.product}
              className="w-full py-2 px-3 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
            />
          </div>

          {/* Đơn vị tính */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Đơn vị (ĐVT):
            </label>
            <input
              type="text"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              placeholder="gói, lon, chai..."
              className="w-full py-2 px-2.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 text-center focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        {/* Thông báo nếu tìm thấy barcode trong kho */}
        {matchedProductNotice && (
          <div className="p-2 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-900 font-medium flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span>{matchedProductNotice}</span>
          </div>
        )}

        {/* Khối Số lượng, Đơn giá nhập và Giá bán đề xuất */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          {/* Số lượng nhập */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Số lượng nhập: <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                min="1"
                value={quantityInput}
                onChange={(e) => setQuantityInput(e.target.value)}
                className="w-full py-2 px-3 bg-white border border-slate-300 rounded-lg text-sm font-bold text-slate-900 font-mono tabular-nums focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
                {unit}
              </span>
            </div>
          </div>

          {/* Đơn giá nhập (Giá vốn) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Đơn giá nhập (Giá vốn): <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                step="500"
                value={costPriceInput}
                onChange={(e) => setCostPriceInput(e.target.value)}
                className="w-full py-2 pl-3 pr-10 bg-white border border-slate-300 rounded-lg text-sm font-bold text-slate-900 font-mono tabular-nums focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                đ
              </span>
            </div>
          </div>

          {/* Giá bán lẻ đề xuất */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Giá bán lẻ niêm yết:
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                step="500"
                value={sellingPriceInput}
                onChange={(e) => setSellingPriceInput(e.target.value)}
                className="w-full py-2 pl-3 pr-10 bg-white border border-slate-300 rounded-lg text-sm font-bold text-emerald-800 font-mono tabular-nums focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-emerald-600">
                đ
              </span>
            </div>
            {profitMargin > 0 && (
              <p className="text-[11px] text-emerald-700 font-semibold mt-0.5 flex items-center justify-end gap-1">
                <TrendingUp className="w-3 h-3" />
                <span>Lời +{profitPerItem.toLocaleString('vi-VN')} đ ({profitMargin}%)</span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 3. Tóm tắt chi phí & Ghi chú */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center bg-slate-50 p-3.5 rounded-xl border border-slate-200">
        <div className="md:col-span-7">
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Ghi chú đợt nhập (Số hóa đơn ngoài, ngày giao...):
          </label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={MOCK_MANUAL_IMPORT_EXAMPLES.invoiceNote}
            className="w-full py-1.5 px-3 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Tổng tiền chi đợt nhập */}
        <div className="md:col-span-5 bg-white p-2.5 rounded-lg border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase">Tổng Tiền Nhập Kho:</p>
            <p className="text-xs text-slate-500">
              {quantity} {unit} × {costPrice.toLocaleString('vi-VN')} đ
            </p>
          </div>
          <div className="text-right">
            <span className="text-lg font-black text-emerald-700 font-mono tabular-nums">
              {totalCost.toLocaleString('vi-VN')}
            </span>
            <span className="text-xs font-bold text-emerald-700 ml-1">đ</span>
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
          disabled={isSubmitting || quantity <= 0 || costPrice <= 0}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs rounded-lg shadow-xs transition flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:translate-y-0.5"
        >
          {isSubmitting ? (
            <div className="flex items-center gap-1.5">
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Đang lưu kho...</span>
            </div>
          ) : (
            <>
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>XÁC NHẬN NHẬP KHO (HOÀN THÀNH)</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};
