from pydantic import BaseModel
from typing import List
from datetime import datetime
import uuid

class ConversationSummarySchema(BaseModel):
    uuid: uuid.UUID
    created_at: datetime
    bulleted_summary: str | None = None
    overall_feeling: str | None = None

    class Config:
        orm_mode = True

class ConversationDetailSchema(ConversationSummarySchema):
    longer_summary: str | None = None
    messages: List | None = None # Assuming messages are a list of dicts
    # Add other fields you want to expose from the Conversations model
    symptom_list: List | None = None
    severity_list: dict | None = None
    medication_list: dict | None = None 