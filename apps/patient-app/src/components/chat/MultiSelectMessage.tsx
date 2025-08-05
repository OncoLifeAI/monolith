import React, { useState } from 'react';
import styled from 'styled-components';
import type { Message } from '@patient-portal/common-types';

interface MultiSelectMessageProps {
  message: Message;
  onSelectionChange?: (selectedOptions: string[]) => void;
}

const Container = styled.div`
  margin-top: 8px;
`;

const OptionButton = styled.button<{ isSelected: boolean }>`
  display: block;
  width: 100%;
  padding: 8px 12px;
  margin: 4px 0;
  border: 1px solid ${props => props.isSelected ? '#007bff' : '#ddd'};
  border-radius: 4px;
  background: ${props => props.isSelected ? '#007bff' : 'white'};
  color: ${props => props.isSelected ? 'white' : '#333'};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.isSelected ? '#0056b3' : '#f8f9fa'};
  }
`;

const SelectedCount = styled.div`
  font-size: 0.875rem;
  color: #666;
  margin-top: 8px;
  text-align: center;
`;

export const MultiSelectMessage: React.FC<MultiSelectMessageProps> = ({
  message,
  onSelectionChange
}) => {
  const maxSelections = message.structuredData?.maxSelections || message.structuredData?.options?.length || 0;
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

  const handleOptionClick = (option: string) => {
    let newSelectedOptions: string[];

    if (selectedOptions.includes(option)) {
      // Remove option if already selected
      newSelectedOptions = selectedOptions.filter(opt => opt !== option);
    } else {
      // Add option if not selected and under max limit
      if (selectedOptions.length < maxSelections) {
        newSelectedOptions = [...selectedOptions, option];
      } else {
        // Replace oldest selection if at max limit
        newSelectedOptions = [...selectedOptions.slice(1), option];
      }
    }

    setSelectedOptions(newSelectedOptions);
    onSelectionChange?.(newSelectedOptions);
  };

  return (
    <Container>
      {message.structuredData?.options?.map((option: string, index: number) => (
        <OptionButton
          key={index}
          isSelected={selectedOptions.includes(option)}
          onClick={() => handleOptionClick(option)}
        >
          {option}
        </OptionButton>
      ))}
      <SelectedCount>
        {selectedOptions.length} of {maxSelections} selected
      </SelectedCount>
    </Container>
  );
}; 