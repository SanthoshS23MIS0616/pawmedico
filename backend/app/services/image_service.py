import asyncio
from io import BytesIO

import numpy as np
from PIL import Image

from app.core.config import settings
from app.services.groq_service import groq_service

try:
    import cv2
except Exception:
    cv2 = None

try:
    import tensorflow as tf
    import tensorflow_hub as hub
except Exception:
    tf = None
    hub = None


class ImageService:
    def __init__(self) -> None:
        self.labels = ["Labrador", "Beagle", "German Shepherd", "Bulldog", "Poodle"]
        self.model = self._load_breed_model()

    def _load_breed_model(self):
        if tf is None or hub is None:
            return None
        path = settings.model_dir / "breed_classifier.h5"
        if not path.exists():
            return None
        try:
            custom_objects = {"KerasLayer": hub.KerasLayer}
            with tf.keras.utils.custom_object_scope(custom_objects):
                return tf.keras.models.load_model(path, custom_objects=custom_objects)
        except Exception:
            return None

    def _load_image(self, image_bytes: bytes) -> Image.Image:
        return Image.open(BytesIO(image_bytes)).convert("RGB")

    def _basic_skin_report(self, image_bytes: bytes) -> tuple[str, float, str]:
        if cv2 is None:
            return "Possible irritation", 58.0, "OpenCV not installed; using text fallback."
        image = np.array(self._load_image(image_bytes))
        image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)
        resized = cv2.resize(image, (300, 300))
        hsv = cv2.cvtColor(resized, cv2.COLOR_BGR2HSV)
        lower_red = np.array([0, 50, 50])
        upper_red = np.array([10, 255, 255])
        redness_mask = cv2.inRange(hsv, lower_red, upper_red)
        redness_ratio = float(np.sum(redness_mask > 0) / (300 * 300))
        gray = cv2.cvtColor(resized, cv2.COLOR_BGR2GRAY)
        edges = cv2.Canny(gray, 50, 150)
        roughness_ratio = float(np.sum(edges > 0) / (300 * 300))
        if redness_ratio > 0.08:
            return "Skin inflammation", min(94.0, 60 + redness_ratio * 250), f"Redness ratio {redness_ratio:.2f}, roughness {roughness_ratio:.2f}"
        if roughness_ratio > 0.12:
            return "Dry or rough coat", min(88.0, 55 + roughness_ratio * 120), f"Redness ratio {redness_ratio:.2f}, roughness {roughness_ratio:.2f}"
        return "Mild irritation", 56.0, f"Redness ratio {redness_ratio:.2f}, roughness {roughness_ratio:.2f}"

    async def detect_skin_condition(self, image_bytes: bytes, mime_type: str) -> dict:
        prompt = (
            "You are a veterinary skin disease expert. Analyze this pet skin image and return a short diagnosis, "
            "severity (low/moderate/high), confidence percentage, 3 care tips, and whether a vet visit is needed. "
            "Always include a confidence percentage in the answer."
        )
        groq_text = await groq_service.analyze_image(image_bytes, mime_type, prompt)
        fallback_condition, fallback_confidence, report = await asyncio.to_thread(self._basic_skin_report, image_bytes)
        if groq_text:
            lower_text = groq_text.lower()
            severity = "high" if "high" in lower_text or "urgent" in lower_text else "moderate" if "moderate" in lower_text else "low"
            confidence, confidence_label, warning = groq_service.evaluate_confidence(groq_text, fallback=84.0)
            needs_vet = "yes" in lower_text or "vet" in lower_text or severity == "high" or confidence_label == "low"
            return {
                "condition": groq_text.splitlines()[0][:120],
                "confidence": confidence,
                "severity": severity,
                "care_tips": ["Keep the area clean and dry.", "Prevent scratching or licking.", "Monitor spreading or discharge."],
                "needs_vet": needs_vet,
                "analysis_source": "groq",
                "confidence_label": confidence_label,
                "warning": warning,
                "image_report": report,
            }
        severity = "high" if fallback_confidence >= 80 else "moderate" if fallback_confidence >= 65 else "low"
        return {
            "condition": fallback_condition,
            "confidence": round(fallback_confidence, 2),
            "severity": severity,
            "care_tips": ["Clean the affected skin gently.", "Avoid harsh shampoos until reviewed.", "See a vet if swelling, odor, or pain appears."],
            "needs_vet": severity != "low",
            "analysis_source": "opencv-fallback",
            "confidence_label": "low" if fallback_confidence < settings.ai_confidence_threshold else "medium",
            "warning": "Groq key not configured; showing fallback image analysis." if not groq_service.configured else None,
            "image_report": report,
        }

    def _predict_breed_with_model(self, image_bytes: bytes) -> tuple[str, float] | None:
        if self.model is None or tf is None:
            return None
        image = np.array(self._load_image(image_bytes))
        resized = np.array(Image.fromarray(image).resize((224, 224)))
        tensor = tf.image.convert_image_dtype(np.expand_dims(resized, axis=0), dtype=tf.float32)
        predictions = self.model.predict(tensor, verbose=0).flatten()
        idx = int(np.argmax(predictions))
        return self.labels[idx], float(predictions[idx] * 100)

    async def identify_animal_and_breed(self, image_bytes: bytes, mime_type: str) -> dict:
        prompt = "Identify the animal and breed from this image. Return two short lines: Animal: <type> and Breed: <breed>."
        groq_text = await groq_service.analyze_image(image_bytes, mime_type, prompt)
        if groq_text:
            animal = "Unknown"
            breed = "Unknown"
            for line in groq_text.splitlines():
                if ":" not in line:
                    continue
                key, value = [item.strip() for item in line.split(":", 1)]
                if key.lower().startswith("animal"):
                    animal = value
                if key.lower().startswith("breed"):
                    breed = value
            confidence, confidence_label, warning = groq_service.evaluate_confidence(groq_text, fallback=86.0)
            return {
                "animal": animal,
                "breed": breed,
                "confidence": confidence,
                "description": "Detected with Groq vision.",
                "analysis_source": "groq",
                "confidence_label": confidence_label,
                "info_link": f"https://www.google.com/search?q={breed.replace(' ', '+')}+breed" if breed != "Unknown" else None,
                "warning": warning,
            }

        breed_result = await asyncio.to_thread(self._predict_breed_with_model, image_bytes)
        if breed_result:
            breed, confidence = breed_result
            return {
                "animal": "Dog",
                "breed": breed,
                "confidence": round(confidence, 2),
                "description": "Predicted with the bundled TensorFlow breed classifier.",
                "analysis_source": "tensorflow",
                "confidence_label": "medium" if confidence >= settings.ai_confidence_threshold else "low",
                "info_link": f"https://www.akc.org/dog-breeds/{breed.lower().replace(' ', '-')}/",
                "warning": "Groq key not configured; using the local dog-only classifier.",
            }

        return {
            "animal": "Unknown",
            "breed": "Unknown",
            "confidence": 32.0,
            "description": "No configured AI model was available for image identification.",
            "analysis_source": "fallback",
            "confidence_label": "low",
            "info_link": None,
            "warning": "Add GROQ_API_KEY to enable full animal and breed recognition.",
        }


image_service = ImageService()
