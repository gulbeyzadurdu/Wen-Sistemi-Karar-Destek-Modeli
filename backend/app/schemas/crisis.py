from pydantic import BaseModel


class AuditRequest(BaseModel):
    step_id: str
    timestamp: str
    user_id: str


class AuditResponse(BaseModel):
    ok: bool = True
