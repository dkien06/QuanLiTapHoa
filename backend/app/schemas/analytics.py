from datetime import datetime
from decimal import Decimal
from typing import Optional, List
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


# -------------------------------------------------------------
# Schemas cho API 1: Doanh thu - Vốn - Lợi nhuận (Financial Summary)
# -------------------------------------------------------------

class FinancialSummaryResponse(BaseModel):
    """
    Kết quả thống kê tài chính:
    - total_revenue: Tổng doanh thu
    - total_cost: Tổng giá vốn hàng bán
    - total_profit: Tổng lợi nhuận (Doanh thu - Vốn)
    - profit_margin: Tỷ suất lợi nhuận (%)
    """
    total_revenue: Decimal = Field(
        default=Decimal("0.00"),
        description="Tổng doanh thu từ các đơn bán hàng"
    )
    total_cost: Decimal = Field(
        default=Decimal("0.00"),
        description="Tổng giá vốn của các sản phẩm đã bán"
    )
    total_profit: Decimal = Field(
        default=Decimal("0.00"),
        description="Tổng lợi nhuận thực tế (Doanh thu - Vốn)"
    )
    profit_margin: float = Field(
        default=0.0,
        description="Tỷ suất lợi nhuận tính theo %: (Lợi nhuận / Doanh thu) * 100"
    )

    model_config = ConfigDict(from_attributes=True)


# -------------------------------------------------------------
# Schemas cho API 2: Sản phẩm bán - Đơn hàng - Tồn kho - Low Stock
# -------------------------------------------------------------

class LowStockItem(BaseModel):
    """Thông tin chi tiết một mặt hàng sắp hết hàng (tồn kho <= ngưỡng cảnh báo)"""
    product_id: UUID = Field(..., description="ID của sản phẩm")
    product_name: str = Field(..., description="Tên sản phẩm (custom name hoặc original name)")
    barcode: Optional[str] = Field(None, description="Mã vạch của sản phẩm")
    quantity: int = Field(..., description="Số lượng tồn kho hiện tại")
    low_stock_threshold: int = Field(..., description="Ngưỡng cảnh báo tồn kho tối thiểu")

    model_config = ConfigDict(from_attributes=True)


class OperationsSummaryResponse(BaseModel):
    """
    Kết quả thống kê hoạt động bán hàng & quản lý kho:
    - total_distinct_products_sold: Tổng số sản phẩm khác nhau đã bán
    - total_orders_sold: Tổng số đơn bán hàng đã tạo
    - total_stock_quantity: Tổng số lượng sản phẩm tồn kho hiện tại
    - low_stock_count: Số lượng mặt hàng đang chạm ngưỡng cảnh báo hết hàng
    - low_stock_items: Danh sách chi tiết các mặt hàng sắp hết hàng (tùy chọn)
    """
    total_distinct_products_sold: int = Field(
        default=0,
        description="Tổng số sản phẩm khác nhau (mặt hàng phân biệt) đã bán"
    )
    total_orders_sold: int = Field(
        default=0,
        description="Tổng số đơn bán hàng đã hoàn tất"
    )
    total_stock_quantity: int = Field(
        default=0,
        description="Tổng số lượng sản phẩm đang có trong kho"
    )
    low_stock_count: int = Field(
        default=0,
        description="Số lượng mặt hàng có tồn kho <= ngưỡng cảnh báo tối thiểu"
    )
    low_stock_items: List[LowStockItem] = Field(
        default_factory=list,
        description="Danh sách các sản phẩm đang trong tình trạng cảnh báo tồn kho thấp"
    )

    model_config = ConfigDict(from_attributes=True)


# -------------------------------------------------------------
# Schemas cho API: Sản Phẩm Mua Nhiều Nhất (Top Selling Products)
# -------------------------------------------------------------

class TopSellingProductItem(BaseModel):
    """Chi tiết sản phẩm bán chạy nhất trong kỳ"""
    id: UUID = Field(..., description="ID sản phẩm")
    name: str = Field(..., description="Tên sản phẩm")
    category: str = Field(default="Chưa phân loại", description="Tên ngành hàng / danh mục")
    sold_count: int = Field(default=0, description="Tổng số lượng đã bán ra trong kỳ")
    revenue: Decimal = Field(default=Decimal("0.00"), description="Tổng doanh thu từ sản phẩm này")
    stock: int = Field(default=0, description="Số lượng tồn kho hiện tại")
    unit: str = Field(default="Sản phẩm", description="Đơn vị tính (Thùng, Lốc, Vỉ, Chai...)")
    trend: str = Field(default="+0.0%", description="Tỷ trọng doanh thu hoặc mức độ tăng trưởng")

    model_config = ConfigDict(from_attributes=True)


# -------------------------------------------------------------
# Schemas cho API: Phân Bổ Mặt Hàng Đã Bán Theo Category
# -------------------------------------------------------------

class CategoryDistributionItem(BaseModel):
    """Thông tin phân bổ theo từng ngành hàng"""
    name: str = Field(..., description="Tên ngành hàng / danh mục")
    distinct_count: int = Field(default=0, description="Số mặt hàng khác biệt đã bán thuộc ngành này")
    percent: float = Field(default=0.0, description="Tỷ lệ phần trăm đóng góp (%)")
    color: str = Field(default="bg-blue-500", description="Màu sắc đại diện Tailwind CSS")

    model_config = ConfigDict(from_attributes=True)


class CategoryDistributionResponse(BaseModel):
    """Kết quả phân bổ toàn bộ ngành hàng và gợi ý kinh doanh"""
    total_products: int = Field(default=0, description="Tổng số mặt hàng khác biệt đã bán qua các ngành hàng")
    categories: List[CategoryDistributionItem] = Field(
        default_factory=list,
        description="Danh sách các ngành hàng và tỷ lệ phân bổ"
    )
    business_insight: str = Field(
        default="",
        description="Gợi ý kinh doanh thông minh tự động sinh từ dữ liệu"
    )

    model_config = ConfigDict(from_attributes=True)
