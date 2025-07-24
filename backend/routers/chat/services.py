import json
import os
from uuid import UUID
from typing import Dict, Any, List, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import func, cast, Date
from datetime import date, datetime, time

# Absolute imports
from .models import (
    Chat, Message, WebSocketMessageIn, WebSocketMessageOut, 
    ProcessResponse, ConversationUpdate, ConnectionEstablished
)
from .constants import ConversationState
from routers.db.patient_models import Conversations as ChatModel, Messages as MessageModel
from .llm.gpt import GPT4oProvider
from .llm.context import ContextLoader


# ===============================================================================
# Core Conversation Logic (with real database queries)
# ===============================================================================

class ConversationService:
    def __init__(self, db: Session):
        self.db = db

    def delete_chat(self, chat_uuid: UUID, patient_uuid: UUID):
        """Deletes a chat conversation after verifying ownership."""
        chat = self.db.query(ChatModel).filter(
            ChatModel.uuid == chat_uuid, 
            ChatModel.patient_uuid == patient_uuid
        ).first()

        if not chat:
            raise ValueError("Chat not found or access denied.")
        
        self.db.delete(chat)
        self.db.commit()
        return

    def create_chat(self, patient_uuid: UUID, commit: bool = True) -> Tuple[ChatModel, Dict[str, Any]]:
        """
        Creates a new chat, saves a system message, and updates the state.
        Can be part of a larger transaction if commit=False.
        """
        # 1. Create the parent Conversation object
        new_chat = ChatModel(
            patient_uuid=patient_uuid,
            conversation_state=ConversationState.CHEMO_CHECK_SENT
        )
        self.db.add(new_chat)
        
        if commit:
            self.db.commit()
            self.db.refresh(new_chat)
            
        initial_question = {
            "text": "Did you get chemotherapy today?",
            "type": "button_prompt",
            "options": ["Yes", "No", "I had it recently, but didn't record it"],
        }
        return new_chat, initial_question

    def _determine_next_state_and_response(self, chat: ChatModel, message: WebSocketMessageIn) -> Tuple[str, WebSocketMessageOut]:
        """The main state machine for the conversation."""
        current_state = chat.conversation_state
        next_state = current_state
        response_content = "I'm not sure how to respond to that. Can you try again?"
        response_options = []
        response_type = "text"

        if current_state == ConversationState.COMPLETED:
            response_content = "This conversation has ended. Please start a new one if you need assistance."
            response_type = "text"
            next_state = ConversationState.COMPLETED
        elif current_state == ConversationState.CHEMO_CHECK_SENT:
            next_state = ConversationState.SYMPTOM_SELECTION_SENT
            response_content = "Thank you. What symptoms are you experiencing? You can select multiple."
            response_type = "multi_select"
            response_options = [
                "Fever", "Nausea", "Vomiting", "Diarrhea", "Constipation", "Fatigue",
                "Headache", "Mouth Sores", "Rash", "Shortness of Breath", "Other"
            ]
        elif current_state == ConversationState.SYMPTOM_SELECTION_SENT:
            next_state = ConversationState.FOLLOWUP_QUESTIONS
            symptoms = [s.strip() for s in message.content.split(',')]
            chat.symptom_list = symptoms # Update the model directly
            
            context = {"patient_state": {"current_symptoms": symptoms}}
            response_content = self._query_knowledge_base(context)
            response_type = "text"
        elif current_state == ConversationState.FOLLOWUP_QUESTIONS:
            chat_history = self.db.query(MessageModel).filter(MessageModel.chat_uuid == chat.uuid).order_by(MessageModel.id.desc()).limit(10).all()
            context = {
                "patient_state": {"current_symptoms": chat.symptom_list},
                "latest_input": message.content,
                "history": [Message.from_orm(m).model_dump(mode='json') for m in reversed(chat_history)]
            }
            response_content = self._query_knowledge_base(context)
            response_type = "text"
        
        assistant_response = WebSocketMessageOut(
            type="assistant_message",
            message_type=response_type,
            content=response_content,
            options=response_options,
        )
        return next_state, assistant_response

    def get_or_create_today_session(self, patient_uuid: UUID) -> Tuple[ChatModel, List[MessageModel], bool]:
        """
        Gets the latest chat for today, or creates one transactionally.
        """
        # Define "today" as a timezone-naive date range from midnight to midnight.
        # This is more robust than casting a timezone-aware timestamp.
        today_start = datetime.combine(date.today(), time.min)
        today_end = datetime.combine(date.today(), time.max)
        
        latest_chat = self.db.query(ChatModel).filter(
            ChatModel.patient_uuid == patient_uuid,
            ChatModel.created_at >= today_start,
            ChatModel.created_at <= today_end
        ).order_by(ChatModel.created_at.desc()).first()

        if latest_chat:
            return latest_chat, latest_chat.messages, False
        else:
            new_chat, initial_question = self.create_chat(patient_uuid, commit=False)
            
            # The first visible message for the user
            first_bot_message = MessageModel(
                sender="assistant",
                message_type=initial_question["type"],
                content=initial_question["text"],
                structured_data={"options": initial_question["options"]},
                conversation=new_chat
            )
            self.db.add(first_bot_message)
            self.db.commit()
            self.db.refresh(new_chat)
            
            # The returned messages should include the system message and the first bot message
            return new_chat, new_chat.messages, True

    async def process_message(self, chat_uuid: UUID, message: WebSocketMessageIn) -> ProcessResponse:
        """Processes a message, updating state and replying in a single transaction."""
        chat = self.db.query(ChatModel).filter(ChatModel.uuid == chat_uuid).first()
        if not chat:
            # This should ideally not happen if client gets UUID from backend
            raise ValueError("Chat not found.")

        # 1. Create the user message object and save it
        user_msg = MessageModel(
            chat_uuid=chat_uuid,
            sender="user",
            message_type="button_response",
            content=message.content,
            structured_data=message.structured_data
        )
        self.db.add(user_msg)
        self.db.flush() # Ensure the user message gets an ID before the assistant replies

        # 2. Determine next state and assistant response details
        new_state, assistant_response_details = self._determine_next_state_and_response(chat, message)
        chat.conversation_state = new_state
        
        # 3. Create the assistant message object
        assistant_msg = MessageModel(
             chat_uuid=chat_uuid,
             sender="assistant",
             message_type=assistant_response_details.message_type,
             content=assistant_response_details.content,
             structured_data={"options": assistant_response_details.options} if assistant_response_details.options else None
        )
        
        # 4. Add all new objects to the session and commit once
        self.db.add_all([chat, assistant_msg])
        self.db.commit()
        
        # 5. Prepare the full response payload
        return ProcessResponse(
            user_message_saved=Message.from_orm(user_msg),
            assistant_response=Message.from_orm(assistant_msg),
            conversation_updated=ConversationUpdate(new_state=new_state, symptom_list=chat.symptom_list)
        )

    def get_connection_ack(self, chat_uuid: UUID) -> ConnectionEstablished:
        """Acknowledges a WebSocket connection with the current chat state."""
        # This message is for backend confirmation, not for display in the UI.
        # It can be logged on the client if needed.
        chat = self.db.query(ChatModel).filter(ChatModel.uuid == chat_uuid).first()
        if not chat:
            return None

        return ConnectionEstablished(
            content="Connection acknowledged.",
            chat_state={
                "conversation_state": chat.conversation_state
            }
        )
        
    def _query_knowledge_base(self, context: Dict[str, Any]) -> str:
        """
        Queries the GPT-4o model with the provided context and document knowledge base.
        """
        print("KB_REAL: Querying GPT-4o with real context...")
        
        # 1. Load the knowledge base context from files
        model_inputs_path = os.path.join(os.path.dirname(__file__), 'model_inputs')
        context_loader = ContextLoader(model_inputs_path)
        
        system_prompt = context_loader.load_system_prompt()
        knowledge_base_context = context_loader.load_context()

        # 2. Construct the user prompt for the LLM
        # We combine the general knowledge base with the specific conversation context
        user_prompt_parts = [
            "### Knowledge Base Context ###",
            knowledge_base_context,
            "\n### Conversation Context ###",
            f"Current Symptoms: {context.get('patient_state', {}).get('current_symptoms', [])}",
            f"Chat History (most recent messages): {json.dumps(context.get('history', []), indent=2)}",
            f"\n### User's Latest Message ###",
            f"User: \"{context.get('latest_input', '')}\"",
            "\nBased on all of the above context, what is the single best follow-up question to ask the user right now? Your response should be ONLY the question text."
        ]
        user_prompt = "\n".join(user_prompt_parts)

        # 3. Call the LLM provider
        llm_provider = GPT4oProvider()
        response_generator = llm_provider.query(
            system_prompt=system_prompt,
            user_prompt=user_prompt
        )

        # 4. Consume the streaming generator to get a single string response
        full_response = "".join([chunk for chunk in response_generator])
        
        print(f"KB_REAL: Received response from GPT-4o: '{full_response}'")
        return full_response if full_response else "I'm not sure what to ask next. Can you tell me more?"
