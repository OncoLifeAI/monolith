import json
import os
from uuid import UUID
from typing import Dict, Any, List, Tuple, AsyncGenerator, Generator
from sqlalchemy.orm import Session
from sqlalchemy import func, cast, Date
from datetime import date, datetime, time

# Absolute imports
from .models import (
    Chat, Message, WebSocketMessageIn, WebSocketMessageOut, 
    ProcessResponse, ConversationUpdate, ConnectionEstablished, WebSocketMessageChunk, WebSocketStreamEnd
)
from .constants import ConversationState
from routers.db.patient_models import Conversations as ChatModel, Messages as MessageModel
from .llm.gpt import GPT4oProvider
from .llm.groq import GroqProvider
from .llm.cerebras import CerebrasProvider
from .llm.context import ContextLoader

LLM_PROVIDER = "gpt4o"  # Options: "gpt4o", "groq", "cerebras"

def get_llm_provider():
    """Factory function to get the configured LLM provider."""
    if LLM_PROVIDER == "gpt4o":
        return GPT4oProvider()
    elif LLM_PROVIDER == "groq":
        return GroqProvider()
    elif LLM_PROVIDER == "cerebras":
        return CerebrasProvider()
    else:
        raise ValueError(f"Unknown LLM provider: {LLM_PROVIDER}")


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
            chat.symptom_list = list(set((chat.symptom_list or []) + symptoms)) # Append unique symptoms
            self.db.commit()
            
            context = {"patient_state": {"current_symptoms": chat.symptom_list}}
            response_content = self._query_knowledge_base(context)

        elif current_state == ConversationState.FOLLOWUP_QUESTIONS:
            chat_history = self.db.query(MessageModel).filter(MessageModel.chat_uuid == chat.uuid).order_by(MessageModel.id.desc()).limit(20).all()
            context = {
                "patient_state": {"current_symptoms": chat.symptom_list},
                "latest_input": message.content,
                "history": [Message.from_orm(m).model_dump(mode='json') for m in reversed(chat_history)]
            }
            
            llm_response = self._query_knowledge_base(context)

            if "DONE" in llm_response:
                response_content = "DONE"
            else:
                # Check if the LLM is asking the user to add more symptoms
                if "anything else you would like to discuss" in llm_response.lower():
                    response_type = "button_prompt"
                    response_options = ["Yes", "No"]
                
                response_content = llm_response

            next_state = ConversationState.FOLLOWUP_QUESTIONS
        
        assistant_response = WebSocketMessageOut(
            type="assistant_message",
            message_type=response_type,
            content=response_content,
            options=response_options,
        )
        return next_state, assistant_response

    def _summarize_and_complete_chat(self, chat: ChatModel) -> AsyncGenerator[Any, None]:
        """
        Streams a summary to the user, updates the chat, and finalizes the conversation.
        """
        print("Streaming summary and completing chat...")
        
        # 1. Create the final assistant message object in the DB to get an ID
        final_assistant_msg = MessageModel(
            chat_uuid=chat.uuid,
            sender="assistant",
            message_type="text",
            content="", # Start with empty content
        )
        self.db.add(final_assistant_msg)
        self.db.commit()
        self.db.refresh(final_assistant_msg)

        # 2. Yield the initial part of the message to the user first
        initial_summary_text = "You are done with your conversation for today! Here is a brief summary of our conversation:\n"
        yield WebSocketMessageChunk(message_id=final_assistant_msg.id, content=initial_summary_text)

        # 3. Stream the bulleted summary from the LLM
        full_history = self.db.query(MessageModel).filter(MessageModel.chat_uuid == chat.uuid).order_by(MessageModel.id.asc()).all()
        history_text = "\n".join([f"{msg.sender}: {msg.content}" for msg in full_history])
        
        summarization_prompt = (
            "Please analyze the following conversation history and generate ONLY a concise, bulleted summary of the key points."
            f"\n\nConversation History:\n{history_text}"
        )

        llm_provider = get_llm_provider()
        summary_generator = llm_provider.query(system_prompt="You are a clinical summarization assistant.", user_prompt=summarization_prompt)
        
        bulleted_summary = ""
        for chunk in summary_generator:
            bulleted_summary += chunk
            yield WebSocketMessageChunk(message_id=final_assistant_msg.id, content=chunk)

        yield WebSocketStreamEnd(message_id=final_assistant_msg.id)

        # 4. Update the chat object with the final summary and state
        chat.bulleted_summary = bulleted_summary
        chat.conversation_state = ConversationState.COMPLETED
        final_assistant_msg.content = initial_summary_text + bulleted_summary # Save the full text
        self.db.commit()

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

    def force_create_today_session(self, patient_uuid: UUID) -> Tuple[ChatModel, List[MessageModel], bool]:
        """
        Creates a new chat for today, regardless of whether one already exists.
        """
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
        
        # The returned messages should include the first bot message
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

    async def process_message_stream(self, chat_uuid: UUID, message: WebSocketMessageIn) -> AsyncGenerator[Any, None]:
        """
        Processes a message, yielding a full message for simple responses or
        streaming chunks for LLM-generated text.
        """
        chat = self.db.query(ChatModel).filter(ChatModel.uuid == chat_uuid).first()
        if not chat:
            # In a real app, you might yield an error message here
            return

        # 1. Save the user's message and yield it back to the client immediately
        user_msg = MessageModel(
            chat_uuid=chat_uuid,
            sender="user",
            message_type=message.message_type,
            content=message.content,
        )
        self.db.add(user_msg)
        self.db.commit()
        self.db.refresh(user_msg)
        yield Message.from_orm(user_msg)

        # 2. Determine next state and initial response details
        new_state, response_details = self._determine_next_state_and_response(chat, message)
        chat.conversation_state = new_state
        
        # 3. Create the initial assistant message object in the DB
        assistant_msg = MessageModel(
            chat_uuid=chat_uuid,
            sender="assistant",
            message_type=response_details.message_type,
            content="", # Start with empty content
            structured_data={"options": response_details.options} if response_details.options else None
        )
        self.db.add(assistant_msg)
        self.db.commit()
        self.db.refresh(assistant_msg)

        # 4. Handle response delivery
        full_response_content = ""
        # If it's a button or multi-select prompt, send the whole message at once.
        if response_details.message_type in ["button_prompt", "multi_select"]:
            full_response_content = response_details.content
            assistant_msg.content = full_response_content
            self.db.commit()
            # Yield the complete Pydantic message object
            yield Message.from_orm(assistant_msg)
        
        # If the conversation is over, delegate to the summarization stream
        elif "DONE" in response_details.content:
            summary_generator = self._summarize_and_complete_chat(chat)
            async for chunk in summary_generator:
                yield chunk
            return # End the generator here

        # Otherwise, stream the text-based response from the LLM.
        else:
            chat_history = self.db.query(MessageModel).filter(MessageModel.chat_uuid == chat.uuid).order_by(MessageModel.id.desc()).limit(20).all()
            context = {
                "patient_state": {"current_symptoms": chat.symptom_list},
                "latest_input": message.content,
                "history": [Message.from_orm(m).model_dump(mode='json') for m in reversed(chat_history)]
            }
            llm_response_generator = self._query_knowledge_base_stream(context)
            for chunk_content in llm_response_generator:
                full_response_content += chunk_content
                yield WebSocketMessageChunk(message_id=assistant_msg.id, content=chunk_content)
            
            assistant_msg.content = full_response_content
            self.db.commit()
            yield WebSocketStreamEnd(message_id=assistant_msg.id)

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
        Queries the configured LLM model with the provided context and document knowledge base.
        """
        print(f"KB_REAL: Querying {LLM_PROVIDER.upper()} with real context...")
        
        # 1. Load the knowledge base context from files
        model_inputs_path = os.path.join(os.path.dirname(__file__), '..', '..', 'model_inputs')
        context_loader = ContextLoader(model_inputs_path)
        
        system_prompt = context_loader.load_system_prompt()
        
        # Get patient symptoms from the context, default to an empty list
        patient_symptoms = context.get('patient_state', {}).get('current_symptoms', [])
        knowledge_base_context = context_loader.load_context(symptoms=patient_symptoms)

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
            "\n### Instruction ###",
            "Your primary goal is to ask follow-up questions to understand the user's symptoms.",
            "IMPORTANT: You must ask only ONE question at a time. Wait for the user's response before asking the next question.",
            "1. First, ask all necessary questions to fully understand the currently reported symptoms based on the knowledge base.",
            "2. After you have gathered all information for the current symptoms, you MUST ask the user 'Is there anything else you would like to discuss?' and provide 'Yes' and 'No' as button options.",
            "3. If the user responds 'No' or indicates they are finished, your **only** response should be the single word 'DONE'. Do not add any other text.",
            "4. If the user responds 'Yes' or lists new symptoms, ask them to specify the new symptoms."
        ]
        user_prompt = "\n".join(user_prompt_parts)

        # 3. Call the LLM provider
        llm_provider = get_llm_provider()
        response_generator = llm_provider.query(
            system_prompt=system_prompt,
            user_prompt=user_prompt
        )

        # 4. Consume the streaming generator to get a single string response
        full_response = "".join([chunk for chunk in response_generator])
        
        print(f"KB_REAL: Received response from {LLM_PROVIDER.upper()}: '{full_response}'")
        return full_response if full_response else "I'm not sure what to ask next. Can you tell me more?"

    def _query_knowledge_base_stream(self, context: Dict[str, Any]) -> Generator[str, None, None]:
        """
        Queries the configured LLM model with the provided context and document knowledge base.
        Yields chunks of the response as they become available.
        """
        print(f"KB_REAL: Streaming {LLM_PROVIDER.upper()} with real context...")
        
        # 1. Load the knowledge base context from files
        model_inputs_path = os.path.join(os.path.dirname(__file__), '..', '..', 'model_inputs')
        context_loader = ContextLoader(model_inputs_path)
        
        system_prompt = context_loader.load_system_prompt()
        
        # Get patient symptoms from the context, default to an empty list
        patient_symptoms = context.get('patient_state', {}).get('current_symptoms', [])
        knowledge_base_context = context_loader.load_context(symptoms=patient_symptoms)

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
            "\n### Instruction ###",
            "Your primary goal is to ask follow-up questions to understand the user's symptoms.",
            "IMPORTANT: You must ask only ONE question at a time. Wait for the user's response before asking the next question.",
            "1. First, ask all necessary questions to fully understand the currently reported symptoms based on the knowledge base.",
            "2. After you have gathered all information for the current symptoms, you MUST ask the user 'Is there anything else you would like to discuss?' and provide 'Yes' and 'No' as button options.",
            "3. If the user responds 'No' or indicates they are finished, your **only** response should be the single word 'DONE'. Do not add any other text.",
            "4. If the user responds 'Yes' or lists new symptoms, ask them to specify the new symptoms."
        ]
        user_prompt = "\n".join(user_prompt_parts)

        # 3. Call the LLM provider
        llm_provider = get_llm_provider()
        response_generator = llm_provider.query(
            system_prompt=system_prompt,
            user_prompt=user_prompt
        )

        # 4. Yield chunks directly from the generator
        for chunk in response_generator:
            yield chunk
