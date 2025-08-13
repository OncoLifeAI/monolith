import React, { useState } from 'react';
import type { Message } from '../../types/chat';

interface MultiSelectMessageProps {
  message: Message;
  onSubmitSelections: (selections: string[]) => void;
}

export const MultiSelectMessage: React.FC<MultiSelectMessageProps> = ({ 
  message, 
  onSubmitSelections 
}) => {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const maxSelections = message.structured_data?.max_selections || message.structured_data?.options?.length || 0;

  const toggleOption = (option: string) => {
    setSelectedOptions(prev => {
      if (prev.includes(option)) {
        return prev.filter(item => item !== option);
      } else if (prev.length < maxSelections) {
        return [...prev, option];
      }
      return prev;
    });
  };

  const handleSubmit = () => {
    if (selectedOptions.length > 0) {
      onSubmitSelections(selectedOptions);
    }
  };

  return (
    <div className="multi-select-options">
      {message.structured_data?.options?.map((option, index) => (
        <label
          key={index}
          className={`multi-select-item ${selectedOptions.includes(option) ? 'selected' : ''}`}
          htmlFor={`checkbox-${index}`}
        >
          <input
            id={`checkbox-${index}`}
            type="checkbox"
            checked={selectedOptions.includes(option)}
            onChange={() => toggleOption(option)}
          />
          <span>{option}</span>
        </label>
      ))}
      <button
        className="multi-select-submit"
        onClick={handleSubmit}
        disabled={selectedOptions.length === 0}
      >
        Submit ({selectedOptions.length} selected)
      </button>
    </div>
  );
}; 