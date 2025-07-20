from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional
import uuid

class DiaryEntrySchema(BaseModel):
    id: int
    created_at: datetime
    title: Optional[str] = None
    diary_entry: str
    entry_uuid: uuid.UUID
    marked_for_doctor: bool
    
    class Config:
        orm_mode = True

class DiaryEntryCreate(BaseModel):
    title: Optional[str] = None
    diary_entry: str
    marked_for_doctor: bool = False

class DiaryEntryUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1)
    diary_entry: Optional[str] = Field(None, min_length=1) 