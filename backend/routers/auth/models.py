from pydantic import BaseModel, EmailStr
from typing import Optional

class SignupRequest(BaseModel):
    email: EmailStr
    first_name: str
    last_name: str

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
    email: EmailStr 