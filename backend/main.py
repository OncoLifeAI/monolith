from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import uvicorn
import os

# Import all the new, organized routers
from routers.auth.auth_routes import router as auth_router
from routers.patient.patient_routes import router as patient_router
from routers.summaries.summaries_routes import router as summaries_router
from routers.diary.diary_routes import router as diary_router
from routers.chat.chat_routes import router as chat_router

# Load environment variables
load_dotenv()

# Create main FastAPI application
app = FastAPI(
    title="Patient Portal API",
    description="API for the Patient Portal application",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure this properly for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include all the new routers
app.include_router(auth_router)
app.include_router(patient_router)
app.include_router(summaries_router)
app.include_router(diary_router)
app.include_router(chat_router)

# Root endpoint
@app.get("/")
async def root():
    return {"message": "Welcome to Patient Portal API", "version": "1.0.0"}

# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0", 
        port=8000, 
        reload=True,
        reload_dirs=["./"]
    )