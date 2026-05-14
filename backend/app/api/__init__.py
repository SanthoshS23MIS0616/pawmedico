from fastapi import APIRouter

from app.api import appointments, auth, breed, chat, dashboard, health, pets, prescription, recommender, skin_disease, symptoms, vaccinations, vets

api_router = APIRouter()
api_router.include_router(health.router)
api_router.include_router(auth.router)
api_router.include_router(skin_disease.router)
api_router.include_router(breed.router)
api_router.include_router(symptoms.router)
api_router.include_router(recommender.router)
api_router.include_router(prescription.router)
api_router.include_router(chat.router)
api_router.include_router(pets.router)
api_router.include_router(dashboard.router)
api_router.include_router(appointments.router)
api_router.include_router(vaccinations.router)
api_router.include_router(vets.router)

