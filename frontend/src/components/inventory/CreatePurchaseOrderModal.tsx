import React, { useState, useEffect } from 'react';
import { X, Building2, PackagePlus, Info } from 'lucide-react';
import { B2BOrderFormTab } from './B2BOrderFormTab';
import { ManualImportFormTab } from './ManualImportFormTab';

export type PurchaseOrderTab = 'B2B' | 'MANUAL';

interface CreatePurchaseOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onB2BSuccess: (orderCode: string) => void;
  onManualSuccess: (orderCode: string, productName: string, quantity: number) => void;
  initialTab?: PurchaseOrderTab;
}

export const CreatePurchaseOrderModal: React.FC<CreatePurchaseOrderModalProps> = ({
  isOpen,
  onClose,
  onB2BSuccess,
  onManualSuccess,
  initialTab = 'B2B',
}) => {
  const [activeTab, setActiveTab] = useState<PurchaseOrderTab>(initialTab);

  // Synchronize tab if initialTab changes when opening
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="po-modal-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-150"
    >
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-6 py-4.5 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <PackagePlus className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="po-modal-title" className="text-lg font-bold tracking-tight text-white">
                  Tạo Đơn Nhập Hàng Tạp Hoá
                </h2>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-950 text-blue-300 border border-blue-800/80">
                  Phân hệ Kho & Cung ứng
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Nhập hàng bổ sung từ Xưởng B2B hoặc Nhập thủ công từ các đại lý ngoài
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            title="Đóng (Esc)"
            aria-label="Đóng cửa sổ"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection Header */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 pt-3 shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('B2B')}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
                activeTab === 'B2B'
                  ? 'border-blue-600 text-blue-700 bg-white rounded-t-lg shadow-2xs'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 rounded-t-lg'
              }`}
            >
              <Building2 className={`w-4 h-4 ${activeTab === 'B2B' ? 'text-blue-600' : 'text-slate-400'}`} />
              <span>1. Đặt Hàng Từ Xưởng Liên Kết (B2B)</span>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                activeTab === 'B2B' ? 'bg-blue-100 text-blue-800' : 'bg-slate-200 text-slate-600'
              }`}>
                Chờ duyệt
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('MANUAL')}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
                activeTab === 'MANUAL'
                  ? 'border-emerald-600 text-emerald-700 bg-white rounded-t-lg shadow-2xs'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 rounded-t-lg'
              }`}
            >
              <PackagePlus className={`w-4 h-4 ${activeTab === 'MANUAL' ? 'text-emerald-600' : 'text-slate-400'}`} />
              <span>2. Nhập Hàng Ngoài (Thủ Công)</span>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                activeTab === 'MANUAL' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
              }`}>
                Cộng kho ngay
              </span>
            </button>
          </div>
        </div>

        {/* Tab Description / Note Banner */}
        <div className="bg-slate-50/70 border-b border-slate-100 px-6 py-2 text-xs text-slate-500 flex items-center gap-2 shrink-0">
          <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          {activeTab === 'B2B' ? (
            <span>
              <strong>Đơn đặt xưởng B2B:</strong> Đơn sẽ gửi đến xưởng liên kết với trạng thái <span className="font-semibold text-amber-700 bg-amber-50 px-1 py-0.2 rounded border border-amber-200">CHỜ XÁC NHẬN</span>. Tồn kho tiệm sẽ chỉ tăng khi xưởng giao và tiệm xác nhận nhận hàng.
            </span>
          ) : (
            <span>
              <strong>Nhập hàng ngoài (Thủ công):</strong> Dành cho hàng mua từ chợ đầu mối hoặc đại lý ngoài. Đơn hoàn tất ngay và <span className="font-semibold text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded border border-emerald-200">TỰ ĐỘNG CỘNG TỒN KHO</span> ngay lập tức!
            </span>
          )}
        </div>

        {/* Modal Scrollable Body */}
        {/* Render both tabs simultaneously with display toggle to preserve form draft state when switching tabs */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30">
          <div className={activeTab === 'B2B' ? 'block' : 'hidden'}>
            <B2BOrderFormTab
              onOrderSuccess={onB2BSuccess}
              onCancel={onClose}
            />
          </div>

          <div className={activeTab === 'MANUAL' ? 'block' : 'hidden'}>
            <ManualImportFormTab
              onImportSuccess={onManualSuccess}
              onCancel={onClose}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
