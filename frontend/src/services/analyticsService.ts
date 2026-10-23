import api from './api';
import { MOCK_MODE, MOCK_DELAY_MS } from '../mock/mockConfig';
import { MOCK_FINANCIAL_SUMMARY, MOCK_OPERATIONS_SUMMARY, MOCK_TOP_SELLING, MOCK_CATEGORY_DISTRIBUTION } from '../mock/mockAnalytics';
import type {
  FinancialSummary,
  OperationsSummary,
  TopSellingProduct,
  CategoryDistributionData,
  TimeRangeFilter,
} from '../types/analytics';

export const analyticsService = {
  /**
   * Lấy thống kê tài chính: Tổng Doanh thu, Tổng Vốn, Tổng Lợi nhuận
   */
  async getFinancialSummary(
    timeRange?: TimeRangeFilter | string,
    startDate?: string,
    endDate?: string
  ): Promise<FinancialSummary> {
    if (MOCK_MODE) {
      await new Promise((r) => setTimeout(r, MOCK_DELAY_MS));
      return MOCK_FINANCIAL_SUMMARY;
    }
    const params: Record<string, string> = {};
    if (timeRange) {
      params.time_range = timeRange.toLowerCase();
    }
    if (startDate) {
      params.start_date = startDate;
    }
    if (endDate) {
      params.end_date = endDate;
    }

    const response = await api.get<FinancialSummary>('/analytics/financial-summary', { params });
    return response.data;
  },

  /**
   * Lấy thống kê hoạt động & kho hàng: SP khác nhau đã bán, Tổng đơn, Tổng tồn kho, Low stock
   */
  async getOperationsSummary(
    timeRange?: TimeRangeFilter | string,
    startDate?: string,
    endDate?: string,
    includeLowStockItems = true,
    lowStockLimit = 10
  ): Promise<OperationsSummary> {
    if (MOCK_MODE) {
      await new Promise((r) => setTimeout(r, MOCK_DELAY_MS));
      return MOCK_OPERATIONS_SUMMARY;
    }
    const params: Record<string, any> = {
      include_low_stock_items: includeLowStockItems,
      low_stock_limit: lowStockLimit,
    };
    if (timeRange) {
      params.time_range = timeRange.toLowerCase();
    }
    if (startDate) {
      params.start_date = startDate;
    }
    if (endDate) {
      params.end_date = endDate;
    }

    const response = await api.get<OperationsSummary>('/analytics/operations-summary', { params });
    return response.data;
  },

  /**
   * Lấy danh sách sản phẩm mua nhiều nhất (Top Selling Products)
   */
  async getTopSellingProducts(
    timeRange?: TimeRangeFilter | string,
    limit = 5,
    startDate?: string,
    endDate?: string
  ): Promise<TopSellingProduct[]> {
    if (MOCK_MODE) {
      await new Promise((r) => setTimeout(r, MOCK_DELAY_MS));
      return MOCK_TOP_SELLING.slice(0, limit);
    }
    const params: Record<string, any> = { limit };
    if (timeRange) {
      params.time_range = timeRange.toLowerCase();
    }
    if (startDate) {
      params.start_date = startDate;
    }
    if (endDate) {
      params.end_date = endDate;
    }

    const response = await api.get<TopSellingProduct[]>('/analytics/top-selling-products', { params });
    return response.data;
  },

  /**
   * Lấy phân bổ mặt hàng đã bán theo danh mục (Category Distribution)
   */
  async getCategoryDistribution(
    timeRange?: TimeRangeFilter | string,
    startDate?: string,
    endDate?: string
  ): Promise<CategoryDistributionData> {
    if (MOCK_MODE) {
      await new Promise((r) => setTimeout(r, MOCK_DELAY_MS));
      return MOCK_CATEGORY_DISTRIBUTION;
    }
    const params: Record<string, string> = {};
    if (timeRange) {
      params.time_range = timeRange.toLowerCase();
    }
    if (startDate) {
      params.start_date = startDate;
    }
    if (endDate) {
      params.end_date = endDate;
    }

    const response = await api.get<CategoryDistributionData>('/analytics/category-distribution', { params });
    return response.data;
  },
};
