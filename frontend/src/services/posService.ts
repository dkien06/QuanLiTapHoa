import type { Product, SaleOrderDraft, BankConfig, CreateOrderResult } from '../types/pos';
import { MOCK_BANK_CONFIG } from '../mock/mockConfig';
import { MOCK_ACTIVE_PRODUCTS } from '../mock/mockProducts';

// Re-export từ mockConfig để các module khác vẫn có thể import qua posService
export const DEFAULT_BANK_CONFIG: BankConfig = MOCK_BANK_CONFIG;

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

// Re-export từ mockProducts.ts để các module khác vẫn import được qua posService
export const MOCK_PRODUCTS: Product[] = MOCK_ACTIVE_PRODUCTS;

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

  // Tìm kiếm theo từ khóa (tên hoặc barcode - hỗ trợ cả tiếng Việt không dấu)
  searchProducts(keyword: string): Product[] {
    const query = keyword.trim().toLowerCase();
    if (!query) return [];
    const normalizedQuery = query.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd');
    return MOCK_PRODUCTS.filter((p) => {
      const nameLower = p.name.toLowerCase();
      const nameNorm = nameLower.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd');
      const catNorm = (p.categoryName || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd');
      return (
        nameLower.includes(query) ||
        nameNorm.includes(normalizedQuery) ||
        p.barcode.toLowerCase().includes(query) ||
        catNorm.includes(normalizedQuery)
      );
    });
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
