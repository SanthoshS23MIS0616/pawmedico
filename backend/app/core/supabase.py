from typing import Any

from app.core.config import settings

try:
    from supabase import Client, create_client
except Exception:
    Client = Any
    create_client = None


def get_supabase_client() -> Client | None:
    if not create_client or not settings.supabase_url or not settings.supabase_service_role_key:
        return None
    return create_client(settings.supabase_url, settings.supabase_service_role_key)


def get_supabase_status() -> dict[str, bool]:
    return {
        "configured": bool(settings.supabase_url and settings.supabase_anon_key and settings.supabase_service_role_key),
        "sdk_available": create_client is not None,
    }

