import React from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface NewConversationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const NewConversationModal: React.FC<NewConversationModalProps> = ({
  isOpen,
  onClose,
  onConfirm
}) => {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <div className="new-conversation-modal-overlay">
      <div className="new-conversation-modal">
        <div className="new-conversation-modal-header">
          <div className="warning-icon">
            <AlertTriangle size={20} />
          </div>
          <h3>Start New Conversation?</h3>
          <button onClick={onClose} className="close-button">
            <X size={20} />
          </button>
        </div>
        
        <div className="new-conversation-modal-content">
          <p>
            Are you sure you want to start a new conversation? This current conversation is not finished. 
            You will lose your progress on this conversation.
          </p>
        </div>
        
        <div className="new-conversation-modal-footer">
          <button onClick={onClose} className="cancel-button">
            Cancel
          </button>
          <button onClick={handleConfirm} className="confirm-button">
            Start New Conversation
          </button>
        </div>
      </div>
    </div>
  );
};
