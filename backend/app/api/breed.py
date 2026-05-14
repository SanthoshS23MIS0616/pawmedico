from fastapi import APIRouter, File, HTTPException, UploadFile

from app.schemas.analysis import BreedIdentificationResponse
from app.services.image_service import image_service

router = APIRouter(prefix="/breed", tags=["breed"])


@router.post("/identify", response_model=BreedIdentificationResponse)
async def identify_breed(file: UploadFile = File(...)) -> BreedIdentificationResponse:
    if file.content_type not in {"image/jpeg", "image/png", "image/webp"}:
        raise HTTPException(status_code=400, detail="Only JPEG, PNG, or WEBP images are supported.")
    result = await image_service.identify_animal_and_breed(await file.read(), file.content_type)
    return BreedIdentificationResponse(**result)

