from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from groq import RateLimitError, APIConnectionError, APIStatusError

from app.schemas import ChatRequest, ChatResponse
from app.services.ai_service import generate_reply


app = FastAPI(
    title="MindMate API",
    description="AI-powered student wellness support chatbot",
    version="1.0.0"
)

# Allow the local React development server to communicate with FastAPI.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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
async def chat(request: ChatRequest):
    messages = [
        message.model_dump()
        for message in request.messages
    ]

    try:
        reply = await generate_reply(messages)
        return ChatResponse(reply=reply)

    except RateLimitError:
        raise HTTPException(
            status_code=429,
            detail="MindMate is temporarily busy. Please try again later."
        )

    except APIConnectionError:
        raise HTTPException(
            status_code=503,
            detail="Unable to connect to the AI service. Please try again."
        )

    except APIStatusError:
        raise HTTPException(
            status_code=502,
            detail="The AI service returned an error. Please try again."
        )

    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Something went wrong. Please try again."
        )