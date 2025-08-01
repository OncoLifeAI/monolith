"""
Conversation Summary Routes

This module provides endpoints for retrieving conversation summaries and details:

Routes:
- GET /summaries/{year}/{month}: Fetch conversation summaries for a specific month and year
- GET /summaries/{conversation_uuid}: Fetch longer summary by conversationUUID

All routes require authentication and operate on the logged-in user's data.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import extract
from typing import List
import uuid

# Absolute imports
from database import get_patient_db
from routers.db.patient_models import Conversations
from routers.auth.dependencies import get_current_user, TokenData
from routers.chat.constants import ConversationState
from .models import ConversationSummarySchema, ConversationDetailSchema

router = APIRouter(prefix="/summaries", tags=["Conversation Summaries"])


@router.get(
    "/{year}/{month}",
    response_model=List[ConversationSummarySchema],
    summary="Fetch conversation summaries by month"
)
async def get_summaries_by_month(
    year: int,
    month: int,
    db: Session = Depends(get_patient_db),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Fetches a list of conversation summaries for the logged-in user
    for a specific year and month. Only returns completed conversations.
    """
    if not 1 <= month <= 12:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Month must be between 1 and 12.")

    summaries = db.query(Conversations).filter(
        Conversations.patient_uuid == current_user.sub,
        Conversations.conversation_state == ConversationState.COMPLETED,
        extract('year', Conversations.created_at) == year,
        extract('month', Conversations.created_at) == month
    ).order_by(Conversations.created_at.desc()).all()

    return summaries


@router.get(
    "/{conversation_uuid}",
    response_model=ConversationDetailSchema,
    summary="Fetch a single conversation's details"
)
async def get_conversation_details(
    conversation_uuid: uuid.UUID,
    db: Session = Depends(get_patient_db),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Fetches the full details for a single conversation by its UUID.
    Ensures the conversation belongs to the logged-in user and is completed.
    """
    conversation = db.query(Conversations).filter(
        Conversations.uuid == conversation_uuid,
        Conversations.patient_uuid == current_user.sub,
        Conversations.conversation_state == ConversationState.COMPLETED
    ).first()

    if not conversation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found or you do not have permission to view it.")

    return conversation 