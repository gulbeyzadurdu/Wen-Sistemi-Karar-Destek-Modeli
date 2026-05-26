from pydantic import BaseModel


class TelemetryPacket(BaseModel):
    energy_kwh: float
    water_m3: float
    nexus_ratio: float
    ts: str
