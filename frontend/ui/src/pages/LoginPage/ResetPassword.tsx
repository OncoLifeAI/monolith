import React, { useEffect, useState} from 'react';
import { Background, WrapperStyle, Header, Logo, Card, Title, Subtitle } from '../../styles/GlobalStyles';
import { MainContent, StyledButton } from './LoginPage.styles';
import InputPassword from '../../common/InputPassword/InputPassword';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const ResetPassword: React.FC = () => {
    const [resetPassword, setResetPassword] = useState<string>('');
    const { completeNewPassword, user } = useAuth();
    const navigate = useNavigate();

    const handleResetPassword = async () => {
      if (user?.email) {
        await completeNewPassword(user.email, resetPassword);
        navigate('/acknowledgement'); // Navigate after successful password reset
      }
    };

  return (
    <Background>
      <WrapperStyle>
        <Header>
            <Logo src="/src/assets/logo.png" alt="Logo" />
        </Header>
        <MainContent>
            <Card> 
                <Title>New Password</Title>
                <Subtitle>Please enter your new password</Subtitle>
                <div style={{ marginBottom: '10px', width: '100%' }}>
                    <InputPassword
                        value={resetPassword}
                        onChange={setResetPassword}
                        className="mb-1"
                        label="New Password"
                        placeholder="New Password"
                    />
                </div>

                <StyledButton variant="primary" type="button" onClick={handleResetPassword}>
                    Reset Password
                </StyledButton>
            </Card>
        </MainContent>
      </WrapperStyle>
    </Background>
  );
};

export default ResetPassword;