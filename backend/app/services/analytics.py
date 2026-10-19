import re
from datetime import datetime, time, timedelta, timezone
from decimal import Decimal
from typing import Optional, List
from uuid import UUID

from app.repository.analytics import AnalyticsRepository
from app.schemas.analytics import (
    FinancialSummaryResponse,
    OperationsSummaryResponse,
    LowStockItem,
    TopSellingProductItem,
    CategoryDistributionItem,
    CategoryDistributionResponse,
)


def _detect_unit(product_name: str) -> str:
    """Tự động suy luận đơn vị tính từ tên sản phẩm hoặc quy cách"""
    name_lower = product_name.lower()
    if "thùng" in name_lower:
        return "Thùng"
    elif "lốc" in name_lower:
        return "Lốc"
    elif "vỉ" in name_lower:
        return "Vỉ"
    elif "chai" in name_lower:
        return "Chai"
    elif "túi" in name_lower:
        return "Túi"
    elif "hộp" in name_lower:
        return "Hộp"
    elif "lon" in name_lower:
        return "Lon"
    elif "gói" in name_lower:
        return "Gói"
    elif "kg" in name_lower:
        return "Kg"
    elif "bịch" in name_lower:
        return "Bịch"
    return "Món"


class AnalyticsService:
    def __init__(self, analytics_repo: AnalyticsRepository):
        self.analytics_repo = analytics_repo

    def _resolve_time_range(
        self,
        time_range: Optional[str] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
    ) -> tuple[Optional[datetime], Optional[datetime]]:
        """
        Chuẩn hóa khoảng thời gian lọc:
        - Nếu người dùng cung cấp start_date và/hoặc end_date thì ưu tiên sử dụng.
        - Nếu người dùng truyền time_range ('today', 'week', 'month', 'all'):
          + 'today': từ 00:00:00 đến 23:59:59 của ngày hiện tại
          + 'week': từ thứ Hai đầu tuần đến cuối tuần
          + 'month': từ ngày mùng 1 đầu tháng đến hết tháng
          + 'all' hoặc None: không giới hạn thời gian
        """
        if start_date or end_date:
            return start_date, end_date

        if not time_range or time_range.lower() == "all":
            return None, None

        now = datetime.now(timezone.utc)
        range_lower = time_range.lower()

        if range_lower == "today":
            start = datetime.combine(now.date(), time.min, tzinfo=timezone.utc)
            end = datetime.combine(now.date(), time.max, tzinfo=timezone.utc)
            return start, end

        elif range_lower == "week":
            start_of_week = now.date() - timedelta(days=now.weekday())
            end_of_week = start_of_week + timedelta(days=6)
            start = datetime.combine(start_of_week, time.min, tzinfo=timezone.utc)
            end = datetime.combine(end_of_week, time.max, tzinfo=timezone.utc)
            return start, end

        elif range_lower == "month":
            start_of_month = now.date().replace(day=1)
            next_month = (start_of_month.replace(day=28) + timedelta(days=4)).replace(day=1)
            end_of_month = next_month - timedelta(days=1)
            start = datetime.combine(start_of_month, time.min, tzinfo=timezone.utc)
            end = datetime.combine(end_of_month, time.max, tzinfo=timezone.utc)
            return start, end

        return None, None

    # ---------------------------------------------------------
    # Nghiệp vụ API 1: Doanh thu - Vốn - Lợi nhuận
    # ---------------------------------------------------------

    async def get_financial_summary(
        self,
        store_id: UUID,
        time_range: Optional[str] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
    ) -> FinancialSummaryResponse:
        resolved_start, resolved_end = self._resolve_time_range(
            time_range=time_range,
            start_date=start_date,
            end_date=end_date,
        )

        data = await self.analytics_repo.get_financial_summary(
            store_id=store_id,
            start_date=resolved_start,
            end_date=resolved_end,
        )

        total_revenue = data.get("total_revenue", Decimal("0.00"))
        total_cost = data.get("total_cost", Decimal("0.00"))
        total_profit = total_revenue - total_cost

        profit_margin = 0.0
        if total_revenue > 0:
            profit_margin = round(float((total_profit / total_revenue) * 100), 2)

        return FinancialSummaryResponse(
            total_revenue=total_revenue,
            total_cost=total_cost,
            total_profit=total_profit,
            profit_margin=profit_margin,
        )

    # ---------------------------------------------------------
    # Nghiệp vụ API 2: Số SP khác nhau đã bán, Tổng đơn, Tổng tồn kho, Low stock
    # ---------------------------------------------------------

    async def get_operations_summary(
        self,
        store_id: UUID,
        time_range: Optional[str] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        include_low_stock_items: bool = True,
        low_stock_limit: int = 10,
    ) -> OperationsSummaryResponse:
        resolved_start, resolved_end = self._resolve_time_range(
            time_range=time_range,
            start_date=start_date,
            end_date=end_date,
        )

        distinct_products = await self.analytics_repo.get_total_distinct_products_sold(
            store_id=store_id,
            start_date=resolved_start,
            end_date=resolved_end,
        )

        total_orders = await self.analytics_repo.get_total_orders_sold(
            store_id=store_id,
            start_date=resolved_start,
            end_date=resolved_end,
        )

        total_stock = await self.analytics_repo.get_total_stock_quantity(store_id=store_id)
        low_stock_count = await self.analytics_repo.get_low_stock_count(store_id=store_id)

        low_stock_items = []
        if include_low_stock_items and low_stock_count > 0:
            raw_items = await self.analytics_repo.get_low_stock_items(
                store_id=store_id,
                limit=low_stock_limit,
            )
            low_stock_items = [LowStockItem(**item) for item in raw_items]

        return OperationsSummaryResponse(
            total_distinct_products_sold=distinct_products,
            total_orders_sold=total_orders,
            total_stock_quantity=total_stock,
            low_stock_count=low_stock_count,
            low_stock_items=low_stock_items,
        )

    # ---------------------------------------------------------
    # Nghiệp vụ API 3: Sản phẩm mua nhiều nhất (Top Selling Products)
    # ---------------------------------------------------------

    async def get_top_selling_products(
        self,
        store_id: UUID,
        time_range: Optional[str] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        limit: int = 5,
    ) -> List[TopSellingProductItem]:
        resolved_start, resolved_end = self._resolve_time_range(
            time_range=time_range,
            start_date=start_date,
            end_date=end_date,
        )

        raw_products = await self.analytics_repo.get_top_selling_products(
            store_id=store_id,
            start_date=resolved_start,
            end_date=resolved_end,
            limit=limit,
        )

        if not raw_products:
            return []

        total_top_revenue = sum(p["revenue"] for p in raw_products)

        items: List[TopSellingProductItem] = []
        for p in raw_products:
            # Tỷ trọng đóng góp doanh thu của sản phẩm trong top bán chạy
            if total_top_revenue > 0:
                pct = round(float((p["revenue"] / total_top_revenue) * 100), 1)
                trend_str = f"+{pct}%"
            else:
                trend_str = "+0.0%"

            items.append(
                TopSellingProductItem(
                    id=p["id"],
                    name=p["name"],
                    category=p["category"],
                    sold_count=p["sold_count"],
                    revenue=p["revenue"],
                    stock=p["stock"],
                    unit=_detect_unit(p["name"]),
                    trend=trend_str,
                )
            )

        return items

    # ---------------------------------------------------------
    # Nghiệp vụ API 4: Phân bổ mặt hàng đã bán theo danh mục
    # ---------------------------------------------------------

    async def get_category_distribution(
        self,
        store_id: UUID,
        time_range: Optional[str] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
    ) -> CategoryDistributionResponse:
        resolved_start, resolved_end = self._resolve_time_range(
            time_range=time_range,
            start_date=start_date,
            end_date=end_date,
        )

        raw_categories = await self.analytics_repo.get_category_distribution(
            store_id=store_id,
            start_date=resolved_start,
            end_date=resolved_end,
        )

        if not raw_categories:
            return CategoryDistributionResponse(
                total_products=0,
                categories=[],
                business_insight="Chưa có dữ liệu bán hàng trong kỳ này. Dữ liệu sẽ tự động xuất hiện khi có đơn bán lẻ đầu tiên.",
            )

        total_distinct = sum(c["distinct_count"] for c in raw_categories)
        total_revenue = sum(c["revenue"] for c in raw_categories)

        # Bảng màu đại diện Tailwind CSS
        palette = [
            "bg-blue-500",
            "bg-emerald-500",
            "bg-amber-500",
            "bg-purple-500",
            "bg-rose-500",
            "bg-indigo-500",
            "bg-teal-500",
            "bg-cyan-500",
        ]

        category_items: List[CategoryDistributionItem] = []
        for idx, cat in enumerate(raw_categories):
            percent = (
                round((cat["distinct_count"] / total_distinct) * 100, 1)
                if total_distinct > 0
                else 0.0
            )
            color = palette[idx % len(palette)]
            category_items.append(
                CategoryDistributionItem(
                    name=cat["name"],
                    distinct_count=cat["distinct_count"],
                    percent=percent,
                    color=color,
                )
            )

        # Xây dựng gợi ý kinh doanh thông minh tự động (Business Insight)
        if len(category_items) >= 2 and total_revenue > 0:
            top2_revenue = raw_categories[0]["revenue"] + raw_categories[1]["revenue"]
            lead_pct = round(float((top2_revenue / total_revenue) * 100))
            insight = (
                f"Các mặt hàng {category_items[0].name} & {category_items[1].name} chiếm {lead_pct}% "
                f"doanh số bán lẻ. Nên nhập thêm tồn kho an toàn trước cuối tuần."
            )
        elif len(category_items) == 1:
            insight = (
                f"Hiện tại 100% doanh số tập trung vào ngành {category_items[0].name}. "
                f"Bạn nên cân nhắc mở rộng thêm các mặt hàng đồ uống hoặc ăn vặt để đa dạng hóa nguồn thu."
            )
        else:
            insight = "Dữ liệu ngành hàng đang được tổng hợp và phân tích theo thời gian thực."

        return CategoryDistributionResponse(
            total_products=total_distinct,
            categories=category_items,
            business_insight=insight,
        )
