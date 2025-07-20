from pydantic import BaseModel
from typing import Optional
from datetime import date, time

class PatientProfileResponse(BaseModel):
    first_name: str
    last_name: str
    email_address: str
    phone_number: Optional[str] = None
    date_of_birth: Optional[date] = None
    chemotherapy_day: Optional[str] = "Thursday" # Placeholder
    reminder_time: Optional[time] = None
    doctor_name: Optional[str] = None
    clinic_name: Optional[str] = None

    class Config:
        orm_mode = True
