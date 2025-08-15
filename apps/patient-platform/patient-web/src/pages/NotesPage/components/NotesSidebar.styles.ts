import styled from 'styled-components';

export const SidebarContainer = styled.div`
  height: 100%;
  min-height: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-right: 1px solid rgba(226, 232, 240, 0.3);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 320px;
  max-width: 380px;
  flex-shrink: 0;
  box-shadow: 4px 0 24px rgba(0, 0, 0, 0.02);
  
  @media (max-width: 767px) {
    min-width: 100%;
    max-width: 100%;
    border-right: none;
    height: 100%;
    box-shadow: none;
  }
`;

export const SidebarHeader = styled.div`
  padding: 24px 20px;
  border-bottom: 1px solid rgba(226, 232, 240, 0.3);
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  position: sticky;
  top: 0;
  z-index: 1;
  
  @media (max-width: 767px) {
    padding: 20px 16px;
  }
`;

export const NotesSidebarTitle = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, #1e293b 0%, #475569 100%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: -0.025em;
  margin-bottom: 0;
  margin-right: 1rem;
  line-height: 1.2;
`;

export const NotesList = styled.div`
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 20px 16px;
  min-height: 0;
  scroll-behavior: smooth;
  
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
  
  @media (max-width: 767px) {
    padding: 16px 12px;
    gap: 16px;
  }
`; 