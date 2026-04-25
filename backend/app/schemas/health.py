from pydantic import BaseModel, Field


class HealthInput(BaseModel):
    include_details: bool = Field(default=False, description="Include diagnostic fields in the response body.")


class HealthOutput(BaseModel):
    status: str
    version: str
    details: dict[str, str] | None = None
