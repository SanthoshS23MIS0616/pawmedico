from datetime import datetime
from pathlib import Path

from app.schemas.analysis import PrescriptionRequest
from app.services.gemini_service import gemini_service
from app.utils.pdf_utils import render_prescription_document


class PrescriptionService:
    def __init__(self) -> None:
        self.output_dir = Path(__file__).resolve().parents[2] / "app" / "assets" / "uploads"
        self.output_dir.mkdir(parents=True, exist_ok=True)

    def _fallback_plan(self, payload: PrescriptionRequest) -> dict:
        today = datetime.utcnow().strftime("%Y-%m-%d")
        disease = payload.disease or "Supportive Care Needed"
        return {
            "disease": disease,
            "prescription_plan": [
                {
                    "date": today,
                    "time": "09:00",
                    "medicine": "Supportive care",
                    "dosage": "As advised by a licensed veterinarian",
                    "route": "oral",
                    "duration": "3-5 days",
                    "notes": "Monitor appetite, energy, and hydration carefully.",
                }
            ],
            "diet_plan": [
                {
                    "date": today,
                    "feeding_time": "morning",
                    "food_type": "Easily digestible diet",
                    "quantity": "Small frequent portions",
                    "notes": "Encourage clean water intake.",
                }
            ],
            "explanation": "A conservative care plan was created because live AI generation was unavailable. Use this as supportive guidance and confirm medications with a veterinarian.",
            "source": "fallback",
            "warning": "Gemini key not configured; prescription used the safe fallback plan.",
        }

    async def generate(self, payload: PrescriptionRequest) -> dict:
        prompt = f"""
You are a veterinary expert. Create a valid JSON prescription plan for this patient.

Pet name: {payload.pet_name}
Animal: {payload.animal}
Breed: {payload.breed or "Unknown"}
Age: {payload.age or "Unknown"}
Weight: {payload.weight or "Unknown"}
Sex: {payload.sex or "Unknown"}
Disease: {payload.disease or "Unknown"}
Symptoms: {", ".join(payload.symptoms) if payload.symptoms else "None"}
Medical history: {payload.medical_history or "None"}

Return exactly this JSON shape:
{{
  "disease": "string",
  "prescription_plan": [
    {{"date":"YYYY-MM-DD","time":"HH:MM","medicine":"string","dosage":"string","route":"string","duration":"string","notes":"string"}}
  ],
  "diet_plan": [
    {{"date":"YYYY-MM-DD","feeding_time":"morning","food_type":"string","quantity":"string","notes":"string"}}
  ],
  "explanation": "string"
}}
"""
        plan = await gemini_service.generate_json(prompt)
        if not plan:
            result = self._fallback_plan(payload)
        else:
            result = {**plan, "source": "gemini", "warning": None}
        filename = f"prescription-{payload.pet_no or payload.pet_name.lower().replace(' ', '-')}-{int(datetime.utcnow().timestamp())}.pdf"
        pdf_path = self.output_dir / filename
        render_prescription_document(result, payload, pdf_path)
        result["pdf_url"] = f"/uploads/{filename}" if pdf_path.exists() else None
        return result


prescription_service = PrescriptionService()

