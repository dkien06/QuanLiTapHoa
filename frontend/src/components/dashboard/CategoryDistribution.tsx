import React from 'react';
import { Layers, Sparkles } from 'lucide-react';

export interface CategoryStatItem {
  name: string;
  distinctCount: number;
  percent: number;
  color: string;
}

interface CategoryDistributionProps {
  categories?: CategoryStatItem[];
}

const defaultCategories: CategoryStatItem[] = [
  { name: 'Thực phẩm khô & Đóng gói', distinctCount: 38, percent: 35, color: 'bg-blue-500' },
  { name: 'Đồ uống & Giải khát', distinctCount: 26, percent: 24, color: 'bg-emerald-500' },
  { name: 'Bánh kẹo & Ăn vặt', distinctCount: 22, percent: 20, color: 'bg-amber-500' },
  { name: 'Gia vị & Thực phẩm chế biến', distinctCount: 14, percent: 13, color: 'bg-purple-500' },
  { name: 'Hóa mỹ phẩm & Tẩy rửa', distinctCount: 9, percent: 8, color: 'bg-rose-500' },
];

export const CategoryDistribution: React.FC<CategoryDistributionProps> = ({
  categories = defaultCategories,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex items-center space-x-2 pb-4 border-b border-slate-100">
          <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">Phân Bổ Mặt Hàng Đã Bán</h4>
            <p className="text-xs text-slate-400">109 sản phẩm phân bổ qua 5 ngành hàng</p>
          </div>
        </div>

        <div className="space-y-4 mt-4">
          {categories.map((item) => (
            <div key={item.name} className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold text-slate-700">
                <span className="truncate pr-2">{item.name}</span>
                <span className="shrink-0 text-slate-900 font-bold">
                  {item.distinctCount} mặt hàng ({item.percent}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div className={`${item.color} h-2 rounded-full`} style={{ width: `${item.percent}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 p-4 rounded-xl bg-blue-50/60 border border-blue-100/80 text-xs text-blue-900 space-y-1">
        <div className="flex items-center space-x-1.5 font-bold">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span>Gợi ý kinh doanh</span>
        </div>
        <p className="text-[11px] text-blue-700 leading-relaxed">
          Các mặt hàng mì gói & nước ngọt chiếm 59% doanh số bán lẻ. Nên nhập thêm tồn kho an toàn trước cuối tuần.
        </p>
      </div>
    </div>
  );
};
