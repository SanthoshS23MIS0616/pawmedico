from dataclasses import dataclass
from typing import Annotated

from fastapi import Header, HTTPException, status

from app.core.config import settings
from app.core.supabase import verify_user_token


@dataclass(slots=True)
class AuthContext:
    user_id: str
    mode: str
    access_token: str | None = None
    email: str | None = None


def _parse_bearer_token(authorization: str | None) -> str | None:
    if not authorization:
        return None
    scheme, _, token = authorization.partition(" ")
    if scheme.lower() != "bearer" or not token.strip():
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid authorization header.")
    return token.strip()


def _demo_user_id(token: str | None, x_demo_user: str | None) -> str:
    if x_demo_user and x_demo_user.strip():
        return x_demo_user.strip()
    if token and token.startswith("demo-local:"):
        return token.split(":", 1)[1] or "demo-user"
    return "demo-user"


async def get_auth_context(
    authorization: Annotated[str | None, Header()] = None,
    x_demo_user: Annotated[str | None, Header()] = None,
) -> AuthContext:
    token = _parse_bearer_token(authorization)
    if settings.supabase_auth_enabled:
        if not token:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication is required.")
        user = await verify_user_token(token)
        user_id = user.get("id")
        if not user_id:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Supabase user id was not present in the token response.")
        return AuthContext(user_id=user_id, email=user.get("email"), access_token=token, mode="supabase")
    return AuthContext(user_id=_demo_user_id(token, x_demo_user), access_token=token, mode="demo")


async def get_optional_auth_context(
    authorization: Annotated[str | None, Header()] = None,
    x_demo_user: Annotated[str | None, Header()] = None,
) -> AuthContext | None:
    token = _parse_bearer_token(authorization)
    if settings.supabase_auth_enabled:
        if not token:
            return None
        user = await verify_user_token(token)
        user_id = user.get("id")
        if not user_id:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Supabase user id was not present in the token response.")
        return AuthContext(user_id=user_id, email=user.get("email"), access_token=token, mode="supabase")
    return AuthContext(user_id=_demo_user_id(token, x_demo_user), access_token=token, mode="demo")
