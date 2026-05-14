from typing import AsyncIterator

from app.schemas.analysis import ChatRequest
from app.services.gemini_service import gemini_service
from app.services.repository import repository


class ChatService:
    async def reply(self, payload: ChatRequest) -> dict:
        pet = repository.get_pet(payload.pet_id) if payload.pet_id else None
        profile = f"Pet context: {pet}" if pet else "No pet profile attached."
        prompt = (
            f"You are PawBot, a veterinary assistant. Reply in language {payload.language}. "
            f"Keep the answer practical, calm, and include when a real vet visit is urgent.\n{profile}\nUser: {payload.message}"
        )
        response = await gemini_service.chat(prompt)
        if not response:
            response = (
                "PawBot is in demo mode right now. Based on the message, monitor eating, drinking, breathing, "
                "toilet habits, and energy closely, and seek urgent veterinary help for seizures, collapse, heavy bleeding, or breathing trouble."
            )
            source = "fallback"
            warning = "Add GEMINI_API_KEY for live AI chat."
        else:
            source = "gemini"
            warning = None
        repository.add_chat_message(payload.pet_id, payload.message, response)
        return {"reply": response, "source": source, "warning": warning}

    async def stream_reply(self, payload: ChatRequest) -> AsyncIterator[str]:
        pet = repository.get_pet(payload.pet_id) if payload.pet_id else None
        profile = f"Pet context: {pet}" if pet else "No pet profile attached."
        prompt = f"You are PawBot. Reply in language {payload.language}. {profile}\nUser: {payload.message}"
        async for chunk in gemini_service.stream_chat(prompt):
            yield chunk


chat_service = ChatService()

