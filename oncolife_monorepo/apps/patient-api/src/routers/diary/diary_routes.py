"""
Diary Entry Routes

This module provides endpoints for managing patient diary entries:

Routes:
- GET /diary/{year}/{month}: Fetch diary entries for a specific month and year
- POST /diary/: Create a new diary entry with text and doctor flag
- PATCH /diary/{entry_uuid}/delete: Soft delete a diary entry by UUID

All routes require authentication and operate on the logged-in user's data.
"""

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import extract
from typing import List
import uuid

# Database and model imports
from db.database import get_patient_db
from db.patient_models import PatientDiaryEntries
from routers.auth.dependencies import get_current_user, TokenData
from .models import DiaryEntrySchema, DiaryEntryCreate, DiaryEntryUpdate
from utils.timezone_utils import utc_to_user_timezone, format_datetime_for_display

router = APIRouter()

def convert_diary_entry_to_user_timezone(entry, user_timezone: str = "America/Los_Angeles"):
    """Convert diary entry timestamps to user timezone for display."""
    # Create a copy of the entry data to avoid modifying the database object
    entry_data = {
        "id": entry.id,
        "created_at": entry.created_at,
        "last_updated_at": entry.last_updated_at,
        "patient_uuid": str(entry.patient_uuid),  # Convert UUID to string
        "title": entry.title,
        "diary_entry": entry.diary_entry,
        "entry_uuid": str(entry.entry_uuid),  # Convert UUID to string
        "marked_for_doctor": entry.marked_for_doctor,
        "is_deleted": entry.is_deleted,
    }
    
    # Convert timestamps to user timezone
    if entry_data["created_at"]:
        entry_data["created_at"] = utc_to_user_timezone(entry_data["created_at"], user_timezone)
    if entry_data["last_updated_at"]:
        entry_data["last_updated_at"] = utc_to_user_timezone(entry_data["last_updated_at"], user_timezone)
    
    return entry_data

@router.get("/diary/{year}/{month}", response_model=list[DiaryEntrySchema], tags=["diary"])
async def get_diary_entries_by_month(
    year: int,
    month: int,
    db: Session = Depends(get_patient_db),
    current_user: TokenData = Depends(get_current_user),
    timezone: str = Query(default="America/Los_Angeles", description="User's timezone")
):
    """
    Get all diary entries for a specific month and year.
    """
    try:
        entries = db.query(PatientDiaryEntries).filter(
            PatientDiaryEntries.patient_uuid == current_user.sub,
            PatientDiaryEntries.is_deleted == False,
            extract('year', PatientDiaryEntries.created_at) == year,
            extract('month', PatientDiaryEntries.created_at) == month
        ).order_by(PatientDiaryEntries.last_updated_at.desc()).all()
        
        # Convert timestamps to user timezone and create proper response objects
        response_data = []
        for entry in entries:
            entry_data = convert_diary_entry_to_user_timezone(entry, timezone)
            response_data.append(DiaryEntrySchema(**entry_data))
        
        return response_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/diary", response_model=DiaryEntrySchema, tags=["diary"])
async def create_diary_entry(
    entry_data: DiaryEntryCreate,
    db: Session = Depends(get_patient_db),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Create a new diary entry for the authenticated patient.
    """
    try:
        new_entry = PatientDiaryEntries(
            patient_uuid=current_user.sub,
            title=entry_data.title,
            diary_entry=entry_data.diary_entry,
            marked_for_doctor=entry_data.marked_for_doctor
        )
        db.add(new_entry)
        db.commit()
        db.refresh(new_entry)
        return new_entry
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.patch("/diary/{entry_uuid}", response_model=DiaryEntrySchema, tags=["diary"])
async def update_diary_entry(
    entry_uuid: str,
    update_data: DiaryEntryUpdate,
    db: Session = Depends(get_patient_db),
    current_user: TokenData = Depends(get_current_user),
    timezone: str = Query(default="America/Los_Angeles", description="User's timezone")
):
    """
    Update a diary entry for the authenticated patient.
    """
    try:
        entry_to_update = db.query(PatientDiaryEntries).filter(
            PatientDiaryEntries.entry_uuid == entry_uuid,
            PatientDiaryEntries.patient_uuid == current_user.sub,
            PatientDiaryEntries.is_deleted == False
        ).first()

        if not entry_to_update:
            raise HTTPException(status_code=404, detail="Diary entry not found")

        # Get the update data, excluding any fields that were not set
        update_data_dict = update_data.dict(exclude_unset=True)

        # Check if there's actually data to update
        if not update_data_dict:
            raise HTTPException(
                status_code=400,
                detail="No update data provided."
            )

        # Update the entry with the provided data
        for key, value in update_data_dict.items():
            setattr(entry_to_update, key, value)

        db.commit()
        db.refresh(entry_to_update)
        
        # Convert timestamps to user timezone for response
        entry_data = convert_diary_entry_to_user_timezone(entry_to_update, timezone)
        return DiaryEntrySchema(**entry_data)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/diary", response_model=list[DiaryEntrySchema], tags=["diary"])
async def get_all_diary_entries(
    db: Session = Depends(get_patient_db),
    current_user: TokenData = Depends(get_current_user),
    timezone: str = Query(default="America/Los_Angeles", description="User's timezone")
):
    """
    Get all diary entries for the authenticated patient.
    """
    try:
        entries = db.query(PatientDiaryEntries).filter(
            PatientDiaryEntries.patient_uuid == current_user.sub,
            PatientDiaryEntries.is_deleted == False
        ).order_by(PatientDiaryEntries.last_updated_at.desc()).all()
        
        # Convert timestamps to user timezone and create proper response objects
        response_data = []
        for entry in entries:
            entry_data = convert_diary_entry_to_user_timezone(entry, timezone)
            response_data.append(DiaryEntrySchema(**entry_data))
        
        return response_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.patch(
    "/{entry_uuid}/delete",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Soft delete a diary entry"
)
async def soft_delete_diary_entry(
    entry_uuid: uuid.UUID,
    db: Session = Depends(get_patient_db),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Soft deletes a diary entry by setting its `is_deleted` flag to true.
    Ensures the entry belongs to the logged-in user before deleting.
    """
    entry_to_delete = db.query(PatientDiaryEntries).filter(
        PatientDiaryEntries.entry_uuid == entry_uuid,
        PatientDiaryEntries.patient_uuid == current_user.sub
    ).first()

    if not entry_to_delete:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Diary entry not found or you do not have permission to delete it.")

    if entry_to_delete.is_deleted:
        # Avoid redundant updates
        return

    entry_to_delete.is_deleted = True
    db.commit()
    return 