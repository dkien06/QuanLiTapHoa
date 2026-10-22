import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { InventoryProduct, UpdateProductPayload } from '../types/inventory';
import { inventoryService } from '../services/inventoryService';
import { authService } from '../services/authService';
import { InventoryFilterBar } from '../components/inventory/InventoryFilterBar';
import { InventoryTable } from '../components/inventory/InventoryTable';
import { EditProductModal } from '../components/inventory/EditProductModal';
import { CreatePurchaseOrderModal } from '../components/inventory/CreatePurchaseOrderModal';
import { PurchaseOrderList } from '../components/inventory/PurchaseOrderList';
import { purchaseOrderService } from '../services/purchaseOrderService';
import {
  ArrowLeft,
  ShoppingCart,
  RotateCcw,
  Store,
  CheckCircle2,
  PackagePlus,
  Boxes,
  Truck,
} from 'lucide-react';

interface InventoryPageProps {
  embeddedInDashboard?: boolean;
}

export const InventoryPage: React.FC<InventoryPageProps> = ({ embeddedInDashboard = false }) => {
  const navigate = useNavigate();

  // Thông tin tiệm
  const [currentUser] = useState(() => {
    return (
      authService.getStoredUser() || {
        fullName: 'Nguyễn Văn An',
        storeName: 'Tạp hóa Bình An',
      }
    );
  });

  // State bộ lọc và phân trang
  const [keyword, setKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [onlyLowStock, setOnlyLowStock] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // State dữ liệu
  const [categories, setCategories] = useState<string[]>([]);
  const [paginatedData, setPaginatedData] = useState<{
    products: InventoryProduct[];
    total: number;
    totalPages: number;
  }>({
    products: [],
    total: 0,
    totalPages: 1,
  });

  const [stats, setStats] = useState(() => inventoryService.getInventoryStats());

  // State Modal chỉnh sửa
  const [selectedProduct, setSelectedProduct] = useState<InventoryProduct | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // State Modal tạo đơn nhập hàng (FE-04)
  const [isCreatePOModalOpen, setIsCreatePOModalOpen] = useState(false);

  // Sub-Tab Phân Hệ: Tồn kho vs Đơn nhập hàng (FE-05)
  const [activeSubTab, setActiveSubTab] = useState<'STOCK' | 'PURCHASE_ORDERS'>('STOCK');
  const [poStats, setPoStats] = useState(() => purchaseOrderService.getOrderStats());

  // Toast thông báo
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Tải dữ liệu danh sách sản phẩm theo bộ lọc
  const loadData = useCallback(() => {
    const result = inventoryService.getFilteredProducts({
      keyword,
      category: selectedCategory,
      onlyLowStock,
      page,
      pageSize,
    });

    setPaginatedData({
      products: result.products,
      total: result.total,
      totalPages: result.totalPages,
    });

    setStats(inventoryService.getInventoryStats());
    setCategories(inventoryService.getCategories());
    setPoStats(purchaseOrderService.getOrderStats());
  }, [keyword, selectedCategory, onlyLowStock, page, pageSize]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Xử lý thay đổi từ khóa
  const handleKeywordChange = (val: string) => {
    setKeyword(val);
    setPage(1);
  };

  // Xử lý thay đổi danh mục
  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    setPage(1);
  };

  // Toggle lọc sắp hết hàng
  const handleToggleLowStock = () => {
    setOnlyLowStock((prev) => !prev);
    setPage(1);
  };

  // Mở modal sửa
  const handleEditProduct = (product: InventoryProduct) => {
    setSelectedProduct(product);
    setIsEditModalOpen(true);
  };

  // Lưu sản phẩm sau khi sửa
  const handleSaveProduct = (id: string, payload: UpdateProductPayload) => {
    const updated = inventoryService.updateProduct(id, payload);
    if (updated) {
      loadData();
      setToastMessage(`Đã cập nhật giá bán và ngưỡng cảnh báo cho "${updated.name}".`);
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  // Khôi phục dữ liệu mẫu
  const handleResetSampleData = () => {
    if (window.confirm('Bạn có muốn khôi phục lại dữ liệu kho mẫu ban đầu không?')) {
      inventoryService.resetToDefault();
      setKeyword('');
      setSelectedCategory('ALL');
      setOnlyLowStock(false);
      setPage(1);
      loadData();
      setToastMessage('Đã khôi phục dữ liệu kho về trạng thái mặc định.');
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  const totalAllProducts = inventoryService.getAllProducts().length;

  return (
    <div className={embeddedInDashboard ? 'space-y-4' : 'min-h-screen bg-slate-100 flex flex-col text-slate-800'}>
      {/* Top Header nếu mở trang độc lập (/inventory) */}
      {!embeddedInDashboard && (
        <header className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between shadow-md shrink-0 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg transition cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
              title="Quay lại Bảng điều khiển"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Về Dashboard</span>
            </button>

            <div className="h-5 w-px bg-slate-700" />

            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-blue-600 rounded-lg shadow-sm">
                <Store className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-sm tracking-tight text-white leading-none">
                  {currentUser.storeName || 'TẠP HÓA BÌNH AN'}
                </h1>
                <span className="text-xs text-blue-300 font-medium">
                  Quản Lý Tồn Kho & Cảnh Báo Hết Hàng
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2.5">
            <button
              type="button"
              onClick={() => setIsCreatePOModalOpen(true)}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-semibold rounded-lg transition cursor-pointer flex items-center gap-1.5 shadow-xs"
              title="Tạo đơn nhập hàng (Xưởng B2B hoặc Thủ công)"
            >
              <PackagePlus className="w-4 h-4" />
              <span>+ Nhập Hàng</span>
            </button>

            <button
              type="button"
              onClick={() => navigate('/pos')}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition cursor-pointer flex items-center gap-1.5 shadow-xs"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Sang Quầy Thu Ngân</span>
              <kbd className="keycap text-blue-900">F2</kbd>
            </button>

            <button
              type="button"
              onClick={handleResetSampleData}
              className="p-2 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded-lg transition cursor-pointer"
              title="Khôi phục dữ liệu mẫu ban đầu"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </header>
      )}

      {/* Main Content Area */}
      <div className={embeddedInDashboard ? 'space-y-4' : 'flex-1 p-4 md:p-6 space-y-4 max-w-7xl mx-auto w-full'}>
        {/* Toast thông báo thành công */}
        {toastMessage && (
          <div className="p-3 bg-emerald-50 text-emerald-900 border border-emerald-300 rounded-lg text-xs font-semibold flex items-center gap-2 shadow-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Navigation Sub-Tabs: Tồn Kho vs Đơn Nhập Hàng */}
        <div className="bg-white p-1.5 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveSubTab('STOCK')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeSubTab === 'STOCK'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Boxes className="w-4 h-4" />
            <span>1. Tồn Kho Cửa Hàng</span>
            <span
              className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                activeSubTab === 'STOCK'
                  ? 'bg-blue-800 text-white'
                  : 'bg-slate-200 text-slate-700'
              }`}
            >
              {totalAllProducts} mã
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('PURCHASE_ORDERS')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeSubTab === 'PURCHASE_ORDERS'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>2. Đơn Nhập Hàng & Theo Dõi</span>
            {poStats.shippingCount + poStats.pendingCount + poStats.confirmedCount > 0 && (
              <span
                className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold ${
                  activeSubTab === 'PURCHASE_ORDERS'
                    ? 'bg-amber-400 text-slate-900'
                    : 'bg-amber-100 text-amber-900 border border-amber-300'
                }`}
              >
                {poStats.shippingCount + poStats.pendingCount + poStats.confirmedCount} đơn
              </span>
            )}
          </button>
        </div>

        {/* Tab 1 Content: Tồn Kho & Cảnh Báo Hết Hàng */}
        {activeSubTab === 'STOCK' && (
          <>
            {/* Thanh công cụ lọc & mini stats */}
            <InventoryFilterBar
              stats={stats}
              keyword={keyword}
              onKeywordChange={handleKeywordChange}
              selectedCategory={selectedCategory}
              onCategoryChange={handleCategoryChange}
              categories={categories}
              onlyLowStock={onlyLowStock}
              onToggleLowStock={handleToggleLowStock}
              totalFiltered={paginatedData.total}
              totalAll={totalAllProducts}
              onOpenCreatePOModal={() => setIsCreatePOModalOpen(true)}
            />

            {/* Bảng dữ liệu tồn kho */}
            <InventoryTable
              products={paginatedData.products}
              total={paginatedData.total}
              page={page}
              pageSize={pageSize}
              totalPages={paginatedData.totalPages}
              onPageChange={setPage}
              onPageSizeChange={(newSize) => {
                setPageSize(newSize);
                setPage(1);
              }}
              onEditProduct={handleEditProduct}
              onResetFilters={() => {
                setKeyword('');
                setSelectedCategory('ALL');
                setOnlyLowStock(false);
                setPage(1);
              }}
            />
          </>
        )}

        {/* Tab 2 Content: Theo Dõi Đơn Nhập Hàng & Nhận Hàng (FE-05) */}
        {activeSubTab === 'PURCHASE_ORDERS' && (
          <PurchaseOrderList
            onOpenCreatePOModal={() => setIsCreatePOModalOpen(true)}
            onOrderReceivedSuccess={(orderCode) => {
              loadData();
              setToastMessage(
                `Đã xác nhận nhận hàng đơn #${orderCode} thành công! Toàn bộ số lượng sản phẩm đã được cộng vào tồn kho.`
              );
              setTimeout(() => setToastMessage(null), 4500);
            }}
          />
        )}

        {/* Modal chỉnh sửa */}
        <EditProductModal
          product={selectedProduct}
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedProduct(null);
          }}
          onSave={handleSaveProduct}
        />

        {/* Modal Tạo đơn nhập hàng (FE-04: B2B xưởng & Nhập ngoài thủ công) */}
        <CreatePurchaseOrderModal
          isOpen={isCreatePOModalOpen}
          onClose={() => setIsCreatePOModalOpen(false)}
          onB2BSuccess={(orderCode) => {
            setIsCreatePOModalOpen(false);
            loadData();
            setToastMessage(`Đã gửi đơn đặt hàng #${orderCode} đến xưởng thành công! Trạng thái: Chờ xác nhận.`);
            setTimeout(() => setToastMessage(null), 4000);
          }}
          onManualSuccess={(orderCode, prodName, qty) => {
            setIsCreatePOModalOpen(false);
            loadData();
            setToastMessage(`Nhập kho thành công ${qty} ${prodName}! Đơn hàng #${orderCode} đã hoàn tất và tồn kho đã được cộng.`);
            setTimeout(() => setToastMessage(null), 4500);
          }}
        />
      </div>
    </div>
  );
};
