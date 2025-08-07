from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

from fastapi import FastAPI
from routers.auth.auth_routes import router as auth_router
from routers.patient.patient_routes import router as patient_router
from routers.profile.profile_routes import router as profile_router
from routers.diary.diary_routes import router as diary_router
from routers.summaries.summaries_routes import router as summaries_router
from routers.chemo.chemo_routes import router as chemo_router
from routers.chat.chat_routes import router as chat_router

app = FastAPI()

app.include_router(auth_router)
app.include_router(patient_router)
app.include_router(profile_router)
app.include_router(diary_router)
app.include_router(summaries_router)
app.include_router(chemo_router)
app.include_router(chat_router)

@app.get("/health")
async def health():
    return {"status": "ok"}
