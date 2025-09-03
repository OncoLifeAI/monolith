"""
Doctor Authentication Routes

This module provides authentication endpoints for doctors and staff using AWS Cognito:

Routes:
- POST /auth/doctor/signup: Register a new doctor/staff member
- POST /auth/admin/signup: Register a new admin user
- POST /auth/doctor/login: Authenticate doctor/staff member
- POST /auth/doctor/complete-new-password: Complete password setup for doctors with temporary passwords
- POST /auth/forgot-password: Initiate forgot password flow (sends reset code to email)
- POST /auth/reset-password: Complete password reset using confirmation code
- GET /auth/doctor/profile: Get doctor profile information
- DELETE /auth/remove-staff: Remove staff member (soft delete)
- POST /auth/logout: Client-side logout (formality endpoint)

All routes handle Cognito integration and manage user data in the doctor database tables.
"""

from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.orm import Session
from dotenv import load_dotenv
import os
import boto3
from botocore.exceptions import ClientError
import logging
import hmac
import hashlib
import base64
from pydantic import BaseModel
from uuid import UUID

# Use absolute imports from the 'backend' directory
from routers.auth.models import (
    DoctorSignupRequest,
    DoctorSignupResponse,
    DoctorLoginRequest,
    DoctorLoginResponse,
    DoctorProfileResponse,
    DoctorCompleteNewPasswordRequest,
    DoctorCompleteNewPasswordResponse,
    DoctorForgotPasswordRequest,
    DoctorForgotPasswordResponse,
    DoctorResetPasswordRequest,
    DoctorResetPasswordResponse,
    DeleteStaffRequest,
    AuthTokens,
)
# Import DB session and models
from routers.db.database import get_doctor_db
from routers.db.doctor_models import StaffProfiles, StaffAssociations, AllClinics
# Import shared dependencies
from routers.auth.dependencies import get_cognito_client, get_current_user, TokenData


class LogoutResponse(BaseModel):
    message: str


# Load environment variables
load_dotenv()

# Create router
router = APIRouter(prefix="/auth", tags=["authentication"])

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def _get_secret_hash(username: str, client_id: str, client_secret: str) -> str:
    """Calculates the SecretHash for Cognito API calls."""
    msg = username + client_id
    dig = hmac.new(
        key=client_secret.encode("utf-8"),
        msg=msg.encode("utf-8"),
        digestmod=hashlib.sha256,
    ).digest()
    return base64.b64encode(dig).decode()


@router.post("/logout", response_model=LogoutResponse)
async def logout():
    """
    Client-side logout. The real action is the client deleting the token.
    This endpoint is a formality.
    """
    logger.info("[AUTH] /logout called")
    return {"message": "Logout successful"}


@router.post("/forgot-password", response_model=DoctorForgotPasswordResponse)
async def forgot_password(request: DoctorForgotPasswordRequest):
    """
    Initiate forgot password flow for a doctor/staff member.
    Sends a password reset code to the user's email via AWS Cognito.
    """
    logger.info(f"[AUTH] /forgot-password email={request.email}")
    
    try:
        user_pool_id = os.getenv("COGNITO_USER_POOL_ID")
        client_id = os.getenv("COGNITO_CLIENT_ID")
        client_secret = os.getenv("COGNITO_CLIENT_SECRET")

        if not user_pool_id or not client_id:
            logger.error("[AUTH] /forgot-password missing Cognito envs")
            raise HTTPException(
                status_code=500,
                detail="COGNITO_USER_POOL_ID or COGNITO_CLIENT_ID not configured",
            )

        cognito_client = get_cognito_client()

        # Prepare parameters for forgot password
        params = {
            "ClientId": client_id,
            "Username": request.email,
        }

        # Add secret hash if client secret is configured
        if client_secret:
            params["SecretHash"] = _get_secret_hash(
                request.email, client_id, client_secret
            )

        # Initiate forgot password flow
        response = cognito_client.forgot_password(**params)
        
        logger.info(f"[AUTH] /forgot-password success email={request.email}")
        
        return DoctorForgotPasswordResponse(
            message="Password reset code has been sent to your email",
            email=request.email
        )

    except ClientError as e:
        error_code = e.response["Error"]["Code"]
        error_message = e.response["Error"]["Message"]
        logger.error(f"[AUTH] /forgot-password Cognito error email={request.email} code={error_code} msg='{error_message}'")
        
        if error_code == "UserNotFoundException":
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No account found with this email address"
            )
        elif error_code == "InvalidParameterException":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid request parameters"
            )
        elif error_code == "LimitExceededException":
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Too many requests. Please try again later"
            )
        else:
            raise HTTPException(
                status_code=500, detail=f"AWS Cognito error: {error_message}"
            )
    except Exception as e:
        logger.error(f"[AUTH] /forgot-password unexpected error email={request.email}: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.post("/reset-password", response_model=DoctorResetPasswordResponse)
async def reset_password(request: DoctorResetPasswordRequest):
    """
    Complete the password reset process using the confirmation code sent via email.
    """
    logger.info(f"[AUTH] /reset-password email={request.email}")
    
    try:
        client_id = os.getenv("COGNITO_CLIENT_ID")
        client_secret = os.getenv("COGNITO_CLIENT_SECRET")

        if not client_id:
            logger.error("[AUTH] /reset-password missing COGNITO_CLIENT_ID")
            raise HTTPException(
                status_code=500,
                detail="COGNITO_CLIENT_ID not configured",
            )

        cognito_client = get_cognito_client()

        # Prepare parameters for confirm forgot password
        params = {
            "ClientId": client_id,
            "Username": request.email,
            "ConfirmationCode": request.confirmation_code,
            "Password": request.new_password,
        }

        # Add secret hash if client secret is configured
        if client_secret:
            params["SecretHash"] = _get_secret_hash(
                request.email, client_id, client_secret
            )

        # Confirm forgot password
        response = cognito_client.confirm_forgot_password(**params)
        
        logger.info(f"[AUTH] /reset-password success email={request.email}")
        
        return DoctorResetPasswordResponse(
            message="Password has been reset successfully",
            email=request.email
        )

    except ClientError as e:
        error_code = e.response["Error"]["Code"]
        error_message = e.response["Error"]["Message"]
        logger.error(f"[AUTH] /reset-password Cognito error email={request.email} code={error_code} msg='{error_message}'")
        
        if error_code == "UserNotFoundException":
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No account found with this email address"
            )
        elif error_code == "CodeMismatchException":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid confirmation code"
            )
        elif error_code == "ExpiredCodeException":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Confirmation code has expired"
            )
        elif error_code == "InvalidPasswordException":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"New password does not meet requirements: {error_message}"
            )
        elif error_code == "LimitExceededException":
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Too many requests. Please try again later"
            )
        else:
            raise HTTPException(
                status_code=500, detail=f"AWS Cognito error: {error_message}"
            )
    except Exception as e:
        logger.error(f"[AUTH] /reset-password unexpected error email={request.email}: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.post("/doctor/signup", response_model=DoctorSignupResponse)
async def signup_doctor(
    request: DoctorSignupRequest,
    doctor_db: Session = Depends(get_doctor_db)
):
    """
    Create a new doctor/staff member in AWS Cognito User Pool.
    On success, creates records in StaffProfiles and StaffAssociations tables.
    """
    logger.info(f"[AUTH] /doctor/signup email={request.email} role={request.role}")
    
    # Check if a staff member with this email already exists
    existing_staff = doctor_db.query(StaffProfiles).filter(
        StaffProfiles.email_address == request.email,
        StaffProfiles.is_archived == False
    ).first()

    if existing_staff:
        logger.warning(f"[AUTH] /doctor/signup conflict email={request.email}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"A staff member with email {request.email} already exists."
        )

    try:
        user_pool_id = os.getenv("COGNITO_USER_POOL_ID")
        if not user_pool_id:
            logger.error("[AUTH] /doctor/signup missing COGNITO_USER_POOL_ID")
            raise HTTPException(
                status_code=500, detail="COGNITO_USER_POOL_ID not configured"
            )

        cognito_client = get_cognito_client()

        user_attributes = [
            {"Name": "email", "Value": request.email},
            {"Name": "email_verified", "Value": "true"},
            {"Name": "given_name", "Value": request.first_name},
            {"Name": "family_name", "Value": request.last_name},
            {"Name": "custom:role", "Value": request.role},
        ]

        if request.npi_number:
            user_attributes.append({"Name": "custom:npi_number", "Value": request.npi_number})

        response = cognito_client.admin_create_user(
            UserPoolId=user_pool_id,
            Username=request.email,
            UserAttributes=user_attributes,
            ForceAliasCreation=False,
        )
        logger.info(f"[AUTH] /doctor/signup created in Cognito email={request.email}")

        # Extract the UUID (sub) that Cognito automatically generates
        user_sub = None
        for attribute in response["User"]["Attributes"]:
            if attribute["Name"] == "sub":
                user_sub = attribute["Value"]
                break
        
        if not user_sub:
            logger.error(f"[AUTH] /doctor/signup missing sub in Cognito response email={request.email}")
            raise HTTPException(status_code=500, detail="User created in Cognito, but failed to retrieve UUID.")

        # Create the staff profile record in StaffProfiles table
        new_staff_profile = StaffProfiles(
            staff_uuid=user_sub,
            email_address=request.email,
            first_name=request.first_name,
            last_name=request.last_name,
            role=request.role,
            npi_number=request.npi_number,
        )

        doctor_db.add(new_staff_profile)
        doctor_db.commit()  # Commit staff profile first
        
        logger.info(f"[AUTH] /doctor/signup staff profile created uuid={user_sub}")

        # Handle physician associations - support multiple physicians
        physician_uuids = request.physician_uuids or []
        clinic_uuid = request.clinic_uuid
        
        # If no physicians specified, find existing physicians or use self-association
        if not physician_uuids:
            existing_physicians = doctor_db.query(StaffProfiles).filter(
                StaffProfiles.role == 'physician',
                StaffProfiles.is_archived == False
            ).all()
            
            if existing_physicians:
                physician_uuids = [p.staff_uuid for p in existing_physicians]
                logger.info(f"[AUTH] /doctor/signup using {len(physician_uuids)} existing physicians")
            else:
                # If no physicians exist, use self-association
                physician_uuids = [user_sub]
                logger.info(f"[AUTH] /doctor/signup no physicians found, using self-association {user_sub}")
        
        # If no clinic specified, find existing clinic
        if not clinic_uuid:
            clinic = doctor_db.query(AllClinics).first()
            if clinic:
                clinic_uuid = clinic.uuid
                logger.info(f"[AUTH] /doctor/signup using default clinic {clinic_uuid}")
            else:
                logger.error(f"[AUTH] /doctor/signup no clinic found and none provided")
                raise HTTPException(status_code=500, detail="No clinic available for association")

        # Create associations for all specified physicians
        for physician_uuid in physician_uuids:
            new_association = StaffAssociations(
                staff_uuid=user_sub,
                physician_uuid=physician_uuid,
                clinic_uuid=clinic_uuid
            )
            doctor_db.add(new_association)
            logger.info(f"[AUTH] /doctor/signup associated staff {user_sub} with physician {physician_uuid} at clinic {clinic_uuid}")

        doctor_db.commit()
        
        logger.info(f"[AUTH] /doctor/signup associations created uuid={user_sub}")

        return DoctorSignupResponse(
            message=f"Doctor/Staff member {request.email} created successfully. A temporary password has been sent to their email.",
            email=request.email,
            user_status=response["User"]["UserStatus"],
            staff_uuid=user_sub,
        )

    except ClientError as e:
        error_code = e.response["Error"]["Code"]
        error_message = e.response["Error"]["Message"]
        logger.error(f"[AUTH] /doctor/signup Cognito error code={error_code} message='{error_message}' email={request.email}")
        raise HTTPException(
            status_code=500, detail=f"AWS Cognito error: {error_message}"
        )
    except Exception as e:
        logger.error(f"[AUTH] /doctor/signup unexpected error email={request.email}: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.post("/admin/signup", response_model=DoctorSignupResponse)
async def signup_admin(
    request: DoctorSignupRequest,
    doctor_db: Session = Depends(get_doctor_db)
):
    """
    Create a new admin user in AWS Cognito User Pool.
    This endpoint automatically sets the role to 'admin' regardless of the request.
    """
    logger.info(f"[AUTH] /admin/signup email={request.email}")
    
    # Check if a staff member with this email already exists
    existing_staff = doctor_db.query(StaffProfiles).filter(
        StaffProfiles.email_address == request.email,
        StaffProfiles.is_archived == False
    ).first()

    if existing_staff:
        logger.warning(f"[AUTH] /admin/signup conflict email={request.email}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"A staff member with email {request.email} already exists."
        )

    try:
        user_pool_id = os.getenv("COGNITO_USER_POOL_ID")
        if not user_pool_id:
            logger.error("[AUTH] /admin/signup missing COGNITO_USER_POOL_ID")
            raise HTTPException(
                status_code=500, detail="COGNITO_USER_POOL_ID not configured"
            )

        cognito_client = get_cognito_client()

        # Force role to be 'admin' for this endpoint
        user_attributes = [
            {"Name": "email", "Value": request.email},
            {"Name": "email_verified", "Value": "true"},
            {"Name": "given_name", "Value": request.first_name},
            {"Name": "family_name", "Value": request.last_name},
            {"Name": "custom:role", "Value": "admin"},
        ]

        if request.npi_number:
            user_attributes.append({"Name": "custom:npi_number", "Value": request.npi_number})

        response = cognito_client.admin_create_user(
            UserPoolId=user_pool_id,
            Username=request.email,
            UserAttributes=user_attributes,
            ForceAliasCreation=False,
        )
        logger.info(f"[AUTH] /admin/signup created in Cognito email={request.email}")

        # Extract the UUID (sub) that Cognito automatically generates
        user_sub = None
        for attribute in response["User"]["Attributes"]:
            if attribute["Name"] == "sub":
                user_sub = attribute["Value"]
                break
        
        if not user_sub:
            logger.error(f"[AUTH] /admin/signup missing sub in Cognito response email={request.email}")
            raise HTTPException(status_code=500, detail="User created in Cognito, but failed to retrieve UUID.")

        # Create the admin profile record in StaffProfiles table
        new_admin_profile = StaffProfiles(
            staff_uuid=user_sub,
            email_address=request.email,
            first_name=request.first_name,
            last_name=request.last_name,
            role="admin",  # Always set to admin
            npi_number=request.npi_number,
        )

        doctor_db.add(new_admin_profile)
        
        # Handle physician associations - support multiple physicians
        physician_uuids = request.physician_uuids or []
        clinic_uuid = request.clinic_uuid
        
        # If no physicians specified, find existing physicians or use self-association
        if not physician_uuids:
            existing_physicians = doctor_db.query(StaffProfiles).filter(
                StaffProfiles.role == 'physician',
                StaffProfiles.is_archived == False
            ).all()
            
            if existing_physicians:
                physician_uuids = [p.staff_uuid for p in existing_physicians]
                logger.info(f"[AUTH] /admin/signup using {len(physician_uuids)} existing physicians")
            else:
                # If no physicians exist, use self-association
                physician_uuids = [user_sub]
                logger.info(f"[AUTH] /admin/signup no physicians found, using self-association {user_sub}")
        
        # If no clinic specified, find existing clinic
        if not clinic_uuid:
            clinic = doctor_db.query(AllClinics).first()
            if clinic:
                clinic_uuid = clinic.uuid
                logger.info(f"[AUTH] /admin/signup using default clinic {clinic_uuid}")
            else:
                logger.error(f"[AUTH] /admin/signup no clinic found and none provided")
                raise HTTPException(status_code=500, detail="No clinic available for association")

        # Create associations for all specified physicians
        for physician_uuid in physician_uuids:
            new_association = StaffAssociations(
                staff_uuid=user_sub,
                physician_uuid=physician_uuid,
                clinic_uuid=clinic_uuid
            )
            doctor_db.add(new_association)
            logger.info(f"[AUTH] /admin/signup associated admin {user_sub} with physician {physician_uuid} at clinic {clinic_uuid}")
        
        doctor_db.commit()
        
        logger.info(f"[AUTH] /admin/signup created admin user {user_sub}")

        return DoctorSignupResponse(
            message=f"Admin user {request.email} created successfully. A temporary password has been sent to their email.",
            email=request.email,
            user_status=response["User"]["UserStatus"],
            staff_uuid=user_sub,
        )

    except ClientError as e:
        error_code = e.response["Error"]["Code"]
        error_message = e.response["Error"]["Message"]
        logger.error(f"[AUTH] /admin/signup Cognito error code={error_code} message='{error_message}' email={request.email}")
        raise HTTPException(
            status_code=500, detail=f"AWS Cognito error: {error_message}"
        )
    except Exception as e:
        logger.error(f"[AUTH] /admin/signup unexpected error email={request.email}: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.delete("/remove-staff", status_code=status.HTTP_204_NO_CONTENT, summary="Remove staff member")
async def remove_staff(
    request: DeleteStaffRequest,
    doctor_db: Session = Depends(get_doctor_db)
):
    """
    Removes a staff member from the system.
    - Soft deletes all related records in the database
    - Deletes the user from AWS Cognito
    - This is an irreversible action for the database records
    """
    logger.warning(f"[AUTH] /remove-staff start email={request.email}")
    
    # Find the staff member by email
    staff_profile = doctor_db.query(StaffProfiles).filter(
        StaffProfiles.email_address == request.email,
        StaffProfiles.is_archived == False
    ).first()
    
    if not staff_profile:
        logger.error(f"[AUTH] /remove-staff staff not found email={request.email}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail=f"Staff member not found with email: {request.email}"
        )
    
    staff_uuid = staff_profile.staff_uuid
    staff_email = staff_profile.email_address
    logger.warning(f"[AUTH] /remove-staff removing staff_uuid={staff_uuid} email={staff_email}")

    # --- Step 1: Soft-delete all related records in the database ---
    try:
        # Soft delete staff associations
        doctor_db.query(StaffAssociations).filter(
            StaffAssociations.staff_uuid == staff_uuid
        ).update({"is_archived": True})
        
        # Soft delete staff profile
        doctor_db.query(StaffProfiles).filter(
            StaffProfiles.staff_uuid == staff_uuid
        ).update({"is_archived": True})
        
        logger.info(f"Database records soft-deleted for staff {staff_uuid}")
    except Exception as e:
        doctor_db.rollback()
        logger.error(f"[AUTH] /remove-staff DB cleanup failed staff_uuid={staff_uuid} error={e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail="Could not remove staff data. Please try again."
        )

    # --- Step 2: Delete the user from Cognito (unless skipped) ---
    if not request.skip_aws:
        try:
            cognito_client = get_cognito_client()
            cognito_client.admin_delete_user(
                UserPoolId=os.getenv("COGNITO_USER_POOL_ID"),
                Username=staff_email
            )
            logger.info(f"[AUTH] /remove-staff deleted from Cognito staff_uuid={staff_uuid}")
        except ClientError as e:
            doctor_db.rollback()
            logger.error(f"[AUTH] /remove-staff Cognito delete failed staff_uuid={staff_uuid} error={e.response['Error']['Message']}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
                detail="Failed to delete staff from authentication service."
            )
    else:
        logger.info(f"[AUTH] /remove-staff skipped AWS Cognito deletion staff_uuid={staff_uuid}")
    
    # --- Step 3: Commit the transaction ---
    doctor_db.commit()
    logger.warning(f"[AUTH] /remove-staff complete staff_uuid={staff_uuid} email={staff_email}")
    
    return


@router.post("/doctor/login", response_model=DoctorLoginResponse)
async def doctor_login(request: DoctorLoginRequest):
    """
    Validate if a doctor/staff member's email and password is valid for login.
    If a temporary password is used, it returns a session token for the password change flow.
    """
    logger.info(f"[AUTH] /doctor/login email={request.email}")
    try:
        user_pool_id = os.getenv("COGNITO_USER_POOL_ID")
        client_id = os.getenv("COGNITO_CLIENT_ID")
        client_secret = os.getenv("COGNITO_CLIENT_SECRET")

        if not user_pool_id or not client_id:
            logger.error("[AUTH] /doctor/login missing Cognito envs")
            raise HTTPException(
                status_code=500,
                detail="COGNITO_USER_POOL_ID or COGNITO_CLIENT_ID not configured",
            )

        cognito_client = get_cognito_client()

        auth_parameters = {"USERNAME": request.email, "PASSWORD": request.password}

        if client_secret:
            auth_parameters["SECRET_HASH"] = _get_secret_hash(
                request.email, client_id, client_secret
            )

        auth_response = cognito_client.admin_initiate_auth(
            UserPoolId=user_pool_id,
            ClientId=client_id,
            AuthFlow="ADMIN_USER_PASSWORD_AUTH",
            AuthParameters=auth_parameters,
        )

        logger.info(f"[AUTH] /doctor/login Cognito response keys={list(auth_response.keys())}")

        if "AuthenticationResult" in auth_response:
            logger.info(f"[AUTH] /doctor/login success email={request.email}")
            auth_result = auth_response["AuthenticationResult"]
            tokens = AuthTokens(
                access_token=auth_result["AccessToken"],
                refresh_token=auth_result["RefreshToken"],
                id_token=auth_result["IdToken"],
                token_type=auth_result["TokenType"],
            )
            return DoctorLoginResponse(
                valid=True,
                message="Login credentials are valid",
                user_status="CONFIRMED",
                tokens=tokens,
                requiresPasswordChange=False
            )

        elif "ChallengeName" in auth_response:
            challenge_name = auth_response["ChallengeName"]
            session = auth_response.get("Session")
            logger.info(f"[AUTH] /doctor/login challenge email={request.email} name={challenge_name}")

            if challenge_name == "NEW_PASSWORD_REQUIRED":
                return DoctorLoginResponse(
                    valid=True,
                    message="Login credentials are valid but password change is required.",
                    user_status="FORCE_CHANGE_PASSWORD",
                    session=session,
                    requiresPasswordChange=True
                )
            else:
                return DoctorLoginResponse(
                    valid=True,
                    message=f"Login credentials are valid but challenge required: {challenge_name}",
                    user_status="CHALLENGE_REQUIRED",
                    session=session,
                    requiresPasswordChange=False
                )
        else:
            logger.warning(f"[AUTH] /doctor/login unexpected response email={request.email}")
            return DoctorLoginResponse(valid=False, message="Unexpected authentication response")

    except ClientError as e:
        error_code = e.response["Error"]["Code"]
        error_message = e.response["Error"]["Message"]
        logger.error(f"[AUTH] /doctor/login Cognito error email={request.email} code={error_code} msg='{error_message}'")
        if error_code == "NotAuthorizedException":
            return DoctorLoginResponse(valid=False, message="Invalid email or password")
        elif error_code == "UserNotFoundException":
            return DoctorLoginResponse(valid=False, message="User not found")
        else:
            raise HTTPException(
                status_code=500, detail=f"AWS Cognito error: {error_message}"
            )
    except Exception as e:
        logger.error(f"[AUTH] /doctor/login unexpected error email={request.email}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error")


@router.post("/doctor/complete-new-password", response_model=DoctorCompleteNewPasswordResponse)
async def doctor_complete_new_password(request: DoctorCompleteNewPasswordRequest):
    """
    Complete the new password setup for a doctor/staff member who was created with a temporary password.
    """
    logger.info(f"[AUTH] /doctor/complete-new-password email={request.email}")
    try:
        user_pool_id = os.getenv("COGNITO_USER_POOL_ID")
        client_id = os.getenv("COGNITO_CLIENT_ID")
        client_secret = os.getenv("COGNITO_CLIENT_SECRET")

        if not user_pool_id or not client_id:
            logger.error("[AUTH] /doctor/complete-new-password missing Cognito envs")
            raise HTTPException(
                status_code=500,
                detail="COGNITO_USER_POOL_ID or COGNITO_CLIENT_ID not configured",
            )

        cognito_client = get_cognito_client()

        challenge_responses = {
            "USERNAME": request.email,
            "NEW_PASSWORD": request.new_password,
        }

        if client_secret:
            challenge_responses["SECRET_HASH"] = _get_secret_hash(
                request.email, client_id, client_secret
            )

        response = cognito_client.admin_respond_to_auth_challenge(
            UserPoolId=user_pool_id,
            ClientId=client_id,
            ChallengeName="NEW_PASSWORD_REQUIRED",
            Session=request.session,
            ChallengeResponses=challenge_responses,
        )

        if "AuthenticationResult" in response:
            logger.info(f"[AUTH] /doctor/complete-new-password success email={request.email}")
            auth_result = response["AuthenticationResult"]
            tokens = AuthTokens(
                access_token=auth_result["AccessToken"],
                refresh_token=auth_result["RefreshToken"],
                id_token=auth_result["IdToken"],
                token_type=auth_result["TokenType"],
            )
            return DoctorCompleteNewPasswordResponse(
                message="Password successfully changed and doctor authenticated.",
                tokens=tokens,
            )
        else:
            logger.error(f"[AUTH] /doctor/complete-new-password unexpected response email={request.email}")
            raise HTTPException(
                status_code=400,
                detail="Could not set new password. Unexpected response from authentication service.",
            )

    except ClientError as e:
        error_code = e.response["Error"]["Code"]
        error_message = e.response["Error"]["Message"]
        logger.error(
            f"[AUTH] /doctor/complete-new-password Cognito error email={request.email} code={error_code} msg='{error_message}'"
        )
        if error_code in [
            "NotAuthorizedException",
            "CodeMismatchException",
            "ExpiredCodeException",
        ]:
            raise HTTPException(
                status_code=400,
                detail="Invalid or expired session. Please try logging in again.",
            )
        if error_code == "InvalidPasswordException":
            raise HTTPException(
                status_code=400,
                detail=f"New password does not meet requirements: {error_message}",
            )
        raise HTTPException(
            status_code=500, detail=f"AWS Cognito error: {error_message}"
        )

    except Exception as e:
        logger.error(
            f"[AUTH] /doctor/complete-new-password unexpected error email={request.email}: {str(e)}"
        )
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/doctor/profile", response_model=DoctorProfileResponse)
async def get_doctor_profile(
    current_user: TokenData = Depends(get_current_user),
    doctor_db: Session = Depends(get_doctor_db)
):
    """
    Get the current doctor/staff member's profile information.
    """
    logger.info(f"[AUTH] /doctor/profile requested for user_id={current_user.sub}")
    
    # Look up the staff profile using the Cognito user ID
    staff_profile = doctor_db.query(StaffProfiles).filter(
        StaffProfiles.staff_uuid == current_user.sub,
        StaffProfiles.is_archived == False
    ).first()
    
    if not staff_profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Staff profile not found"
        )
    
    # Get clinic name if available through associations
    clinic_name = None
    if staff_profile.role != 'physician':
        # For non-physicians, find their clinic through StaffAssociations
        association = doctor_db.query(StaffAssociations).filter(
            StaffAssociations.staff_uuid == current_user.sub,
            StaffAssociations.is_archived == False
        ).first()
        
        if association:
            clinic = doctor_db.query(AllClinics).filter(
                AllClinics.uuid == association.clinic_uuid
            ).first()
            if clinic:
                clinic_name = clinic.clinic_name
    
    return DoctorProfileResponse(
        staff_uuid=staff_profile.staff_uuid,
        email_address=staff_profile.email_address,
        first_name=staff_profile.first_name,
        last_name=staff_profile.last_name,
        role=staff_profile.role,
        npi_number=staff_profile.npi_number,
        clinic_name=clinic_name
    )