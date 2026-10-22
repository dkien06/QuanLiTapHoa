import type {
  Supplier,
  PurchaseOrderRecord,
  ManualImportPayload,
} from '../types/purchaseOrder';
import { inventoryService } from './inventoryService';

const PO_STORAGE_KEY = 'purchase_orders_history_store';

// Danh sách các Xưởng sản xuất / Nhà cung cấp B2B liên kết trên hệ thống
export const MOCK_SUPPLIERS: Supplier[] = [
  {
    id: 'sup-001',
    name: 'Xưởng Thực Phẩm Acecook Việt Nam',
    code: 'SUP-ACECOOK',
    phone: '028 3815 4064',
    address: 'KCN Tân Bình, P. Tây Thạnh, Q. Tân Phú, TP.HCM',
    catalog: [
      {
        productId: 'prod-acecook-01',
        barcode: '8934563138164',
        name: 'Mì Hảo Hảo Tôm chua cay 75g (Thùng 30 gói)',
        unit: 'gói',
        wholesalePrice: 3600, // Giá sỉ xưởng
        suggestedRetailPrice: 4500,
        minOrderQuantity: 30, // Tối thiểu 1 thùng 30 gói
        categoryName: 'Mì & Thực phẩm ăn liền',
      },
      {
        productId: 'prod-acecook-02',
        barcode: '8934563138225',
        name: 'Mì Đệ Nhất thịt bằm 82g',
        unit: 'gói',
        wholesalePrice: 5200,
        suggestedRetailPrice: 6500,
        minOrderQuantity: 30,
        categoryName: 'Mì & Thực phẩm ăn liền',
      },
      {
        productId: 'prod-acecook-03',
        barcode: '8934563138332',
        name: 'Phở Đệ Nhất Bò Gói 68g',
        unit: 'gói',
        wholesalePrice: 6800,
        suggestedRetailPrice: 8500,
        minOrderQuantity: 30,
        categoryName: 'Mì & Thực phẩm ăn liền',
      },
      {
        productId: 'prod-acecook-04',
        barcode: '8934563138449',
        name: 'Miến Phú Hương Sườn heo 58g',
        unit: 'gói',
        wholesalePrice: 8000,
        suggestedRetailPrice: 10000,
        minOrderQuantity: 24,
        categoryName: 'Mì & Thực phẩm ăn liền',
      },
    ],
  },
  {
    id: 'sup-002',
    name: 'Tổng Kho Nước Giải Khát & Đồ Uống Sài Gòn',
    code: 'SUP-BEVERAGE',
    phone: '028 3755 8899',
    address: 'Lô C25, KCN Vĩnh Lộc, Bình Chánh, TP.HCM',
    catalog: [
      {
        productId: 'prod-bev-01',
        barcode: '8935049500115',
        name: 'Nước ngọt Coca-Cola Sleek lon 320ml',
        unit: 'lon',
        wholesalePrice: 7800,
        suggestedRetailPrice: 10000,
        minOrderQuantity: 24, // 1 két 24 lon
        categoryName: 'Nước giải khát',
      },
      {
        productId: 'prod-bev-02',
        barcode: '8934822212330',
        name: 'Bia Heineken Sleek lon 330ml',
        unit: 'lon',
        wholesalePrice: 17500,
        suggestedRetailPrice: 22000,
        minOrderQuantity: 24,
        categoryName: 'Bia & Đồ uống có cồn',
      },
      {
        productId: 'prod-bev-03',
        barcode: '8934673123456',
        name: 'Sữa tươi tiệt trùng Vinamilk 100% 180ml',
        unit: 'hộp',
        wholesalePrice: 7200,
        suggestedRetailPrice: 9000,
        minOrderQuantity: 48, // 1 thùng 48 hộp
        categoryName: 'Sữa & Bơ sữa',
      },
      {
        productId: 'prod-bev-04',
        barcode: '8935001700112',
        name: 'Nước tăng lực Sting Dâu đỏ chai 330ml',
        unit: 'chai',
        wholesalePrice: 7500,
        suggestedRetailPrice: 10000,
        minOrderQuantity: 24,
        categoryName: 'Nước giải khát',
      },
    ],
  },
  {
    id: 'sup-003',
    name: 'Công Ty Thực Phẩm & Bánh Kẹo Orion Food',
    code: 'SUP-ORION',
    phone: '0274 374 3666',
    address: 'KCN Mỹ Phước 2, Bến Cát, Bình Dương',
    catalog: [
      {
        productId: 'prod-orion-01',
        barcode: '8936036010012',
        name: 'Bánh Chocopie Orion hộp 12 cái (396g)',
        unit: 'hộp',
        wholesalePrice: 46000,
        suggestedRetailPrice: 58000,
        minOrderQuantity: 8,
        categoryName: 'Bánh kẹo & Ăn vặt',
      },
      {
        productId: 'prod-orion-02',
        barcode: '8936036010050',
        name: 'Bánh Custas Orion hộp 6 cái (141g)',
        unit: 'hộp',
        wholesalePrice: 24500,
        suggestedRetailPrice: 32000,
        minOrderQuantity: 10,
        categoryName: 'Bánh kẹo & Ăn vặt',
      },
      {
        productId: 'prod-orion-03',
        barcode: '8935001234567',
        name: 'Kẹo cao su Cool Air vỉ bạc hà',
        unit: 'vỉ',
        wholesalePrice: 5200,
        suggestedRetailPrice: 7000,
        minOrderQuantity: 20,
        categoryName: 'Bánh kẹo & Ăn vặt',
      },
      {
        productId: 'prod-orion-04',
        barcode: '8936036010088',
        name: 'Snack khoai tây OStar vị Tảo biển 90g',
        unit: 'gói',
        wholesalePrice: 13500,
        suggestedRetailPrice: 18000,
        minOrderQuantity: 20,
        categoryName: 'Bánh kẹo & Ăn vặt',
      },
    ],
  },
];

// Hàm sinh mã đơn hàng chuẩn tiệm
const generateOrderCode = (type: 'B2B' | 'MANUAL') => {
  const now = new Date();
  const dateStr = `${now.getFullYear().toString().slice(-2)}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  const randomStr = Math.floor(1000 + Math.random() * 9000);
  return `PO-${type}-${dateStr}-${randomStr}`;
};

// Dữ liệu đơn nhập hàng mẫu bao phủ cả 5 trạng thái
const createInitialOrders = (): PurchaseOrderRecord[] => [
  {
    id: 'po-seed-001',
    orderCode: 'PO-B2B-261017-8142',
    type: 'B2B',
    status: 'SHIPPING',
    statusLabel: 'Đang vận chuyển',
    supplierId: 'sup-002',
    supplierName: 'Tổng Kho Nước Giải Khát & Đồ Uống Sài Gòn',
    items: [
      {
        productId: 'prod-bev-02',
        barcode: '8934822212330',
        name: 'Bia Heineken Sleek lon 330ml',
        unit: 'lon',
        quantity: 24,
        unitPrice: 17500,
        subtotal: 420000,
      },
      {
        productId: 'prod-bev-01',
        barcode: '8935049500115',
        name: 'Nước ngọt Coca-Cola Sleek lon 320ml',
        unit: 'lon',
        quantity: 48,
        unitPrice: 7800,
        subtotal: 374400,
      },
    ],
    totalAmount: 794400,
    note: 'Giao trong giờ hành chính, xe tải giao trước 17h chiều',
    createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'po-seed-002',
    orderCode: 'PO-B2B-261018-3591',
    type: 'B2B',
    status: 'CONFIRMED',
    statusLabel: 'Xưởng đã duyệt',
    supplierId: 'sup-001',
    supplierName: 'Xưởng Thực Phẩm Acecook Việt Nam',
    items: [
      {
        productId: 'prod-acecook-01',
        barcode: '8934563138164',
        name: 'Mì Hảo Hảo Tôm chua cay 75g (Thùng 30 gói)',
        unit: 'gói',
        quantity: 60,
        unitPrice: 3600,
        subtotal: 216000,
      },
      {
        productId: 'prod-acecook-02',
        barcode: '8934563138225',
        name: 'Mì Đệ Nhất thịt bằm 82g',
        unit: 'gói',
        quantity: 30,
        unitPrice: 5200,
        subtotal: 156000,
      },
    ],
    totalAmount: 372000,
    note: 'Đã thanh toán trước 50% tiền cọc qua VietQR',
    createdAt: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
  },
  {
    id: 'po-seed-003',
    orderCode: 'PO-B2B-261018-6204',
    type: 'B2B',
    status: 'PENDING',
    statusLabel: 'Chờ xưởng duyệt',
    supplierId: 'sup-003',
    supplierName: 'Công ty TNHH Thực phẩm Orion Việt Nam',
    items: [
      {
        productId: 'prod-orion-01',
        barcode: '8936036010012',
        name: 'Bánh Chocopie Orion hộp 12 cái',
        unit: 'hộp',
        quantity: 20,
        unitPrice: 42000,
        subtotal: 840000,
      },
      {
        productId: 'prod-orion-02',
        barcode: '8936036010081',
        name: 'Bánh Custas Kem Trứng Hộp 6 cái',
        unit: 'hộp',
        quantity: 20,
        unitPrice: 22000,
        subtotal: 440000,
      },
    ],
    totalAmount: 1280000,
    note: 'Đơn đặt bổ sung hàng bán Tết',
    createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
  },
  {
    id: 'po-seed-004',
    orderCode: 'PO-MANUAL-261018-1092',
    type: 'MANUAL',
    status: 'RECEIVED',
    statusLabel: 'Đã nhận hàng',
    supplierName: 'Đại lý Bánh kẹo Chợ Lớn',
    items: [
      {
        barcode: '893600000001',
        name: 'Keo Dua Ben Tre Hop 300g',
        unit: 'hộp',
        quantity: 50,
        unitPrice: 18000,
        subtotal: 900000,
      },
    ],
    totalAmount: 900000,
    note: 'Hàng nhập ngoài thủ công, thanh toán tiền mặt tại quầy',
    createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    receivedAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
  },
  {
    id: 'po-seed-005',
    orderCode: 'PO-B2B-261016-1934',
    type: 'B2B',
    status: 'CANCELLED',
    statusLabel: 'Đã hủy',
    supplierId: 'sup-001',
    supplierName: 'Xưởng Thực Phẩm Acecook Việt Nam',
    items: [
      {
        productId: 'prod-acecook-04',
        barcode: '8934563138449',
        name: 'Miến Phú Hương Sườn heo 58g',
        unit: 'gói',
        quantity: 24,
        unitPrice: 8000,
        subtotal: 192000,
      },
    ],
    totalAmount: 192000,
    note: 'Xưởng phản hồi tạm hết hàng miến trong kho xuất',
    createdAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
  },
];

export const purchaseOrderService = {
  // Lấy danh sách xưởng liên kết
  getSuppliers(): Supplier[] {
    return MOCK_SUPPLIERS;
  },

  // Lấy chi tiết xưởng theo ID
  getSupplierById(id: string): Supplier | null {
    return MOCK_SUPPLIERS.find((s) => s.id === id) || null;
  },

  // Lấy lịch sử đơn nhập hàng từ localStorage (hoặc nạp seed orders)
  getOrderHistory(): PurchaseOrderRecord[] {
    const initial = createInitialOrders();
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
