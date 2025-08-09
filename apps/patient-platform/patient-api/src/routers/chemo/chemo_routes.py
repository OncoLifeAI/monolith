from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import date

from db.database import get_patient_db
from routers.auth.dependencies import get_current_user, TokenData
from . import services, models

router = APIRouter()

@router.post("/chemo/log", response_model=models.LogChemoDateResponse, tags=["chemo"])
def log_chemo_date(
    request: models.LogChemoDateRequest,
    db: Session = Depends(get_patient_db),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Logs a chemotherapy date for the authenticated patient.
    """
    try:
        result = services.log_chemo_date_for_patient(
            db=db,
            patient_uuid=current_user.sub,
            chemo_date=request.chemo_date,
            timezone=request.timezone
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 