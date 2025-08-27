"""
Patient Dashboard Routes

This module provides endpoints for doctors to view patient data and analytics.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from datetime import date, datetime
from uuid import UUID
import logging

# Import database session and models
from routers.db.database import get_doctor_db
from routers.db.patient_models import Conversations as PatientConversations
from routers.auth.dependencies import get_current_user, TokenData

# Import schemas
from .schemas import (
    ConversationDataResponse,
    PatientConversationsResponse,
    PatientConversationsSummaryResponse
)

# Create router
router = APIRouter(prefix="/patient-dashboard", tags=["patient-dashboard"])

# Configure logging
logger = logging.getLogger(__name__)


@router.get(
    "/{patient_uuid}/conversations",
    response_model=PatientConversationsResponse,
    summary="Get patient conversations data within date range"
)
async def get_patient_conversations(
    patient_uuid: UUID,
    start_date: date = Query(..., description="Start date for the range (YYYY-MM-DD)"),
    end_date: date = Query(..., description="End date for the range (YYYY-MM-DD)"),
    current_user: TokenData = Depends(get_current_user),
    doctor_db: Session = Depends(get_doctor_db)
):
    """
    Fetch medication_list and severity_list for all conversations within a date range for a specific patient.
    
    This endpoint allows doctors to view patient conversation data including:
    - Symptoms discussed
    - Severity ratings for each symptom
    - Medications mentioned
    - Overall conversation state and feeling
    
    Args:
        patient_uuid: UUID of the patient
        start_date: Start date for the range (inclusive)
        end_date: End date for the range (inclusive)
        current_user: Authenticated doctor/staff member
        doctor_db: Database session
    
    Returns:
        PatientConversationsResponse with conversation data and metadata
    """
    logger.info(f"[PATIENT-DASHBOARD] /{patient_uuid}/conversations requested by user {current_user.sub}")
    logger.info(f"[PATIENT-DASHBOARD] Date range: {start_date} to {end_date}")
    
    try:
        # Convert dates to datetime for database query
        start_datetime = datetime.combine(start_date, datetime.min.time())
        end_datetime = datetime.combine(end_date, datetime.max.time())
        
        logger.info(f"[PATIENT-DASHBOARD] Querying conversations between {start_datetime} and {end_datetime}")
        
        # Query conversations within the date range
        conversations = doctor_db.query(PatientConversations).filter(
            PatientConversations.patient_uuid == patient_uuid,
            PatientConversations.created_at >= start_datetime,
            PatientConversations.created_at <= end_datetime
        ).order_by(PatientConversations.created_at.desc()).all()
        
        logger.info(f"[PATIENT-DASHBOARD] Found {len(conversations)} conversations for patient {patient_uuid}")
        
        # Convert conversations to response format
        conversation_data = []
        for conv in conversations:
            logger.debug(f"[PATIENT-DASHBOARD] Processing conversation {conv.uuid}")
            logger.debug(f"[PATIENT-DASHBOARD] Conversation state: {conv.conversation_state}")
            logger.debug(f"[PATIENT-DASHBOARD] Symptom list: {conv.symptom_list}")
            logger.debug(f"[PATIENT-DASHBOARD] Severity list: {conv.severity_list}")
            logger.debug(f"[PATIENT-DASHBOARD] Medication list: {conv.medication_list}")
            
            conversation_data.append(ConversationDataResponse(
                conversation_uuid=conv.uuid,
                conversation_date=conv.created_at.date(),
                symptom_list=conv.symptom_list,
                severity_list=conv.severity_list,
                medication_list=conv.medication_list,
                conversation_state=conv.conversation_state,
                overall_feeling=conv.overall_feeling
            ))
        
        # Calculate summary statistics
        total_symptoms = set()
        total_medications = set()
        severity_summary = {}
        
        for conv in conversations:
            if conv.symptom_list:
                total_symptoms.update(conv.symptom_list)
            
            if conv.medication_list:
                for med in conv.medication_list:
                    if isinstance(med, dict) and 'medicationName' in med:
                        total_medications.add(med['medicationName'])
            
            if conv.severity_list:
                for symptom, severity in conv.severity_list.items():
                    if symptom not in severity_summary:
                        severity_summary[symptom] = []
                    severity_summary[symptom].append(severity)
        
        # Calculate average severity for each symptom
        avg_severity = {}
        for symptom, severities in severity_summary.items():
            if severities:
                avg_severity[symptom] = sum(severities) / len(severities)
        
        logger.info(f"[PATIENT-DASHBOARD] Summary stats - Total symptoms: {len(total_symptoms)}, Total medications: {len(total_medications)}")
        logger.info(f"[PATIENT-DASHBOARD] Average severity by symptom: {avg_severity}")
        
        return PatientConversationsResponse(
            patient_uuid=patient_uuid,
            date_range_start=start_date,
            date_range_end=end_date,
            total_conversations=len(conversations),
            conversations=conversation_data
        )
        
    except Exception as e:
        logger.error(f"[PATIENT-DASHBOARD] Error fetching conversations for patient {patient_uuid}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch patient conversations: {str(e)}"
        )


@router.get(
    "/{patient_uuid}/conversations/summary",
    response_model=PatientConversationsSummaryResponse,
    summary="Get summary statistics for patient conversations"
)
async def get_patient_conversations_summary(
    patient_uuid: UUID,
    start_date: date = Query(..., description="Start date for the range (YYYY-MM-DD)"),
    end_date: date = Query(..., description="End date for the range (YYYY-MM-DD)"),
    current_user: TokenData = Depends(get_current_user),
    doctor_db: Session = Depends(get_doctor_db)
):
    """
    Get summary statistics for patient conversations within a date range.
    
    Returns aggregated data including:
    - Most common symptoms
    - Average severity ratings
    - Most mentioned medications
    - Conversation completion rates
    """
    logger.info(f"[PATIENT-DASHBOARD] /{patient_uuid}/conversations/summary requested by user {current_user.sub}")
    
    try:
        # Convert dates to datetime for database query
        start_datetime = datetime.combine(start_date, datetime.min.time())
        end_datetime = datetime.combine(end_date, datetime.max.time())
        
        # Query conversations within the date range
        conversations = doctor_db.query(PatientConversations).filter(
            PatientConversations.patient_uuid == patient_uuid,
            PatientConversations.created_at >= start_datetime,
            PatientConversations.created_at <= end_datetime
        ).all()
        
        if not conversations:
            return PatientConversationsSummaryResponse(
                patient_uuid=str(patient_uuid),
                date_range={"start": start_date, "end": end_date},
                total_conversations=0,
                symptom_summary={
                    "total_unique_symptoms": 0,
                    "top_symptoms": [],
                    "average_severity_by_symptom": {}
                },
                medication_summary={
                    "total_unique_medications": 0,
                    "top_medications": []
                },
                conversation_summary={
                    "states": {},
                    "feelings": {}
                }
            )
        
        # Aggregate data
        symptom_counts = {}
        severity_data = {}
        medication_counts = {}
        conversation_states = {}
        feelings = {}
        
        for conv in conversations:
            # Count symptoms
            if conv.symptom_list:
                for symptom in conv.symptom_list:
                    symptom_counts[symptom] = symptom_counts.get(symptom, 0) + 1
            
            # Aggregate severity data
            if conv.severity_list:
                for symptom, severity in conv.severity_list.items():
                    if symptom not in severity_data:
                        severity_data[symptom] = []
                    severity_data[symptom].append(severity)
            
            # Count medications
            if conv.medication_list:
                for med in conv.medication_list:
                    if isinstance(med, dict) and 'medicationName' in med:
                        med_name = med['medicationName']
                        medication_counts[med_name] = medication_counts.get(med_name, 0) + 1
            
            # Count conversation states
            state = conv.conversation_state or 'unknown'
            conversation_states[state] = conversation_states.get(state, 0) + 1
            
            # Count feelings
            if conv.overall_feeling:
                feelings[conv.overall_feeling] = feelings.get(conv.overall_feeling, 0) + 1
        
        # Calculate averages
        avg_severity = {}
        for symptom, severities in severity_data.items():
            if severities:
                avg_severity[symptom] = round(sum(severities) / len(severities), 2)
        
        # Sort by frequency
        top_symptoms = sorted(symptom_counts.items(), key=lambda x: x[1], reverse=True)[:10]
        top_medications = sorted(medication_counts.items(), key=lambda x: x[1], reverse=True)[:10]
        
        return PatientConversationsSummaryResponse(
            patient_uuid=str(patient_uuid),
            date_range={"start": start_date, "end": end_date},
            total_conversations=len(conversations),
            symptom_summary={
                "total_unique_symptoms": len(symptom_counts),
                "top_symptoms": top_symptoms,
                "average_severity_by_symptom": avg_severity
            },
            medication_summary={
                "total_unique_medications": len(medication_counts),
                "top_medications": top_medications
            },
            conversation_summary={
                "states": conversation_states,
                "feelings": feelings
            }
        )
        
    except Exception as e:
        logger.error(f"[PATIENT-DASHBOARD] Error fetching summary for patient {patient_uuid}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch patient summary: {str(e)}"
        )
