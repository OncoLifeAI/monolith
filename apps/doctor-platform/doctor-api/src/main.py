from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers.auth.auth_routes import router as auth_router
from routers.staff.staff_routes import router as staff_router
from routers.patients.patient_routes import router as patients_router
from routers.dashboard.dashboard_routes import router as dashboard_router

app = FastAPI(title="OncoLife Doctor API", version="1.0.0")

# CORS
_default_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",  # Doctor platform specific port
    "http://127.0.0.1:3001",
]
_env_origins = os.getenv("CORS_ORIGINS")
allow_origins = [o.strip() for o in _env_origins.split(",")] if _env_origins else _default_origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(staff_router)
app.include_router(patients_router)
app.include_router(dashboard_router)

@app.get("/health")
async def health():
    return {"status": "ok", "service": "doctor-api"} 