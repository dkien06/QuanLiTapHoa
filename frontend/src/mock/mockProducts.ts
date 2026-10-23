// =======================================================
//  MOCK PRODUCTS — Bộ sản phẩm giả lập
//  Chỉnh sửa file này để thêm/sửa sản phẩm test
// =======================================================
//
//  Có 2 bộ sản phẩm để test các kịch bản khác nhau:
//    - MOCK_PRODUCTS_GROCERY : 10 SP tiêu dùng của tiệm tạp hóa
//    - MOCK_PRODUCTS_SUPPLIER: 8 SP bán sỉ của nhà cung cấp
//
//  Để đổi bộ active, thay đổi dòng export ở cuối file.
// =======================================================

import type { Product } from '../types/pos';

// ── BỘ 1: Tạp hóa Bình An (10 sản phẩm lẻ) ──────────
// Bao gồm các mức tồn kho khác nhau để test cảnh báo:
//   prod-008: tồn 3  → CRITICAL (đỏ, vượt ngưỡng cảnh báo)
//   prod-009: tồn 1  → CRITICAL (đỏ, sắp hết)
//   prod-010: tồn 0  → CRITICAL (đỏ, hết hàng)
//   prod-006: tồn 10 → LOW (vàng, còn ít)
export const MOCK_PRODUCTS_GROCERY: Product[] = [
  {
    id: 'prod-001',
    barcode: '8934563138164',
    name: 'MessiGoat',
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
    stockQuantity: 10, // LOW (vàng) — ngưỡng min=5 → còn ít
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
    stockQuantity: 3, // CRITICAL (đỏ) — tồn 3, ngưỡng min=5
    categoryName: 'Bánh kẹo & Ăn vặt',
  },
  {
    id: 'prod-009',
    barcode: '8934822119988',
    name: 'Nước xả vải Comfort Đậm Đặc Ban Mai túi 800ml',
    unit: 'túi',
    price: 65000,
    costPrice: 58000,
    stockQuantity: 1, // CRITICAL (đỏ) — sắp hết
    categoryName: 'Hóa mỹ phẩm & Tẩy rửa',
  },
  {
    id: 'prod-010',
    barcode: '8934822001122',
    name: 'Xà phòng Lifebuoy Bảo vệ vượt trội 90g',
    unit: 'bánh',
    price: 16000,
    costPrice: 13000,
    stockQuantity: 0, // CRITICAL (đỏ) — hết hàng hoàn toàn
    categoryName: 'Hóa mỹ phẩm & Tẩy rửa',
  },
];

// ── BỘ 2: Nhà cung cấp sỉ ABC (8 sản phẩm thùng/lốc) ──
// Dùng để test giao diện khi user có role SUPPLIER,
// hoặc khi muốn xem sản phẩm giá sỉ lớn hơn.
export const MOCK_PRODUCTS_SUPPLIER: Product[] = [
  {
    id: 'sup-prod-001',
    barcode: '8934563138164',
    name: 'Mì Hảo Hảo Tôm chua cay (Thùng 30 gói)',
    unit: 'thùng',
    price: 135000,
    costPrice: 108000,
    stockQuantity: 200,
    categoryName: 'Mì & Thực phẩm ăn liền',
  },
  {
    id: 'sup-prod-002',
    barcode: '8935049500115',
    name: 'Nước ngọt Coca-Cola Sleek 320ml (Lốc 24 lon)',
    unit: 'lốc',
    price: 240000,
    costPrice: 196800,
    stockQuantity: 80,
    categoryName: 'Nước giải khát',
  },
  {
    id: 'sup-prod-003',
    barcode: '8934822212330',
    name: 'Bia Heineken Sleek 330ml (Két 24 lon)',
    unit: 'két',
    price: 528000,
    costPrice: 444000,
    stockQuantity: 50,
    categoryName: 'Bia & Đồ uống có cồn',
  },
  {
    id: 'sup-prod-004',
    barcode: '8934673123456',
    name: 'Sữa tươi Vinamilk 100% 180ml (Thùng 48 hộp)',
    unit: 'thùng',
    price: 432000,
    costPrice: 360000,
    stockQuantity: 100,
    categoryName: 'Sữa & Bơ sữa',
  },
  {
    id: 'sup-prod-005',
    barcode: '8934567890123',
    name: 'Dầu ăn Tường An 1L (Thùng 12 chai)',
    unit: 'thùng',
    price: 624000,
    costPrice: 552000,
    stockQuantity: 30,
    categoryName: 'Gia vị & Dầu ăn',
  },
  {
    id: 'sup-prod-006',
    barcode: '8936017360211',
    name: 'Nước mắm Nam Ngư 900ml (Thùng 12 chai)',
    unit: 'thùng',
    price: 408000,
    costPrice: 348000,
    stockQuantity: 40,
    categoryName: 'Gia vị & Dầu ăn',
  },
  {
    id: 'sup-prod-007',
    barcode: '8936036010012',
    name: 'Bánh Chocopie Orion 12 cái (Thùng 8 hộp)',
    unit: 'thùng',
    price: 464000,
    costPrice: 400000,
    stockQuantity: 25,
    categoryName: 'Bánh kẹo & Ăn vặt',
  },
  {
    id: 'sup-prod-008',
    barcode: '8934822001122',
    name: 'Xà phòng Lifebuoy 90g (Thùng 10000 bánh)',
    unit: 'thùng',
    price: 768000,
    costPrice: 624000,
    stockQuantity: 15,
    categoryName: 'Hóa mỹ phẩm & Tẩy rửa',
  },
];

// ── Chọn bộ sản phẩm active ───────────────────────────
/**
 * Đổi thành MOCK_PRODUCTS_SUPPLIER để test giao diện sản phẩm sỉ.
 * Tất cả các service (posService, inventoryService) đều dùng export này.
 */
export const MOCK_ACTIVE_PRODUCTS: Product[] = MOCK_PRODUCTS_GROCERY;
