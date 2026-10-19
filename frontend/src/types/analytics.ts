export interface LowStockItem {
  product_id: string;
  product_name: string;
  barcode?: string | null;
  quantity: number;
  low_stock_threshold: number;
}

export interface FinancialSummary {
  total_revenue: string | number;
  total_cost: string | number;
  total_profit: string | number;
  profit_margin: number;
}

export interface OperationsSummary {
  total_distinct_products_sold: number;
  total_orders_sold: number;
  total_stock_quantity: number;
  low_stock_count: number;
  low_stock_items: LowStockItem[];
}

export interface TopSellingProduct {
  id: string;
  name: string;
  category: string;
  sold_count: number;
  revenue: string | number;
  stock: number;
  unit: string;
  trend: string;
}

export interface CategoryDistributionItem {
  name: string;
  distinct_count: number;
  percent: number;
  color: string;
}

export interface CategoryDistributionData {
  total_products: number;
  categories: CategoryDistributionItem[];
  business_insight: string;
}

export type TimeRangeFilter = 'TODAY' | 'WEEK' | 'MONTH' | 'ALL';
