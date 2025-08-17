import styled from 'styled-components';

export const Backdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.1);
  z-index: 1500;
  backdrop-filter: blur(2px);
`;

export const MobileBackdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  z-index: 9998;
  backdrop-filter: blur(4px);
`;

export const DatePickerContainer = styled.div<{ $fullWidth?: boolean }>`
  position: relative;
  width: ${props => props.$fullWidth ? '100%' : 'auto'};
  z-index: 1501;
`;

export const DateDisplayButton = styled.button.attrs({ type: 'button' })<{ 
  $fullWidth?: boolean; 
  $isOpen?: boolean;
}>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: ${props => props.$fullWidth ? '100%' : 'auto'};
  min-width: 280px;
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
    gap: 4px;
  }

  .label {
    font-size: 12px;
    font-weight: 600;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .date-text {
    font-size: 16px;
    font-weight: 600;
    color: #1e293b;
    letter-spacing: -0.025em;
  }

  .icon-container {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #64748b;
  }

  .chevron {
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    
    &.open {
      transform: rotate(180deg);
    }
  }
`;

export const PortalDropdownContainer = styled.div<{ 
  $position?: { top: number; left: number; width: number } 
}>`
  position: fixed;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(226, 232, 240, 0.3);
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  z-index: 9999;
  pointer-events: auto;
  overflow: hidden;
  animation: slideDown 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  max-height: 400px;

  /* Desktop positioning */
  @media (min-width: 768px) {
    top: ${props => props.$position?.top || 0}px;
    left: ${props => props.$position?.left || 0}px;
    width: ${props => props.$position?.width || 280}px;
  }

  /* Mobile positioning - center on screen */
  @media (max-width: 767px) {
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 90vw;
    max-width: 350px;
    animation: mobileSlideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-10px) scale(0.98);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  @keyframes mobileSlideUp {
    from {
      opacity: 0;
      transform: translate(-50%, -50%) scale(0.9);
    }
    to {
      opacity: 1;
      transform: translate(-50%, -50%) scale(1);
    }
  }
`;

export const DropdownContainer = styled.div<{ $position?: 'top' | 'bottom' }>`
  position: absolute;
  top: ${props => props.$position === 'top' ? 'auto' : 'calc(100% + 8px)'};
  bottom: ${props => props.$position === 'top' ? 'calc(100% + 8px)' : 'auto'};
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(226, 232, 240, 0.3);
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  z-index: 1502;
  overflow: hidden;
  animation: ${props => props.$position === 'top' ? 'slideUp' : 'slideDown'} 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  max-height: 400px;

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-10px) scale(0.98);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(10px) scale(0.98);
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
  padding: 20px 24px;
  border-bottom: 1px solid rgba(226, 232, 240, 0.3);
  background: rgba(255, 255, 255, 0.1);
`;

export const MonthYearSelector = styled.div`
  display: flex;
  align-items: center;
  font-weight: 700;
  font-size: 16px;
  color: #1e293b;
  letter-spacing: -0.025em;
`;

export const NavigationButton = styled.button.attrs({ type: 'button' })`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: 1px solid rgba(226, 232, 240, 0.6);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.8);
  color: #64748b;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(8px);

  &:hover {
    background: rgba(59, 130, 246, 0.1);
    border-color: rgba(59, 130, 246, 0.3);
    color: #3b82f6;
    transform: translateY(-1px);
    box-shadow: 0 4px 16px rgba(59, 130, 246, 0.15);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background: rgba(248, 250, 252, 0.8);
    
    &:hover {
      transform: none;
      box-shadow: none;
    }
  }
`;

export const CalendarGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
  padding: 20px 24px;

  .week-day-header {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 32px;
    font-size: 12px;
    font-weight: 600;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
`;

export const DayButton = styled.button.attrs({ type: 'button' })<{
  $isSelected?: boolean;
  $isToday?: boolean;
  $isDisabled?: boolean;
  $isInCurrentMonth?: boolean;
}>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: 1px solid ${props => {
    if (props.$isSelected) return 'rgba(59, 130, 246, 0.5)';
    if (props.$isToday && props.$isInCurrentMonth) return 'rgba(16, 185, 129, 0.4)';
    return 'transparent';
  }};
  border-radius: 12px;
  background: ${props => {
    if (props.$isSelected) return 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)';
    if (props.$isToday && props.$isInCurrentMonth) return 'rgba(16, 185, 129, 0.1)';
    if (props.$isDisabled) return 'transparent';
    return 'rgba(255, 255, 255, 0.5)';
  }};
  color: ${props => {
    if (props.$isDisabled) return '#d1d5db';
    if (props.$isSelected) return 'white';
    if (props.$isToday && props.$isInCurrentMonth) return '#059669';
    if (!props.$isInCurrentMonth) return '#9ca3af';
    return '#374151';
  }};
  font-weight: ${props => {
    if (props.$isSelected || (props.$isToday && props.$isInCurrentMonth)) return '600';
    return '500';
  }};
  font-size: 14px;
  cursor: ${props => props.$isDisabled ? 'not-allowed' : 'pointer'};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(8px);

  &:hover:not(:disabled) {
    transform: ${props => props.$isDisabled ? 'none' : 'translateY(-1px)'};
    box-shadow: ${props => {
      if (props.$isDisabled) return 'none';
      if (props.$isSelected) return '0 6px 24px rgba(59, 130, 246, 0.3)';
      if (props.$isToday && props.$isInCurrentMonth) return '0 6px 24px rgba(16, 185, 129, 0.2)';
      return '0 6px 24px rgba(0, 0, 0, 0.1)';
    }};
    background: ${props => {
      if (props.$isDisabled) return 'transparent';
      if (props.$isSelected) return 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)';
      if (props.$isToday && props.$isInCurrentMonth) return 'rgba(16, 185, 129, 0.15)';
      return 'rgba(255, 255, 255, 0.8)';
    }};
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }
`;
