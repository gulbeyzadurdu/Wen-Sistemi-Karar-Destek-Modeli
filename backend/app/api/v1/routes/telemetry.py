import random
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, Query

from app.api.deps import get_current_user
from app.models.user import User
from app.schemas.telemetry import TelemetryPacket

router = APIRouter(prefix="/telemetry", tags=["telemetry"])


def _make_packet(ts: datetime) -> TelemetryPacket:
    energy = round(random.uniform(8.0, 18.0), 4)
    water = round(random.uniform(8.0, 13.0), 4)
    nexus = round(energy / water, 4)
    return TelemetryPacket(
        energy_kwh=energy,
        water_m3=water,
        nexus_ratio=nexus,
        ts=ts.isoformat(),
    )


@router.get(
    "/live",
    response_model=TelemetryPacket,
    summary="Anlık telemetri verisi (simülasyon)",
)
async def get_live(
    _: User = Depends(get_current_user),
) -> TelemetryPacket:
    return _make_packet(datetime.now(timezone.utc))


@router.get(
    "/history",
    response_model=list[TelemetryPacket],
    summary="Geçmiş telemetri verisi (simülasyon)",
)
async def get_history(
    points: int = Query(default=50, ge=1, le=1000, description="Kaç veri noktası dönsün"),
    _: User = Depends(get_current_user),
) -> list[TelemetryPacket]:
    now = datetime.now(timezone.utc)
    return [_make_packet(now - timedelta(minutes=i)) for i in range(points)]
