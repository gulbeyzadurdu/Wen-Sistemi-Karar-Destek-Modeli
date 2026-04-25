from app.core.config import get_settings
from app.schemas.health import HealthInput, HealthOutput


def build_health(*, data: HealthInput) -> HealthOutput:
    settings = get_settings()
    if not data.include_details:
        return HealthOutput(status="ok", version=settings.app_version, details=None)
    return HealthOutput(
        status="ok",
        version=settings.app_version,
        details={"app_name": settings.app_name},
    )
