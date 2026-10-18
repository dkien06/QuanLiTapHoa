export type PurchaseOrderType = 'B2B' | 'MANUAL';

export type PurchaseOrderStatus =
  | 'PENDING'    // Chờ xác nhận (B2B đặt xưởng)
  | 'CONFIRMED'  // Xưởng đã duyệt
  | 'SHIPPING'   // Đang vận chuyển
  | 'RECEIVED'   // Hoàn thành / Đã nhận hàng (Nhập thủ công hoặc B2B đã giao)
  | 'CANCELLED'; // Đã hủy

export interface SupplierProduct {
  productId: string;
  barcode: string;
  name: string;
  unit: string;
  wholesalePrice: number; // Giá sỉ niêm yết của xưởng (VND)
  suggestedRetailPrice?: number; // Giá bán lẻ đề xuất
  minOrderQuantity: number; // Số lượng đặt tối thiểu (vd: 10, 24, 30)
  categoryName: string;
}

export interface Supplier {
  id: string;
  name: string;
  code: string;
  phone: string;
  address: string;
  catalog: SupplierProduct[];
}

export interface B2BOrderItem {
  productId: string;
  barcode: string;
  name: string;
  unit: string;
  wholesalePrice: number;
  quantity: number;
  subtotal: number;
}

export interface ManualImportPayload {
  supplierName: string; // Tên nhà cung cấp ngoài (chợ đầu mối, đại lý tư nhân...)
  productName: string;
  barcode: string;
  unit: string;
  quantity: number;
  costPrice: number; // Đơn giá nhập hàng (VND)
  suggestedSellingPrice: number; // Giá bán lẻ đề xuất niêm yết (VND)
  note?: string;
}

export interface PurchaseOrderRecord {
  id: string;
  orderCode: string; // Mã đơn format: PO-B2B-YYMMDD-XXXX hoặc PO-MANUAL-YYMMDD-XXXX
  type: PurchaseOrderType;
  status: PurchaseOrderStatus;
  statusLabel: string;
  supplierId?: string;
  supplierName: string;
  items: Array<{
    productId?: string;
    barcode: string;
    name: string;
    unit: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
  }>;
  totalAmount: number;
  note?: string;
  createdAt: string;
  receivedAt?: string;
}
