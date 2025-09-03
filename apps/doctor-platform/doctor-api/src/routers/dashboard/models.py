from pydantic import BaseModel
from typing import List, Optional
from datetime import date

class ConversationSummary(BaseModel):
    bulleted_summary: Optional[str] = None
    symptom_list: Optional[list] = None
    conversation_state: Optional[str] = None

class DashboardPatientInfo(BaseModel):
    patient_uuid: str
    full_name: str
    dob: Optional[date] = None
    mrn: Optional[str] = None
    last_conversation: ConversationSummary

class PaginatedDashboardResponse(BaseModel):
    patients: List[DashboardPatientInfo]
    total_count: int
    page: int
    page_size: int
    total_pages: int
