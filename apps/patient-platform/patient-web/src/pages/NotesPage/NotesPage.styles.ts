import styled from 'styled-components';

export const NotesPageContainer = styled.div`
  flex: 1;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  display: flex;
  flex-direction: row;
  overflow: hidden;
  height: calc(100vh - 80px);
  min-height: 0;
  
  @media (max-width: 767px) {
    flex-direction: column;
    height: calc(100vh - 8rem); /* Account for mobile nav + header */
  }
`;

export const NotesHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #e9ecef;
  background-color: #ffffff;
  
  h5 {
    font-size: 1.1rem;
    font-weight: 700;
    color: #343a40;
    margin: 0;
    width: 100%;
  }
`;

export const SearchContainer = styled.div`
  margin-bottom: 20px;
  width: 100%;
  display: flex;
  padding: 0 16px;
  
  .search-input {
    width: 100%;
    padding: 12px 16px;
    border: 1px solid rgba(226, 232, 240, 0.6);
    border-radius: 12px;
    font-size: 14px;
    outline: none;
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(8px);
    transition: all 0.3s ease;
    color: #1e293b;
    
    &::placeholder {
      color: #94a3b8;
    }
    
    &:focus {
      border-color: rgba(59, 130, 246, 0.5);
      box-shadow: 0 4px 16px rgba(59, 130, 246, 0.15);
      background: rgba(255, 255, 255, 0.95);
    }
  }
`;

export const AddNewButton = styled.button`
  background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 12px 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
  flex-shrink: 0;
  box-shadow: 0 4px 16px rgba(59, 130, 246, 0.25);
  backdrop-filter: blur(8px);
  
  &:hover {
    background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%);
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(59, 130, 246, 0.35);
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

// Mobile Navigation Components
export const MobileNavBar = styled.div`
  display: none;
  
  @media (max-width: 767px) {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.75rem 1rem;
    background: #fff;
    border-bottom: 1px solid #e9ecef;
    position: sticky;
    top: 0;
    z-index: 10;
  }
`;

export const MobileNavButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: none;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  color: #495057;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #f8f9fa;
    border-color: #007bff;
    color: #007bff;
  }
  
  &:active {
    background: #e9ecef;
  }
  
  @media (hover: none) {
    &:hover {
      background: none;
      border-color: #dee2e6;
      color: #495057;
    }
  }
`;

export const MobileViewContainer = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'showSidebar'
})<{ showSidebar: boolean }>`
  display: none;
  
  @media (max-width: 767px) {
    display: flex;
    flex: 1;
    flex-direction: column;
    overflow: hidden;
    position: relative;
    height: 100%;
  }
`;

export const MobileSidebarWrapper = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'isVisible'
})<{ isVisible: boolean }>`
  display: none;
  
  @media (max-width: 767px) {
    display: ${props => props.isVisible ? 'flex' : 'none'};
    flex: 1;
    flex-direction: column;
    background: #fff;
    overflow: hidden;
  }
`;

export const MobileEditorWrapper = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'isVisible'
})<{ isVisible: boolean }>`
  display: none;
  
  @media (max-width: 767px) {
    display: ${props => props.isVisible ? 'flex' : 'none'};
    flex: 1;
    flex-direction: column;
    overflow: hidden;
  }
`;

export const DesktopContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  overflow: hidden;
  height: 100%;
  
  @media (max-width: 767px) {
    display: none;
  }
`;

export const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 48px;
  text-align: center;
  
  .empty-icon {
    font-size: 4rem;
    margin-bottom: 24px;
    opacity: 0.6;
  }
  
  .empty-title {
    font-size: 1.5rem;
    font-weight: 600;
    color: #1e293b;
    margin-bottom: 12px;
    margin: 0;
  }
  
  .empty-description {
    color: #64748b;
    font-size: 16px;
    line-height: 1.6;
    margin: 0;
    max-width: 400px;
  }
`; 