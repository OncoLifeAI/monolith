from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import date

class PatientResponse(BaseModel):
    uuid: str
    mrn: str
    first_name: str
    last_name: str
    email: str
    dob: Optional[date]
    sex: Optional[str]

class PaginatedPatientsResponse(BaseModel):
    patients: List[PatientResponse]
    total_count: int
    page: int
    page_size: int
    total_pages: int

class AddPatientRequest(BaseModel):
    email_address: EmailStr
    first_name: str
    last_name: str
    sex: Optional[str] = None
    dob: Optional[date] = None
    mrn: str
    ethnicity: Optional[str] = None
    phone_number: Optional[str] = None
    disease_type: Optional[str] = None
    treatment_type: Optional[str] = None
    physician_uuid: str
    clinic_uuid: str

class EditPatientRequest(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    sex: Optional[str] = None
    dob: Optional[date] = None
    ethnicity: Optional[str] = None
    phone_number: Optional[str] = None
    disease_type: Optional[str] = None
    treatment_type: Optional[str] = None
