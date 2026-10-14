import React from 'react';
import { Flame } from 'lucide-react';

export interface ProductItem {
  id: number;
  name: string;
  category: string;
  soldCount: number;
  revenue: string;
  stock: number;
  unit: string;
  trend: string;
}

interface TopSellingProductsProps {
  products?: ProductItem[];
}

const defaultProducts: ProductItem[] = [
  {
    id: 1,
    name: 'Mì ăn liền Hảo Hảo tôm chua cay (Thùng 30 gói)',
    category: 'Thực phẩm khô',
    soldCount: 342,
    revenue: '37.620.000 đ',
    stock: 58,
    unit: 'Thùng',
    trend: '+18.5%',
  },
  {
    id: 2,
    name: 'Nước ngọt Coca Cola lon 320ml (Lốc 6 lon)',
    category: 'Đồ uống & Giải khát',
    soldCount: 275,
    revenue: '15.950.000 đ',
    stock: 112,
    unit: 'Lốc',
    trend: '+12.3%',
  },
  {
    id: 3,
    name: 'Sữa chua Vinamilk có đường (Vỉ 4 hộp)',
    category: 'Bơ sữa & Tráng miệng',
    soldCount: 198,
    revenue: '5.940.000 đ',
    stock: 35,
    unit: 'Vỉ',
    trend: '+8.1%',
  },
  {
    id: 4,
    name: 'Dầu ăn Simply đậu nành chai 1L',
    category: 'Gia vị & Dầu ăn',
    soldCount: 164,
    revenue: '10.660.000 đ',
    stock: 19,
    unit: 'Chai',
    trend: '+5.4%',
  },
  {
    id: 5,
    name: 'Bột giặt OMO Comfort tinh dầu thơm 3kg',
    category: 'Hóa mỹ phẩm',
    soldCount: 120,
    revenue: '19.200.000 đ',
    stock: 14,
    unit: 'Túi',
    trend: '+3.2%',
  },
];

export const TopSellingProducts: React.FC<TopSellingProductsProps> = ({
  products = defaultProducts,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
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

      {/* Top Products Table */}
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
              <tr key={product.id} className="hover:bg-slate-50/80 transition">
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
                  {product.soldCount} <span className="text-[10px] font-normal text-slate-500">{product.unit}</span>
                </td>
                <td className="py-3 px-3 text-right font-semibold text-slate-800">{product.revenue}</td>
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
                <td className="py-3 px-2 text-right font-semibold text-emerald-600">{product.trend}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
