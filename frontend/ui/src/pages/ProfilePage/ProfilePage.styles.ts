import styled from "styled-components";

export const ProfileContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #F8F9FA;
`;

export const ProfileHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem 2rem;
  background-color: #FFFFFF;
  border-bottom: 1px solid #E0E0E0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
`;

export const ProfileTitle = styled.h1`
  font-size: 2.25rem;
  font-weight: 700;
  color: #2C3E50;
  margin: 0;
  letter-spacing: -0.5px;
`;

export const ProfileContent = styled.div`
  display: flex;
  flex-direction: column;
  padding: 2rem;
  flex: 1;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
`;

export const ProfileCard = styled.div`
  background-color: #FFFFFF;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  padding: 2rem;
  margin-bottom: 2rem;
`;

export const ProfileInfoHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #E9ECEF;
`;

export const ProfileImageContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const ProfileImage = styled.div<{ imageUrl?: string }>`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-image: ${props => props.imageUrl ? `url(${props.imageUrl})` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'};
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 2rem;
  font-weight: 600;
  border: 3px solid #FFFFFF;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
`;

export const EditImageButton = styled.button`
  position: absolute;
  bottom: 0;
  right: 0;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background-color: #007BFF;
  border: 2px solid #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  color: white;
  
  &:hover {
    background-color: #0056b3;
    transform: scale(1.1);
  }
  
  svg {
    width: 14px;
    height: 14px;
  }
`;

export const ProfileInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

export const ProfileName = styled.h2`
  font-size: 1.75rem;
  font-weight: 600;
  color: #2C3E50;
  margin: 0;
`;

export const ProfileEmail = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #6C757D;
  font-size: 1rem;
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

export const EditProfileButton = styled.button`
  background-color: #007BFF;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: #0056b3;
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 123, 255, 0.3);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

export const SectionTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: #495057;
  margin: 0 0 1.5rem 0;
`;

export const InformationGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  
  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

export const InformationColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

export const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

export const InputLabel = styled.label`
  font-size: 0.875rem;
  font-weight: 600;
  color: #495057;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

export const InputField = styled.input<{ isEditing?: boolean }>`
  padding: 0.75rem 1rem;
  border: 1px solid ${props => props.isEditing ? '#007BFF' : '#DEE2E6'};
  border-radius: 8px;
  font-size: 1rem;
  color: #495057;
  background-color: ${props => props.isEditing ? '#F8F9FA' : '#FFFFFF'};
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #007BFF;
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
  }
  
  &:disabled {
    background-color: #F8F9FA;
    color: #6C757D;
    cursor: not-allowed;
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

export const SaveButton = styled.button`
  background-color: #28A745;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 1rem;
  
  &:hover {
    background-color: #218838;
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(40, 167, 69, 0.3);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &:disabled {
    background-color: #6C757D;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

export const CancelButton = styled.button`
  background-color: #6C757D;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 1rem;
  margin-left: 1rem;
  
  &:hover {
    background-color: #545B62;
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(108, 117, 125, 0.3);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

export const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
`; 