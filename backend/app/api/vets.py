from fastapi import APIRouter, Request

from app.core.rate_limit import limiter
from app.schemas.analysis import NearbyVetsRequest, NearbyVetsResponse
from app.services.vet_locator_service import vet_locator_service

router = APIRouter(prefix="/vets", tags=["vets"])


@router.post("/nearby", response_model=NearbyVetsResponse)
@limiter.limit("30/minute")
async def nearby_vets(request: Request, payload: NearbyVetsRequest) -> NearbyVetsResponse:
    return NearbyVetsResponse(**(await vet_locator_service.find_nearby(payload)))
