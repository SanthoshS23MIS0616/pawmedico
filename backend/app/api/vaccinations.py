from fastapi import APIRouter, HTTPException

from app.schemas.pet import VaccinationCreate, VaccinationResponse
from app.services.repository import repository

router = APIRouter(prefix="/vaccinations", tags=["vaccinations"])


@router.get("", response_model=list[VaccinationResponse])
async def list_vaccinations() -> list[VaccinationResponse]:
    return [VaccinationResponse(**row) for row in repository.list_vaccinations()]


@router.post("", response_model=VaccinationResponse)
async def create_vaccination(payload: VaccinationCreate) -> VaccinationResponse:
    if not repository.get_pet(payload.pet_id):
        raise HTTPException(status_code=404, detail="Pet not found.")
    return VaccinationResponse(**repository.create_vaccination(payload.model_dump()))

