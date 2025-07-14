import React, { useEffect, useState } from 'react';
import { Form } from 'react-bootstrap';
import { Mail } from 'lucide-react';
import { Card, Title, Subtitle } from '../../styles/GlobalStyles';
import {
  StyledForm,
  ForgotPassword,
  Divider,
  SocialRow,
  SocialIcon,
  StyledInputGroup,
  StyledInput,
  InputIcon,
  StyledButton
} from './LoginPage.styles';
import { useAuth } from '../../contexts/AuthContext';
import InputPassword from '../../common/InputPassword/InputPassword';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { authenticateLogin } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async() => {
    const result = await authenticateLogin(email, password);
    if (result?.data?.requiresPasswordChange) {
      navigate('/reset-password');
    }
    if (result.data.user_status === 'CONFIRMED') {
      navigate('/dashboard');
    }
  };

  return (
    <Card>
      <Title>Welcome Back to OncoLife AI <span role="img" aria-label="wave">👋🏻</span></Title>
      <Subtitle>Please enter your details to sign in to your account</Subtitle>
      <StyledForm>
        <Form.Group className="mb-3" controlId="formEmail">
          <Form.Label>Email</Form.Label>
          <StyledInputGroup>
            <InputIcon>
              <Mail size={20} />
            </InputIcon>
            <StyledInput
              type="email"
              placeholder="Your Email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </StyledInputGroup>
        </Form.Group>
        <InputPassword
          value={password}
          onChange={setPassword}
          className="mb-1"
          label="Password"
          placeholder="Password"
        />
        <ForgotPassword href="#">Forgot Password?</ForgotPassword>
        <StyledButton variant="primary" type="button" onClick={handleLogin}>
          Sign In
        </StyledButton>
      </StyledForm>
      <Divider>Or continue with</Divider>
      <SocialRow>
        <SocialIcon src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg" alt="Google" />
      </SocialRow>
    </Card>
  );
};

export default Login; 