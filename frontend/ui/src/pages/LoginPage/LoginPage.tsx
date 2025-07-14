import React from 'react';
import { Link } from 'react-router-dom';
import Login from './Login';
import logo from '../../assets/logo.png';
import { Background, WrapperStyle, Header, Logo } from '../../styles/GlobalStyles';
import {
  TopRightText,
  MainContent,
  Footer,
} from './LoginPage.styles';

const LoginPage: React.FC = () => {
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