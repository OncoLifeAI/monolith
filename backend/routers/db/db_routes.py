from fastapi import APIRouter

router = APIRouter(prefix="/db", tags=["database"])

@router.get("/test")
async def db_test():
    """Test endpoint for the database service routes."""
    return {"status": "ok", "service": "database"} 