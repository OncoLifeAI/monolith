import styled from "styled-components";

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #F8F9FA;
`;

export const Header = styled.div`
  display: flex;
  align-items: center;
  padding: 1.5rem 2rem;
  background-color: #FFFFFF;
  border-bottom: 1px solid #E0E0E0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  
  @media (max-width: 767px) {
    position: sticky;
    top: 4rem; /* Height of mobile navigation */
    z-index: 10;
    padding: 1rem 1.5rem;
  }
`;

export const Title = styled.h1`
  font-size: 2.25rem;
  font-weight: 700;
  color: #2C3E50;
  margin: 0;
  letter-spacing: -0.5px;
  
  @media (max-width: 767px) {
    font-size: 1.75rem;
  }
`;

export const Content = styled.div`
  display: flex;
  flex-direction: column;
  padding: 2rem;
  flex: 1;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  
  @media (max-width: 767px) {
    padding: 1rem;
  }
`;

export const PageHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #E9ECEF;
  
  @media (max-width: 767px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }
`;

export const PageTitle = styled.h2`
  font-size: 1.75rem;
  font-weight: 600;
  color: #495057;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 1rem;
  
  @media (max-width: 767px) {
    font-size: 1.5rem;
  }
`;

export const DatePickerContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  .MuiTextField-root {
    min-width: 200px;
  }
  
  .MuiInputBase-root {
    background-color: #FFFFFF;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }
  
  .MuiOutlinedInput-root {
    &:hover .MuiOutlinedInput-notchedOutline {
      border-color: #007BFF;
    }
    
    &.Mui-focused .MuiOutlinedInput-notchedOutline {
      border-color: #007BFF;
      border-width: 2px;
    }
  }
`;

export const CurrentDateDisplay = styled.span`
  color: #6C757D;
  font-weight: 500;
  font-size: 1.1rem;
  padding: 0 1rem;
  min-width: 120px;
  text-align: center;
`;

export const NavigationContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  
  @media (max-width: 767px) {
    width: 100%;
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
  }
  
  .btn-primary {
    font-weight: 600;
    font-size: 14px;
    padding: 8px 20px;
    border-radius: 8px;
    transition: all 0.2s ease;
    box-shadow: 0 2px 4px rgba(0, 123, 255, 0.2);
    
    @media (max-width: 767px) {
      padding: 10px 16px;
      font-size: 16px;
      width: 100%;
    }
    
    &:hover {
      background-color: #4A90E2;
      border-color: #4A90E2;
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(74, 144, 226, 0.3);
    }
    
    &:active {
      transform: translateY(0);
      box-shadow: 0 2px 4px rgba(0, 123, 255, 0.2);
    }
    
    &:focus {
      box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
    }
  }
`;

export const DateNavigationGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  @media (max-width: 767px) {
    width: 100%;
    justify-content: center;
    gap: 0.75rem;
  }
  
  .btn {
    border-radius: 8px;
    transition: all 0.2s ease;
    
    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
    }
    
    &:active {
      transform: translateY(0);
    }
  }
  
  .btn-outline-secondary {
    &:hover {
      border-color: #007BFF;
      color: #007BFF;
    }
  }
`;

export const NavigationButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: 1px solid #DEE2E6;
  background-color: #FFFFFF;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #6C757D;
  
  @media (max-width: 767px) {
    width: 44px;
    height: 44px;
    
    svg {
      width: 18px;
      height: 18px;
    }
  }
  
  &:hover {
    background-color: #F8F9FA;
    border-color: #007BFF;
    color: #007BFF;
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 123, 255, 0.15);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

export const DateDisplayButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 8px 16px;
  height: 40px;
  min-width: 200px;
  justify-content: space-between;
  border: 1px solid #DEE2E6;
  background-color: #FFFFFF;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #495057;
  font-weight: 500;
  
  &:hover {
    background-color: #F8F9FA;
    border-color: #007BFF;
    color: #007BFF;
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 123, 255, 0.15);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  span {
    font-size: 1.1rem;
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

export const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 4rem 2rem;
`;

export const ErrorContainer = styled.div`
  background-color: #F8D7DA;
  border: 1px solid #F5C6CB;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 2rem;
  color: #721C24;
`;

export const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  color: #6C757D;
  
  h3 {
    font-size: 1.5rem;
    margin-bottom: 1rem;
    color: #495057;
  }
  
  p {
    font-size: 1.1rem;
    margin: 0;
  }
`;