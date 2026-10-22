import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { User } from '../types/auth';
import type {
  FinancialSummary,
  OperationsSummary,
  TopSellingProduct,
  CategoryDistributionData,
} from '../types/analytics';
import { authService } from '../services/authService';
import { analyticsService } from '../services/analyticsService';
import { Sidebar, type DashboardTab } from '../components/dashboard/Sidebar';
import { Header } from '../components/dashboard/Header';
import { StatsCards } from '../components/dashboard/StatsCards';
import { TopSellingProducts } from '../components/dashboard/TopSellingProducts';
import { CategoryDistribution } from '../components/dashboard/CategoryDistribution';
import { QuickActions } from '../components/dashboard/QuickActions';
import { PosPlaceholder } from '../components/dashboard/PosPlaceholder';
import { InventoryPage } from './InventoryPage';

interface DashboardPageProps {
  user?: User;
  onLogout?: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  user: initialUser,
  onLogout: initialOnLogout,
}) => {
  const navigate = useNavigate();
  const [currentUser] = useState<User>(() => {
    return (
      initialUser ||
      authService.getStoredUser() || {
        id: '8d45950f-a79c-4891-a413-b8e80515c624',
        username: 'tiem_binh_an',
        fullName: 'Nguyễn Văn An',
        phone: '0901234567',
        role: 'OWNER',
        storeId: 'df935abc-4021-4c20-bad4-3241e85ca2b2',
        storeType: 'GROCERY',
        storeName: 'Tạp hóa Bình An',
        storeAddress: '123 Nguyễn Trãi',
      }
    );
  });

  const [activeMenu, setActiveMenu] = useState<DashboardTab>('OVERVIEW');
  const [timeRange, setTimeRange] = useState<'TODAY' | 'WEEK' | 'MONTH'>('MONTH');

  // State lưu trữ dữ liệu thống kê từ Backend
  const [financial, setFinancial] = useState<FinancialSummary | null>(null);
  const [operations, setOperations] = useState<OperationsSummary | null>(null);
  const [topProducts, setTopProducts] = useState<TopSellingProduct[]>([]);
  const [categoryDist, setCategoryDist] = useState<CategoryDistributionData | null>(null);
  const [loadingMetrics, setLoadingMetrics] = useState<boolean>(true);
  const [metricsError, setMetricsError] = useState<string | null>(null);

  const fetchDashboardMetrics = useCallback(async () => {
    setLoadingMetrics(true);
    setMetricsError(null);
    try {
      const [financialData, operationsData, topProductsData, categoryDistData] =
        await Promise.all([
          analyticsService.getFinancialSummary(timeRange),
          analyticsService.getOperationsSummary(timeRange),
          analyticsService.getTopSellingProducts(timeRange, 5),
          analyticsService.getCategoryDistribution(timeRange),
        ]);
      setFinancial(financialData);
      setOperations(operationsData);
      setTopProducts(topProductsData);
      setCategoryDist(categoryDistData);
    } catch (err: any) {
      console.error('Lỗi khi tải dữ liệu thống kê:', err);
      setMetricsError(
        err?.response?.data?.detail || err?.message || 'Không thể kết nối đến máy chủ thống kê'
      );
    } finally {
      setLoadingMetrics(false);
    }
  }, [timeRange]);

  useEffect(() => {
    fetchDashboardMetrics();
  }, [fetchDashboardMetrics]);

  const handleLogout = () => {
    if (initialOnLogout) {
      initialOnLogout();
    } else {
      authService.logout();
      navigate('/login', { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row text-slate-800">
      {/* Sidebar Navigation */}
      <Sidebar
        user={currentUser}
        activeMenu={activeMenu}
        onSelectMenu={setActiveMenu}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <Header activeMenu={activeMenu} />

        {/* Body Views */}
        <main className="flex-1 p-6 overflow-y-auto space-y-6">
          {activeMenu === 'OVERVIEW' ? (
            <>
              {/* Filter / Range Row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Hiệu Suất Kinh Doanh & Phân Tích Mặt Hàng</h3>
                  <p className="text-xs text-slate-500">Thống kê dữ liệu bán buôn và bán lẻ theo thời gian thực</p>
                </div>
                <div className="flex items-center bg-slate-200/80 p-1 rounded-xl text-xs font-semibold self-start sm:self-auto">
                  <button
                    onClick={() => setTimeRange('TODAY')}
                    className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                      timeRange === 'TODAY' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Hôm nay
                  </button>
                  <button
                    onClick={() => setTimeRange('WEEK')}
                    className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                      timeRange === 'WEEK' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Tuần này
                  </button>
                  <button
                    onClick={() => setTimeRange('MONTH')}
                    className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                      timeRange === 'MONTH' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Tháng này
                  </button>
                </div>
              </div>

              {/* Error Alert if fetching metrics failed */}
              {metricsError && (
                <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-xl flex items-center justify-between">
                  <span>⚠️ {metricsError}</span>
                  <button
                    onClick={fetchDashboardMetrics}
                    className="font-bold underline hover:text-amber-950 cursor-pointer"
                  >
                    Thử lại
                  </button>
                </div>
              )}

              {/* KPI Summary Cards */}
              <StatsCards
                financial={financial}
                operations={operations}
                loading={loadingMetrics}
              />

              {/* Main Content Grid: Top Selling Products & Category Diversity */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <TopSellingProducts products={topProducts} loading={loadingMetrics} />
                </div>
                <div>
                  <CategoryDistribution data={categoryDist} loading={loadingMetrics} />
                </div>
              </div>

              {/* Quick Actions Row */}
              <QuickActions onNavigate={setActiveMenu} />
            </>
          ) : activeMenu === 'POS' ? (
            <PosPlaceholder onBackToOverview={() => setActiveMenu('OVERVIEW')} />
          ) : (
            <InventoryPage embeddedInDashboard />
          )}
        </main>
      </div>
    </div>
  );
};
