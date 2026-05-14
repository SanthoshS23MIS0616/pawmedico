import json
from pathlib import Path

import numpy as np

from app.core.config import settings
from app.schemas.analysis import SymptomCatalogResponse, SymptomPredictionRequest

try:
    import joblib
except Exception:
    joblib = None


class DiseasePredictor:
    def __init__(self) -> None:
        self.model = self._load_model()
        self.disease_mapping = {
            0: ("Tick fever", "https://www.thevetexpert.com/tick-fever-in-dogs-causes-signs-diagnosis-and-treatment/"),
            1: ("Distemper", "https://www.akc.org/expert-advice/health/distemper-in-dogs/"),
            2: ("Parvovirus", "https://www.akc.org/expert-advice/health/parvovirus-what-puppy-owners-need-to-know/"),
            3: ("Hepatitis", "https://vcahospitals.com/know-your-pet/infectious-canine-hepatitis"),
            4: ("Tetanus", "https://vcahospitals.com/know-your-pet/tetanus-in-dogs"),
            5: ("Chronic kidney Disease", "https://www.petmd.com/dog/conditions/kidney/chronic-renal-failure-dogs"),
            6: ("Diabetes", "https://www.petmd.com/dog/conditions/endocrine/c_dg_diabetes_mellitus"),
            7: ("Gastrointestinal Disease", "https://www.petmd.com/dog/conditions/digestive/c_multi_gastroenteritis"),
            8: ("Allergies", "https://www.petmd.com/dog/general-health/dog-allergies"),
            9: ("Gingivitis", "https://www.petmd.com/dog/conditions/mouth/c_dg_gingivitis"),
            10: ("Cancers", "https://www.petmd.com/dog/conditions/cancer/c_dg_cancer_general"),
            11: ("Skin Rashes", "https://www.petmd.com/dog/general-health/dog-skin-allergies-and-rashes"),
        }
        self.symptom_signatures = {
            "Tick fever": {"fever", "weakness", "loss of appetite", "lethargy"},
            "Distemper": {"runny nose", "coughing", "seizures", "fever"},
            "Parvovirus": {"diarrhea", "vomiting", "dehydration", "weakness"},
            "Hepatitis": {"abdominal pain", "fever", "vomiting", "loss of appetite"},
            "Tetanus": {"muscle weakness", "loss of coordination", "head tilt"},
            "Chronic kidney Disease": {"frequent urination", "increased thirst", "weight loss"},
            "Diabetes": {"increased appetite", "increased thirst", "weight loss"},
            "Gastrointestinal Disease": {"vomiting", "diarrhea", "abdominal pain"},
            "Allergies": {"itching", "redness", "hair loss"},
            "Gingivitis": {"excessive drooling", "swollen face", "loss of appetite"},
            "Cancers": {"lumps", "pain", "unexplained weight loss"},
            "Skin Rashes": {"red patches", "crusty lesions", "scaly skin"},
        }
        self.breed_symptoms = self._load_breed_symptoms()

    def _load_model(self):
        if not joblib:
            return None
        path = settings.model_dir / "symptom_model.pkl"
        if not path.exists():
            return None
        try:
            return joblib.load(path)
        except Exception:
            return None

    def _load_breed_symptoms(self) -> dict[str, list[str]]:
        path = settings.data_dir / "breed_symptoms.json"
        if not path.exists():
            return {}
        try:
            return json.loads(path.read_text(encoding="utf-8"))
        except Exception:
            return {}

    def get_catalog(self, breed: str | None) -> SymptomCatalogResponse:
        breeds = sorted(self.breed_symptoms.keys())
        if breed and breed in self.breed_symptoms:
            symptoms = self.breed_symptoms[breed]
        else:
            flattened = sorted({item for values in self.breed_symptoms.values() for item in values})
            symptoms = flattened[:80]
        return SymptomCatalogResponse(breed=breed, symptoms=symptoms, all_breeds=breeds)

    async def predict(self, payload: SymptomPredictionRequest) -> dict:
        if payload.symptom_vector and self.model is not None:
            try:
                vector = np.array(payload.symptom_vector).reshape(1, -1)
                prediction = self.model.predict(vector)
                scores = prediction[0] if hasattr(prediction, "__len__") else prediction
                idx = int(np.argmax(scores))
                disease, link = self.disease_mapping.get(idx, ("Unknown Disease", None))
                confidence = float(np.max(scores) * 100) if hasattr(scores, "__len__") else 65.0
                return {
                    "disease": disease,
                    "severity": "moderate" if confidence < 85 else "high",
                    "confidence": round(confidence, 2),
                    "vet_link": link,
                    "matched_symptoms": [],
                    "advice": ["Monitor hydration.", "Consult a veterinarian if symptoms worsen."],
                    "source": "joblib-model",
                }
            except Exception:
                pass

        normalized = {item.strip().lower() for item in payload.symptoms}
        best_disease = "General illness"
        best_score = 0
        for disease, signature in self.symptom_signatures.items():
            score = len(normalized.intersection(signature))
            if score > best_score:
                best_disease = disease
                best_score = score
        confidence = min(96.0, 45.0 + (best_score * 14))
        severity = "low" if confidence < 60 else "moderate" if confidence < 80 else "high"
        link = next((url for name, url in self.disease_mapping.values() if name == best_disease), None)
        return {
            "disease": best_disease,
            "severity": severity,
            "confidence": round(confidence, 2),
            "vet_link": link,
            "matched_symptoms": sorted(normalized.intersection(self.symptom_signatures.get(best_disease, set()))),
            "advice": [
                "Keep the pet hydrated and comfortable.",
                "Track symptom duration and severity in the dashboard.",
                "Seek urgent veterinary help if breathing, seizures, or collapse occur.",
            ],
            "source": "rule-based-fallback",
        }


disease_predictor = DiseasePredictor()

