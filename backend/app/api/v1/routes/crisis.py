from datetime import datetime, timezone

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.db import get_session
from app.models.crisis_audit_log import CrisisAuditLog
from app.models.user import User
from app.schemas.crisis import AuditRequest, AuditResponse

router = APIRouter(prefix="/crisis", tags=["crisis"])


@router.put(
    "/audit",
    response_model=AuditResponse,
    summary="Kriz protokol adımını audit tablosuna kaydet",
)
async def put_audit(
    body: AuditRequest,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> AuditResponse:
    # Parse client-supplied timestamp; fall back to server time if malformed.
    try:
        ts = datetime.fromisoformat(body.timestamp).replace(tzinfo=timezone.utc)
    except ValueError:
        ts = datetime.now(timezone.utc)

    log = CrisisAuditLog(
        crisis_event_id=None,
        user_id=current_user.id,
        step_id=body.step_id,
        message=f"Checklist step completed: {body.step_id}",
        ts=ts,
    )
    session.add(log)
    await session.commit()
    return AuditResponse()
