"""
Chat and Conversation Routes

This module provides endpoints for managing chat interactions and conversations.
"""

from fastapi import APIRouter, Depends, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from datetime import date, datetime
from pydantic import BaseModel

# Absolute imports
from database import get_patient_db
from routers.db.patient_models import Conversations
from routers.auth.dependencies import get_current_user, TokenData
from .models import ConversationResponse
from .llm import CerebrasProvider # Using Cerebras for the streaming endpoint


class StreamRequest(BaseModel):
    system_prompt: str
    user_prompt: str


router = APIRouter(prefix="/chat", tags=["Chat"])


@router.post("/stream-response")
async def stream_llm_response(request: StreamRequest):
    """
    Receives a prompt and streams back the response from an LLM provider.
    """
    # Here, you could have logic to select different providers.
    # For now, we'll hardcode the CerebrasProvider.
    llm_provider = CerebrasProvider()
    
    response_generator = llm_provider.query(
        system_prompt=request.system_prompt,
        user_prompt=request.user_prompt
    )
    
    return StreamingResponse(response_generator, media_type="text/plain")


@router.post(
    "/create-dummy",
    response_model=ConversationResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a dummy conversation entry"
)
async def create_dummy_conversation(
    db: Session = Depends(get_patient_db),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Creates a new, fully-populated dummy conversation entry for the logged-in user.
    This is used for testing and development purposes.
    """
    dummy_conversation = Conversations(
        patient_uuid=current_user.sub,
        conversation_state="completed",
        messages=[
            {"speaker": "bot", "text": "Hello, how are you feeling today?"},
            {"speaker": "patient", "text": "I'm feeling a bit nauseous and have a headache."},
            {"speaker": "bot", "text": "I'm sorry to hear that. On a scale of 1-10, how severe is the nausea?"},
            {"speaker": "patient", "text": "About a 4."},
            {"speaker": "bot", "text": "And the headache?"},
            {"speaker": "patient", "text": "A 3."},
        ],
        symptom_list=["nausea", "headache"],
        severity_list={"nausea": 4, "headache": 3},
        longer_summary="The patient is experiencing mild nausea (4/10) and a slight headache (3/10) but is otherwise feeling stable. No other acute symptoms were reported.",
        medication_list=["Ondansetron", "Tylenol"],
        chemo_date=date(2023, 10, 20),
        bulleted_summary="- Symptom: Nausea (Severity: 4/10), - Symptom: Headache (Severity: 3/10), - Medications mentioned: Ondansetron, Tylenol",
        overall_feeling="Slightly unwell but stable.",
        created_at=datetime.utcnow() # Manually set for consistency
    )
    
    db.add(dummy_conversation)
    db.commit()
    db.refresh(dummy_conversation)
    
    return dummy_conversation 