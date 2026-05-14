from fastapi import APIRouter, HTTPException

from app.schemas.pet import AppointmentCreate, AppointmentResponse
from app.services.repository import repository

router = APIRouter(prefix="/appointments", tags=["appointments"])


@router.get("", response_model=list[AppointmentResponse])
async def list_appointments() -> list[AppointmentResponse]:
    return [AppointmentResponse(**row) for row in repository.list_appointments()]


@router.post("", response_model=AppointmentResponse)
async def create_appointment(payload: AppointmentCreate) -> AppointmentResponse:
    if not repository.get_pet(payload.pet_id):
        raise HTTPException(status_code=404, detail="Pet not found.")
    return AppointmentResponse(**repository.create_appointment(payload.model_dump()))

