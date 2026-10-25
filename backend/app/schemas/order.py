import uuid
from decimal import Decimal
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field
from app.models.enums import PaymentMethod

class CheckoutItemRequest(BaseModel):
    product_id: uuid.UUID
    quantity: int = Field(..., gt=0, description="Số lượng mua lớn hơn 0")

class CheckoutRequest(BaseModel):
    items: List[CheckoutItemRequest] = Field(..., min_length=1, description="Giỏ hàng có ít nhất 1 món")
    payment_method: PaymentMethod = Field(default=PaymentMethod.CASH, description="CASH hoặc TRANSFER")


class OrderItemResponse(BaseModel):
    product_id: uuid.UUID
    quantity: int
    unit_price: Decimal
    unit_cost: Decimal

    model_config = ConfigDict(from_attributes=True)

class OrderResponse(BaseModel):
    id: uuid.UUID
    store_id: uuid.UUID
    cashier_id: uuid.UUID
    total_amount: Decimal
    payment_method: PaymentMethod
    created_at: datetime
    items: List[OrderItemResponse]

    model_config = ConfigDict(from_attributes=True)
