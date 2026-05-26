"""Shared FastAPI dependencies used across multiple routers."""

from uuid import UUID

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import decode_access_token
from app.db import get_session
from app.models.user import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/v1/auth/login")

_credentials_exc = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Could not validate credentials",
    headers={"WWW-Authenticate": "Bearer"},
)


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    session: AsyncSession = Depends(get_session),
) -> User:
    """Decode Bearer token and return the corresponding User row.

    Raises 401 if the token is missing, expired, or the user no longer exists.
    """
    try:
        payload = decode_access_token(token)
        user_id_str: str | None = payload.get("sub")
        if user_id_str is None:
            raise _credentials_exc
    except JWTError:
        raise _credentials_exc

    result = await session.execute(select(User).where(User.id == UUID(user_id_str)))
    user = result.scalar_one_or_none()
    if user is None:
        raise _credentials_exc
    return user
