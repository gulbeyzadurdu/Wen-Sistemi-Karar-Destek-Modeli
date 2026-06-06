from collections.abc import AsyncGenerator
import logging

from sqlalchemy import func, select, text
from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

from app.core.config import get_settings

logger = logging.getLogger(__name__)

_settings = get_settings()

engine = create_async_engine(
    _settings.database_url,
    echo=False,
    pool_size=5,
    max_overflow=10,
    pool_pre_ping=True,
)

AsyncSessionLocal: async_sessionmaker[AsyncSession] = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


async def get_session() -> AsyncGenerator[AsyncSession, None]:
    """FastAPI dependency that yields a managed async DB session."""
    async with AsyncSessionLocal() as session:
        yield session


async def init_db() -> None:
    """Create all tables and convert telemetry_data into a TimescaleDB hypertable.

    Safe to call on every startup — uses IF NOT EXISTS guards.
    """
    # Import all models so metadata is populated before create_all.
    import app.models  # noqa: F401

    from app.db.base import Base

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        logger.info("Database tables created / verified.")

    async with AsyncSessionLocal() as session:
        from app.core.security import hash_password
        from app.models.user import User

        result = await session.execute(select(func.count()).select_from(User))
        if result.scalar_one() == 0:
            session.add_all(
                [
                    User(
                        email="arif@bosb.gov.tr",
                        password_hash=hash_password("wen2024"),
                        role="STRATEGIC",
                        name="Arif Bey",
                    ),
                    User(
                        email="emre@bosb.gov.tr",
                        password_hash=hash_password("wen2024"),
                        role="TECHNICAL",
                        name="Emre Bey",
                    ),
                ]
            )
            await session.commit()
            logger.info("Seed users created: arif@bosb.gov.tr, emre@bosb.gov.tr")

    async with AsyncSessionLocal() as session:
        try:
            await session.execute(
                text(
                    """
                    SELECT create_hypertable(
                        'telemetry_data',
                        'time',
                        if_not_exists => TRUE,
                        chunk_time_interval => INTERVAL '7 days'
                    )
                    """
                )
            )
            await session.commit()
            logger.info("TimescaleDB hypertable for telemetry_data ensured.")
        except Exception as exc:
            await session.rollback()
            logger.warning(
                "Could not create hypertable (TimescaleDB extension may be unavailable): %s",
                exc,
            )
