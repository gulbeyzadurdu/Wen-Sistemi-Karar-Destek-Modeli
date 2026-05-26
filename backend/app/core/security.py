"""JWT creation / verification and Argon2id password helpers."""

from datetime import datetime, timedelta, timezone
from uuid import UUID

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import get_settings

pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def hash_password(plain: str) -> str:
    return pwd_context.hash(plain)


def create_access_token(user_id: UUID, role: str, name: str) -> str:
    settings = get_settings()
    expire = datetime.now(timezone.utc) + timedelta(
        minutes=settings.access_token_expire_minutes
    )
    payload: dict = {
        "sub": str(user_id),
        "role": role,
        "name": name,
        "exp": expire,
    }
    return jwt.encode(payload, settings.secret_key, algorithm="HS256")


def decode_access_token(token: str) -> dict:
    """Decode and verify a JWT.  Raises ``JWTError`` on any failure."""
    settings = get_settings()
    return jwt.decode(token, settings.secret_key, algorithms=["HS256"])


__all__ = [
    "verify_password",
    "hash_password",
    "create_access_token",
    "decode_access_token",
    "JWTError",
]
