from fastapi import APIRouter, Depends, HTTPException

from app.core.auth import AuthContext, get_auth_context
from app.schemas.pet import VaccinationCreate, VaccinationResponse
from app.services.repository import repository

router = APIRouter(prefix="/vaccinations", tags=["vaccinations"])


@router.get("", response_model=list[VaccinationResponse])
async def list_vaccinations(auth: AuthContext = Depends(get_auth_context)) -> list[VaccinationResponse]:
    return [VaccinationResponse(**row) for row in await repository.list_vaccinations(auth)]


@router.post("", response_model=VaccinationResponse)
async def create_vaccination(payload: VaccinationCreate, auth: AuthContext = Depends(get_auth_context)) -> VaccinationResponse:
    if not await repository.get_pet(auth, payload.pet_id):
        raise HTTPException(status_code=404, detail="Pet not found.")
    return VaccinationResponse(**(await repository.create_vaccination(auth, payload.model_dump())))
