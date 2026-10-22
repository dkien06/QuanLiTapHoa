import React from 'react';
import { Flame, PackageOpen } from 'lucide-react';
import type { TopSellingProduct } from '../../types/analytics';

interface TopSellingProductsProps {
  products?: TopSellingProduct[];
  loading?: boolean;
}

const formatCurrency = (amount: string | number | undefined): string => {
  if (amount === undefined || amount === null) return '0 đ';
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return '0 đ';
  return new Intl.NumberFormat('vi-VN').format(num) + ' đ';
};

export const TopSellingProducts: React.FC<TopSellingProductsProps> = ({
  products = [],
  loading = false,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-rose-50 text-rose-600 rounded-lg">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Sản Phẩm Mua Nhiều Nhất</h4>
              <p className="text-xs text-slate-400">Xếp hạng theo số lượng bán ra trong kỳ</p>
            </div>
          </div>
          <span className="text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer">
            Xem tất cả
          </span>
        </div>

        {/* Loading Skeleton */}
        {loading ? (
          <div className="space-y-3 mt-4 animate-pulse">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between py-2.5">
                <div className="flex items-center space-x-3 w-2/5">
                  <div className="w-5 h-5 rounded-full bg-slate-200"></div>
                  <div className="space-y-1.5 flex-1">
                    <div className="h-3.5 bg-slate-200 rounded w-4/5"></div>
                    <div className="h-2.5 bg-slate-100 rounded w-2/5"></div>
                  </div>
                </div>
                <div className="h-3.5 bg-slate-200 rounded w-16"></div>
                <div className="h-3.5 bg-slate-200 rounded w-20"></div>
                <div className="h-3.5 bg-slate-100 rounded w-16"></div>
                <div className="h-3.5 bg-slate-100 rounded w-12"></div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          /* Empty State khi chưa có sản phẩm nào bán ra */
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center">
              <PackageOpen className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-slate-700">Chưa có giao dịch bán hàng</p>
            <p className="text-xs text-slate-400 max-w-sm">
              Chưa phát sinh dữ liệu mua hàng trong khoảng thời gian này. Dữ liệu sẽ xuất hiện khi có đơn bán lẻ tại quầy POS.
            </p>
          </div>
        ) : (
          /* Top Products Table */
          <div className="overflow-x-auto mt-3">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-400 font-semibold border-b border-slate-100">
                  <th className="py-2.5 px-2">#</th>
                  <th className="py-2.5 px-3">Tên sản phẩm</th>
                  <th className="py-2.5 px-3 text-center">Đã bán</th>
                  <th className="py-2.5 px-3 text-right">Doanh thu</th>
                  <th className="py-2.5 px-3 text-center">Tồn kho</th>
                  <th className="py-2.5 px-2 text-right">Tăng trưởng</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((product, index) => (
                  <tr key={product.id || index} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-2 font-bold text-slate-400">
                      <span
                        className={`w-5 h-5 rounded-full inline-flex items-center justify-center text-[10px] ${
                          index === 0
                            ? 'bg-amber-100 text-amber-800 font-bold'
                            : index === 1
                            ? 'bg-slate-200 text-slate-700'
                            : index === 2
                            ? 'bg-orange-100 text-orange-800'
                            : 'text-slate-400'
                        }`}
                      >
                        {index + 1}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-900 line-clamp-1">{product.name}</div>
                      <span className="text-[10px] text-slate-400">{product.category}</span>
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-slate-800">
                      {product.sold_count}{' '}
                      <span className="text-[10px] font-normal text-slate-500">{product.unit}</span>
                    </td>
                    <td className="py-3 px-3 text-right font-semibold text-slate-800">
                      {formatCurrency(product.revenue)}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          product.stock < 20
                            ? 'bg-red-50 text-red-600 border border-red-200'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {product.stock} {product.unit}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-right font-semibold text-emerald-600">
                      {product.trend}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
