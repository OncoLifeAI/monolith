from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import and_, desc
from typing import List, Optional

from routers.auth.dependencies import get_current_user, TokenData
from routers.db.database import get_patient_db, get_doctor_db
from routers.db.doctor_models import StaffAssociations
from routers.db.patient_models import PatientInfo, PatientPhysicianAssociations, Conversations
from .models import PaginatedDashboardResponse, DashboardPatientInfo, ConversationSummary

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

# Helpers

def get_physician_uuid_from_staff(staff_uuid: str, doctor_db: Session) -> Optional[str]:
    staff_assoc = doctor_db.query(StaffAssociations).filter(
        StaffAssociations.staff_uuid == staff_uuid
    ).first()
    return staff_assoc.physician_uuid if staff_assoc else None

@router.get("/get-dashboard-info", response_model=PaginatedDashboardResponse)
async def get_dashboard_info(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    patient_db: Session = Depends(get_patient_db),
    doctor_db: Session = Depends(get_doctor_db),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Returns paginated dashboard information for all patients under the physician
    associated with the authenticated staff member. For each patient, includes full name,
    DOB, MRN, and the latest conversation's bulleted_summary and symptom_list.
    """
    print(f"[DASHBOARD API] Authenticated user: {current_user.sub}, email: {current_user.email}")
    
    # Use the authenticated user's ID as staff_uuid
    staff_uuid = current_user.sub
    physician_uuid = get_physician_uuid_from_staff(staff_uuid, doctor_db)
    if not physician_uuid:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Staff not associated with any physician")

    # Count patients associated to this physician
    total_count = patient_db.query(PatientPhysicianAssociations).filter(
        and_(
            PatientPhysicianAssociations.physician_uuid == physician_uuid,
            PatientPhysicianAssociations.is_deleted == False
        )
    ).count()

    total_pages = (total_count + page_size - 1) // page_size
    offset = (page - 1) * page_size

    associations = patient_db.query(PatientPhysicianAssociations).filter(
        and_(
            PatientPhysicianAssociations.physician_uuid == physician_uuid,
            PatientPhysicianAssociations.is_deleted == False
        )
    ).offset(offset).limit(page_size).all()

    patients: List[DashboardPatientInfo] = []

    for assoc in associations:
        info: Optional[PatientInfo] = patient_db.query(PatientInfo).filter(
            and_(PatientInfo.uuid == assoc.patient_uuid, PatientInfo.is_deleted == False)
        ).first()

        if not info:
            continue

        full_name = f"{info.first_name or ''} {info.last_name or ''}".strip()

        # Fetch latest conversation for this patient by created_at
        last_convo = patient_db.query(Conversations).filter(
            Conversations.patient_uuid == assoc.patient_uuid
        ).order_by(desc(Conversations.created_at)).first()

        convo_summary = ConversationSummary(
            bulleted_summary=getattr(last_convo, "bulleted_summary", None) if last_convo else None,
            symptom_list=getattr(last_convo, "symptom_list", None) if last_convo else None,
        )

        patients.append(DashboardPatientInfo(
            patient_uuid=str(info.uuid),
            full_name=full_name,
            dob=info.dob,
            mrn=info.mrn,
            last_conversation=convo_summary
        ))

    return PaginatedDashboardResponse(
        patients=patients,
        total_count=total_count,
        page=page,
        page_size=page_size,
        total_pages=total_pages
    )
