from fastapi import APIRouter, Request
from fastapi.responses import StreamingResponse

from app.core.rate_limit import limiter
from app.schemas.analysis import ChatRequest, ChatResponse
from app.services.chat_service import chat_service

router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("", response_model=ChatResponse)
@limiter.limit("20/minute")
async def chat(request: Request, payload: ChatRequest) -> ChatResponse:
    return ChatResponse(**(await chat_service.reply(payload)))


@router.post("/stream")
@limiter.limit("20/minute")
async def chat_stream(request: Request, payload: ChatRequest) -> StreamingResponse:
    return StreamingResponse(chat_service.stream_reply(payload), media_type="text/event-stream")
