from pydantic import BaseModel, EmailStr
from typing import Optional, List

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

class DoctorAuthTokens(BaseModel):
    access_token: str
    refresh_token: str
    id_token: str
    token_type: str

class DoctorLoginResponse(BaseModel):
    valid: bool
    message: str
    user_status: Optional[str] = None
    session: Optional[str] = None
    tokens: Optional[DoctorAuthTokens] = None
    requiresPasswordChange: Optional[bool] = False

class DoctorCompleteNewPasswordRequest(BaseModel):
    email: EmailStr
    new_password: str
    session: str
    
class DoctorCompleteNewPasswordResponse(BaseModel):
    message: str
    tokens: DoctorAuthTokens

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

# Legacy patient models (keeping for backward compatibility)
class SignupRequest(BaseModel):
    email: EmailStr
    first_name: str
    last_name: str
    physician_email: Optional[EmailStr] = None

class SignupResponse(BaseModel):
    message: str
    email: str
    user_status: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class AuthTokens(BaseModel):
    access_token: str
    refresh_token: str
    id_token: str
    token_type: str

class LoginResponse(BaseModel):
    valid: bool
    message: str
    user_status: Optional[str] = None
    session: Optional[str] = None
    tokens: Optional[AuthTokens] = None

class CompleteNewPasswordRequest(BaseModel):
    email: EmailStr
    new_password: str
    session: str
    
class CompleteNewPasswordResponse(BaseModel):
    message: str
    tokens: AuthTokens

class DeletePatientRequest(BaseModel):
    email: Optional[EmailStr] = None
    uuid: Optional[str] = None
    skip_aws: Optional[bool] = False

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ForgotPasswordResponse(BaseModel):
    message: str
    email: str

class ResetPasswordRequest(BaseModel):
    email: EmailStr
    confirmation_code: str
    new_password: str

class ResetPasswordResponse(BaseModel):
    message: str
    email: str 