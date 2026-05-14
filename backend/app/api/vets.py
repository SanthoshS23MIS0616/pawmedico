from fastapi import APIRouter

from app.schemas.analysis import NearbyVetsRequest, NearbyVetsResponse
from app.services.vet_locator_service import vet_locator_service

router = APIRouter(prefix="/vets", tags=["vets"])


@router.post("/nearby", response_model=NearbyVetsResponse)
async def nearby_vets(payload: NearbyVetsRequest) -> NearbyVetsResponse:
    return NearbyVetsResponse(**(await vet_locator_service.find_nearby(payload)))

