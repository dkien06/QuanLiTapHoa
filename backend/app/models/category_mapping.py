from __future__ import annotations

import uuid
from datetime import datetime
from typing import TYPE_CHECKING, Optional

from sqlalchemy import (
    Text, DateTime, ForeignKey,
    CheckConstraint, Index, func, text
)
from sqlalchemy.dialects.postgresql import UUID, ENUM
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.enums import CategoryMappingStatus

if TYPE_CHECKING:
    from app.models.store import StoreCategory
    from app.models.product import Category
    from app.models.user import User, AdminUser


class CategoryMappingRequest(Base):
    __tablename__ = "category_mapping_requests"
    __table_args__ = (
        CheckConstraint(
            "(status = 'PENDING' AND reviewed_by IS NULL AND reviewed_at IS NULL) OR "
            "(status IN ('APPROVED', 'REJECTED') AND reviewed_by IS NOT NULL AND reviewed_at IS NOT NULL)",
            name="ck_mapping_review_state"
        ),
        Index(
            "uq_pending_mapping_per_store_category",
            "store_category_id",
            unique=True,
            postgresql_where=text("status = 'PENDING'")
        ),
        Index("idx_mapping_requests_status_created", "status", "created_at"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()")
    )
    store_category_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("store_categories.id"), nullable=False
    )
    proposed_category_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("categories.id"), nullable=False
    )
    status: Mapped[CategoryMappingStatus] = mapped_column(
        ENUM(CategoryMappingStatus, name="category_mapping_status", create_type=False),
        default=CategoryMappingStatus.PENDING,
        server_default=text("'PENDING'"),
        nullable=False
    )
    requested_by: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=False
    )
    reviewed_by: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("admin_users.id"), nullable=True
    )
    review_note: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    reviewed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    # Relationships
    store_category: Mapped["StoreCategory"] = relationship()
    proposed_category: Mapped["Category"] = relationship()
    requester: Mapped["User"] = relationship("User", foreign_keys=[requested_by])
    reviewer: Mapped[Optional["AdminUser"]] = relationship("AdminUser", foreign_keys=[reviewed_by])
