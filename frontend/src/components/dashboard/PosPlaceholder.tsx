import { useNavigate } from 'react-router-dom';
import { ShoppingCart, ArrowRight } from 'lucide-react';

interface PosPlaceholderProps {
  onBackToOverview: () => void;
}

export const PosPlaceholder: React.FC<PosPlaceholderProps> = ({ onBackToOverview }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center space-y-4 max-w-2xl mx-auto my-8 shadow-xs">
      <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto">
        <ShoppingCart className="w-8 h-8" />
      </div>
      <h3 className="text-xl font-bold text-slate-900">Màn Hình Thu Ngân & Bán Hàng (POS)</h3>
      <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
        Hệ thống hỗ trợ quét mã vạch Barcode thời gian thực, tự động cộng dồn số lượng, cảnh báo vượt tồn kho và phím tắt F2/F9.
      </p>
      <div className="pt-2 flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={onBackToOverview}
          className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition cursor-pointer"
        >
          Quay lại Bảng Thống Kê
        </button>
        <button
          type="button"
          onClick={() => navigate('/pos')}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl transition cursor-pointer flex items-center gap-2 shadow-md shadow-blue-500/20"
        >
          <span>Vào Màn Hình POS (F2)</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
