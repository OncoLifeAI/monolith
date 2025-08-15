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
  min-height: 80px;

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
`;

export const NotePreview = styled.p`
  color: #64748b;
  font-size: 14px;
  margin-bottom: 12px;
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  white-space: normal;
`;

export const NoteDate = styled.div`
  color: #94a3b8;
  font-size: 12px;
  font-weight: 500;
  margin-top: auto;
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