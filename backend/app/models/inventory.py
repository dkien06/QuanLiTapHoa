from __future__ import annotations

import uuid
from datetime import datetime
from decimal import Decimal
from typing import TYPE_CHECKING, Optional

from sqlalchemy import (
    String, Integer, Numeric, DateTime, ForeignKey,
    ForeignKeyConstraint, UniqueConstraint, CheckConstraint, Index,
    func, text
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

if TYPE_CHECKING:
    from app.models.store import Store, StoreCategory
    from app.models.product import Product


class StoreInventory(Base):
    __tablename__ = "store_inventories"
    __table_args__ = (
        UniqueConstraint("store_id", "product_id", name="uq_inventory_store_product"),
        ForeignKeyConstraint(
            ["store_id", "store_category_id"],
            ["store_categories.store_id", "store_categories.id"],
            name="fk_inventory_category_same_store"
        ),
        CheckConstraint("quantity >= 0", name="ck_inventory_quantity_positive"),
        CheckConstraint("cost_price >= 0", name="ck_inventory_cost_price_positive"),
        CheckConstraint("selling_price >= 0", name="ck_inventory_selling_price_positive"),
        CheckConstraint("low_stock_threshold >= 0", name="ck_inventory_threshold_positive"),
        Index("idx_store_inventories_category_id", "store_category_id"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()")
    )
    store_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("stores.id"), nullable=False
    )
    product_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("products.id"), nullable=False
    )
    store_category_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), nullable=True)
    custom_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    quantity: Mapped[int] = mapped_column(Integer, default=0, server_default=text("0"), nullable=False)
    cost_price: Mapped[Decimal] = mapped_column(
        Numeric(14, 2), default=Decimal("0.00"), server_default=text("0"), nullable=False
    )
    selling_price: Mapped[Decimal] = mapped_column(
        Numeric(14, 2), default=Decimal("0.00"), server_default=text("0"), nullable=False
    )
    low_stock_threshold: Mapped[int] = mapped_column(
        Integer, default=0, server_default=text("0"), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    # Relationships
    store: Mapped["Store"] = relationship(back_populates="inventories")
    product: Mapped["Product"] = relationship()
    store_category: Mapped[Optional["StoreCategory"]] = relationship(
        primaryjoin="and_(StoreInventory.store_id == foreign(StoreCategory.store_id), StoreInventory.store_category_id == foreign(StoreCategory.id))",
        overlaps="categories,store",
    )
