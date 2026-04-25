from fastapi import APIRouter

from app.schemas.health import HealthInput, HealthOutput
from app.services import health as health_service

router = APIRouter()


@router.get("/health", response_model=HealthOutput)
def get_health() -> HealthOutput:
    return health_service.build_health(data=HealthInput(include_details=False))


@router.post("/health", response_model=HealthOutput)
def post_health(data: HealthInput) -> HealthOutput:
    return health_service.build_health(data=data)
