from datetime import datetime
from typing import Optional, List
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.repository.analytics import AnalyticsRepository
from app.services.analytics import AnalyticsService
from app.schemas.analytics import (
    FinancialSummaryResponse,
    OperationsSummaryResponse,
    TopSellingProductItem,
    CategoryDistributionResponse,
)

router = APIRouter(prefix="/analytics", tags=["Analytics & Dashboard"])


async def get_analytics_service(db: AsyncSession = Depends(get_db)) -> AnalyticsService:
    """Dependency khởi tạo AnalyticsService từ DB Session"""
    analytics_repo = AnalyticsRepository(db)
    return AnalyticsService(analytics_repo=analytics_repo)


# =====================================================================
# API 1: Tổng Doanh thu - Tổng Vốn - Tổng Lợi nhuận
# =====================================================================
@router.get(
    "/financial-summary",
    response_model=FinancialSummaryResponse,
    status_code=status.HTTP_200_OK,
    summary="Lấy tổng doanh thu, tổng vốn và tổng lợi nhuận",
)
async def get_financial_summary(
    time_range: Optional[str] = Query(
        None,
        description="Khoảng thời gian thống kê: 'today' | 'week' | 'month' | 'all'",
        examples=["today", "week", "month", "all"],
    ),
    start_date: Optional[datetime] = Query(
        None,
        description="Thời điểm bắt đầu (ISO 8601), ví dụ: 2026-10-01T00:00:00Z",
    ),
    end_date: Optional[datetime] = Query(
        None,
        description="Thời điểm kết thúc (ISO 8601), ví dụ: 2026-10-31T23:59:59Z",
    ),
    current_user: User = Depends(get_current_user),
    service: AnalyticsService = Depends(get_analytics_service),
):
    """
    **API 1: Thống kê Tài chính (Financial Summary)**
    - **Tổng doanh thu** (`total_revenue`): Tổng tiền thu về từ các đơn bán hàng (`sales_orders`).
    - **Tổng vốn** (`total_cost`): Tổng chi phí giá vốn của các mặt hàng đã bán ra (`sales_order_items.quantity * unit_cost`).
    - **Tổng lợi nhuận** (`total_profit`): Doanh thu - Vốn.
    - **Tỷ suất lợi nhuận** (`profit_margin`): Tính theo tỷ lệ phần trăm (%).
    """
    return await service.get_financial_summary(
        store_id=current_user.store_id,
        time_range=time_range,
        start_date=start_date,
        end_date=end_date,
    )


# =====================================================================
# API 2: Tổng SP khác nhau đã bán - Tổng đơn đã bán - Tổng tồn kho - Low stock
# =====================================================================
@router.get(
    "/operations-summary",
    response_model=OperationsSummaryResponse,
    status_code=status.HTTP_200_OK,
    summary="Lấy tổng số SP khác nhau đã bán, tổng đơn, tổng tồn kho và cảnh báo tồn kho thấp",
)
async def get_operations_summary(
    time_range: Optional[str] = Query(
        None,
        description="Khoảng thời gian thống kê: 'today' | 'week' | 'month' | 'all'",
        examples=["today", "week", "month", "all"],
    ),
    start_date: Optional[datetime] = Query(
        None,
        description="Thời điểm bắt đầu (ISO 8601)",
    ),
    end_date: Optional[datetime] = Query(
        None,
        description="Thời điểm kết thúc (ISO 8601)",
    ),
    include_low_stock_items: bool = Query(
        True,
        description="Có trả về danh sách chi tiết các mặt hàng sắp hết hàng hay không",
    ),
    low_stock_limit: int = Query(
        10,
        ge=1,
        le=100,
        description="Số lượng tối đa mặt hàng low stock trả về trong danh sách",
    ),
    current_user: User = Depends(get_current_user),
    service: AnalyticsService = Depends(get_analytics_service),
):
    """
    **API 2: Thống kê Hoạt động & Kho hàng (Operations & Inventory Summary)**
    - **Tổng số SP khác nhau đã bán** (`total_distinct_products_sold`): Số mặt hàng phân biệt đã xuất kho bán.
    - **Tổng đơn đã bán** (`total_orders_sold`): Tổng số hóa đơn bán hàng hoàn tất.
    - **Tổng tồn kho** (`total_stock_quantity`): Tổng số lượng sản phẩm đang còn lưu kho của cửa hàng.
    - **Cảnh báo tồn kho thấp** (`low_stock_count`): Số lượng sản phẩm có số tồn <= ngưỡng cảnh báo (`low_stock_threshold`).
    - **Danh sách chi tiết mặt hàng sắp hết hàng** (`low_stock_items`): Danh sách tên, mã vạch, số lượng còn lại và ngưỡng cảnh báo.
    """
    return await service.get_operations_summary(
        store_id=current_user.store_id,
        time_range=time_range,
        start_date=start_date,
        end_date=end_date,
        include_low_stock_items=include_low_stock_items,
        low_stock_limit=low_stock_limit,
    )


# =====================================================================
# API 3: Sản phẩm mua nhiều nhất (Top Selling Products)
# =====================================================================
@router.get(
    "/top-selling-products",
    response_model=List[TopSellingProductItem],
    status_code=status.HTTP_200_OK,
    summary="Lấy danh sách các sản phẩm bán chạy nhất trong kỳ",
)
async def get_top_selling_products(
    time_range: Optional[str] = Query(
        None,
        description="Khoảng thời gian: 'today' | 'week' | 'month' | 'all'",
        examples=["today", "week", "month", "all"],
    ),
    start_date: Optional[datetime] = Query(
        None,
        description="Thời điểm bắt đầu (ISO 8601)",
    ),
    end_date: Optional[datetime] = Query(
        None,
        description="Thời điểm kết thúc (ISO 8601)",
    ),
    limit: int = Query(
        5,
        ge=1,
        le=50,
        description="Số lượng sản phẩm lấy về (mặc định 5)",
    ),
    current_user: User = Depends(get_current_user),
    service: AnalyticsService = Depends(get_analytics_service),
):
    """
    **API 3: Sản phẩm mua nhiều nhất (Top Selling Products)**
    - Xếp hạng theo số lượng bán ra (`sold_count DESC`).
    - Trả về tên, ngành hàng, số lượng đã bán, doanh thu, tồn kho thực tế, đơn vị và tỷ trọng xu hướng.
    """
    return await service.get_top_selling_products(
        store_id=current_user.store_id,
        time_range=time_range,
        start_date=start_date,
        end_date=end_date,
        limit=limit,
    )


# =====================================================================
# API 4: Phân bổ mặt hàng đã bán theo danh mục (Category Distribution)
# =====================================================================
@router.get(
    "/category-distribution",
    response_model=CategoryDistributionResponse,
    status_code=status.HTTP_200_OK,
    summary="Lấy phân bổ mặt hàng đã bán theo từng ngành hàng",
)
async def get_category_distribution(
    time_range: Optional[str] = Query(
        None,
        description="Khoảng thời gian: 'today' | 'week' | 'month' | 'all'",
        examples=["today", "week", "month", "all"],
    ),
    start_date: Optional[datetime] = Query(
        None,
        description="Thời điểm bắt đầu (ISO 8601)",
    ),
    end_date: Optional[datetime] = Query(
        None,
        description="Thời điểm kết thúc (ISO 8601)",
    ),
    current_user: User = Depends(get_current_user),
    service: AnalyticsService = Depends(get_analytics_service),
):
    """
    **API 4: Phân bổ mặt hàng đã bán theo ngành hàng (Category Distribution)**
    - Đếm số mặt hàng phân biệt của từng ngành hàng đã phát sinh bán.
    - Tính tỷ lệ phần trăm (`%`) đóng góp và gán màu sắc trực quan.
    - Sinh gợi ý kinh doanh thông minh tự động (Business Insight).
    """
    return await service.get_category_distribution(
        store_id=current_user.store_id,
        time_range=time_range,
        start_date=start_date,
        end_date=end_date,
    )
