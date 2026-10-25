import uuid
from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.orm import joinedload
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.inventory import StoreInventory
from app.models.order import SalesOrder, SalesOrderItem
from app.models.notification import Notification

class OrderRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_inventory_for_update( #xu ly ton kho
        self, store_id: uuid.UUID, product_id: uuid.UUID
    ) -> Optional[StoreInventory]:
        query = (
            select(StoreInventory)
            .with_for_update()
            .options(joinedload(StoreInventory.product))
            .where(
                StoreInventory.store_id == store_id,
                StoreInventory.product_id == product_id
            )
        )
        result = await self.db.execute(query)
        return result.scalar_one_or_none()

    def add_order(self, order: SalesOrder):
        self.db.add(order)

    def add_order_items(self, items: List[SalesOrderItem]):
        self.db.add_all(items)

    def add_notifications(self, notis: List[Notification]):
        self.db.add_all(notis)

# Hiện tại OrderRepository đang tạm làm thêm việc của Kho(Inventory) và Thông báo (Notification).
# Khi có thời gian tối ưu kiến trúc (Clean Architecture), bạn hãy làm 2 bước sau:
#
# 1. TÁCH KHO SANG: app/repository/inventory.py
#    - Chuyển hàm `get_inventory_for_update` sang class `InventoryRepository`.
#
# 2. TÁCH THÔNG BÁO SANG: app/repository/notification.py
#    - Chuyển hàm `add_notifications` sang class `NotificationRepository`.
#
# -> Khi đó, OrderRepository ở file này sẽ chỉ giữ lại đúng 2 hàm:
#    `add_order` và `add_order_items`.
#
