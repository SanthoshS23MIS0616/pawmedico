from fastapi import APIRouter

from app.core.config import settings
from app.core.supabase import get_supabase_status

router = APIRouter(prefix="/auth", tags=["auth"])


@router.get("/config")
async def auth_config() -> dict:
    status = get_supabase_status()
    return {
        "provider": "supabase",
        "configured": status["configured"],
        "sdk_available": True,
        "auth_ready": status["auth_ready"],
        "database_ready": status["database_ready"],
        "storage_ready": status["storage_ready"],
        "google_login_ready": status["auth_ready"],
        "email_password_ready": status["auth_ready"],
        "live_mode": settings.supabase_auth_enabled,
        "demo_mode_available": True,
        "storage_bucket": status["storage_bucket"],
    }
