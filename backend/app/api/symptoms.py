from fastapi import APIRouter, HTTPException

from app.schemas.analysis import SymptomCatalogResponse, SymptomPredictionRequest, SymptomPredictionResponse
from app.services.disease_predictor import disease_predictor

router = APIRouter(prefix="/symptoms", tags=["symptoms"])


@router.get("/catalog", response_model=SymptomCatalogResponse)
async def symptom_catalog(breed: str | None = None) -> SymptomCatalogResponse:
    return disease_predictor.get_catalog(breed)


@router.post("/predict", response_model=SymptomPredictionResponse)
async def predict_disease(payload: SymptomPredictionRequest) -> SymptomPredictionResponse:
    if not payload.symptoms and not payload.symptom_vector:
        raise HTTPException(status_code=400, detail="Provide symptoms or a symptom_vector.")
    result = await disease_predictor.predict(payload)
    return SymptomPredictionResponse(**result)

