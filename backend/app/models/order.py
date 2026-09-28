from __future__ import annotations

import uuid
from datetime import datetime
from decimal import Decimal
from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import (
    Integer, Numeric, DateTime, ForeignKey,
    ForeignKeyConstraint, UniqueConstraint, CheckConstraint, Index,
    func, text
)
from sqlalchemy.dialects.postgresql import UUID, ENUM
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.enums import PurchaseOrderStatus, PaymentMethod

if TYPE_CHECKING:
    from app.models.store import Store
    from app.models.user import User
    from app.models.product import Product


class PurchaseOrder(Base):
    __tablename__ = "purchase_orders"
    __table_args__ = (
        CheckConstraint("grocery_store_id <> supplier_store_id", name="ck_purchase_different_stores"),
        CheckConstraint("total_amount >= 0", name="ck_purchase_total_amount_positive"),
        ForeignKeyConstraint(
            ["grocery_store_id", "created_by"],
            ["users.store_id", "users.id"],
            name="fk_purchase_creator_same_grocery"
        ),
        Index("idx_purchase_grocery_created", "grocery_store_id", text("created_at DESC")),
        Index("idx_purchase_supplier_created", "supplier_store_id", text("created_at DESC")),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()")
    )
    grocery_store_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("stores.id"), nullable=False
    )
    supplier_store_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("stores.id"), nullable=False
    )
    status: Mapped[PurchaseOrderStatus] = mapped_column(
        ENUM(PurchaseOrderStatus, name="purchase_order_status", create_type=False),
        default=PurchaseOrderStatus.PENDING,
        server_default=text("'PENDING'"),
        nullable=False
    )
    total_amount: Mapped[Decimal] = mapped_column(
        Numeric(14, 2), default=Decimal("0.00"), server_default=text("0"), nullable=False
    )
    created_by: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    received_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    # Relationships
    items: Mapped[List["PurchaseOrderItem"]] = relationship(
        back_populates="purchase_order", cascade="all, delete-orphan"
    )
    grocery_store: Mapped["Store"] = relationship("Store", foreign_keys=[grocery_store_id])
    supplier_store: Mapped["Store"] = relationship("Store", foreign_keys=[supplier_store_id])
    creator: Mapped["User"] = relationship(
        "User",
        primaryjoin="and_(PurchaseOrder.grocery_store_id == foreign(User.store_id), PurchaseOrder.created_by == foreign(User.id))",
        overlaps="store,users",
    )


class PurchaseOrderItem(Base):
    __tablename__ = "purchase_order_items"
    __table_args__ = (
        UniqueConstraint("purchase_order_id", "product_id", name="uq_purchase_item_product"),
        CheckConstraint("quantity > 0", name="ck_purchase_item_quantity_positive"),
        CheckConstraint("unit_price >= 0", name="ck_purchase_item_price_positive"),
        Index("idx_purchase_order_items_product_id", "product_id"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()")
    )
    purchase_order_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("purchase_orders.id"), nullable=False
    )
    product_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("products.id"), nullable=False
    )
    quantity: Mapped[int] = mapped_column(Integer, nullable=False)
    unit_price: Mapped[Decimal] = mapped_column(Numeric(14, 2), nullable=False)

    # Relationships
    purchase_order: Mapped["PurchaseOrder"] = relationship(back_populates="items")
    product: Mapped["Product"] = relationship()


class SalesOrder(Base):
    __tablename__ = "sales_orders"
    __table_args__ = (
        ForeignKeyConstraint(
            ["store_id", "cashier_id"],
            ["users.store_id", "users.id"],
            name="fk_sale_cashier_same_store"
        ),
        CheckConstraint("total_amount >= 0", name="ck_sales_total_positive"),
        Index("idx_sales_store_created", "store_id", text("created_at DESC")),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()")
    )
    store_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("stores.id"), nullable=False
    )
    cashier_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    total_amount: Mapped[Decimal] = mapped_column(Numeric(14, 2), nullable=False)
    payment_method: Mapped[PaymentMethod] = mapped_column(
        ENUM(PaymentMethod, name="payment_method", create_type=False),
        default=PaymentMethod.CASH,
        server_default=text("'CASH'"),
        nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    # Relationships
    items: Mapped[List["SalesOrderItem"]] = relationship(
        back_populates="sales_order", cascade="all, delete-orphan"
    )
    store: Mapped["Store"] = relationship("Store", foreign_keys=[store_id])
    cashier: Mapped["User"] = relationship(
        "User",
        primaryjoin="and_(SalesOrder.store_id == foreign(User.store_id), SalesOrder.cashier_id == foreign(User.id))",
        overlaps="creator,store,users",
    )


class SalesOrderItem(Base):
    __tablename__ = "sales_order_items"
    __table_args__ = (
        UniqueConstraint("sales_order_id", "product_id", name="uq_sales_item_product"),
        CheckConstraint("quantity > 0", name="ck_sales_item_qty_positive"),
        CheckConstraint("unit_price >= 0", name="ck_sales_item_price_positive"),
        CheckConstraint("unit_cost >= 0", name="ck_sales_item_cost_positive"),
        Index("idx_sales_order_items_product_id", "product_id"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()")
    )
    sales_order_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("sales_orders.id"), nullable=False
    )
    product_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("products.id"), nullable=False
    )
    quantity: Mapped[int] = mapped_column(Integer, nullable=False)
    unit_price: Mapped[Decimal] = mapped_column(Numeric(14, 2), nullable=False)
    unit_cost: Mapped[Decimal] = mapped_column(Numeric(14, 2), nullable=False)

    # Relationships
    sales_order: Mapped["SalesOrder"] = relationship(back_populates="items")
    product: Mapped["Product"] = relationship()
