from fastapi import APIRouter
from fastapi.responses import StreamingResponse

from app.schemas.analysis import ChatRequest, ChatResponse
from app.services.chat_service import chat_service

router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("", response_model=ChatResponse)
async def chat(payload: ChatRequest) -> ChatResponse:
    return ChatResponse(**(await chat_service.reply(payload)))


@router.post("/stream")
async def chat_stream(payload: ChatRequest) -> StreamingResponse:
    return StreamingResponse(chat_service.stream_reply(payload), media_type="text/event-stream")

