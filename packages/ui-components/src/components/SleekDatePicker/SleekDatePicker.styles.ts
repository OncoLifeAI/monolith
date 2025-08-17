import styled from 'styled-components';

export const Backdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.1);
  z-index: 500;
  backdrop-filter: blur(2px);
`;

export const DatePickerContainer = styled.div<{ $fullWidth?: boolean }>`
  position: relative;
  width: ${props => props.$fullWidth ? '100%' : 'auto'};
  z-index: 501;
`;

export const DateDisplayButton = styled.button<{ 
  $fullWidth?: boolean; 
  $isOpen?: boolean;
}>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: ${props => props.$fullWidth ? '100%' : 'auto'};
  min-width: 240px;
  padding: 16px 20px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(12px);
  border: 1px solid ${props => props.$isOpen ? 'rgba(59, 130, 246, 0.5)' : 'rgba(226, 232, 240, 0.6)'};
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: ${props => props.$isOpen 
    ? '0 12px 40px rgba(59, 130, 246, 0.15)' 
    : '0 4px 20px rgba(0, 0, 0, 0.08)'};
  transform: ${props => props.$isOpen ? 'translateY(-2px)' : 'translateY(0)'};

  &:hover {
    border-color: rgba(59, 130, 246, 0.4);
    box-shadow: 0 8px 32px rgba(59, 130, 246, 0.12);
    transform: translateY(-1px);
  }

  .date-content {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 2px;
  }

  .label {
    font-size: 12px;
    font-weight: 500;
    color: #64748b;
    line-height: 1;
  }

  .date-text {
    font-size: 16px;
    font-weight: 600;
    color: #1e293b;
    line-height: 1.2;
  }

  .icon-container {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #64748b;
  }

  .chevron {
    transition: transform 0.3s ease;
    
    &.open {
      transform: rotate(180deg);
    }
  }
`;

export const DropdownContainer = styled.div`
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(226, 232, 240, 0.4);
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.12);
  padding: 24px;
  z-index: 502;
  animation: slideDown 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-8px) scale(0.98);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
`;

export const DropdownHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(226, 232, 240, 0.4);
`;

export const YearSelector = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 12px;
  color: #3b82f6;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(59, 130, 246, 0.15);
    border-color: rgba(59, 130, 246, 0.3);
    transform: translateY(-1px);
  }
`;

export const NavigationButton = styled.button<{ disabled?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: rgba(248, 250, 252, 0.8);
  border: 1px solid rgba(226, 232, 240, 0.6);
  border-radius: 12px;
  color: ${props => props.disabled ? '#94a3b8' : '#475569'};
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.3s ease;
  opacity: ${props => props.disabled ? 0.5 : 1};

  &:hover:not(:disabled) {
    background: rgba(59, 130, 246, 0.1);
    border-color: rgba(59, 130, 246, 0.3);
    color: #3b82f6;
    transform: translateY(-1px);
  }
`;

export const MonthGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
`;

export const MonthButton = styled.button<{ 
  $isSelected?: boolean; 
  $isCurrent?: boolean;
  $isDisabled?: boolean;
}>`
  padding: 16px 12px;
  border: 1px solid ${props => {
    if (props.$isDisabled) return 'rgba(226, 232, 240, 0.3)';
    if (props.$isSelected) return 'rgba(59, 130, 246, 0.5)';
    if (props.$isCurrent) return 'rgba(16, 185, 129, 0.4)';
    return 'rgba(226, 232, 240, 0.6)';
  }};
  border-radius: 12px;
  background: ${props => {
    if (props.$isDisabled) return 'rgba(248, 250, 252, 0.5)';
    if (props.$isSelected) return 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)';
    if (props.$isCurrent) return 'rgba(16, 185, 129, 0.1)';
    return 'rgba(255, 255, 255, 0.8)';
  }};
  color: ${props => {
    if (props.$isDisabled) return '#9ca3af';
    if (props.$isSelected) return 'white';
    if (props.$isCurrent) return '#059669';
    return '#374151';
  }};
  font-weight: ${props => props.$isSelected || props.$isCurrent ? '600' : '500'};
  font-size: 14px;
  cursor: ${props => props.$isDisabled ? 'not-allowed' : 'pointer'};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(8px);

  &:hover:not(:disabled) {
    transform: ${props => props.$isDisabled ? 'none' : 'translateY(-2px)'};
    box-shadow: ${props => {
      if (props.$isDisabled) return 'none';
      if (props.$isSelected) return '0 8px 32px rgba(59, 130, 246, 0.3)';
      if (props.$isCurrent) return '0 8px 32px rgba(16, 185, 129, 0.2)';
      return '0 8px 32px rgba(0, 0, 0, 0.1)';
    }};
    background: ${props => {
      if (props.$isDisabled) return 'rgba(248, 250, 252, 0.5)';
      if (props.$isSelected) return 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)';
      if (props.$isCurrent) return 'rgba(16, 185, 129, 0.15)';
      return 'rgba(255, 255, 255, 0.95)';
    }};
  }

  &:active {
    transform: translateY(-1px);
  }
`;

export const YearGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  max-height: 300px;
  overflow-y: auto;
  padding-right: 8px;

  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(241, 245, 249, 0.5);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(148, 163, 184, 0.4);
    border-radius: 3px;
    
    &:hover {
      background: rgba(148, 163, 184, 0.6);
    }
  }
`;

export const YearButton = styled.button<{ 
  $isSelected?: boolean; 
  $isCurrent?: boolean;
}>`
  padding: 12px 8px;
  border: 1px solid ${props => {
    if (props.$isSelected) return 'rgba(59, 130, 246, 0.5)';
    if (props.$isCurrent) return 'rgba(16, 185, 129, 0.4)';
    return 'rgba(226, 232, 240, 0.6)';
  }};
  border-radius: 8px;
  background: ${props => {
    if (props.$isSelected) return 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)';
    if (props.$isCurrent) return 'rgba(16, 185, 129, 0.1)';
    return 'rgba(255, 255, 255, 0.8)';
  }};
  color: ${props => {
    if (props.$isSelected) return 'white';
    if (props.$isCurrent) return '#059669';
    return '#374151';
  }};
  font-weight: ${props => props.$isSelected || props.$isCurrent ? '600' : '500'};
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-1px);
    background: ${props => {
      if (props.$isSelected) return 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)';
      if (props.$isCurrent) return 'rgba(16, 185, 129, 0.15)';
      return 'rgba(255, 255, 255, 0.95)';
    }};
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  }

  &:active {
    transform: translateY(0);
  }
`;

export const CloseButton = styled.button`
  position: absolute;
  top: 16px;
  right: 16px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(248, 250, 252, 0.8);
  border: 1px solid rgba(226, 232, 240, 0.6);
  border-radius: 8px;
  color: #64748b;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(239, 68, 68, 0.1);
    border-color: rgba(239, 68, 68, 0.3);
    color: #ef4444;
    transform: scale(1.1);
  }
`;
