import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Login from './Login';
import logo from '../../assets/logo.png';
import { Background, WrapperStyle, Header, Logo } from '../../styles/GlobalStyles';
import {
  TopRightText,
  MainContent,
  Footer,
} from './LoginPage.styles';

const LoginPage: React.FC = () => {
  const [resetPassword, setResetPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const handleTogglePassword = () => setShowPassword((prev) => !prev);
  const navigate = useNavigate();

  const handleLogin = () => {
    // authenticateLogin(email, password);
    navigate('/reset-password');
  }

  return (
    <Background>
      <WrapperStyle>
        <Header>
          <Logo src={logo} alt="Logo" />
          <TopRightText>
            Don't you have an account? <Link to="/signup">Sign up</Link>
          </TopRightText>
        </Header>
        
        <MainContent>
          <Login />
        </MainContent>
        
        <Footer>© 2025 OncoLife - All Right Reserved</Footer>
      </WrapperStyle>
    </Background>
  );
};

export default LoginPage; 