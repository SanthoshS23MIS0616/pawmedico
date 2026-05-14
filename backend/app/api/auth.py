from fastapi import APIRouter

from app.core.supabase import get_supabase_status

router = APIRouter(prefix="/auth", tags=["auth"])


@router.get("/config")
async def auth_config() -> dict:
    status = get_supabase_status()
    return {
        "provider": "supabase",
        "configured": status["configured"],
        "sdk_available": status["sdk_available"],
        "google_login_ready": status["configured"],
        "demo_mode_available": True,
    }
