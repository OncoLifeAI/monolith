import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Background, WrapperStyle, ForgotPassword as ForgotPasswordComponent } from '@oncolife/ui-components';
import { LoginHeader } from './LoginPage.styles';
import logo from '../../assets/logo.png';
import { Logo } from '@oncolife/ui-components';
import { useForgotPassword, useResetPassword } from '../../services/login';
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
  const forgotPasswordMutation = useForgotPassword();
  const resetPasswordMutation = useResetPassword();
  
  // Get email from navigation state if it was passed from login page
  const initialEmail = location.state?.email || '';

  const handleForgotPassword = async (email: string) => {
    try {
      await forgotPasswordMutation.mutateAsync({ email });
    } catch (error: any) {
      // Re-throw the error so the UI component can handle it
      throw new Error(error?.response?.data?.message || error?.message || 'Failed to send reset email');
    }
  };

  const handleResetPassword = async (email: string, confirmationCode: string, newPassword: string) => {
    try {
      await resetPasswordMutation.mutateAsync({ 
        email, 
        confirmation_code: confirmationCode, 
        new_password: newPassword 
      });
    } catch (error: any) {
      // Re-throw the error so the UI component can handle it
      throw new Error(error?.response?.data?.message || error?.message || 'Failed to reset password');
    }
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
            userType="patient"
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
