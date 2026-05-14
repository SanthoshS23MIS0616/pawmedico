from fastapi import APIRouter, HTTPException

from app.schemas.pet import HealthRecordCreate, HealthRecordResponse, PetCreate, PetResponse, WeightLogCreate, WeightLogResponse
from app.services.repository import repository

router = APIRouter(prefix="/pets", tags=["pets"])


@router.get("", response_model=list[PetResponse])
async def list_pets() -> list[PetResponse]:
    return [PetResponse(**pet) for pet in repository.list_pets()]


@router.post("", response_model=PetResponse)
async def create_pet(payload: PetCreate) -> PetResponse:
    return PetResponse(**repository.create_pet(payload.model_dump()))


@router.get("/{pet_id}", response_model=PetResponse)
async def get_pet(pet_id: str) -> PetResponse:
    pet = repository.get_pet(pet_id)
    if not pet:
        raise HTTPException(status_code=404, detail="Pet not found.")
    return PetResponse(**pet)


@router.post("/{pet_id}/records", response_model=HealthRecordResponse)
async def create_health_record(pet_id: str, payload: HealthRecordCreate) -> HealthRecordResponse:
    if not repository.get_pet(pet_id):
        raise HTTPException(status_code=404, detail="Pet not found.")
    record = repository.create_health_record(pet_id, payload.model_dump())
    return HealthRecordResponse(**record)


@router.post("/{pet_id}/weights", response_model=WeightLogResponse)
async def create_weight_log(pet_id: str, payload: WeightLogCreate) -> WeightLogResponse:
    if not repository.get_pet(pet_id):
        raise HTTPException(status_code=404, detail="Pet not found.")
    record = repository.create_weight_log(pet_id, payload.model_dump())
    return WeightLogResponse(**record)

