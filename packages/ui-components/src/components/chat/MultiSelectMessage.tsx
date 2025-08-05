import React, { useState } from 'react';
import type { Message } from '@patient-portal/common-types';

interface MultiSelectMessageProps {
  message: Message;
  onSubmitSelections: (selections: string[]) => void;
}

export const MultiSelectMessage: React.FC<MultiSelectMessageProps> = ({ 
  message, 
  onSubmitSelections 
}) => {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const maxSelections = message.structuredData?.maxSelections || message.structuredData?.options?.length || 0;

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
      {message.structuredData?.options?.map((option: string, index: number) => (
        <div
          key={index}
          className={`multi-select-item ${selectedOptions.includes(option) ? 'selected' : ''}`}
          onClick={() => toggleOption(option)}
        >
          <input
            type="checkbox"
            checked={selectedOptions.includes(option)}
            onChange={() => toggleOption(option)}
          />
          <span>{option}</span>
        </div>
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