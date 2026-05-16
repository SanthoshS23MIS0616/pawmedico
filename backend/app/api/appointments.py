from fastapi import APIRouter, Depends, HTTPException

from app.core.auth import AuthContext, get_auth_context
from app.schemas.pet import AppointmentCreate, AppointmentResponse
from app.services.repository import repository

router = APIRouter(prefix="/appointments", tags=["appointments"])


@router.get("", response_model=list[AppointmentResponse])
async def list_appointments(auth: AuthContext = Depends(get_auth_context)) -> list[AppointmentResponse]:
    return [AppointmentResponse(**row) for row in await repository.list_appointments(auth)]


@router.post("", response_model=AppointmentResponse)
async def create_appointment(payload: AppointmentCreate, auth: AuthContext = Depends(get_auth_context)) -> AppointmentResponse:
    if not await repository.get_pet(auth, payload.pet_id):
        raise HTTPException(status_code=404, detail="Pet not found.")
    return AppointmentResponse(**(await repository.create_appointment(auth, payload.model_dump())))
