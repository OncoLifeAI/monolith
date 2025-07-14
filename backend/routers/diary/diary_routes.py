"""
Diary Entry Routes

This module provides endpoints for managing patient diary entries:

Routes:
- GET /diary/{year}/{month}: Fetch diary entries for a specific month and year
- POST /diary/: Create a new diary entry with text and doctor flag
- PATCH /diary/{entry_uuid}/delete: Soft delete a diary entry by UUID

All routes require authentication and operate on the logged-in user's data.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import extract
from typing import List
import uuid

# Absolute imports
from database import get_patient_db
from routers.db.models import PatientDiaryEntries
from routers.auth.dependencies import get_current_user, TokenData
from .models import DiaryEntrySchema, DiaryEntryCreate

router = APIRouter(prefix="/diary", tags=["Patient Diary"])


@router.get(
    "/{year}/{month}",
    response_model=List[DiaryEntrySchema],
    summary="Fetch diary entries by month"
)
async def get_diary_entries_by_month(
    year: int,
    month: int,
    db: Session = Depends(get_patient_db),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Fetches a list of non-deleted diary entries for the logged-in user
    for a specific year and month.
    """
    if not 1 <= month <= 12:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Month must be between 1 and 12.")

    entries = db.query(PatientDiaryEntries).filter(
        PatientDiaryEntries.patient_uuid == current_user.sub,
        PatientDiaryEntries.is_deleted == False,
        extract('year', PatientDiaryEntries.created_at) == year,
        extract('month', PatientDiaryEntries.created_at) == month
    ).order_by(PatientDiaryEntries.created_at.desc()).all()

    return entries


@router.post(
    "/",
    response_model=DiaryEntrySchema,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new diary entry"
)
async def create_diary_entry(
    entry: DiaryEntryCreate,
    db: Session = Depends(get_patient_db),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Creates a new diary entry for the logged-in user.
    """
    new_entry = PatientDiaryEntries(
        patient_uuid=current_user.sub,
        diary_entry=entry.diary_entry,
        marked_for_doctor=entry.marked_for_doctor,
    )
    db.add(new_entry)
    db.commit()
    db.refresh(new_entry)
    return new_entry


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