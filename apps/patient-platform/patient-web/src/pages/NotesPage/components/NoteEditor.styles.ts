import styled from 'styled-components';

export const EditorContainer = styled.div`
  height: 100%;
  width: 100%;
  background-color: #ffffff;
  display: flex;
  flex-direction: column;
  position: relative;
`;

export const EditorHeader = styled.div`
  padding: 2rem 1.5rem 1.5rem 1.5rem;
  border-bottom: 1px solid #e9ecef;
  background-color: #ffffff;
  
  @media (max-width: 767px) {
    padding: 1.5rem 1rem 1rem 1rem;
  }
`;

export const EditorContent = styled.div`
  flex: 1;
  padding: 1.5rem 1.5rem 2rem 1.5rem;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 0;
  
  @media (max-width: 767px) {
    padding: 1rem 1rem 1.5rem 1rem;
  }
`;

export const SaveButton = styled.button`
  min-width: 120px;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
  border: none;
  transition: all 0.2s ease;
  background-color: #007bff;
  color: white;
  cursor: pointer;
  
  @media (max-width: 767px) {
    min-width: 100px;
    padding: 0.875rem 1.25rem;
    font-size: 0.95rem;
  }
  
  &:hover, &:focus {
    background-color: #0056b3;
    transform: translateY(-1px);
    box-shadow: 0 6px 16px rgba(0, 123, 255, 0.4);
    outline: none;
  }
  &:active {
    transform: translateY(0);
  }
  
  @media (hover: none) {
    &:hover {
      background-color: #007bff;
      transform: none;
      box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
    }
  }
`;

export const DeleteButton = styled.button`
  min-width: 120px;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  box-shadow: 0 4px 12px rgba(220, 53, 69, 0.3);
  border: none;
  transition: all 0.2s ease;
  background-color: #dc3545;
  color: white;
  cursor: pointer;
  
  @media (max-width: 767px) {
    min-width: 100px;
    padding: 0.875rem 1.25rem;
    font-size: 0.95rem;
  }
  
  &:hover, &:focus {
    background-color: #c82333;
    transform: translateY(-1px);
    box-shadow: 0 6px 16px rgba(220, 53, 69, 0.4);
    outline: none;
  }
  &:active {
    transform: translateY(0);
  }
  
  @media (hover: none) {
    &:hover {
      background-color: #dc3545;
      transform: none;
      box-shadow: 0 4px 12px rgba(220, 53, 69, 0.3);
    }
  }
`;

export const CancelButton = styled.button`
  min-width: 120px;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  box-shadow: 0 4px 12px rgba(108, 117, 125, 0.3);
  border: none;
  transition: all 0.2s ease;
  background-color: #6c757d;
  color: white;
  cursor: pointer;
  
  @media (max-width: 767px) {
    min-width: 100px;
    padding: 0.875rem 1.25rem;
    font-size: 0.95rem;
  }
  
  &:hover, &:focus {
    background-color: #5a6268;
    transform: translateY(-1px);
    box-shadow: 0 6px 16px rgba(108, 117, 125, 0.4);
    outline: none;
  }
  &:active {
    transform: translateY(0);
  }
  
  @media (hover: none) {
    &:hover {
      background-color: #6c757d;
      transform: none;
      box-shadow: 0 4px 12px rgba(108, 117, 125, 0.3);
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
  gap: 1rem;
  padding: 1.5rem 2rem;
  background: linear-gradient(0deg, #fff 90%, rgba(255,255,255,0.7) 100%);
  border-top: 1px solid #e9ecef;
  z-index: 10;
  
  @media (max-width: 767px) {
    padding: 1rem 1rem;
    gap: 0.75rem;
    justify-content: center;
    flex-wrap: wrap;
  }
`;

export const EditorInput = styled.input`
  width: 100%;
  border: 2px solid #e0e7ef;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  font-size: 2rem;
  font-weight: 700;
  background: #fff;
  color: #2C3E50;
  transition: border 0.2s;
  
  @media (max-width: 767px) {
    font-size: 1.5rem;
    padding: 0.75rem;
  }
  
  &:focus {
    border-color: #007bff;
    outline: none;
    background: #f8faff;
  }
`;

export const EditorTextarea = styled.textarea`
  width: 100%;
  flex: 1;
  border: 2px solid #e0e7ef;
  border-radius: 8px;
  padding: 1rem;
  font-size: 1rem;
  background: #fff;
  color: #2C3E50;
  resize: none;
  transition: border 0.2s;
  min-height: 200px;
  
  @media (max-width: 767px) {
    padding: 0.875rem;
    font-size: 1rem;
    min-height: 150px;
  }
  
  &:focus {
    border-color: #007bff;
    outline: none;
    background: #f8faff;
  }
`; 