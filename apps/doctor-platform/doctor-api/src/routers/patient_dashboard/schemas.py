"""
Patient Dashboard Schemas

This module contains Pydantic models for patient dashboard API requests and responses.
"""

from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import date
from uuid import UUID


class ConversationDataResponse(BaseModel):
    """Response model for conversation data"""
    conversation_uuid: UUID
    conversation_date: date
    symptom_list: Optional[List[str]] = None
    severity_list: Optional[Dict[str, int]] = None
    medication_list: Optional[List[Dict[str, Any]]] = None
    conversation_state: str
    overall_feeling: Optional[str] = None


class PatientConversationsResponse(BaseModel):
    """Response model for patient conversations data"""
    patient_uuid: UUID
    date_range_start: date
    date_range_end: date
    total_conversations: int
    conversations: List[ConversationDataResponse]


class PatientConversationsSummaryResponse(BaseModel):
    """Response model for patient conversations summary"""
    patient_uuid: str
    date_range: Dict[str, date]
    total_conversations: int
    symptom_summary: Dict[str, Any]
    medication_summary: Dict[str, Any]
    conversation_summary: Dict[str, Any]
