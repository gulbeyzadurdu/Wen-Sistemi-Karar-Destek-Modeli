from datetime import datetime
from uuid import UUID, uuid4

from sqlalchemy import Boolean, CheckConstraint, DateTime, ForeignKey, String, func
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Anomaly(Base):
    __tablename__ = "anomalies"
    __table_args__ = (
        CheckConstraint(
            "severity IN ('Kritik', 'Turuncu', 'Sari', 'Yesil', 'Uyari')",
            name="ck_anomalies_severity",
        ),
    )

    id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), primary_key=True, default=uuid4
    )
    anomaly_code: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    factory_id: Mapped[str] = mapped_column(
        String, ForeignKey("factories.id", ondelete="CASCADE"), nullable=False
    )
    sensor_id: Mapped[UUID | None] = mapped_column(
        PGUUID(as_uuid=True),
        ForeignKey("sensors.id", ondelete="SET NULL"),
        nullable=True,
    )
    severity: Mapped[str] = mapped_column(String, nullable=False)
    summary: Mapped[str] = mapped_column(String, nullable=False)
    is_resolved: Mapped[bool] = mapped_column(
        Boolean, server_default="false", nullable=False
    )
    resolved_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    # Relationships
    factory: Mapped["Factory"] = relationship(  # noqa: F821
        "Factory", back_populates="anomalies"
    )
    sensor: Mapped["Sensor | None"] = relationship(  # noqa: F821
        "Sensor", back_populates="anomalies"
    )
