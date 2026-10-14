import React from 'react';
import { ShoppingCart } from 'lucide-react';

interface PosPlaceholderProps {
  onBackToOverview: () => void;
}

export const PosPlaceholder: React.FC<PosPlaceholderProps> = ({ onBackToOverview }) => {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center space-y-4 max-w-2xl mx-auto my-8">
      <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto">
        <ShoppingCart className="w-8 h-8" />
      </div>
      <h3 className="text-xl font-bold text-slate-900">Giao Diện Bán Hàng (POS)</h3>
      <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
        Mô-đun thu ngân POS đang được kết nối với backend. Bạn có thể quay lại Bảng điều khiển để xem thống kê sản phẩm mua nhiều nhất hoặc quản lý kho.
      </p>
      <div className="pt-2">
        <button
          type="button"
          onClick={onBackToOverview}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl transition cursor-pointer"
        >
          Quay lại Bảng Thống Kê
        </button>
      </div>
    </div>
  );
};
