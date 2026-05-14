from typing import Literal

from pydantic import BaseModel, Field


class SkinDiseaseResponse(BaseModel):
    condition: str
    confidence: float = Field(ge=0, le=100)
    severity: Literal["low", "moderate", "high"]
    care_tips: list[str]
    needs_vet: bool
    analysis_source: str
    confidence_label: Literal["low", "medium", "high"] = "medium"
    warning: str | None = None
    image_report: str | None = None


class BreedIdentificationResponse(BaseModel):
    animal: str
    breed: str
    confidence: float = Field(ge=0, le=100)
    description: str
    analysis_source: str
    confidence_label: Literal["low", "medium", "high"] = "medium"
    info_link: str | None = None
    warning: str | None = None


class SymptomPredictionRequest(BaseModel):
    animal: str = "Dog"
    breed: str | None = None
    symptoms: list[str] = Field(default_factory=list)
    symptom_vector: list[int] = Field(default_factory=list)


class SymptomPredictionResponse(BaseModel):
    disease: str
    severity: str
    confidence: float = Field(ge=0, le=100)
    vet_link: str | None = None
    matched_symptoms: list[str] = Field(default_factory=list)
    advice: list[str] = Field(default_factory=list)
    source: str


class SymptomCatalogResponse(BaseModel):
    breed: str | None = None
    symptoms: list[str]
    all_breeds: list[str]


class BreedRecommendationRequest(BaseModel):
    affectionate_with_family: float = Field(ge=1, le=5)
    good_with_young_children: float = Field(ge=1, le=5)
    good_with_other_dogs: float = Field(ge=1, le=5)
    shedding_level: float = Field(ge=1, le=5)
    coat_grooming_frequency: float = Field(ge=1, le=5)
    drooling_level: float = Field(ge=1, le=5)
    openness_to_strangers: float = Field(ge=1, le=5)
    playfulness_level: float = Field(ge=1, le=5)
    watchdog_protective_nature: float = Field(ge=1, le=5)
    adaptability_level: float = Field(ge=1, le=5)
    trainability_level: float = Field(ge=1, le=5)
    energy_level: float = Field(ge=1, le=5)
    barking_level: float = Field(ge=1, le=5)
    mental_stimulation_needs: float = Field(ge=1, le=5)
    height_c: float = Field(ge=10, le=100)
    weight_c: float = Field(ge=1, le=90)
    life_c: float = Field(ge=5, le=20)
    coat_length_c: float = Field(ge=1, le=3)


class BreedMatch(BaseModel):
    name: str
    similarity: float = Field(ge=0, le=100)
    url: str
    summary: str


class BreedRecommendationResponse(BaseModel):
    matches: list[BreedMatch]
    source: str
    warning: str | None = None
    dataset_size: int | None = None


class PrescriptionMedication(BaseModel):
    date: str
    time: str
    medicine: str
    dosage: str
    route: str
    duration: str
    notes: str


class PrescriptionDietItem(BaseModel):
    date: str
    feeding_time: str
    food_type: str
    quantity: str
    notes: str


class PrescriptionRequest(BaseModel):
    pet_no: str | None = None
    pet_name: str
    animal: str = "Dog"
    breed: str | None = None
    age: str | None = None
    weight: str | None = None
    sex: str | None = None
    disease: str | None = None
    symptoms: list[str] = Field(default_factory=list)
    medical_history: str | None = None


class PrescriptionResponse(BaseModel):
    disease: str
    prescription_plan: list[PrescriptionMedication]
    diet_plan: list[PrescriptionDietItem]
    explanation: str
    pdf_url: str | None = None
    source: str
    warning: str | None = None


class ChatRequest(BaseModel):
    message: str
    pet_id: str | None = None
    language: Literal["en", "ta", "hi"] = "en"


class ChatResponse(BaseModel):
    reply: str
    source: str
    warning: str | None = None


class NearbyVetsRequest(BaseModel):
    latitude: float = Field(ge=-90, le=90)
    longitude: float = Field(ge=-180, le=180)
    radius_km: int = Field(default=5, ge=1, le=30)


class NearbyVet(BaseModel):
    name: str
    latitude: float
    longitude: float
    distance_km: float
    map_link: str
    source: str


class NearbyVetsResponse(BaseModel):
    vets: list[NearbyVet]
    warning: str | None = None
