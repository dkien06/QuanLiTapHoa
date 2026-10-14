import React from 'react';
import { Boxes } from 'lucide-react';

interface InventoryPlaceholderProps {
  onBackToOverview: () => void;
}

export const InventoryPlaceholder: React.FC<InventoryPlaceholderProps> = ({ onBackToOverview }) => {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center space-y-4 max-w-2xl mx-auto my-8">
      <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto">
        <Boxes className="w-8 h-8" />
      </div>
      <h3 className="text-xl font-bold text-slate-900">Giao Diện Quản Lý Kho</h3>
      <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
        Mô-đun quản lý xuất nhập tồn, phân loại danh mục sản phẩm và nhà cung cấp đang trong quá trình tích hợp.
      </p>
      <div className="pt-2">
        <button
          type="button"
          onClick={onBackToOverview}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl transition cursor-pointer"
        >
          Quay lại Bảng Thống Kê
        </button>
      </div>
    </div>
  );
};
