from pydantic import BaseModel, Json
from typing import List, Dict, Any
from datetime import datetime, date
import uuid

class ConversationResponse(BaseModel):
    """
    Response model for a conversation entry.
    Reflects the structure of the Conversations table.
    """
    uuid: uuid.UUID
    created_at: datetime
    patient_uuid: uuid.UUID
    conversation_state: str
    messages: List[Dict[str, Any]]
    symptom_list: List[str]
    severity_list: Dict[str, int]
    longer_summary: str
    medication_list: List[str]
    chemo_date: date
    bulleted_summary: str
    overall_feeling: str

    class Config:
        orm_mode = True 