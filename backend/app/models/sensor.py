from datetime import datetime
from uuid import UUID, uuid4

from sqlalchemy import Boolean, CheckConstraint, DateTime, ForeignKey, String, func
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Sensor(Base):
    __tablename__ = "sensors"
    __table_args__ = (
        CheckConstraint(
            "sensor_type IN ('ENERGY', 'WATER', 'COMBINED')",
            name="ck_sensors_sensor_type",
        ),
    )

    id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), primary_key=True, default=uuid4
    )
    factory_id: Mapped[str] = mapped_column(
        String, ForeignKey("factories.id", ondelete="CASCADE"), nullable=False
    )
    sensor_type: Mapped[str] = mapped_column(String, nullable=False)
    label: Mapped[str | None] = mapped_column(String, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, server_default="true", nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    # Relationships
    factory: Mapped["Factory"] = relationship(  # noqa: F821
        "Factory", back_populates="sensors"
    )
    telemetry: Mapped[list["TelemetryData"]] = relationship(  # noqa: F821
        "TelemetryData", back_populates="sensor"
    )
    anomalies: Mapped[list["Anomaly"]] = relationship(  # noqa: F821
        "Anomaly", back_populates="sensor"
    )
