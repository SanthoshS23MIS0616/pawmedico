from typing import Any

import httpx
from fastapi import HTTPException, status

from app.core.config import settings

def get_supabase_status() -> dict[str, bool | str]:
    return {
        "configured": bool(settings.supabase_url and settings.supabase_anon_key and settings.supabase_service_role_key),
        "url_configured": bool(settings.supabase_url),
        "anon_key_configured": bool(settings.supabase_anon_key),
        "service_role_configured": bool(settings.supabase_service_role_key),
        "auth_ready": settings.supabase_auth_enabled,
        "database_ready": settings.supabase_auth_enabled,
        "storage_ready": settings.supabase_storage_enabled,
        "admin_ready": settings.supabase_admin_enabled,
        "storage_bucket": settings.supabase_storage_bucket,
        "transport": "rest",
    }


def build_rest_headers(access_token: str | None = None, use_service_role: bool = False) -> dict[str, str]:
    key = settings.supabase_service_role_key if use_service_role else settings.supabase_anon_key
    if not settings.supabase_url or not key:
        raise RuntimeError("Supabase REST headers requested before Supabase was configured.")
    return {
        "apikey": key,
        "Authorization": f"Bearer {access_token or key}",
        "Accept": "application/json",
    }


def build_rest_url(table: str) -> str:
    if not settings.supabase_url:
        raise RuntimeError("Supabase REST URL requested before Supabase was configured.")
    return f"{settings.supabase_url.rstrip('/')}/rest/v1/{table}"


def build_storage_public_url(object_path: str) -> str | None:
    if not settings.supabase_storage_enabled or not settings.supabase_url:
        return None
    normalized = object_path.lstrip("/")
    return f"{settings.supabase_url.rstrip('/')}/storage/v1/object/public/{settings.supabase_storage_bucket}/{normalized}"


async def verify_user_token(access_token: str) -> dict[str, Any]:
    if not settings.supabase_auth_enabled or not settings.supabase_url:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Supabase auth is not configured.")

    url = f"{settings.supabase_url.rstrip('/')}/auth/v1/user"
    try:
        async with httpx.AsyncClient(timeout=12) as client:
            response = await client.get(url, headers=build_rest_headers(access_token=access_token))
    except httpx.HTTPError as exc:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Unable to reach Supabase auth.") from exc

    if response.status_code >= 400:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired access token.")

    payload = response.json()
    return payload.get("user", payload) if isinstance(payload, dict) else {}
