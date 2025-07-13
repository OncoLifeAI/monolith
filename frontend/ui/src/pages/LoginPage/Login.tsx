import React, { useState } from 'react';
import { Form } from 'react-bootstrap';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import {
  Card,
  Title,
  Subtitle,
  StyledForm,
  ForgotPassword,
  Divider,
  SocialRow,
  SocialIcon,
  StyledInputGroup,
  StyledInput,
  InputIcon,
  EyeButton,
  StyledButton
} from './LoginPage.styles';
import { useAuth } from '../../contexts/AuthContext';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { authenticateLogin } = useAuth();

  const handleTogglePassword = () => setShowPassword((prev) => !prev);

  const handleLogin = () => {
    authenticateLogin(email, password);
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
        <Form.Group className="mb-1" controlId="formPassword">
          <Form.Label>Password</Form.Label>
          <StyledInputGroup>
            <InputIcon>
              <Lock size={20} />
            </InputIcon>
            <StyledInput
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <EyeButton type="button" onClick={handleTogglePassword} aria-label={showPassword ? "Hide password" : "Show password"}>
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </EyeButton>
          </StyledInputGroup>
        </Form.Group>
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