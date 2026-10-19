from datetime import datetime
from decimal import Decimal
from typing import Optional, List, Dict, Any
from uuid import UUID

from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.order import SalesOrder, SalesOrderItem
from app.models.inventory import StoreInventory
from app.models.product import Product
from app.models.store import StoreCategory


class AnalyticsRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    # ---------------------------------------------------------
    # API 1: Doanh thu, Vốn, Lợi nhuận
    # ---------------------------------------------------------

    async def get_financial_summary(
        self,
        store_id: UUID,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
    ) -> Dict[str, Decimal]:
        """
        Tính tổng doanh thu và tổng vốn của cửa hàng.
        - Doanh thu: Tổng tiền từ các đơn hàng sales_orders.
        - Vốn: Tổng chi phí giá vốn (quantity * unit_cost) từ sales_order_items.
        """
        rev_stmt = select(
            func.coalesce(func.sum(SalesOrder.total_amount), Decimal("0.00"))
        ).where(SalesOrder.store_id == store_id)

        if start_date:
            rev_stmt = rev_stmt.where(SalesOrder.created_at >= start_date)
        if end_date:
            rev_stmt = rev_stmt.where(SalesOrder.created_at <= end_date)

        rev_result = await self.db.execute(rev_stmt)
        total_revenue = rev_result.scalar_one()

        cost_stmt = (
            select(
                func.coalesce(
                    func.sum(SalesOrderItem.quantity * SalesOrderItem.unit_cost),
                    Decimal("0.00"),
                )
            )
            .join(SalesOrder, SalesOrderItem.sales_order_id == SalesOrder.id)
            .where(SalesOrder.store_id == store_id)
        )

        if start_date:
            cost_stmt = cost_stmt.where(SalesOrder.created_at >= start_date)
        if end_date:
            cost_stmt = cost_stmt.where(SalesOrder.created_at <= end_date)

        cost_result = await self.db.execute(cost_stmt)
        total_cost = cost_result.scalar_one()

        return {
            "total_revenue": Decimal(str(total_revenue)),
            "total_cost": Decimal(str(total_cost)),
        }

    # ---------------------------------------------------------
    # API 2: Số SP khác nhau đã bán, Tổng đơn, Tổng tồn kho, Low stock
    # ---------------------------------------------------------

    async def get_total_distinct_products_sold(
        self,
        store_id: UUID,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
    ) -> int:
        """Đếm số mặt hàng khác biệt (distinct product_id) đã bán ra"""
        stmt = (
            select(func.count(func.distinct(SalesOrderItem.product_id)))
            .join(SalesOrder, SalesOrderItem.sales_order_id == SalesOrder.id)
            .where(SalesOrder.store_id == store_id)
        )

        if start_date:
            stmt = stmt.where(SalesOrder.created_at >= start_date)
        if end_date:
            stmt = stmt.where(SalesOrder.created_at <= end_date)

        result = await self.db.execute(stmt)
        return int(result.scalar_one() or 0)

    async def get_total_orders_sold(
        self,
        store_id: UUID,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
    ) -> int:
        """Đếm tổng số đơn bán hàng đã tạo"""
        stmt = select(func.count(SalesOrder.id)).where(SalesOrder.store_id == store_id)

        if start_date:
            stmt = stmt.where(SalesOrder.created_at >= start_date)
        if end_date:
            stmt = stmt.where(SalesOrder.created_at <= end_date)

        result = await self.db.execute(stmt)
        return int(result.scalar_one() or 0)

    async def get_total_stock_quantity(self, store_id: UUID) -> int:
        """Tổng số lượng tồn kho (tổng số unit sản phẩm đang còn trong kho)"""
        stmt = select(
            func.coalesce(func.sum(StoreInventory.quantity), 0)
        ).where(StoreInventory.store_id == store_id)

        result = await self.db.execute(stmt)
        return int(result.scalar_one() or 0)

    async def get_low_stock_count(self, store_id: UUID) -> int:
        """Đếm số lượng mặt hàng đang chạm ngưỡng cảnh báo tồn kho thấp (quantity <= low_stock_threshold)"""
        stmt = select(func.count(StoreInventory.id)).where(
            StoreInventory.store_id == store_id,
            StoreInventory.quantity <= StoreInventory.low_stock_threshold,
        )

        result = await self.db.execute(stmt)
        return int(result.scalar_one() or 0)

    async def get_low_stock_items(
        self,
        store_id: UUID,
        limit: int = 20,
    ) -> List[Dict[str, Any]]:
        """Lấy danh sách các mặt hàng sắp hết hàng (tồn kho thấp)"""
        stmt = (
            select(
                StoreInventory.product_id,
                func.coalesce(StoreInventory.custom_name, Product.original_name).label("product_name"),
                Product.barcode,
                StoreInventory.quantity,
                StoreInventory.low_stock_threshold,
            )
            .join(Product, StoreInventory.product_id == Product.id)
            .where(
                StoreInventory.store_id == store_id,
                StoreInventory.quantity <= StoreInventory.low_stock_threshold,
            )
            .order_by(StoreInventory.quantity.asc())
            .limit(limit)
        )

        result = await self.db.execute(stmt)
        rows = result.mappings().all()

        return [
            {
                "product_id": row["product_id"],
                "product_name": row["product_name"],
                "barcode": row["barcode"],
                "quantity": row["quantity"],
                "low_stock_threshold": row["low_stock_threshold"],
            }
            for row in rows
        ]

    # ---------------------------------------------------------
    # API 3: Sản phẩm mua nhiều nhất (Top Selling Products)
    # ---------------------------------------------------------

    async def get_top_selling_products(
        self,
        store_id: UUID,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        limit: int = 5,
    ) -> List[Dict[str, Any]]:
        """
        Lấy danh sách các sản phẩm bán chạy nhất trong kỳ lọc.
        Sắp xếp theo tổng số lượng bán giảm dần (sold_count DESC).
        """
        stmt = (
            select(
                SalesOrderItem.product_id,
                func.coalesce(StoreInventory.custom_name, Product.original_name).label("name"),
                func.coalesce(StoreCategory.name, "Chưa phân loại").label("category"),
                func.sum(SalesOrderItem.quantity).label("sold_count"),
                func.sum(SalesOrderItem.quantity * SalesOrderItem.unit_price).label("revenue"),
                func.coalesce(StoreInventory.quantity, 0).label("stock"),
            )
            .join(SalesOrder, SalesOrderItem.sales_order_id == SalesOrder.id)
            .join(Product, SalesOrderItem.product_id == Product.id)
            .outerjoin(
                StoreInventory,
                and_(
                    StoreInventory.product_id == SalesOrderItem.product_id,
                    StoreInventory.store_id == SalesOrder.store_id,
                ),
            )
            .outerjoin(
                StoreCategory,
                and_(
                    StoreInventory.store_category_id == StoreCategory.id,
                    StoreCategory.store_id == SalesOrder.store_id,
                ),
            )
            .where(SalesOrder.store_id == store_id)
        )

        if start_date:
            stmt = stmt.where(SalesOrder.created_at >= start_date)
        if end_date:
            stmt = stmt.where(SalesOrder.created_at <= end_date)

        stmt = (
            stmt.group_by(
                SalesOrderItem.product_id,
                StoreInventory.custom_name,
                Product.original_name,
                StoreCategory.name,
                StoreInventory.quantity,
            )
            .order_by(func.sum(SalesOrderItem.quantity).desc())
            .limit(limit)
        )

        result = await self.db.execute(stmt)
        rows = result.mappings().all()

        return [
            {
                "id": row["product_id"],
                "name": row["name"],
                "category": row["category"],
                "sold_count": int(row["sold_count"] or 0),
                "revenue": Decimal(str(row["revenue"] or 0)),
                "stock": int(row["stock"] or 0),
            }
            for row in rows
        ]

    # ---------------------------------------------------------
    # API 4: Phân bổ mặt hàng đã bán theo danh mục (Category Distribution)
    # ---------------------------------------------------------

    async def get_category_distribution(
        self,
        store_id: UUID,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
    ) -> List[Dict[str, Any]]:
        """
        Thống kê số lượng mặt hàng khác biệt đã bán theo từng ngành hàng/category.
        """
        stmt = (
            select(
                func.coalesce(StoreCategory.name, "Chưa phân loại").label("category_name"),
                func.count(func.distinct(SalesOrderItem.product_id)).label("distinct_count"),
                func.coalesce(
                    func.sum(SalesOrderItem.quantity * SalesOrderItem.unit_price),
                    Decimal("0.00"),
                ).label("revenue"),
            )
            .join(SalesOrder, SalesOrderItem.sales_order_id == SalesOrder.id)
            .outerjoin(
                StoreInventory,
                and_(
                    StoreInventory.product_id == SalesOrderItem.product_id,
                    StoreInventory.store_id == SalesOrder.store_id,
                ),
            )
            .outerjoin(
                StoreCategory,
                and_(
                    StoreInventory.store_category_id == StoreCategory.id,
                    StoreCategory.store_id == SalesOrder.store_id,
                ),
            )
            .where(SalesOrder.store_id == store_id)
        )

        if start_date:
            stmt = stmt.where(SalesOrder.created_at >= start_date)
        if end_date:
            stmt = stmt.where(SalesOrder.created_at <= end_date)

        stmt = (
            stmt.group_by(StoreCategory.name)
            .order_by(func.count(func.distinct(SalesOrderItem.product_id)).desc())
        )

        result = await self.db.execute(stmt)
        rows = result.mappings().all()

        return [
            {
                "name": row["category_name"],
                "distinct_count": int(row["distinct_count"] or 0),
                "revenue": Decimal(str(row["revenue"] or 0)),
            }
            for row in rows
        ]
