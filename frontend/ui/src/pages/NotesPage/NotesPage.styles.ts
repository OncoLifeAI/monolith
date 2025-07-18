import styled from 'styled-components';

export const NotesPageContainer = styled.div`
  flex: 1;
  background-color: #f8f9fa;
  display: flex;
  flex-direction: row;
  overflow: hidden;
  height: calc(100vh - 80px);
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
`; 