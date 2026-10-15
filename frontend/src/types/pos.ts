export interface Product {
  id: string;
  barcode: string;
  name: string;
  unit: string; // lon, chai, gói, hộp, cái, kg...
  price: number; // Giá bán (VND)
  costPrice?: number; // Giá vốn nhập
  stockQuantity: number; // Tồn kho thực tế
  categoryName?: string;
  imageUrl?: string;
}

export interface CartItem {
  productId: string;
  barcode: string;
  name: string;
  unit: string;
  price: number;
  quantity: number;
  subtotal: number;
  stockQuantity: number;
}

export type DiscountType = 'FIXED' | 'PERCENT';

export interface CartSummaryData {
  itemCount: number; // Số dòng sản phẩm khác nhau
  totalQuantity: number; // Tổng số lượng sản phẩm (tổng các quantity)
  subtotal: number; // Tổng tiền hàng chưa giảm
  discount: number; // Giá trị giảm (tiền hoặc %)
  discountType: DiscountType;
  discountAmount: number; // Số tiền được giảm thực tế
  finalTotal: number; // Tổng tiền phải thanh toán
  customerPaid: number; // Số tiền khách đưa
  changeAmount: number; // Tiền thối lại cho khách
}

export type PaymentMethod = 'CASH' | 'TRANSFER' | 'QR';

export interface SaleOrderDraft {
  id: string;
  orderCode: string;
  createdAt: string;
  items: CartItem[];
  summary: CartSummaryData;
  paymentMethod: PaymentMethod;
  cashierName: string;
  storeName: string;
  storeAddress: string;
  customerNote?: string;
}
