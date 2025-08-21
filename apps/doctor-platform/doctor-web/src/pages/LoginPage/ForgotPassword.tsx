import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Background, WrapperStyle, ForgotPassword as ForgotPasswordComponent, Logo } from '@oncolife/ui-components';
import { LoginHeader } from './LoginPage.styles';
import logo from '../../assets/logo.png';
import styled from 'styled-components';

const MobileContainer = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 36px;
  min-height: 0;
  overflow-y: auto;

  @media (max-width: 480px) {
    padding: 0 16px;
  }

  @media (max-width: 360px) {
    padding: 0 12px;
  }
`;

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get email from navigation state if it was passed from login page
  const initialEmail = location.state?.email || '';

  const handleForgotPassword = async (email: string) => {
    // TODO: Implement API call for password reset
    console.log('Doctor forgot password request:', { email });
    
    // For now, just simulate success
    // In the future, this will call the actual API
    return Promise.resolve();
  };

  const handleResetPassword = async (email: string, confirmationCode: string, newPassword: string) => {
    // TODO: Implement API call for password reset
    console.log('Doctor reset password request:', { email, confirmationCode: '***', newPassword: '***' });
    
    // For now, just simulate success
    // In the future, this will call the actual API
    return Promise.resolve();
  };

  const handleBackToLogin = () => {
    navigate('/login');
  };

  return (
    <Background>
      <WrapperStyle>
        <LoginHeader>
          <Logo src={logo} alt="OncoLife Logo" />
        </LoginHeader>
        <MobileContainer>
          <ForgotPasswordComponent
            userType="doctor"
            initialEmail={initialEmail}
            onSubmit={handleForgotPassword}
            onResetPassword={handleResetPassword}
            onBackToLogin={handleBackToLogin}
          />
        </MobileContainer>
      </WrapperStyle>
    </Background>
  );
};

export default ForgotPassword;
