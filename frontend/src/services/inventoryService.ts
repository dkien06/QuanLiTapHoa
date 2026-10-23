import type {
  InventoryProduct,
  StockStatusLevel,
  UpdateProductPayload,
  InventoryFilterParams,
  InventoryStats,
} from '../types/inventory';
import { MOCK_ACTIVE_PRODUCTS as MOCK_PRODUCTS } from '../mock/mockProducts';
import { requireMockMode } from '../mock/mockConfig';
import { MOCK_DEFAULT_PRODUCT_CATEGORY, MOCK_DEFAULT_STOCK_ALERT, MOCK_IMPORTED_PRODUCT_CATEGORY, MOCK_STOCK_ALERTS } from '../mock/mockInventory';

const STORAGE_KEY = 'inventory_products_store';

// Hàm xác định trạng thái tồn kho theo 3 mức chuẩn
export const determineStockStatus = (
  stockQuantity: number,
  minStockAlert: number
): StockStatusLevel => {
  if (stockQuantity <= minStockAlert || stockQuantity === 0) {
    return 'CRITICAL'; // Đỏ: Sắp hết / Đạt ngưỡng / Hết hàng
  }
  if (stockQuantity <= 10) {
    return 'LOW'; // Vàng: Còn ít (<= 10)
  }
  return 'NORMAL'; // Xanh: Còn nhiều (> 10)
};

// Hàm chuẩn hóa tiếng Việt không dấu để tìm kiếm thông minh hơn
export const normalizeVietnamese = (str: string): string => {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .trim();
};

// Khởi tạo dữ liệu mẫu phong phú kế thừa từ posService và bổ sung ngưỡng cảnh báo
const createInitialProducts = (): InventoryProduct[] => {
  return MOCK_PRODUCTS.map((p) => {
    const minAlert = MOCK_STOCK_ALERTS[p.id] ?? MOCK_DEFAULT_STOCK_ALERT;
    const status = determineStockStatus(p.stockQuantity, minAlert);
    return {
      id: p.id,
      barcode: p.barcode,
      name: p.name,
      unit: p.unit,
      categoryName: p.categoryName || MOCK_DEFAULT_PRODUCT_CATEGORY,
      stockQuantity: p.stockQuantity,
      costPrice: p.costPrice || Math.round(p.price * 0.8),
      sellingPrice: p.price,
      minStockAlert: minAlert,
      updatedAt: new Date().toISOString(),
      status,
    };
  });
};

export const inventoryService = {
  // Lấy toàn bộ danh sách từ localStorage (hoặc nạp mẫu ban đầu)
  getAllProducts(): InventoryProduct[] {
    requireMockMode('Quản lý kho');
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: InventoryProduct[] = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Tính lại status theo stock hiện tại phòng trường hợp logic đổi
          return parsed.map((item) => ({
            ...item,
            status: determineStockStatus(item.stockQuantity, item.minStockAlert),
          }));
        }
      }
    } catch {
      // Fallback
    }

    const initial = createInitialProducts();
    this.saveProducts(initial);
    return initial;
  },

  // Lưu danh sách sản phẩm vào localStorage
  saveProducts(products: InventoryProduct[]): void {
    requireMockMode('Lưu kho mẫu');
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    } catch {
      // Bỏ qua lỗi quota
    }
  },

  // Lấy sản phẩm theo ID
  getProductById(id: string): InventoryProduct | null {
    const products = this.getAllProducts();
    return products.find((p) => p.id === id) || null;
  },

  // Lấy danh sách danh mục hàng hóa duy nhất
  getCategories(): string[] {
    const products = this.getAllProducts();
    const categoriesSet = new Set<string>();
    products.forEach((p) => {
      if (p.categoryName) categoriesSet.add(p.categoryName);
    });
    return Array.from(categoriesSet);
  },

  // Tìm kiếm, lọc và phân trang sản phẩm
  getFilteredProducts(params: InventoryFilterParams): {
    products: InventoryProduct[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  } {
    const all = this.getAllProducts();
    const { keyword, category, onlyLowStock, page = 1, pageSize = 10 } = params;

    const query = keyword.trim().toLowerCase();
    const normalizedQuery = normalizeVietnamese(keyword);

    const filtered = all.filter((item) => {
      // Lọc từ khóa: Tên hoặc Barcode (hỗ trợ cả có dấu và không dấu tiếng Việt)
      if (query) {
        const nameLower = item.name.toLowerCase();
        const nameNormalized = normalizeVietnamese(item.name);
        const matchName =
          nameLower.includes(query) ||
          nameNormalized.includes(normalizedQuery);
        const matchBarcode = item.barcode.toLowerCase().includes(query);
        if (!matchName && !matchBarcode) return false;
      }

      // Lọc theo Danh mục
      if (category && category !== 'ALL') {
        if (item.categoryName !== category) return false;
      }

      // Lọc nhanh sắp hết hàng (Vàng hoặc Đỏ)
      if (onlyLowStock) {
        if (item.status === 'NORMAL') return false;
      }

      return true;
    });

    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const currentPage = Math.min(Math.max(1, page), totalPages);
    const startIndex = (currentPage - 1) * pageSize;
    const paginatedProducts = filtered.slice(startIndex, startIndex + pageSize);

    return {
      products: paginatedProducts,
      total,
      page: currentPage,
      pageSize,
      totalPages,
    };
  },

  // Cập nhật giá bán lẻ và ngưỡng cảnh báo tồn tối thiểu
  updateProduct(id: string, payload: UpdateProductPayload): InventoryProduct | null {
    const all = this.getAllProducts();
    const index = all.findIndex((p) => p.id === id);
    if (index === -1) return null;

    const existing = all[index];
    const newSellingPrice = Math.max(0, Math.round(payload.sellingPrice));
    const newMinAlert = Math.max(0, Math.round(payload.minStockAlert));
    const newStatus = determineStockStatus(existing.stockQuantity, newMinAlert);

    const updated: InventoryProduct = {
      ...existing,
      sellingPrice: newSellingPrice,
      minStockAlert: newMinAlert,
      status: newStatus,
      updatedAt: new Date().toISOString(),
    };

    all[index] = updated;
    this.saveProducts(all);
    return updated;
  },

  // Tính toán các chỉ số thống kê kho
  getInventoryStats(): InventoryStats {
    const all = this.getAllProducts();

    let totalStockQuantity = 0;
    let lowStockCount = 0;
    let criticalCount = 0;
    let totalCostValue = 0;
    let totalRetailValue = 0;

    all.forEach((p) => {
      totalStockQuantity += p.stockQuantity;
      totalCostValue += p.stockQuantity * p.costPrice;
      totalRetailValue += p.stockQuantity * p.sellingPrice;

      if (p.status === 'CRITICAL') {
        criticalCount++;
        lowStockCount++;
      } else if (p.status === 'LOW') {
        lowStockCount++;
      }
    });

    return {
      totalProducts: all.length,
      totalStockQuantity,
      lowStockCount,
      criticalCount,
      totalCostValue,
      totalRetailValue,
    };
  },

  // Cộng dồn tồn kho và cập nhật giá vốn từ đơn nhập hàng thủ công
  addOrUpdateStockFromManualImport(payload: {
    barcode: string;
    name: string;
    unit: string;
    quantity: number;
    costPrice: number;
    sellingPrice?: number;
  }): InventoryProduct {
    const all = this.getAllProducts();
    const barcodeTrimmed = payload.barcode.trim();
    const index = all.findIndex(
      (p) => p.barcode.toLowerCase() === barcodeTrimmed.toLowerCase()
    );

    if (index > -1) {
      // Đã có trong kho -> Cộng dồn số lượng, cập nhật giá vốn mới
      const existing = all[index];
      const newStock = existing.stockQuantity + payload.quantity;
      const updated: InventoryProduct = {
        ...existing,
        name: payload.name || existing.name,
        unit: payload.unit || existing.unit,
        stockQuantity: newStock,
        costPrice: payload.costPrice > 0 ? payload.costPrice : existing.costPrice,
        sellingPrice:
          payload.sellingPrice && payload.sellingPrice > 0
            ? payload.sellingPrice
            : existing.sellingPrice,
        status: determineStockStatus(newStock, existing.minStockAlert),
        updatedAt: new Date().toISOString(),
      };
      all[index] = updated;
      this.saveProducts(all);
      return updated;
    } else {
      // Chưa có trong kho -> Thêm sản phẩm mới vào danh mục
      const minAlert = MOCK_DEFAULT_STOCK_ALERT;
      const newProduct: InventoryProduct = {
        id: `prod-${Date.now()}`,
        barcode: barcodeTrimmed,
        name: payload.name,
        unit: payload.unit,
        categoryName: MOCK_IMPORTED_PRODUCT_CATEGORY,
        stockQuantity: payload.quantity,
        costPrice: payload.costPrice,
        sellingPrice: payload.sellingPrice || Math.round(payload.costPrice * 1.2),
        minStockAlert: minAlert,
        status: determineStockStatus(payload.quantity, minAlert),
        updatedAt: new Date().toISOString(),
      };
      all.unshift(newProduct);
      this.saveProducts(all);
      return newProduct;
    }
  },

  // Khôi phục dữ liệu gốc
  resetToDefault(): InventoryProduct[] {
    requireMockMode('Khôi phục kho mẫu');
    const initial = createInitialProducts();
    this.saveProducts(initial);
    return initial;
  },
};
