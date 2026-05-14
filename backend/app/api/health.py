from fastapi import APIRouter

from app.core.config import settings
from app.core.supabase import get_supabase_status
from app.services.repository import repository

router = APIRouter(tags=["health"])


@router.get("/health")
async def health_check() -> dict:
    return {
        "status": "ok",
        "app": settings.app_name,
        "environment": settings.environment,
        "repository_mode": repository.mode,
        "supabase": get_supabase_status(),
        "gemini_configured": bool(settings.google_api_key),
    }
