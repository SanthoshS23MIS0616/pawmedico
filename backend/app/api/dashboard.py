from fastapi import APIRouter, Depends

from app.core.auth import AuthContext, get_auth_context
from app.schemas.pet import DashboardResponse
from app.services.repository import repository

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("", response_model=DashboardResponse)
async def get_dashboard(auth: AuthContext = Depends(get_auth_context)) -> DashboardResponse:
    return DashboardResponse(**(await repository.get_dashboard(auth)))
