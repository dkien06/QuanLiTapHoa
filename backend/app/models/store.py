from __future__ import annotations

import uuid
from datetime import datetime
from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import (
    String, Text, DateTime, ForeignKey,
    UniqueConstraint, Index, func, text
)
from sqlalchemy.dialects.postgresql import UUID, ENUM
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.enums import StoreType

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.product import Category
    from app.models.inventory import StoreInventory


class Store(Base):
    __tablename__ = "stores"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()")
    )
    name: Mapped[str] = mapped_column(String(150), nullable=False)
    store_type: Mapped[StoreType] = mapped_column(
        ENUM(StoreType, name="store_type", create_type=False), nullable=False
    )
    phone: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    address: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    # Relationships
    users: Mapped[List["User"]] = relationship(back_populates="store", cascade="all, delete-orphan")
    categories: Mapped[List["StoreCategory"]] = relationship(back_populates="store", cascade="all, delete-orphan")
    inventories: Mapped[List["StoreInventory"]] = relationship(back_populates="store", cascade="all, delete-orphan")


class StoreCategory(Base):
    __tablename__ = "store_categories"
    __table_args__ = (
        UniqueConstraint("store_id", "name", name="uq_store_category_name"),
        UniqueConstraint("store_id", "id", name="uq_store_categories_store_id_id"),
        Index("idx_store_categories_category_id", "category_id"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()")
    )
    store_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("stores.id"), nullable=False
    )
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    category_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("categories.id"), nullable=True
    )

    # Relationships
    store: Mapped["Store"] = relationship(back_populates="categories")
    system_category: Mapped[Optional["Category"]] = relationship()
