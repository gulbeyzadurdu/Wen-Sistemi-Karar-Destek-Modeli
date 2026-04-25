from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    app_name: str = "WEN API"
    app_version: str = "0.1.0"
    api_prefix: str = "/v1"
    cors_origins: str = Field(default="http://localhost:5173", description="Comma-separated origins")
    database_url: str = Field(
        default="postgresql+asyncpg://wen:wen_dev@localhost:5432/wen",
        description="Async SQLAlchemy URL (Timescale/Postgres).",
    )
    redis_url: str = "redis://localhost:6379/0"

    @property
    def cors_origins_list(self) -> list[str]:
        return [part.strip() for part in self.cors_origins.split(",") if part.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
