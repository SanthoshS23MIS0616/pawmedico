from fastapi import APIRouter, File, HTTPException, Request, UploadFile

from app.core.rate_limit import limiter
from app.schemas.analysis import SkinDiseaseResponse
from app.services.image_service import image_service

router = APIRouter(prefix="/analysis", tags=["analysis"])


@router.post("/analyze-skin", response_model=SkinDiseaseResponse)
@limiter.limit("10/minute")
async def analyze_skin(request: Request, file: UploadFile = File(...)) -> SkinDiseaseResponse:
    if file.content_type not in {"image/jpeg", "image/png", "image/webp"}:
        raise HTTPException(status_code=400, detail="Only JPEG, PNG, or WEBP images are supported.")
    result = await image_service.detect_skin_condition(await file.read(), file.content_type)
    return SkinDiseaseResponse(**result)
