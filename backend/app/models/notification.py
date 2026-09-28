from __future__ import annotations

import uuid
from datetime import datetime
from typing import TYPE_CHECKING, Optional

from sqlalchemy import (
    String, Text, Boolean, DateTime, ForeignKey,
    CheckConstraint, Index, func, text
)
from sqlalchemy.dialects.postgresql import UUID, ENUM
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.enums import NotificationType

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.order import PurchaseOrder
    from app.models.inventory import StoreInventory


class Notification(Base):
    __tablename__ = "notifications"
    __table_args__ = (
        CheckConstraint(
            "(type = 'PO_STATUS_CHANGED' AND purchase_order_id IS NOT NULL AND store_inventory_id IS NULL) OR "
            "(type = 'LOW_STOCK' AND store_inventory_id IS NOT NULL AND purchase_order_id IS NULL) OR "
            "(type = 'GENERAL' AND purchase_order_id IS NULL AND store_inventory_id IS NULL)",
            name="ck_notification_reference"
        ),
        Index("idx_notifications_user_read_created", "user_id", "is_read", text("created_at DESC")),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()")
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=False
    )
    type: Mapped[NotificationType] = mapped_column(
        ENUM(NotificationType, name="notification_type", create_type=False),
        nullable=False
    )
    title: Mapped[str] = mapped_column(String(150), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    purchase_order_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("purchase_orders.id"), nullable=True
    )
    store_inventory_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("store_inventories.id"), nullable=True
    )
    is_read: Mapped[bool] = mapped_column(Boolean, default=False, server_default=text("false"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    # Relationships
    user: Mapped["User"] = relationship(back_populates="notifications")
    purchase_order: Mapped[Optional["PurchaseOrder"]] = relationship()
    store_inventory: Mapped[Optional["StoreInventory"]] = relationship()
