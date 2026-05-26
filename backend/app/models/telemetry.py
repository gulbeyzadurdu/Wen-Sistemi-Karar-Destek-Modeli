"""TelemetryData — TimescaleDB hypertable.

Partitioned by ``time`` with 7-day chunks (configured in ``app.db.engine.init_db``).
Composite primary key ``(time, sensor_id)`` satisfies TimescaleDB's requirement that
the partition key be part of every unique constraint.
``nexus_ratio`` is a GENERATED ALWAYS AS STORED column computed server-side.
"""

from datetime import datetime
from uuid import UUID

from sqlalchemy import Boolean, Computed, DateTime, Double, ForeignKey
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class TelemetryData(Base):
    __tablename__ = "telemetry_data"

    time: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), primary_key=True, nullable=False
    )
    sensor_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True),
        ForeignKey("sensors.id", ondelete="CASCADE"),
        primary_key=True,
        nullable=False,
    )
    water_value: Mapped[float] = mapped_column(
        Double, server_default="0", nullable=False
    )
    energy_value: Mapped[float] = mapped_column(
        Double, server_default="0", nullable=False
    )
    # Server-side generated column: NULL when water_value is 0 to avoid division by zero.
    nexus_ratio: Mapped[float | None] = mapped_column(
        Double,
        Computed(
            "CASE WHEN water_value = 0 OR water_value IS NULL "
            "THEN NULL "
            "ELSE energy_value / water_value END",
            persisted=True,
        ),
        nullable=True,
    )
    anomaly_flag: Mapped[bool] = mapped_column(
        Boolean, server_default="false", nullable=False
    )

    # Relationship
    sensor: Mapped["Sensor"] = relationship(  # noqa: F821
        "Sensor", back_populates="telemetry"
    )
