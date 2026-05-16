from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, Depends, File, HTTPException, Request, UploadFile

from app.core.auth import AuthContext, get_auth_context
from app.core.config import settings
from app.schemas.pet import (
    HealthRecordCreate,
    HealthRecordResponse,
    PetCreate,
    PetResponse,
    PetUpdate,
    PhotoUploadResponse,
    WeightLogCreate,
    WeightLogResponse,
)
from app.services.repository import repository

router = APIRouter(prefix="/pets", tags=["pets"])


@router.get("", response_model=list[PetResponse])
async def list_pets(auth: AuthContext = Depends(get_auth_context)) -> list[PetResponse]:
    return [PetResponse(**pet) for pet in await repository.list_pets(auth)]


@router.post("", response_model=PetResponse)
async def create_pet(payload: PetCreate, auth: AuthContext = Depends(get_auth_context)) -> PetResponse:
    return PetResponse(**(await repository.create_pet(auth, payload.model_dump())))


@router.get("/{pet_id}", response_model=PetResponse)
async def get_pet(pet_id: str, auth: AuthContext = Depends(get_auth_context)) -> PetResponse:
    pet = await repository.get_pet(auth, pet_id)
    if not pet:
        raise HTTPException(status_code=404, detail="Pet not found.")
    return PetResponse(**pet)


@router.patch("/{pet_id}", response_model=PetResponse)
async def update_pet(pet_id: str, payload: PetUpdate, auth: AuthContext = Depends(get_auth_context)) -> PetResponse:
    pet = await repository.update_pet(auth, pet_id, payload.model_dump(exclude_none=True))
    if not pet:
        raise HTTPException(status_code=404, detail="Pet not found.")
    return PetResponse(**pet)


@router.post("/photos/upload", response_model=PhotoUploadResponse)
async def upload_pet_photo(
    request: Request,
    file: UploadFile = File(...),
    auth: AuthContext = Depends(get_auth_context),
) -> PhotoUploadResponse:
    allowed_types = {"image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp"}
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Only JPG, PNG, and WEBP pet photos are supported.")
    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="Uploaded file was empty.")
    suffix = Path(file.filename or "").suffix.lower() or allowed_types[file.content_type]
    filename = f"pet-{auth.user_id}-{uuid4().hex}{suffix}"
    destination = settings.upload_dir / filename
    destination.write_bytes(content)
    return PhotoUploadResponse(provider="local-upload", file_path=filename, public_url=str(request.url_for("uploads", path=filename)))


@router.post("/{pet_id}/records", response_model=HealthRecordResponse)
async def create_health_record(
    pet_id: str,
    payload: HealthRecordCreate,
    auth: AuthContext = Depends(get_auth_context),
) -> HealthRecordResponse:
    if not await repository.get_pet(auth, pet_id):
        raise HTTPException(status_code=404, detail="Pet not found.")
    record = await repository.create_health_record(auth, pet_id, payload.model_dump())
    return HealthRecordResponse(**record)


@router.post("/{pet_id}/weights", response_model=WeightLogResponse)
async def create_weight_log(
    pet_id: str,
    payload: WeightLogCreate,
    auth: AuthContext = Depends(get_auth_context),
) -> WeightLogResponse:
    if not await repository.get_pet(auth, pet_id):
        raise HTTPException(status_code=404, detail="Pet not found.")
    record = await repository.create_weight_log(auth, pet_id, payload.model_dump())
    return WeightLogResponse(**record)
