export type StockStatusLevel = 'NORMAL' | 'LOW' | 'CRITICAL';

export interface InventoryProduct {
  id: string;
  barcode: string;
  name: string;
  unit: string;
  categoryName: string;
  stockQuantity: number;
  costPrice: number; // Giá vốn nhập hàng (VND)
  sellingPrice: number; // Giá bán lẻ niêm yết (VND)
  minStockAlert: number; // Ngưỡng tồn tối thiểu kích hoạt cảnh báo đỏ
  updatedAt: string; // Thời gian cập nhật gần nhất
  status: StockStatusLevel;
}

export interface UpdateProductPayload {
  sellingPrice: number;
  minStockAlert: number;
}

export interface InventoryFilterParams {
  keyword: string;
  category: string;
  onlyLowStock: boolean;
  page: number;
  pageSize: number;
}

export interface InventoryStats {
  totalProducts: number; // Tổng số mặt hàng khác nhau
  totalStockQuantity: number; // Tổng số lượng sản phẩm tồn trong kho
  lowStockCount: number; // Số mặt hàng đang ở ngưỡng báo động (Vàng + Đỏ)
  criticalCount: number; // Số mặt hàng sắp hết hoặc hết hàng (Đỏ)
  totalCostValue: number; // Tổng giá trị kho theo giá vốn
  totalRetailValue: number; // Tổng giá trị kho theo giá bán niêm yết
}
