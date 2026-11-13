import logging

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from groq import (
    APIConnectionError,
    APIStatusError,
    AuthenticationError,
    RateLimitError,
)

from app.auth import get_current_user
from app.config import settings
from app.rate_limit import SlidingWindowRateLimiter
from app.safety import CRISIS_REPLY, detect_crisis
from app.schemas import ChatRequest, ChatResponse
from app.services.ai_service import EmptyReplyError, generate_reply

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("mindmate")

app = FastAPI(
    title="MindMate API",
    description="AI-powered student wellness support chatbot",
    version="1.1.0"
)

# Only the configured React origins may call this API from a browser.
# Authentication uses a Bearer token, not cookies, so credentials are off.
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)

rate_limiter = SlidingWindowRateLimiter(
    max_calls=settings.RATE_LIMIT_PER_MINUTE,
    window_seconds=60,
)


@app.get("/")
async def home():
    return {
        "message": "Welcome to MindMate API!",
        "status": "running"
    }


@app.get("/api/health")
async def health_check():
    return {"status": "healthy"}


@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest, user: dict = Depends(get_current_user)):
    messages = [message.model_dump() for message in request.messages]

    # Safety first: a message about self-harm gets a fixed, caring reply with
    # helplines. It skips the rate limit so help is never blocked.
    if detect_crisis(messages[-1]["content"]):
        logger.info("Safety reply sent for a message flagged as a crisis.")
        return ChatResponse(reply=CRISIS_REPLY, crisis=True)

    wait_seconds = rate_limiter.hit(user["sub"])
    if wait_seconds:
        raise HTTPException(
            status_code=429,
            detail=f"You're sending messages quickly. Please wait {wait_seconds} seconds and try again.",
            headers={"Retry-After": str(wait_seconds)},
        )

    try:
        reply = await generate_reply(messages)
        return ChatResponse(reply=reply)

    except RateLimitError:
        logger.warning("Groq rate limit reached.")
        raise HTTPException(
            status_code=429,
            detail="MindMate is temporarily busy. Please try again in a minute."
        )

    except AuthenticationError:
        logger.error("Groq rejected the API key. Check GROQ_API_KEY in backend/.env.")
        raise HTTPException(
            status_code=502,
            detail="The AI service is not set up correctly. Please let the developer know."
        )

    except APIConnectionError:
        logger.error("Could not connect to Groq.")
        raise HTTPException(
            status_code=503,
            detail="Unable to connect to the AI service. Please try again."
        )

    except APIStatusError as error:
        logger.error("Groq returned status %s.", error.status_code)
        raise HTTPException(
            status_code=502,
            detail="The AI service returned an error. Please try again."
        )

    except EmptyReplyError:
        logger.error("Groq returned an empty reply.")
        raise HTTPException(
            status_code=502,
            detail="I couldn't put a reply together that time. Please try again."
        )

    except Exception:
        logger.exception("Unexpected error while generating a reply.")
        raise HTTPException(
            status_code=500,
            detail="Something went wrong. Please try again."
        )