from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_
import uuid
from typing import Optional
# Relative imports
from routers.db.database import get_doctor_db
from routers.db.doctor_models import StaffAssociations, StaffProfiles, AllClinics
from routers.auth.dependencies import get_current_user, TokenData
from .models import (
    ClinicAssociationResponse, 
    AddPhysicianRequest, 
    AddStaffRequest, 
    AddClinicRequest,
    StaffResponse,
    PaginatedStaffResponse,
    AddStaffInfoRequest,
    EditStaffRequest
)

router = APIRouter(prefix="/staff", tags=["Staff and Clinic Data"])

# --- Helper Functions ---

def get_clinic_uuid_from_staff(staff_uuid: str, db: Session) -> Optional[str]:
    """Get clinic UUID from staff UUID using StaffAssociations table."""
    staff_assoc = db.query(StaffAssociations).filter(
        StaffAssociations.staff_uuid == staff_uuid
    ).first()
    return staff_assoc.clinic_uuid if staff_assoc else None

# --- New Routes ---

@router.get("/get-staff", response_model=PaginatedStaffResponse)
async def get_staff(
    staff_uuid: str = Query(..., description="Staff UUID to get clinic staff for"),
    page: int = Query(1, ge=1, description="Page number (1-based)"),
    page_size: int = Query(20, ge=1, le=100, description="Number of staff per page"),
    db: Session = Depends(get_doctor_db),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Get paginated list of all staff members in the same clinic.
    Uses staff_uuid to find the clinic, then returns all staff in that clinic.
    """
    # Get clinic UUID from the provided staff UUID
    clinic_uuid = get_clinic_uuid_from_staff(staff_uuid, db)
    if not clinic_uuid:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Staff member not found or not associated with any clinic"
        )
    
    # Get total count of staff in this clinic
    total_count = db.query(StaffAssociations).filter(
        and_(
            StaffAssociations.clinic_uuid == clinic_uuid,
            StaffAssociations.is_deleted == False
        )
    ).distinct(StaffAssociations.staff_uuid).count()
    
    # Calculate pagination
    total_pages = (total_count + page_size - 1) // page_size
    offset = (page - 1) * page_size
    
    # Get staff associations for this clinic with pagination
    staff_assocs = db.query(StaffAssociations).filter(
        and_(
            StaffAssociations.clinic_uuid == clinic_uuid,
            StaffAssociations.is_deleted == False
        )
    ).distinct(StaffAssociations.staff_uuid).offset(offset).limit(page_size).all()
    
    # Get staff details for each association
    staff_list = []
    for assoc in staff_assocs:
        staff_profile = db.query(StaffProfiles).filter(
            StaffProfiles.staff_uuid == assoc.staff_uuid
        ).first()
        
        if staff_profile:
            staff_list.append(StaffResponse(
                staff_uuid=str(staff_profile.staff_uuid),
                first_name=staff_profile.first_name or "",
                last_name=staff_profile.last_name or "",
                email_address=staff_profile.email_address,
                role=staff_profile.role or ""
            ))
    
    return PaginatedStaffResponse(
        staff=staff_list,
        total_count=total_count,
        page=page,
        page_size=page_size,
        total_pages=total_pages
    )

@router.post(
    "/add-clinic",
    status_code=status.HTTP_201_CREATED,
    summary="Add a new clinic"
)
async def add_clinic(
    request: AddClinicRequest,
    db: Session = Depends(get_doctor_db),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Creates a new clinic in the AllClinics table.
    """
    new_clinic = AllClinics(
        clinic_name=request.clinic_name,
        address=request.address,
        phone_number=request.phone_number,
        fax_number=request.fax_number
    )
    db.add(new_clinic)
    db.commit()
    db.refresh(new_clinic)

    return {"message": "Clinic added successfully", "clinic_uuid": new_clinic.uuid}


@router.post(
    "/add-physician",
    status_code=status.HTTP_201_CREATED,
    summary="Add a new physician"
)
async def add_physician(
    request: AddPhysicianRequest,
    db: Session = Depends(get_doctor_db),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Creates a new physician profile and self-associates them in the StaffAssociations table.
    """
    # Create the profile first to get the generated staff_uuid
    new_physician_profile = StaffProfiles(
        email_address=request.email_address,
        first_name=request.first_name,
        last_name=request.last_name,
        npi_number=request.npi_number,
        role='physician'
    )
    db.add(new_physician_profile)
    db.commit()
    db.refresh(new_physician_profile)

    # Now create the self-association
    new_association = StaffAssociations(
        staff_uuid=new_physician_profile.staff_uuid,
        physician_uuid=new_physician_profile.staff_uuid, # Self-association
        clinic_uuid=request.clinic_uuid
    )
    db.add(new_association)
    db.commit()

    return {"message": "Physician added successfully", "staff_uuid": new_physician_profile.staff_uuid}

@router.post("/add-staff", status_code=status.HTTP_201_CREATED)
async def add_staff_info(
    request: AddStaffInfoRequest,
    db: Session = Depends(get_doctor_db),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Add a new staff member with all fields from staff info table.
    Creates both staff profile and staff association.
    """
    # Check if staff with same email already exists
    existing_staff = db.query(StaffProfiles).filter(
        StaffProfiles.email_address == request.email_address
    ).first()
    if existing_staff:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Staff member with this email already exists"
        )
    
    # Create new staff profile
    new_staff = StaffProfiles(
        email_address=request.email_address,
        first_name=request.first_name,
        last_name=request.last_name,
        role=request.role,
        npi_number=request.npi_number
    )
    db.add(new_staff)
    db.commit()
    db.refresh(new_staff)
    
    # Create staff association
    staff_assoc = StaffAssociations(
        staff_uuid=new_staff.staff_uuid,
        physician_uuid=request.physician_uuid,
        clinic_uuid=request.clinic_uuid
    )
    db.add(staff_assoc)
    db.commit()
    
    return {
        "message": "Staff member added successfully",
        "staff_uuid": str(new_staff.staff_uuid)
    }

@router.patch("/edit-staff/{staff_uuid}")
async def edit_staff(
    staff_uuid: str,
    request: EditStaffRequest,
    db: Session = Depends(get_doctor_db),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Edit staff member. Can change all fields including physician and clinic associations.
    """
    # Get the staff profile
    staff_profile = db.query(StaffProfiles).filter(
        StaffProfiles.staff_uuid == staff_uuid
    ).first()
    
    if not staff_profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Staff member not found"
        )
    
    # Update staff profile fields
    if request.email_address is not None:
        # Check if new email already exists (excluding current staff)
        existing_email = db.query(StaffProfiles).filter(
            and_(
                StaffProfiles.email_address == request.email_address,
                StaffProfiles.staff_uuid != staff_uuid
            )
        ).first()
        if existing_email:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email address already in use by another staff member"
            )
        staff_profile.email_address = request.email_address
    
    if request.first_name is not None:
        staff_profile.first_name = request.first_name
    if request.last_name is not None:
        staff_profile.last_name = request.last_name
    if request.role is not None:
        staff_profile.role = request.role
    if request.npi_number is not None:
        staff_profile.npi_number = request.npi_number
    
    # Update staff associations if provided
    if request.physician_uuid is not None or request.clinic_uuid is not None:
        # Get existing association
        existing_assoc = db.query(StaffAssociations).filter(
            StaffAssociations.staff_uuid == staff_uuid
        ).first()
        
        if existing_assoc:
            # Update existing association
            if request.physician_uuid is not None:
                existing_assoc.physician_uuid = request.physician_uuid
            if request.clinic_uuid is not None:
                existing_assoc.clinic_uuid = request.clinic_uuid
        else:
            # Create new association if none exists
            new_assoc = StaffAssociations(
                staff_uuid=staff_uuid,
                physician_uuid=request.physician_uuid or existing_assoc.physician_uuid,
                clinic_uuid=request.clinic_uuid or existing_assoc.clinic_uuid
            )
            db.add(new_assoc)
    
    db.commit()
    
    return {
        "message": "Staff member updated successfully",
        "staff_uuid": str(staff_uuid)
    }


@router.get(
    "/clinic-from-physician/{physician_uuid}",
    response_model=ClinicAssociationResponse,
    summary="Get a clinic UUID from a physician UUID"
)
async def get_clinic_from_physician(
    physician_uuid: uuid.UUID,
    db: Session = Depends(get_doctor_db),
    current_user: TokenData = Depends(get_current_user) # Add authentication
):
    """
    Finds the clinic associated with a given physician by looking up their
    association in the Staff_Associations table.
    """
    association = db.query(StaffAssociations).filter(
        StaffAssociations.physician_uuid == physician_uuid
    ).first()

    if not association:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No clinic association found for physician UUID: {physician_uuid}"
        )

    return ClinicAssociationResponse(
        physician_uuid=association.physician_uuid,
        clinic_uuid=association.clinic_uuid
    ) 