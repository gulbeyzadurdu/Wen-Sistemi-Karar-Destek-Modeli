from datetime import datetime
from uuid import UUID, uuid4

from sqlalchemy import Boolean, CheckConstraint, DateTime, ForeignKey, String, func
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class CrisisEvent(Base):
    __tablename__ = "crisis_events"
    __table_args__ = (
        CheckConstraint(
            "level IN ('yellow', 'orange', 'red', 'KOD_KIRMIZI', 'WATER_CUTOFF')",
            name="ck_crisis_events_level",
        ),
    )

    id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), primary_key=True, default=uuid4
    )
    actor_id: Mapped[UUID | None] = mapped_column(
        PGUUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )
    level: Mapped[str] = mapped_column(String, nullable=False)
    manual_lock: Mapped[bool] = mapped_column(
        Boolean, server_default="false", nullable=False
    )
    is_simulation: Mapped[bool] = mapped_column(
        Boolean, server_default="false", nullable=False
    )
    resolution_note: Mapped[str | None] = mapped_column(String, nullable=True)
    started_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    resolved_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    # Relationships
    actor: Mapped["User | None"] = relationship(  # noqa: F821
        "User", back_populates="crisis_events"
    )
    audit_logs: Mapped[list["CrisisAuditLog"]] = relationship(  # noqa: F821
        "CrisisAuditLog", back_populates="crisis_event"
    )
