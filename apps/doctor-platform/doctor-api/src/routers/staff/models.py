from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
import uuid

class ClinicAssociationResponse(BaseModel):
    physician_uuid: uuid.UUID
    clinic_uuid: uuid.UUID

class AddPhysicianRequest(BaseModel):
    email_address: EmailStr
    first_name: str
    last_name: str
    npi_number: str
    clinic_uuid: uuid.UUID

class AddStaffRequest(BaseModel):
    email_address: EmailStr
    first_name: str
    last_name: str
    role: str = Field(..., pattern="^(staff|admin)$")
    physician_uuids: List[uuid.UUID]
    clinic_uuid: uuid.UUID

class AddClinicRequest(BaseModel):
    clinic_name: str
    address: str
    phone_number: str
    fax_number: str

# New models for additional staff routes
class StaffResponse(BaseModel):
    staff_uuid: str
    first_name: str
    last_name: str
    email_address: str
    role: str

class PaginatedStaffResponse(BaseModel):
    staff: List[StaffResponse]
    total_count: int
    page: int
    page_size: int
    total_pages: int

class AddStaffInfoRequest(BaseModel):
    email_address: EmailStr
    first_name: str
    last_name: str
    role: str
    npi_number: Optional[str] = None
    physician_uuid: uuid.UUID
    clinic_uuid: uuid.UUID

class EditStaffRequest(BaseModel):
    email_address: Optional[EmailStr] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    role: Optional[str] = None
    npi_number: Optional[str] = None
    physician_uuid: Optional[uuid.UUID] = None
    clinic_uuid: Optional[uuid.UUID] = None 