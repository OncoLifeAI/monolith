from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from typing import List, Optional
from datetime import date
import uuid

from routers.auth.dependencies import get_current_user
from routers.db.database import get_patient_db, get_doctor_db
from routers.db.patient_models import PatientInfo, PatientPhysicianAssociations
from routers.db.doctor_models import StaffAssociations
from .models import PatientResponse, PaginatedPatientsResponse, AddPatientRequest, EditPatientRequest

router = APIRouter(prefix="/patients", tags=["patients"])

# --- Helper Functions ---

def get_physician_uuid_from_staff(staff_uuid: str, db: Session) -> Optional[str]:
    """Get physician UUID from staff UUID using StaffAssociations table."""
    staff_assoc = db.query(StaffAssociations).filter(
        StaffAssociations.staff_uuid == staff_uuid
    ).first()
    return staff_assoc.physician_uuid if staff_assoc else None

def verify_staff_access(staff_uuid: str, physician_uuid: str, clinic_uuid: str, db: Session) -> bool:
    """Verify that the staff member has access to the specified physician and clinic."""
    staff_assoc = db.query(StaffAssociations).filter(
        and_(
            StaffAssociations.staff_uuid == staff_uuid,
            StaffAssociations.physician_uuid == physician_uuid,
            StaffAssociations.clinic_uuid == clinic_uuid
        )
    ).first()
    return staff_assoc is not None

# --- Routes ---

@router.get("/get-patients", response_model=PaginatedPatientsResponse)
async def get_patients(
    page: int = Query(1, ge=1, description="Page number (1-based)"),
    page_size: int = Query(20, ge=1, le=100, description="Number of patients per page"),
    patient_db: Session = Depends(get_patient_db),
    doctor_db: Session = Depends(get_doctor_db),
    current_user = Depends(get_current_user)
):
    """
    Get paginated list of patients for the authenticated staff member.
    Uses the authenticated user's ID to find the associated physician, then patients are fetched.
    """
    # Use the authenticated user's ID as staff_uuid
    staff_uuid = current_user.sub
    physician_uuid = get_physician_uuid_from_staff(staff_uuid, doctor_db)
    if not physician_uuid:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Staff member not found or not associated with any physician"
        )
    
    # Get total count of patients for this physician
    total_count = patient_db.query(PatientPhysicianAssociations).filter(
        and_(
            PatientPhysicianAssociations.physician_uuid == physician_uuid,
            PatientPhysicianAssociations.is_deleted == False
        )
    ).count()
    
    # Calculate pagination
    total_pages = (total_count + page_size - 1) // page_size
    offset = (page - 1) * page_size
    
    # Get patient associations for this physician with pagination
    patient_assocs = patient_db.query(PatientPhysicianAssociations).filter(
        and_(
            PatientPhysicianAssociations.physician_uuid == physician_uuid,
            PatientPhysicianAssociations.is_deleted == False
        )
    ).offset(offset).limit(page_size).all()
    
    # Get patient details for each association
    patients = []
    for assoc in patient_assocs:
        patient_info = patient_db.query(PatientInfo).filter(
            and_(
                PatientInfo.uuid == assoc.patient_uuid,
                PatientInfo.is_deleted == False
            )
        ).first()
        
        if patient_info:
            print(f"[PATIENTS API] Processing patient: {patient_info.uuid}, mrn: {patient_info.mrn}, first_name: {patient_info.first_name}")
            patients.append(PatientResponse(
                uuid=str(patient_info.uuid),
                mrn=patient_info.mrn or "",
                first_name=patient_info.first_name or "",
                last_name=patient_info.last_name or "",
                email=patient_info.email_address,
                dob=patient_info.dob,
                sex=patient_info.sex
            ))
    
    return PaginatedPatientsResponse(
        patients=patients,
        total_count=total_count,
        page=page,
        page_size=page_size,
        total_pages=total_pages
    )

@router.post("/add-patient", response_model=dict)
async def add_patient(
    request: AddPatientRequest,
    patient_db: Session = Depends(get_patient_db),
    doctor_db: Session = Depends(get_doctor_db),
    current_user = Depends(get_current_user)
):
    """
    Add a new patient. Requires authentication and staff access verification.
    """
    # Verify that the current user (staff member) has access to the specified physician and clinic
    if not verify_staff_access(current_user.sub, request.physician_uuid, request.clinic_uuid, doctor_db):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Staff member not authorized for this physician/clinic combination."
        )
    
    # Check if patient with same MRN already exists
    existing_mrn = patient_db.query(PatientInfo).filter(
        and_(
            PatientInfo.mrn == request.mrn,
            PatientInfo.is_deleted == False
        )
    ).first()
    if existing_mrn:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Patient with this MRN already exists"
        )
    
    # Check if patient with same email already exists
    existing_email = patient_db.query(PatientInfo).filter(
        and_(
            PatientInfo.email_address == request.email_address,
            PatientInfo.is_deleted == False
        )
    ).first()
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Patient with this email already exists"
        )
    
    # Create new patient
    new_patient = PatientInfo(
        uuid=uuid.uuid4(),
        email_address=request.email_address,
        first_name=request.first_name,
        last_name=request.last_name,
        sex=request.sex,
        dob=request.dob,
        mrn=request.mrn,
        ethnicity=request.ethnicity,
        phone_number=request.phone_number,
        disease_type=request.disease_type,
        treatment_type=request.treatment_type
    )
    
    patient_db.add(new_patient)
    
    # Create patient-physician association
    patient_assoc = PatientPhysicianAssociations(
        patient_uuid=new_patient.uuid,
        physician_uuid=uuid.UUID(request.physician_uuid),
        clinic_uuid=uuid.UUID(request.clinic_uuid)
    )
    
    patient_db.add(patient_assoc)
    patient_db.commit()
    
    return {
        "message": "Patient added successfully",
        "patient_uuid": str(new_patient.uuid),
        "mrn": new_patient.mrn
    }

@router.patch("/edit-patient/{patient_uuid}", response_model=dict)
async def edit_patient(
    patient_uuid: str,
    request: EditPatientRequest,
    patient_db: Session = Depends(get_patient_db),
    current_user = Depends(get_current_user)
):
    """
    Edit/update a patient. Cannot change email, MRN, doctor, or clinic.
    """
    # Get the patient
    patient = patient_db.query(PatientInfo).filter(
        and_(
            PatientInfo.uuid == patient_uuid,
            PatientInfo.is_deleted == False
        )
    ).first()
    
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found"
        )
    
    # Update allowed fields
    if request.first_name is not None:
        patient.first_name = request.first_name
    if request.last_name is not None:
        patient.last_name = request.last_name
    if request.sex is not None:
        patient.sex = request.sex
    if request.dob is not None:
        patient.dob = request.dob
    if request.ethnicity is not None:
        patient.ethnicity = request.ethnicity
    if request.phone_number is not None:
        patient.phone_number = request.phone_number
    if request.disease_type is not None:
        patient.disease_type = request.disease_type
    if request.treatment_type is not None:
        patient.treatment_type = request.treatment_type
    
    patient_db.commit()
    
    return {
        "message": "Patient updated successfully",
        "patient_uuid": str(patient.uuid)
    }
