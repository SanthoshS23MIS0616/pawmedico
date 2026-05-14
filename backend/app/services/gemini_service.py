import asyncio
import json
from typing import AsyncIterator

from app.core.config import settings

try:
    import google.generativeai as genai
except Exception:
    genai = None


class GeminiService:
    def __init__(self) -> None:
        self._configured = False
        if genai and settings.google_api_key:
            genai.configure(api_key=settings.google_api_key)
            self._configured = True

    @property
    def configured(self) -> bool:
        return self._configured

    async def analyze_image(self, image_bytes: bytes, mime_type: str, prompt: str) -> str | None:
        if not self.configured:
            return None

        def _run() -> str:
            model = genai.GenerativeModel("gemini-1.5-flash")
            response = model.generate_content([prompt, {"mime_type": mime_type, "data": image_bytes}])
            return getattr(response, "text", "").strip()

        return await asyncio.to_thread(_run)

    async def generate_json(self, prompt: str) -> dict | None:
        if not self.configured:
            return None

        def _run() -> dict | None:
            model = genai.GenerativeModel("gemini-1.5-flash")
            response = model.generate_content(prompt)
            text = getattr(response, "text", "").strip()
            try:
                return json.loads(text)
            except Exception:
                start = text.find("{")
                end = text.rfind("}")
                if start != -1 and end != -1 and end > start:
                    return json.loads(text[start : end + 1])
                return None

        return await asyncio.to_thread(_run)

    async def chat(self, prompt: str) -> str | None:
        if not self.configured:
            return None

        def _run() -> str:
            model = genai.GenerativeModel("gemini-1.5-flash")
            response = model.generate_content(prompt)
            return getattr(response, "text", "").strip()

        return await asyncio.to_thread(_run)

    async def stream_chat(self, prompt: str) -> AsyncIterator[str]:
        if not self.configured:
            fallback = "PawBot is running in demo mode until a real Gemini API key is added."
            for word in fallback.split():
                yield f"data: {word} \n\n"
            return

        def _collect() -> list[str]:
            model = genai.GenerativeModel("gemini-1.5-flash")
            response = model.generate_content(prompt, stream=True)
            return [chunk.text for chunk in response if getattr(chunk, "text", "")]

        chunks = await asyncio.to_thread(_collect)
        for chunk in chunks:
            yield f"data: {chunk}\n\n"


gemini_service = GeminiService()

