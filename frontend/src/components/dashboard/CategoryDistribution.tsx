import React from 'react';
import { Layers, Sparkles, AlertCircle } from 'lucide-react';
import type { CategoryDistributionData } from '../../types/analytics';

interface CategoryDistributionProps {
  data?: CategoryDistributionData | null;
  loading?: boolean;
}

export const CategoryDistribution: React.FC<CategoryDistributionProps> = ({
  data,
  loading = false,
}) => {
  const categories = data?.categories || [];
  const colors = [
  'bg-blue-500',
  'bg-emerald-500',
  'bg-amber-500',
  'bg-purple-500',
  'bg-rose-500',
  'bg-indigo-500',
  'bg-teal-500',
  'bg-cyan-500',
];
  const totalProducts = data?.total_products || 0;
  const businessInsight =
    data?.business_insight ||
    'Chưa có dữ liệu giao dịch trong kỳ này để đưa ra gợi ý kinh doanh.';

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center space-x-2 pb-4 border-b border-slate-100">
          <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">Phân Bổ Mặt Hàng Đã Bán</h4>
            <p className="text-xs text-slate-400">
              {totalProducts} sản phẩm phân bổ qua {categories.length} ngành hàng
            </p>
          </div>
        </div>

        {/* Loading Skeleton */}
        {loading ? (
          <div className="space-y-4 mt-4 animate-pulse">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between">
                  <div className="h-3 bg-slate-200 rounded w-28"></div>
                  <div className="h-3 bg-slate-200 rounded w-16"></div>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2"></div>
              </div>
            ))}
          </div>
        ) : categories.length === 0 ? (
          /* Empty State khi chưa có dữ liệu ngành hàng */
          <div className="py-10 flex flex-col items-center justify-center text-center space-y-2">
            <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center">
              <AlertCircle className="w-5 h-5" />
            </div>
            <p className="text-xs font-bold text-slate-600">Chưa có dữ liệu ngành hàng</p>
            <p className="text-[11px] text-slate-400 max-w-xs">
              Các mặt hàng được bán sẽ được tự động phân loại và tính tỷ lệ đóng góp tại đây.
            </p>
          </div>
        ) : (
          /* Categories Progress Bars */
          <div className="space-y-4 mt-4">
            {categories.map((item,idx) => (
              <div key={item.name} className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold text-slate-700">
                  <span className="truncate pr-2">{item.name}</span>
                  <span className="shrink-0 text-slate-900 font-bold">
                    {item.distinct_count} mặt hàng ({item.percent}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className={`${colors[idx % colors.length]} h-2 rounded-full transition-all duration-500`}
                    style={{ width: `${Math.min(item.percent, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Smart Business Insight Box */}
      <div className="mt-6 p-4 rounded-xl bg-blue-50/60 border border-blue-100/80 text-xs text-blue-900 space-y-1">
        <div className="flex items-center space-x-1.5 font-bold">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span>Gợi ý kinh doanh</span>
        </div>
        <p className="text-slate-600 leading-relaxed text-[11px]">{businessInsight}</p>
      </div>
    </div>
  );
};
