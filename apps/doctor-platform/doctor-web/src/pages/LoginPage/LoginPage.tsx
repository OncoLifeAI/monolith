import React from 'react';
import Login from './Login';
import logo from '../../assets/logo.png';
import { Background, WrapperStyle, Logo } from '@oncolife/ui-components';
import {
  TopRightText,
  MainContent,
  Footer,
  LoginHeader,
} from './LoginPage.styles';

const LoginPage: React.FC = () => {
  return (
    <Background>
      <WrapperStyle>
        <LoginHeader>
          <Logo src={logo} alt="Logo" />
          <TopRightText>
            Doctor Portal - OncoLife AI
          </TopRightText>
        </LoginHeader>
        
        <MainContent>
          <Login />
        </MainContent>
        
        <Footer>© 2025 OncoLife - All Right Reserved</Footer>
      </WrapperStyle>
    </Background>
  );
};

export default LoginPage;
