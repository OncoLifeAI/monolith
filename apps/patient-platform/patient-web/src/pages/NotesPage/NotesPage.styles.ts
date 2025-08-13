import styled from 'styled-components';

export const NotesPageContainer = styled.div`
  flex: 1;
  background-color: #f8f9fa;
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
  margin-bottom: 1.25rem;
  width: 100%;
  display: flex;
  padding: 0 1rem;
  
  .search-input {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 14px;
    outline: none;
    
    &:focus {
      border-color: #007bff;
    }
  }
`;

export const AddNewButton = styled.button`
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0.5rem 0.875rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.375rem;
  white-space: nowrap;
  flex-shrink: 0;
  
  &:hover {
    background-color: #0056b3;
    transform: translateY(-1px);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  @media (hover: none) {
    &:hover {
      background-color: #007bff;
      transform: none;
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