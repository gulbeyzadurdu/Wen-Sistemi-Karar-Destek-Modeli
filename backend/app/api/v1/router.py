from fastapi import APIRouter

from app.api.v1.routes import ai, auth, crisis, health, telemetry

api_v1_router = APIRouter()
api_v1_router.include_router(health.router, tags=["health"])
api_v1_router.include_router(auth.router)
api_v1_router.include_router(telemetry.router)
api_v1_router.include_router(crisis.router)
api_v1_router.include_router(ai.router)
