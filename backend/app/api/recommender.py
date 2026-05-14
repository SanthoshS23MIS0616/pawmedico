from fastapi import APIRouter

from app.schemas.analysis import BreedRecommendationRequest, BreedRecommendationResponse
from app.services.recommender_service import recommender_service

router = APIRouter(prefix="/recommender", tags=["recommender"])


@router.post("/breeds", response_model=BreedRecommendationResponse)
async def recommend_breeds(payload: BreedRecommendationRequest) -> BreedRecommendationResponse:
    return recommender_service.recommend(payload)

