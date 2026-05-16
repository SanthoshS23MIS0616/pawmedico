import asyncio
import base64
import json
import re
from typing import AsyncIterator

from app.core.config import settings

try:
    from groq import Groq
except Exception:
    Groq = None


class GroqService:
    def __init__(self) -> None:
        self._configured = bool(Groq and settings.groq_api_key)
        self._client = Groq(api_key=settings.groq_api_key) if self._configured else None

    @property
    def configured(self) -> bool:
        return self._configured

    @property
    def text_model_name(self) -> str:
        return settings.groq_text_model

    @property
    def vision_model_name(self) -> str:
        return settings.groq_vision_model

    def _extract_confidence(self, text: str) -> float | None:
        match = re.search(r"(\d{1,3})(?:\s?%)", text)
        if not match:
            return None
        confidence = float(match.group(1))
        return max(0.0, min(confidence, 100.0))

    def evaluate_confidence(self, text: str, fallback: float = 65.0) -> tuple[float, str, str | None]:
        confidence = self._extract_confidence(text) or fallback
        if confidence < settings.ai_confidence_threshold:
            return confidence, "low", "Low-confidence AI result. Please see a vet for a proper diagnosis."
        if confidence < 80:
            return confidence, "medium", None
        return confidence, "high", None

    @staticmethod
    def _extract_text(completion) -> str:
        return (completion.choices[0].message.content or "").strip()

    async def analyze_image(self, image_bytes: bytes, mime_type: str, prompt: str) -> str | None:
        if not self.configured or self._client is None:
            return None

        encoded = base64.b64encode(image_bytes).decode("utf-8")
        data_url = f"data:{mime_type};base64,{encoded}"

        def _run() -> str:
            completion = self._client.chat.completions.create(
                model=self.vision_model_name,
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": prompt},
                            {"type": "image_url", "image_url": {"url": data_url}},
                        ],
                    }
                ],
                temperature=0.2,
                max_completion_tokens=1024,
            )
            return self._extract_text(completion)

        try:
            return await asyncio.to_thread(_run)
        except Exception:
            return None

    async def generate_json(self, prompt: str) -> dict | None:
        if not self.configured or self._client is None:
            return None

        def _run() -> dict | None:
            completion = self._client.chat.completions.create(
                model=self.text_model_name,
                messages=[
                    {"role": "system", "content": "You are a veterinary assistant. Return valid JSON only."},
                    {"role": "user", "content": prompt},
                ],
                temperature=0.2,
                max_completion_tokens=1200,
            )
            text = self._extract_text(completion)
            try:
                return json.loads(text)
            except Exception:
                start = text.find("{")
                end = text.rfind("}")
                if start != -1 and end != -1 and end > start:
                    return json.loads(text[start : end + 1])
                return None

        try:
            return await asyncio.to_thread(_run)
        except Exception:
            return None

    async def chat(self, prompt: str) -> str | None:
        if not self.configured or self._client is None:
            return None

        def _run() -> str:
            completion = self._client.chat.completions.create(
                model=self.text_model_name,
                messages=[
                    {"role": "system", "content": "You are a calm, practical veterinary assistant."},
                    {"role": "user", "content": prompt},
                ],
                temperature=0.3,
                max_completion_tokens=900,
            )
            return self._extract_text(completion)

        try:
            return await asyncio.to_thread(_run)
        except Exception:
            return None

    async def stream_chat(self, prompt: str) -> AsyncIterator[str]:
        response = await self.chat(prompt)
        if not response:
            fallback = "PawBot is running in demo mode until a real Groq API key is added."
            for word in fallback.split():
                yield f"data: {word} \n\n"
            return

        for sentence in [part.strip() for part in re.split(r"(?<=[.!?])\s+", response) if part.strip()]:
            yield f"data: {sentence} \n\n"


groq_service = GroqService()
