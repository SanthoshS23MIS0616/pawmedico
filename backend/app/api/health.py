from fastapi import APIRouter

from app.core.config import settings
from app.core.supabase import get_supabase_status
from app.services.disease_predictor import disease_predictor
from app.services.image_service import image_service
from app.services.recommender_service import recommender_service
from app.services.repository import repository

router = APIRouter(tags=["health"])


@router.get("/health")
async def health_check() -> dict:
    supabase = get_supabase_status()
    return {
        "status": "ok",
        "app": settings.app_name,
        "environment": settings.environment,
        "repository_mode": repository.mode,
        "supabase": supabase,
        "gemini_configured": bool(settings.active_gemini_api_key),
        "gemini": {
            "configured": bool(settings.active_gemini_api_key),
            "model": settings.gemini_model,
            "confidence_threshold": settings.gemini_confidence_threshold,
        },
        "demo_mode": {
            "available": True,
            "active": not settings.supabase_auth_enabled,
        },
        "assets": {
            "breed_recommender_source": recommender_service.source,
            "breed_recommender_breeds": recommender_service.dataset_size,
            "local_breed_model_ready": image_service.model is not None,
            "local_symptom_model_ready": disease_predictor.model is not None,
            "uploads_directory_ready": settings.upload_dir.exists(),
        },
    }
