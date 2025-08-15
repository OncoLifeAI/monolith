import styled from 'styled-components';

export const EditorContainer = styled.div`
  height: 100%;
  width: 100%;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  display: flex;
  flex-direction: column;
  position: relative;
  border-radius: 0 0 0 24px;
  overflow: hidden;
  box-shadow: -4px 0 24px rgba(0, 0, 0, 0.02);
  padding: 32px;
  padding-bottom: 120px; /* Make room for floating action bar */
  
  @media (max-width: 767px) {
    padding: 24px;
    padding-bottom: 100px;
    border-radius: 0;
  }
`;

export const EditorHeader = styled.div`
  margin-bottom: 32px;
  
  @media (max-width: 767px) {
    margin-bottom: 24px;
  }
`;

export const EditorContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 0;
`;

export const SaveButton = styled.button`
  min-width: 120px;
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 14px;
  box-shadow: 0 4px 16px rgba(59, 130, 246, 0.25);
  border: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%);
  color: white;
  cursor: pointer;
  backdrop-filter: blur(8px);
  
  @media (max-width: 767px) {
    min-width: 100px;
    padding: 12px 20px;
    font-size: 14px;
  }
  
  &:hover, &:focus {
    background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%);
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(59, 130, 246, 0.35);
    outline: none;
  }
  &:active {
    transform: translateY(-1px);
    box-shadow: 0 4px 16px rgba(59, 130, 246, 0.25);
  }
  
  @media (hover: none) {
    &:hover {
      background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%);
      transform: none;
      box-shadow: 0 4px 16px rgba(59, 130, 246, 0.25);
    }
  }
`;

export const DeleteButton = styled.button`
  min-width: 120px;
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 14px;
  box-shadow: 0 4px 16px rgba(239, 68, 68, 0.25);
  border: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  cursor: pointer;
  backdrop-filter: blur(8px);
  
  @media (max-width: 767px) {
    min-width: 100px;
    padding: 12px 20px;
    font-size: 14px;
  }
  
  &:hover, &:focus {
    background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(239, 68, 68, 0.35);
    outline: none;
  }
  &:active {
    transform: translateY(-1px);
    box-shadow: 0 4px 16px rgba(239, 68, 68, 0.25);
  }
  
  @media (hover: none) {
    &:hover {
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
      transform: none;
      box-shadow: 0 4px 16px rgba(239, 68, 68, 0.25);
    }
  }
`;

export const CancelButton = styled.button`
  min-width: 120px;
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 14px;
  box-shadow: 0 4px 16px rgba(100, 116, 139, 0.25);
  border: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: linear-gradient(135deg, #64748b 0%, #475569 100%);
  color: white;
  cursor: pointer;
  backdrop-filter: blur(8px);
  
  @media (max-width: 767px) {
    min-width: 100px;
    padding: 12px 20px;
    font-size: 14px;
  }
  
  &:hover, &:focus {
    background: linear-gradient(135deg, #475569 0%, #334155 100%);
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(100, 116, 139, 0.35);
    outline: none;
  }
  &:active {
    transform: translateY(-1px);
    box-shadow: 0 4px 16px rgba(100, 116, 139, 0.25);
  }
  
  @media (hover: none) {
    &:hover {
      background: linear-gradient(135deg, #64748b 0%, #475569 100%);
      transform: none;
      box-shadow: 0 4px 16px rgba(100, 116, 139, 0.25);
    }
  }
`;

export const EditorHeading = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: #2C3E50;
  margin-bottom: 1.5rem;
  letter-spacing: -0.5px;
  display: flex;
  align-items: center;
  gap: 1rem;
  
  @media (max-width: 767px) {
    font-size: 1.5rem;
    margin-bottom: 1rem;
    gap: 0.75rem;
  }
`;

export const EditorActionBar = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  padding: 24px 32px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-top: 1px solid rgba(226, 232, 240, 0.3);
  z-index: 10;
  box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.02);
  
  @media (max-width: 767px) {
    padding: 20px 16px;
    gap: 12px;
    justify-content: center;
    flex-wrap: wrap;
  }
`;

export const EditorInput = styled.input`
  width: 100%;
  border: 1px solid rgba(226, 232, 240, 0.6);
  border-radius: 16px;
  padding: 24px 28px;
  font-size: 2.25rem;
  font-weight: 700;
  background: rgba(255, 255, 255, 0.95);
  color: #1e293b;
  transition: all 0.3s ease;
  backdrop-filter: blur(8px);
  line-height: 1.2;
  
  &::placeholder {
    color: #94a3b8;
    font-weight: 600;
  }
  
  @media (max-width: 767px) {
    font-size: 1.75rem;
    padding: 20px 24px;
  }
  
  &:focus {
    border-color: rgba(59, 130, 246, 0.5);
    outline: none;
    background: rgba(255, 255, 255, 1);
    box-shadow: 0 8px 32px rgba(59, 130, 246, 0.15);
  }
  
  &[readonly] {
    background: rgba(248, 250, 252, 0.8);
    border-color: rgba(226, 232, 240, 0.4);
    cursor: pointer;
    
    &:hover {
      background: rgba(248, 250, 252, 0.9);
      border-color: rgba(59, 130, 246, 0.3);
    }
  }
`;

export const EditorTextarea = styled.textarea`
  width: 100%;
  flex: 1;
  border: 1px solid rgba(226, 232, 240, 0.6);
  border-radius: 16px;
  padding: 28px;
  font-size: 17px;
  line-height: 1.7;
  background: rgba(255, 255, 255, 0.95);
  color: #1e293b;
  resize: none;
  transition: all 0.3s ease;
  min-height: 400px;
  backdrop-filter: blur(8px);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
  
  &::placeholder {
    color: #94a3b8;
    font-style: italic;
  }
  
  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(241, 245, 249, 0.5);
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(148, 163, 184, 0.4);
    border-radius: 4px;
    
    &:hover {
      background: rgba(148, 163, 184, 0.6);
    }
  }
  
  @media (max-width: 767px) {
    padding: 24px;
    font-size: 16px;
    min-height: 300px;
  }
  
  &:focus {
    border-color: rgba(59, 130, 246, 0.5);
    outline: none;
    background: rgba(255, 255, 255, 1);
    box-shadow: 0 8px 32px rgba(59, 130, 246, 0.15);
  }
  
  &[readonly] {
    background: rgba(248, 250, 252, 0.8);
    border-color: rgba(226, 232, 240, 0.4);
    cursor: pointer;
    
    &:hover {
      background: rgba(248, 250, 252, 0.9);
      border-color: rgba(59, 130, 246, 0.3);
    }
  }
`; 