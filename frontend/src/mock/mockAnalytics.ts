import type { FinancialSummary, OperationsSummary, TopSellingProduct, CategoryDistributionData } from '../types/analytics';

// Dashboard analytics fixtures (chỉ dùng khi MOCK_MODE = true)

export const MOCK_FINANCIAL_SUMMARY: FinancialSummary = {
  total_revenue: 15_480_000,
  total_cost: 11_850_000,
  total_profit: 3_630_000,
  profit_margin: 23.4,
};

export const MOCK_OPERATIONS_SUMMARY: OperationsSummary = {
  total_orders_sold: 87,
  total_distinct_products_sold: 24,
  total_stock_quantity: 48_250_000,
  low_stock_count: 3,
  low_stock_items: [
    { product_id: 'prod-008', product_name: 'Kẹo cao su Cool Air vỉ bạc hà', quantity: 3, low_stock_threshold: 5 },
    { product_id: 'prod-009', product_name: 'Nước xả Comfort túi 800ml', quantity: 1, low_stock_threshold: 5 },
    { product_id: 'prod-010', product_name: 'Xà phòng Lifebuoy 90g', quantity: 0, low_stock_threshold: 10 },
  ],
};

export const MOCK_TOP_SELLING: TopSellingProduct[] = [
  { id: 'prod-001', name: 'Mì Hảo Hảo Tôm chua cay 75g', category: 'Mì & Thực phẩm ăn liền', sold_count: 320, revenue: 1_440_000, stock: 120, unit: 'gói', trend: 'up' },
  { id: 'prod-002', name: 'Nước ngọt Coca-Cola Sleek lon 320ml', category: 'Nước giải khát', sold_count: 180, revenue: 1_800_000, stock: 48, unit: 'lon', trend: 'up' },
  { id: 'prod-003', name: 'Bia Heineken Sleek lon 330ml', category: 'Bia & Đồ uống có cồn', sold_count: 96, revenue: 2_112_000, stock: 24, unit: 'lon', trend: 'stable' },
  { id: 'prod-004', name: 'Sữa tươi Vinamilk 180ml', category: 'Sữa & Bơ sữa', sold_count: 144, revenue: 1_296_000, stock: 40, unit: 'hộp', trend: 'up' },
  { id: 'prod-007', name: 'Bánh Chocopie Orion hộp 12 cái', category: 'Bánh kẹo & Ăn vặt', sold_count: 60, revenue: 3_480_000, stock: 20, unit: 'hộp', trend: 'down' },
];

export const MOCK_CATEGORY_DISTRIBUTION: CategoryDistributionData = {
  total_products: 10,
  business_insight: 'Bánh kẹo & Ăn vặt chiếm tỷ trọng cao nhất với 33.8% doanh số.',
  categories: [
    { name: 'Mì & Thực phẩm ăn liền', distinct_count: 1, percent: 9.3, color: '#f97316' },
    { name: 'Nước giải khát', distinct_count: 1, percent: 11.6, color: '#3b82f6' },
    { name: 'Bia & Đồ uống có cồn', distinct_count: 1, percent: 13.6, color: '#eab308' },
    { name: 'Sữa & Bơ sữa', distinct_count: 1, percent: 8.4, color: '#06b6d4' },
    { name: 'Gia vị & Dầu ăn', distinct_count: 2, percent: 15.8, color: '#84cc16' },
    { name: 'Bánh kẹo & Ăn vặt', distinct_count: 2, percent: 33.8, color: '#ec4899' },
    { name: 'Hóa mỹ phẩm & Tẩy rửa', distinct_count: 2, percent: 7.5, color: '#8b5cf6' },
  ],
};
