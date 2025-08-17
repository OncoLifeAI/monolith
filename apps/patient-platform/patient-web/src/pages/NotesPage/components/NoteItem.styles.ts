import styled from 'styled-components';

interface NoteItemContainerProps {
  isSelected: boolean;
}

export const NoteItemContainer = styled.div<NoteItemContainerProps>`
  padding: 20px;
  padding-right: 60px; /* Make room for action buttons */
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid ${props => props.isSelected ? 'rgba(59, 130, 246, 0.5)' : 'rgba(226, 232, 240, 0.6)'};
  background: ${props => props.isSelected 
    ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(99, 102, 241, 0.08) 100%)' 
    : 'rgba(255, 255, 255, 0.9)'};
  backdrop-filter: blur(8px);
  box-shadow: ${props => props.isSelected 
    ? '0 8px 32px rgba(59, 130, 246, 0.15)' 
    : '0 2px 16px rgba(0, 0, 0, 0.08)'};
  margin-bottom: 0;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  min-height: 140px; /* Increased to ensure all content is visible */
  height: 140px; /* Fixed height to prevent compression */
  flex-shrink: 0; /* Prevent flex container from shrinking this item */
  
  /* Responsive adjustments */
  @media (max-width: 768px) {
    min-height: 120px;
    height: 120px;
    padding: 18px;
    padding-right: 55px;
  }
  
  @media (max-width: 480px) {
    min-height: 110px;
    height: 110px;
    padding: 16px;
    padding-right: 50px;
  }

  &:hover {
    background: ${props => props.isSelected 
      ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.12) 0%, rgba(99, 102, 241, 0.12) 100%)' 
      : 'rgba(255, 255, 255, 0.95)'};
    border-color: ${props => props.isSelected ? 'rgba(59, 130, 246, 0.6)' : 'rgba(59, 130, 246, 0.3)'};
    transform: translateY(-2px);
    box-shadow: ${props => props.isSelected 
      ? '0 12px 40px rgba(59, 130, 246, 0.2)' 
      : '0 8px 32px rgba(0, 0, 0, 0.12)'};
  }

  &:active {
    transform: translateY(-1px);
  }
`;

export const NoteTitle = styled.h6`
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 8px;
  font-size: 16px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 1.4;
  min-height: 22px; /* Ensure consistent height */
  
  /* Allow wrapping on very small screens */
  @media (max-width: 480px) {
    white-space: normal;
    -webkit-line-clamp: 2;
    display: -webkit-box;
    -webkit-box-orient: vertical;
  }
`;

export const NotePreview = styled.p`
  color: #64748b;
  font-size: 14px;
  margin-bottom: 12px;
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3; /* Increased to 3 lines for better content visibility */
  -webkit-box-orient: vertical;
  white-space: normal;
  flex: 1; /* Take available space between title and date */
  
  /* Ensure content is always visible */
  word-break: break-word;
  hyphens: auto;
  
  /* Responsive adjustments */
  @media (max-width: 768px) {
    -webkit-line-clamp: 2;
    font-size: 13px;
  }
  
  @media (max-width: 480px) {
    -webkit-line-clamp: 2;
    font-size: 12px;
    margin-bottom: 8px;
  }
`;

export const NoteDate = styled.div`
  color: #94a3b8;
  font-size: 12px;
  font-weight: 500;
  margin-top: auto;
  min-height: 16px; /* Back to single line height */
  
  /* Ensure date is always visible */
  flex-shrink: 0;
`;

export const NoteActions = styled.div`
  position: absolute;
  top: 20px;
  right: 20px;
  display: flex;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.3s ease;

  ${NoteItemContainer}:hover & {
    opacity: 1;
  }
`;

export const ActionButton = styled.button`
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 8px;
  background: rgba(248, 250, 252, 0.9);
  backdrop-filter: blur(8px);
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: rgba(239, 68, 68, 0.1);
    color: #ef4444;
    transform: scale(1.1);
  }
`; 