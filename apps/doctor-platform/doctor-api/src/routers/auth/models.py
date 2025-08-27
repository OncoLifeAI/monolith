from pydantic import BaseModel, EmailStr
from typing import Optional, List

# Shared models
class AuthTokens(BaseModel):
    access_token: str
    refresh_token: str
    id_token: str
    token_type: str

# Doctor-specific models
class DoctorSignupRequest(BaseModel):
    email: EmailStr
    first_name: str
    last_name: str
    role: str = "admin"  # Default to admin
    npi_number: Optional[str] = None
    physician_uuids: Optional[List[str]] = None  # List of physician UUIDs to associate with
    clinic_uuid: Optional[str] = None    # Default to None, will use existing clinic if not provided

class DoctorSignupResponse(BaseModel):
    message: str
    email: str
    user_status: str
    staff_uuid: str

class DoctorLoginRequest(BaseModel):
    email: EmailStr
    password: str

class DoctorLoginResponse(BaseModel):
    valid: bool
    message: str
    user_status: Optional[str] = None
    session: Optional[str] = None
    tokens: Optional[AuthTokens] = None
    requiresPasswordChange: Optional[bool] = False

class DoctorCompleteNewPasswordRequest(BaseModel):
    email: EmailStr
    new_password: str
    session: str
    
class DoctorCompleteNewPasswordResponse(BaseModel):
    message: str
    tokens: AuthTokens

class DoctorForgotPasswordRequest(BaseModel):
    email: EmailStr

class DoctorForgotPasswordResponse(BaseModel):
    message: str
    email: str

class DoctorResetPasswordRequest(BaseModel):
    email: EmailStr
    confirmation_code: str
    new_password: str

class DoctorResetPasswordResponse(BaseModel):
    message: str
    email: str

class DoctorProfileResponse(BaseModel):
    staff_uuid: str
    email_address: str
    first_name: str
    last_name: str
    role: str
    npi_number: Optional[str] = None
    clinic_name: Optional[str] = None

# Staff management models
class DeleteStaffRequest(BaseModel):
    email: EmailStr
    skip_aws: Optional[bool] = False