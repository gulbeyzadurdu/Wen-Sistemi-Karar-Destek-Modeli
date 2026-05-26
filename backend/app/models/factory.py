from datetime import datetime

from sqlalchemy import CheckConstraint, DateTime, Double, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Factory(Base):
    __tablename__ = "factories"
    __table_args__ = (
        CheckConstraint(
            "status IN ('Online', 'Offline', 'Warning')", name="ck_factories_status"
        ),
    )

    id: Mapped[str] = mapped_column(String, primary_key=True)
    name: Mapped[str] = mapped_column(String, nullable=False)
    status: Mapped[str | None] = mapped_column(String, nullable=True)
    nexus_ratio: Mapped[float | None] = mapped_column(
        Double, server_default="1.0", nullable=True
    )
    energy_consumption: Mapped[float | None] = mapped_column(Double, nullable=True)
    water_consumption: Mapped[float | None] = mapped_column(Double, nullable=True)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    # Relationships
    sensors: Mapped[list["Sensor"]] = relationship(  # noqa: F821
        "Sensor", back_populates="factory"
    )
    thresholds: Mapped[list["Threshold"]] = relationship(  # noqa: F821
        "Threshold", back_populates="factory"
    )
    anomalies: Mapped[list["Anomaly"]] = relationship(  # noqa: F821
        "Anomaly", back_populates="factory"
    )
