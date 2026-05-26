from datetime import datetime
from uuid import UUID, uuid4

from sqlalchemy import Boolean, CheckConstraint, DateTime, Double, ForeignKey, String, func
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Threshold(Base):
    __tablename__ = "thresholds"
    __table_args__ = (
        CheckConstraint(
            "alert_type IN ('APP', 'EMAIL', 'BOTH')", name="ck_thresholds_alert_type"
        ),
    )

    id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), primary_key=True, default=uuid4
    )
    factory_id: Mapped[str] = mapped_column(
        String, ForeignKey("factories.id", ondelete="CASCADE"), nullable=False
    )
    created_by: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )
    energy_min: Mapped[float] = mapped_column(Double, server_default="8.4", nullable=False)
    energy_max: Mapped[float] = mapped_column(Double, server_default="18.25", nullable=False)
    water_min: Mapped[float] = mapped_column(Double, server_default="8.08", nullable=False)
    water_max: Mapped[float] = mapped_column(Double, server_default="12.92", nullable=False)
    alert_type: Mapped[str] = mapped_column(String, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, server_default="true", nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    # Relationships
    factory: Mapped["Factory"] = relationship(  # noqa: F821
        "Factory", back_populates="thresholds"
    )
    creator: Mapped["User | None"] = relationship(  # noqa: F821
        "User", back_populates="thresholds", foreign_keys=[created_by]
    )
