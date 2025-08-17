import styled from 'styled-components';

export const InputGroup = styled.div`
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

export const Input = styled.input`
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