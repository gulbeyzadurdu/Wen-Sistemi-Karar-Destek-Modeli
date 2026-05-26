from datetime import datetime
from uuid import UUID, uuid4

from sqlalchemy import Boolean, CheckConstraint, DateTime, Integer, String, func
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class User(Base):
    __tablename__ = "users"
    __table_args__ = (
        CheckConstraint("role IN ('STRATEGIC', 'TECHNICAL')", name="ck_users_role"),
    )

    id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), primary_key=True, default=uuid4
    )
    email: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String, nullable=False)
    role: Mapped[str] = mapped_column(String, nullable=False)
    name: Mapped[str] = mapped_column(String, nullable=False)
    department: Mapped[str | None] = mapped_column(String, nullable=True)
    phone: Mapped[str | None] = mapped_column(String, nullable=True)
    last_login: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    login_count: Mapped[int] = mapped_column(Integer, server_default="0", nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    # Relationships
    thresholds: Mapped[list["Threshold"]] = relationship(  # noqa: F821
        "Threshold", back_populates="creator", foreign_keys="Threshold.created_by"
    )
    crisis_events: Mapped[list["CrisisEvent"]] = relationship(  # noqa: F821
        "CrisisEvent", back_populates="actor"
    )
    crisis_audit_logs: Mapped[list["CrisisAuditLog"]] = relationship(  # noqa: F821
        "CrisisAuditLog", back_populates="user"
    )
    simulation_runs: Mapped[list["SimulationRun"]] = relationship(  # noqa: F821
        "SimulationRun", back_populates="triggered_by_user"
    )
    notifications: Mapped[list["Notification"]] = relationship(  # noqa: F821
        "Notification", back_populates="user"
    )
    refresh_tokens: Mapped[list["RefreshToken"]] = relationship(  # noqa: F821
        "RefreshToken", back_populates="user"
    )
