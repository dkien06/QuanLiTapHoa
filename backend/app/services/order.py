from decimal import Decimal
from typing import List
from fastapi import HTTPException, status

from app.models.enums import NotificationType
from app.models.order import SalesOrder, SalesOrderItem
from app.models.notification import Notification
from app.models.user import User
from app.repository.order import OrderRepository
from app.schemas.order import (
    CheckoutRequest,
    OrderResponse,
    OrderItemResponse,
)

class OrderService:
    def __init__(self, order_repo: OrderRepository):
        self.order_repo = order_repo

    async def checkout(
        self, current_user: User, data: CheckoutRequest
    ) -> OrderResponse:
        store_id = current_user.store_id
        total_amount = Decimal("0.00")
        order_items: List[SalesOrderItem] = []
        low_stock_notis: List[Notification]= []

        sales_order = SalesOrder(
            store_id = store_id,
            cashier_id=current_user.id,
            total_amount=Decimal("0.00"), #Tạm thời để 0, tính xong sẽ gán lại
            payment_method = data.payment_method
        )

        self.order_repo.add_order(sales_order)
        await self.order_repo.db.flush()

        for item in data.items:
            inventory = await self.order_repo.get_inventory_for_update(store_id, item.product_id)

            if not inventory:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Sản phẩm ID '{item.product_id}' không có trong kho cửa hàng.",
                )

            product_name = inventory.custom_name or inventory.product.original_name

            if inventory.quantity < item.quantity:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Mặt hàng '{product_name}' không đủ số lượng tồn (Hiện còn: {inventory.quantity}, Yêu cầu: {item.quantity}).",
                )

            unit_price = inventory.selling_price
            unit_cost = inventory.cost_price
            total_amount += unit_price * item.quantity

            sales_order_item = SalesOrderItem(
                sales_order_id = sales_order.id,
                product_id = item.product_id,
                quantity = item.quantity,
                unit_price = unit_price,
                unit_cost = unit_cost,
            )

            order_items.append(sales_order_item)

            inventory.quantity -= item.quantity

            if (inventory.quantity <= inventory.low_stock_threshold):
                noti = Notification(
                    user_id = current_user.id,
                    type=NotificationType.LOW_STOCK,
                    title="Cảnh báo sắp hết hàng",
                    content=f"Sản phẩm '{product_name}' chỉ còn {inventory.quantity} món trong kho (Ngưỡng báo: {inventory.low_stock_threshold}).",
                    store_inventory_id=inventory.id,
                )
                low_stock_notis.append(noti)

        sales_order.total_amount = total_amount
        self.order_repo.add_order_items(order_items)

        if low_stock_notis:
            self.order_repo.add_notifications(low_stock_notis)

        await self.order_repo.db.commit()
        await self.order_repo.db.refresh(sales_order)

        return OrderResponse(
            id=sales_order.id,
            store_id=sales_order.store_id,
            cashier_id=sales_order.cashier_id,
            total_amount=sales_order.total_amount,
            payment_method=sales_order.payment_method,
            created_at=sales_order.created_at,
            items=[
                OrderItemResponse(
                    product_id=it.product_id,
                    quantity=it.quantity,
                    unit_price=it.unit_price,
                    unit_cost=it.unit_cost,
                )
                for it in order_items
            ],
        )


# Khi đã tách InventoryRepository và NotificationRepository ở tầng Repository, 
# bạn cập nhật OrderService như sau:
#
# 1. CẬP NHẬT HÀM __INIT__:
#    def __init__(
#        self, 
#        order_repo: OrderRepository,
#        inventory_repo: InventoryRepository,
#        notification_repo: NotificationRepository
#    ):
#        self.order_repo = order_repo
#        self.inventory_repo = inventory_repo
#        self.notification_repo = notification_repo
#
# 2. ĐỔI CÁC LỜI GỌI HÀM TRONG CHECKOUT:
#    - `self.order_repo.get_inventory_for_update(...)` 
#      -> thành: `self.inventory_repo.get_by_product_id(...)`
#    - `self.order_repo.add_notifications(low_stock_notis)` 
#      -> thành: `self.notification_repo.add_notifications(low_stock_notis)`
#
# 3. TRANSACTION VẪN AN TOÀN:
#    Vì cả 3 repo đều nhận chung 1 AsyncSession từ get_db(), nên lệnh 
#    `await self.order_repo.db.commit()` vẫn sẽ commit chung cho cả 3 bảng!
#
