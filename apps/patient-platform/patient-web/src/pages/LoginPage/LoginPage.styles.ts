import styled from 'styled-components';
import { Form, Button } from 'react-bootstrap';

export const LoginTitle = styled.h2`
  font-size: 1.6rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
  text-align: center;
`;

export const LoginHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2.25rem 2.25rem 0 2.25rem;
  flex-shrink: 0;

  @media (max-width: 768px) {
    padding: 1.5rem 1.5rem 0 1.5rem;
  }

  @media (max-width: 480px) {
    padding: 1rem 1rem 0 1rem;
  }
`;

export const TopRightText = styled.div`
  font-size: 1rem;
  color: #222;
  
  @media (max-width: 480px) {
    font-size: 0.875rem;
  }
  
  a {
    color: #222;
    text-decoration: underline;
    margin-left: 0.25rem;
  }
`;

export const MainContent = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 2.25rem;
  overflow-y: auto;
  overflow-x: hidden;

  @media (max-width: 768px) {
    padding: 0 1.5rem;
    align-items: flex-start;
    padding-top: 1rem;
    padding-bottom: 1rem;
  }

  @media (max-width: 480px) {
    padding: 0.5rem 1rem;
    align-items: flex-start;
    padding-top: 1rem;
    padding-bottom: 1rem;
  }
`;

export const StyledForm = styled(Form)`
  width: 100%;
`;

export const ForgotPassword = styled.a`
  font-size: 0.95rem;
  color: #4d7cfe;
  text-decoration: none;
  float: right;
  margin-top: 0.25rem;
  margin-bottom: 1.25rem;
  cursor: pointer;
`;

export const Footer = styled.div`
  padding: 0 2.25rem 1.5rem 2.25rem;
  font-size: 0.95rem;
  color: #222;
  opacity: 0.7;
  flex-shrink: 0;

  @media (max-width: 768px) {
    padding: 0 1.5rem 1.25rem 1.5rem;
  }

  @media (max-width: 480px) {
    padding: 0 1rem 1rem 1rem;
    font-size: 0.875rem;
  }
`;

export const StyledInputGroup = styled.div`
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 1rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  padding: 0.75rem 1rem;
  margin-bottom: 1.25rem;
  border: 2px solid transparent;
  transition: border 0.2s, box-shadow 0.2s;
  min-height: 3.5rem;

  &:focus-within {
    border: 2px solid #4d7cfe;
    box-shadow: 0 4px 12px rgba(77, 124, 254, 0.15);
  }

  @media (max-width: 480px) {
    padding: 0.875rem 1rem;
    min-height: 3.75rem;
    border-radius: 0.75rem;
  }
`;

export const StyledInput = styled.input`
  border: none;
  outline: none;
  background: transparent;
  flex: 1;
  font-size: 1.1rem;
  padding: 0.5rem 0.5rem;
  color: #222;
  
  &::placeholder {
    color: #bbb;
    opacity: 1;
  }

  @media (max-width: 480px) {
    font-size: 1rem;
    padding: 0.25rem 0.5rem;
  }
`;

export const InputIcon = styled.span`
  display: flex;
  align-items: center;
  color: #888;
  margin-right: 0.75rem;
  font-size: 1.2rem;
`;

export const EyeButton = styled.button`
  background: none;
  border: none;
  outline: none;
  cursor: pointer;
  color: #888;
  display: flex;
  align-items: center;
  font-size: 1.2rem;
  margin-left: 0.5rem;
  padding: 0;
`;

export const StyledButton = styled(Button)`
  width: 100%;
  background: #4d97fe;
  color: #fff;
  border: none;
  border-radius: 1rem;
  padding: 1rem 0;
  font-size: 1.25rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  outline: none;
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
  min-height: 3.5rem;

  &:hover, &:focus {
    background: #357ae8;
    color: #fff;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(77, 151, 254, 0.25);
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  }

  @media (max-width: 480px) {
    padding: 1.125rem 0;
    font-size: 1.125rem;
    min-height: 3.75rem;
    border-radius: 0.75rem;
  }
`;

export const AcknowledgementText = styled.p<{ $bold?: boolean; $marginTop?: string; $marginBottom?: string }>`
  font-size: 1rem;
  text-align: left;
  width: 100%;
  line-height: 1.5;
  margin-bottom: 1rem;
  color: #333;
  font-weight: ${props => props.$bold ? 'bold' : 'normal'};
  margin-top: ${props => props.$marginTop || '0'};
  margin-bottom: ${props => props.$marginBottom || '1rem'};

  @media (max-width: 480px) {
    font-size: 0.95rem;
    line-height: 1.4;
  }
`; 