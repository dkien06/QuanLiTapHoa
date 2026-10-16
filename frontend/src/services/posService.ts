import type { Product, SaleOrderDraft, BankConfig, CreateOrderResult } from '../types/pos';

// Cấu hình tài khoản ngân hàng thụ hưởng mặc định của tiệm tạp hóa
export const DEFAULT_BANK_CONFIG: BankConfig = {
  bankId: 'VCB', // Vietcombank
  bankName: 'Vietcombank - TMCP Ngoại Thương VN',
  accountNo: '9893456313816',
  accountName: 'NGUYEN VAN AN - TIEM BINH AN',
};

// Hàm sinh URL ảnh mã VietQR động theo chuẩn mở Napas/VietQR
export const generateVietQRUrl = (
  bank: BankConfig,
  amount: number,
  orderCode: string
): string => {
  const cleanAmount = Math.max(0, Math.round(amount));
  const encodedName = encodeURIComponent(bank.accountName);
  const encodedInfo = encodeURIComponent(orderCode);
  return `https://img.vietqr.io/image/${bank.bankId}-${bank.accountNo}-compact2.png?amount=${cleanAmount}&addInfo=${encodedInfo}&accountName=${encodedName}`;
};

// Danh sách sản phẩm mẫu phong phú đặc trưng cho tiệm tạp hóa Việt Nam
export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'prod-001',
    barcode: '8934563138164',
    name: 'Mì Hảo Hảo Tôm chua cay 75g',
    unit: 'gói',
    price: 4500,
    costPrice: 3800,
    stockQuantity: 120,
    categoryName: 'Mì & Thực phẩm ăn liền',
  },
  {
    id: 'prod-002',
    barcode: '8935049500115',
    name: 'Nước ngọt Coca-Cola Sleek lon 320ml',
    unit: 'lon',
    price: 10000,
    costPrice: 8200,
    stockQuantity: 48,
    categoryName: 'Nước giải khát',
  },
  {
    id: 'prod-003',
    barcode: '8934822212330',
    name: 'Bia Heineken Sleek lon 330ml',
    unit: 'lon',
    price: 22000,
    costPrice: 18500,
    stockQuantity: 24,
    categoryName: 'Bia & Đồ uống có cồn',
  },
  {
    id: 'prod-004',
    barcode: '8934673123456',
    name: 'Sữa tươi tiệt trùng Vinamilk 100% Có đường 180ml',
    unit: 'hộp',
    price: 9000,
    costPrice: 7500,
    stockQuantity: 40,
    categoryName: 'Sữa & Bơ sữa',
  },
  {
    id: 'prod-005',
    barcode: '8934567890123',
    name: 'Dầu ăn Tường An Cooking Oil chai 1L',
    unit: 'chai',
    price: 52000,
    costPrice: 46000,
    stockQuantity: 15,
    categoryName: 'Gia vị & Dầu ăn',
  },
  {
    id: 'prod-006',
    barcode: '8936017360211',
    name: 'Nước mắm Nam Ngư Đệ Nhị chai 900ml',
    unit: 'chai',
    price: 34000,
    costPrice: 29000,
    stockQuantity: 10,
    categoryName: 'Gia vị & Dầu ăn',
  },
  {
    id: 'prod-007',
    barcode: '8936036010012',
    name: 'Bánh Chocopie Orion hộp 12 cái',
    unit: 'hộp',
    price: 58000,
    costPrice: 50000,
    stockQuantity: 20,
    categoryName: 'Bánh kẹo & Ăn vặt',
  },
  {
    id: 'prod-008',
    barcode: '8935001234567',
    name: 'Kẹo cao su Cool Air vỉ bạc hà',
    unit: 'vỉ',
    price: 7000,
    costPrice: 5500,
    stockQuantity: 3, // Dùng để test cảnh báo tồn kho thấp / vượt tồn kho
    categoryName: 'Bánh kẹo & Ăn vặt',
  },
  {
    id: 'prod-009',
    barcode: '8934822119988',
    name: 'Nước xả vải Comfort Đậm Đặc Ban Mai túi 800ml',
    unit: 'túi',
    price: 65000,
    costPrice: 58000,
    stockQuantity: 1, // Dùng để test cảnh báo sắp hết hàng
    categoryName: 'Hóa mỹ phẩm & Tẩy rửa',
  },
  {
    id: 'prod-010',
    barcode: '8934822001122',
    name: 'Xà phòng Lifebuoy Bảo vệ vượt trội 90g',
    unit: 'bánh',
    price: 16000,
    costPrice: 13000,
    stockQuantity: 0, // Dùng để test cảnh báo hết hàng hoàn toàn
    categoryName: 'Hóa mỹ phẩm & Tẩy rửa',
  },
];

// Hàm phát âm thanh beep của máy quét mã vạch POS
export const playScannerBeep = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1760, ctx.currentTime); // Âm bíp cao tần (A6)
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.08);
  } catch {
    // Không ném lỗi nếu trình duyệt chặn autoplay
  }
};

export const posService = {
  // Lấy toàn bộ danh sách sản phẩm mock
  getAllProducts(): Product[] {
    return MOCK_PRODUCTS;
  },

  // Tìm sản phẩm chính xác theo mã barcode
  findProductByBarcode(barcode: string): Product | null {
    const trimmed = barcode.trim().toLowerCase();
    if (!trimmed) return null;
    return (
      MOCK_PRODUCTS.find((p) => p.barcode.toLowerCase() === trimmed) || null
    );
  },

  // Tìm kiếm theo từ khóa (tên hoặc barcode)
  searchProducts(keyword: string): Product[] {
    const query = keyword.trim().toLowerCase();
    if (!query) return [];
    return MOCK_PRODUCTS.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.barcode.toLowerCase().includes(query) ||
        (p.categoryName && p.categoryName.toLowerCase().includes(query))
    );
  },

  // Lưu và xử lý đơn hàng bán lẻ POS
  async createSalesOrder(order: SaleOrderDraft): Promise<CreateOrderResult> {
    await new Promise((resolve) => setTimeout(resolve, 350));

    // Đảm bảo thông tin ngân hàng và link VietQR
    const finalOrder: SaleOrderDraft = {
      ...order,
      bankInfo: order.bankInfo || DEFAULT_BANK_CONFIG,
      qrPayloadUrl:
        order.qrPayloadUrl ||
        (order.paymentMethod === 'TRANSFER' || order.paymentMethod === 'QR'
          ? generateVietQRUrl(
              order.bankInfo || DEFAULT_BANK_CONFIG,
              order.summary.finalTotal,
              order.orderCode
            )
          : undefined),
    };

    // Lưu vào lịch sử đơn hàng trong localStorage
    try {
      const historyStr = localStorage.getItem('pos_sales_history') || '[]';
      const history: SaleOrderDraft[] = JSON.parse(historyStr);
      history.unshift(finalOrder);
      // Giữ tối đa 50 đơn gần nhất
      localStorage.setItem('pos_sales_history', JSON.stringify(history.slice(0, 50)));
    } catch {
      // Bỏ qua lỗi nếu quota vượt mức hoặc môi trường test
    }

    return {
      success: true,
      message: 'Thanh toán đơn hàng thành công!',
      order: finalOrder,
    };
  },

  // Giữ lại để tương thích ngược
  async checkoutOrder(order: SaleOrderDraft): Promise<{ success: boolean; message: string; orderId: string }> {
    const res = await this.createSalesOrder(order);
    return {
      success: res.success,
      message: res.message,
      orderId: res.order.orderCode,
    };
  },

  // Lấy danh sách lịch sử đơn hàng đã bán
  getOrderHistory(): SaleOrderDraft[] {
    try {
      const historyStr = localStorage.getItem('pos_sales_history') || '[]';
      return JSON.parse(historyStr);
    } catch {
      return [];
    }
  },
};
