from fastapi import APIRouter

from app.schemas.pet import DashboardResponse
from app.services.repository import repository

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("", response_model=DashboardResponse)
async def get_dashboard() -> DashboardResponse:
    return DashboardResponse(**repository.get_dashboard())

