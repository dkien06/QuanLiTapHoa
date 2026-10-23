import type {
  Supplier,
  PurchaseOrderRecord,
  ManualImportPayload,
} from '../types/purchaseOrder';
import { inventoryService } from './inventoryService';
import { requireMockMode } from '../mock/mockConfig';
import { MOCK_SUPPLIERS, createMockInitialOrders } from '../mock/mockPurchaseOrders';

const PO_STORAGE_KEY = 'purchase_orders_history_store';

// Nhà cung cấp và đơn nhập mẫu được khai báo trong ../mock/mockPurchaseOrders.
const generateOrderCode = (type: 'B2B' | 'MANUAL') => {
  const now = new Date();
  const dateStr = `${now.getFullYear().toString().slice(-2)}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  const randomStr = Math.floor(1000 + Math.random() * 9000);
  return `PO-${type}-${dateStr}-${randomStr}`;
};

export const purchaseOrderService = {
  // Lấy danh sách xưởng liên kết
  getSuppliers(): Supplier[] {
    requireMockMode('Danh sách xưởng');
    return MOCK_SUPPLIERS;
  },

  // Lấy chi tiết xưởng theo ID
  getSupplierById(id: string): Supplier | null {
    requireMockMode('Thông tin xưởng');
    return MOCK_SUPPLIERS.find((s) => s.id === id) || null;
  },

  // Lấy lịch sử đơn nhập hàng từ localStorage (hoặc nạp seed orders)
  getOrderHistory(): PurchaseOrderRecord[] {
    requireMockMode('Lịch sử đơn nhập');
    const initial = createMockInitialOrders();
    try {
      const stored = localStorage.getItem(PO_STORAGE_KEY);
      if (stored) {
        const parsed: PurchaseOrderRecord[] = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Kết hợp các đơn mới tạo với các đơn mẫu nếu chưa có để luôn đủ 5 trạng thái kiểm thử
          const existingIds = new Set(parsed.map((o) => o.id));
          const missingSeeds = initial.filter((s) => !existingIds.has(s.id));
          if (missingSeeds.length > 0) {
            const combined = [...parsed, ...missingSeeds];
            localStorage.setItem(PO_STORAGE_KEY, JSON.stringify(combined));
            return combined;
          }
          return parsed;
        }
      }
    } catch {
      // Fallback
    }

    // Nếu chưa có, nạp danh sách mẫu và lưu vào storage
    try {
      localStorage.setItem(PO_STORAGE_KEY, JSON.stringify(initial));
    } catch {
      // ignore
    }
    return initial;
  },

  // Lưu lịch sử đơn nhập hàng
  saveOrder(record: PurchaseOrderRecord): void {
    requireMockMode('Lưu đơn nhập mẫu');
    try {
      const history = this.getOrderHistory();
      history.unshift(record);
      localStorage.setItem(PO_STORAGE_KEY, JSON.stringify(history.slice(0, 100)));
    } catch {
      // Bỏ qua lỗi quota
    }
  },

  // Lọc danh sách đơn nhập hàng theo trạng thái & từ khóa
  getFilteredOrders(filter: {
    status?: string;
    keyword?: string;
  }): PurchaseOrderRecord[] {
    const all = this.getOrderHistory();
    const { status = 'ALL', keyword = '' } = filter;
    const q = keyword.trim().toLowerCase();

    return all.filter((order) => {
      // Lọc theo trạng thái
      if (status && status !== 'ALL') {
        if (order.status !== status) return false;
      }

      // Lọc theo từ khóa (Mã đơn, Tên xưởng/nhà cung cấp, Tên món hàng)
      if (q) {
        const matchCode = order.orderCode.toLowerCase().includes(q);
        const matchSupplier = order.supplierName.toLowerCase().includes(q);
        const matchItem = order.items.some(
          (i) =>
            i.name.toLowerCase().includes(q) ||
            i.barcode.toLowerCase().includes(q)
        );
        if (!matchCode && !matchSupplier && !matchItem) return false;
      }

      return true;
    });
  },

  // Thống kê số lượng đơn theo từng trạng thái
  getOrderStats(): {
    total: number;
    pendingCount: number;
    confirmedCount: number;
    shippingCount: number;
    receivedCount: number;
    cancelledCount: number;
    totalAmountSpent: number;
  } {
    const all = this.getOrderHistory();
    let pendingCount = 0;
    let confirmedCount = 0;
    let shippingCount = 0;
    let receivedCount = 0;
    let cancelledCount = 0;
    let totalAmountSpent = 0;

    all.forEach((o) => {
      if (o.status === 'PENDING') pendingCount++;
      else if (o.status === 'CONFIRMED') confirmedCount++;
      else if (o.status === 'SHIPPING') shippingCount++;
      else if (o.status === 'RECEIVED') {
        receivedCount++;
        totalAmountSpent += o.totalAmount;
      } else if (o.status === 'CANCELLED') cancelledCount++;
    });

    return {
      total: all.length,
      pendingCount,
      confirmedCount,
      shippingCount,
      receivedCount,
      cancelledCount,
      totalAmountSpent,
    };
  },

  // Xác nhận đã nhận hàng (Cập nhật sang RECEIVED và TỰ ĐỘNG CỘNG TỒN KHO)
  confirmReceivedOrder(orderId: string): PurchaseOrderRecord {
    const history = this.getOrderHistory();
    const index = history.findIndex((o) => o.id === orderId);
    if (index === -1) {
      throw new Error('Không tìm thấy đơn nhập hàng trong hệ thống.');
    }

    const order = history[index];
    if (order.status === 'RECEIVED') {
      return order; // Đã nhận trước đó rồi
    }
    if (order.status === 'CANCELLED') {
      throw new Error('Đơn hàng đã bị hủy, không thể xác nhận nhận hàng.');
    }

    // 1. Cập nhật trạng thái đơn sang RECEIVED
    const updatedOrder: PurchaseOrderRecord = {
      ...order,
      status: 'RECEIVED',
      statusLabel: 'Đã nhận hàng',
      receivedAt: new Date().toISOString(),
    };

    // 2. Tự động cộng số lượng món hàng vào kho tiệm (inventoryService)
    order.items.forEach((item) => {
      inventoryService.addOrUpdateStockFromManualImport({
        barcode: item.barcode,
        name: item.name,
        unit: item.unit,
        quantity: item.quantity,
        costPrice: item.unitPrice,
      });
    });

    // 3. Lưu lại vào localStorage
    history[index] = updatedOrder;
    try {
      localStorage.setItem(PO_STORAGE_KEY, JSON.stringify(history));
    } catch {
      // ignore
    }

    return updatedOrder;
  },

  // Hủy đơn hàng (nếu đơn chưa xuất kho hoặc đang chờ duyệt)
  cancelOrder(orderId: string, reason?: string): PurchaseOrderRecord {
    const history = this.getOrderHistory();
    const index = history.findIndex((o) => o.id === orderId);
    if (index === -1) {
      throw new Error('Không tìm thấy đơn nhập hàng.');
    }

    const order = history[index];
    if (order.status === 'RECEIVED') {
      throw new Error('Đơn hàng đã nhận hàng vào kho, không thể hủy đơn.');
    }

    const updatedOrder: PurchaseOrderRecord = {
      ...order,
      status: 'CANCELLED',
      statusLabel: 'Đã hủy',
      note: reason ? `${order.note ? order.note + ' | ' : ''}Lý do hủy: ${reason}` : order.note,
    };

    history[index] = updatedOrder;
    try {
      localStorage.setItem(PO_STORAGE_KEY, JSON.stringify(history));
    } catch {
      // ignore
    }

    return updatedOrder;
  },

  // Tạo Đơn Đặt Hàng B2B từ Xưởng (Trạng thái: PENDING / CHO_XAC_NHAN)
  async createB2BOrder(
    supplierId: string,
    orderItems: Array<{ productId: string; quantity: number }>,
    note?: string
  ): Promise<PurchaseOrderRecord> {
    requireMockMode('Đặt hàng tại xưởng');
    await new Promise((resolve) => setTimeout(resolve, 300));

    const supplier = this.getSupplierById(supplierId);
    if (!supplier) {
      throw new Error('Không tìm thấy nhà cung cấp xưởng được chọn.');
    }

    const items = orderItems
      .map((item) => {
        const prod = supplier.catalog.find((p) => p.productId === item.productId);
        if (!prod || item.quantity <= 0) return null;
        return {
          productId: prod.productId,
          barcode: prod.barcode,
          name: prod.name,
          unit: prod.unit,
          quantity: item.quantity,
          unitPrice: prod.wholesalePrice,
          subtotal: item.quantity * prod.wholesalePrice,
        };
      })
      .filter((i): i is NonNullable<typeof i> => i !== null);

    if (items.length === 0) {
      throw new Error('Vui lòng chọn ít nhất 1 mặt hàng với số lượng hợp lệ.');
    }

    const totalAmount = items.reduce((sum, i) => sum + i.subtotal, 0);

    const record: PurchaseOrderRecord = {
      id: `po-${Date.now()}`,
      orderCode: generateOrderCode('B2B'),
      type: 'B2B',
      status: 'PENDING',
      statusLabel: 'Chờ xưởng xác nhận',
      supplierId: supplier.id,
      supplierName: supplier.name,
      items,
      totalAmount,
      note,
      createdAt: new Date().toISOString(),
    };

    this.saveOrder(record);
    return record;
  },

  // Tạo Đơn Nhập Hàng Ngoài Thủ Công (Trạng thái: RECEIVED / HOAN_THANH)
  async createManualImportOrder(
    payload: ManualImportPayload
  ): Promise<PurchaseOrderRecord> {
    requireMockMode('Tạo phiếu nhập mẫu');
    await new Promise((resolve) => setTimeout(resolve, 300));

    if (!payload.supplierName.trim()) {
      throw new Error('Vui lòng nhập tên nhà cung cấp ngoài.');
    }
    if (!payload.productName.trim()) {
      throw new Error('Vui lòng nhập tên sản phẩm.');
    }
    if (!payload.barcode.trim()) {
      throw new Error('Vui lòng nhập mã vạch barcode.');
    }
    if (payload.quantity <= 0) {
      throw new Error('Số lượng nhập phải lớn hơn 0.');
    }
    if (payload.costPrice <= 0) {
      throw new Error('Đơn giá nhập hàng phải lớn hơn 0 đ.');
    }

    const subtotal = payload.quantity * payload.costPrice;

    // 1. Tự động cộng dồn tồn kho và cập nhật giá vốn ngay lập tức vào inventoryService!
    inventoryService.addOrUpdateStockFromManualImport({
      barcode: payload.barcode,
      name: payload.productName,
      unit: payload.unit || 'cái',
      quantity: payload.quantity,
      costPrice: payload.costPrice,
      sellingPrice: payload.suggestedSellingPrice > 0 ? payload.suggestedSellingPrice : undefined,
    });

    // 2. Lưu vết đơn nhập hàng thủ công với trạng thái HOAN_THANH (RECEIVED)
    const record: PurchaseOrderRecord = {
      id: `po-${Date.now()}`,
      orderCode: generateOrderCode('MANUAL'),
      type: 'MANUAL',
      status: 'RECEIVED',
      statusLabel: 'Đã nhập kho thành công',
      supplierName: payload.supplierName.trim(),
      items: [
        {
          barcode: payload.barcode.trim(),
          name: payload.productName.trim(),
          unit: payload.unit || 'cái',
          quantity: payload.quantity,
          unitPrice: payload.costPrice,
          subtotal,
        },
      ],
      totalAmount: subtotal,
      note: payload.note,
      createdAt: new Date().toISOString(),
      receivedAt: new Date().toISOString(),
    };

    this.saveOrder(record);
    return record;
  },
};
