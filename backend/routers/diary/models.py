from pydantic import BaseModel
from datetime import datetime
import uuid

class DiaryEntrySchema(BaseModel):
    id: int
    created_at: datetime
    diary_entry: str
    entry_uuid: uuid.UUID
    marked_for_doctor: bool
    
    class Config:
        orm_mode = True

class DiaryEntryCreate(BaseModel):
    diary_entry: str
    marked_for_doctor: bool = False

class DiaryEntryUpdate(BaseModel):
    diary_entry: str 