import React, { useState, useEffect } from 'react';
import { Mail, ArrowLeft, Check, X } from 'lucide-react';
import { Card, Title, Subtitle } from '../../styles/GlobalStyles';
import {
  StyledForm,
  StyledInputGroup,
  StyledInput,
  InputIcon,
  StyledButton
} from './LoginPage.styles';
import InputPassword from '../../components/Login/InputPassword';
import styled from 'styled-components';

const passwordRules = [
  {
    label: 'Contains at least 1 number',
    test: (pw: string) => /\d/.test(pw),
  },
  {
    label: 'Contains at least 1 special character',
    test: (pw: string) => /[!@#$%^&*(),.?":{}|<>]/.test(pw),
  },
  {
    label: 'Contains at least 1 uppercase letter',
    test: (pw: string) => /[A-Z]/.test(pw),
  },
  {
    label: 'Contains at least 1 lowercase letter',
    test: (pw: string) => /[a-z]/.test(pw),
  },
  {
    label: 'Minimum of 8 characters long',
    test: (pw: string) => pw.length >= 8,
  },
];

const CodeInput = styled.input`
  width: 100%;
  padding: 1rem;
  font-size: 1.5rem;
  text-align: center;
  letter-spacing: 0.5rem;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  background: white;
  transition: all 0.2s;
  font-family: 'Courier New', monospace;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
  
  &:disabled {
    background-color: #f9fafb;
    cursor: not-allowed;
  }

  @media (max-width: 480px) {
    padding: 0.8rem;
    font-size: 1.3rem;
    letter-spacing: 0.3rem;
  }
`;

const RuleList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0 0 8px 0;
`;

const RuleItem = styled.li<{ status: 'gray' | 'green' | 'red' }>`
  display: flex;
  align-items: center;
  color: ${({ status }) =>
    status === 'green' ? '#22c55e' : status === 'red' ? '#ef4444' : '#888'};
  font-size: 0.85rem;
  margin-bottom: 2px;
  svg {
    margin-right: 6px;
    min-width: 18px;
  }

  @media (max-width: 480px) {
    font-size: 0.8rem;
    margin-bottom: 1px;
  }
`;

const PasswordMatchIndicator = styled.div<{ type: 'match' | 'mismatch' }>`
  color: ${({ type }) => type === 'match' ? '#22c55e' : '#ef4444'};
  font-size: 0.85rem;
  margin-top: 0.3rem;
  display: flex;
  align-items: center;

  @media (max-width: 480px) {
    font-size: 0.8rem;
    margin-top: 0.25rem;
  }
`;

const ValidationSection = styled.div`
  padding-top: 8px;

  @media (max-width: 480px) {
    padding-top: 6px;
  }
`;

const MobileLabel = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #374151;
  font-size: 1rem;

  @media (max-width: 480px) {
    font-size: 0.95rem;
    margin-bottom: 0.4rem;
  }
`;

const MessageBox = styled.div<{ type: 'error' | 'success' }>`
  color: ${({ type }) => type === 'error' ? '#ef4444' : '#22c55e'};
  margin-bottom: 0.75rem;
  padding: 0.6rem;
  background-color: ${({ type }) => type === 'error' ? '#fef2f2' : '#f0fdf4'};
  border: 1px solid ${({ type }) => type === 'error' ? '#fecaca' : '#bbf7d0'};
  border-radius: 0.4rem;
  font-size: 0.85rem;
  line-height: 1.3;

  @media (max-width: 480px) {
    padding: 0.5rem;
    font-size: 0.8rem;
    margin-bottom: 0.6rem;
    border-radius: 0.3rem;
  }
`;

const FormSection = styled.div`
  margin-bottom: 0.75rem;
  width: 100%;

  @media (max-width: 480px) {
    margin-bottom: 0.6rem;
  }
`;

const MobileStyledButton = styled(StyledButton)`
  margin-bottom: 0.5rem;
  
  @media (max-width: 480px) {
    font-size: 1rem;
    padding: 0.7rem 0;
    border-radius: 10px;
    margin-top: 0.3rem;
    margin-bottom: 0.4rem;
  }

  @media (max-width: 360px) {
    font-size: 0.95rem;
    padding: 0.65rem 0;
  }
`;

const MobileTitle = styled(Title)`
  margin-bottom: 0.75rem;
  
  @media (max-width: 480px) {
    font-size: 1.4rem;
    margin-bottom: 0.5rem;
  }

  @media (max-width: 360px) {
    font-size: 1.3rem;
    margin-bottom: 0.4rem;
  }
`;

const MobileSubtitle = styled(Subtitle)`
  word-break: break-word;
  overflow-wrap: break-word;
  padding: 0 0.5rem;
  margin-bottom: 1rem;
  
  @media (max-width: 480px) {
    font-size: 0.85rem;
    margin-bottom: 0.75rem;
    line-height: 1.3;
    padding: 0 0.25rem;
  }

  @media (max-width: 360px) {
    font-size: 0.8rem;
    line-height: 1.4;
    padding: 0;
    margin-bottom: 0.6rem;
  }
`;

const SuccessCard = styled(Card)`
  text-align: center;
  padding: 2rem;
  
  @media (max-width: 480px) {
    padding: 1.5rem;
  }
`;

const CountdownText = styled.div`
  font-size: 1.1rem;
  color: #6b7280;
  margin: 1rem 0;
  
  @media (max-width: 480px) {
    font-size: 1rem;
  }
`;

const MobileStyledInputGroup = styled(StyledInputGroup)`
  @media (max-width: 480px) {
    padding: 0.4rem 0.8rem;
    margin-bottom: 1rem;
    border-radius: 12px;
  }

  @media (max-width: 360px) {
    padding: 0.35rem 0.7rem;
    border-radius: 10px;
  }
`;

const MobileInputIcon = styled(InputIcon)`
  @media (max-width: 480px) {
    margin-right: 0.6rem;
    font-size: 1.1rem;
  }

  @media (max-width: 360px) {
    margin-right: 0.5rem;
    font-size: 1rem;
  }
`;

const MobileStyledInput = styled(StyledInput)`
  @media (max-width: 480px) {
    font-size: 1rem;
    padding: 0.6rem 0.4rem;
  }

  @media (max-width: 360px) {
    font-size: 0.95rem;
    padding: 0.5rem 0.3rem;
  }
`;

interface ForgotPasswordProps {
  onSubmit?: (email: string) => Promise<void>;
  onResetPassword?: (email: string, confirmationCode: string, newPassword: string) => Promise<void>;
  onBackToLogin?: () => void;
  userType?: 'patient' | 'doctor';
  initialEmail?: string;
}

const ForgotPassword: React.FC<ForgotPasswordProps> = ({ 
  onSubmit,
  onResetPassword,
  onBackToLogin,
  userType = 'patient',
  initialEmail = ''
}) => {
  const [step, setStep] = useState<'email' | 'verify' | 'success'>('email');
  const [email, setEmail] = useState(initialEmail);
  const [confirmationCode, setConfirmationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [timerId, setTimerId] = useState<NodeJS.Timeout | null>(null);

  // Countdown timer effect
  useEffect(() => {
    if (step === 'success' && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      setTimerId(timer);
      return () => clearTimeout(timer);
    } else if (step === 'success' && countdown === 0) {
      // Auto redirect when countdown reaches 0
      if (onBackToLogin) {
        onBackToLogin();
      }
    }
  }, [step, countdown, onBackToLogin]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerId) {
        clearTimeout(timerId);
      }
    };
  }, [timerId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    if (step === 'email') {
      // Email step validation
      if (!email.trim()) {
        setError('Email is required');
        setIsLoading(false);
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setError('Please enter a valid email address');
        setIsLoading(false);
        return;
      }

      try {
        if (onSubmit) {
          await onSubmit(email);
          setSuccess('Code sent successfully');
          setStep('verify'); // Move to verification step
        } else {
          console.log('Password reset request:', { email, userType });
          setSuccess('Code sent successfully');
          setStep('verify');
        }
      } catch (err: any) {
        let message = 'Failed to send password reset email';
        if (err.message === 'USER_NOT_FOUND') {
          message = 'Code sent successfully';
          setStep('verify'); // Still proceed for security
        } else if (err.message === 'INVALID_EMAIL') {
          message = 'Please enter a valid email address';
        } else if (err.message === 'RATE_LIMITED') {
          message = 'Too many requests. Please try again later';
        } else if (err.message) {
          message = err.message;
        }
        
        if (err.message === 'USER_NOT_FOUND') {
          setSuccess(message);
          setStep('verify');
        } else {
          setError(message);
        }
      } finally {
        setIsLoading(false);
      }
    } else {
      // Verification step validation
      if (!confirmationCode.trim()) {
        setError('Verification code is required');
        setIsLoading(false);
        return;
      }

      if (confirmationCode.length !== 6) {
        setError('Please enter the 6-digit code');
        setIsLoading(false);
        return;
      }

      if (!newPassword.trim()) {
        setError('New password is required');
        setIsLoading(false);
        return;
      }

      if (!confirmPassword.trim()) {
        setError('Please confirm your new password');
        setIsLoading(false);
        return;
      }

      // Password validation
      const failedRules = passwordRules.filter(rule => !rule.test(newPassword));
      if (failedRules.length > 0) {
        setError('Please ensure your password meets all requirements');
        setIsLoading(false);
        return;
      }

      if (newPassword !== confirmPassword) {
        setError('Passwords do not match');
        setIsLoading(false);
        return;
      }

      try {
        if (onResetPassword) {
          await onResetPassword(email, confirmationCode, newPassword);
          // On success, show success screen
          setSuccess('Password reset successfully!');
          setCountdown(5); // Reset countdown
          setStep('success');
        } else {
          console.log('Password reset:', { email, confirmationCode: '***', newPassword: '***' });
          setSuccess('Password reset successfully!');
          setCountdown(5);
          setStep('success');
        }
      } catch (err: any) {
        let message = 'Failed to reset password';
        if (err.message === 'INVALID_CODE') {
          message = 'Invalid or expired verification code';
        } else if (err.message === 'WEAK_PASSWORD') {
          message = 'Password does not meet security requirements';
        } else if (err.message === 'CODE_EXPIRED') {
          message = 'Verification code has expired. Please request a new one.';
        } else if (err.message) {
          message = err.message;
        }
        setError(message);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleBackToLogin = () => {
    // Cancel timer if it's running
    if (timerId) {
      clearTimeout(timerId);
      setTimerId(null);
    }
    
    if (onBackToLogin) {
      onBackToLogin();
    } else {
      // Default behavior - could navigate back
      console.log('Back to login clicked');
    }
  };

  const handleBackToEmail = () => {
    setStep('email');
    setError(null);
    setSuccess(null);
    setConfirmationCode('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const platformName = userType === 'doctor' ? 'OncoLife Doctor Portal' : 'OncoLife AI';

  // Success screen
  if (step === 'success') {
    return (
      <SuccessCard>
        <MobileTitle>Success! ✅</MobileTitle>
        <MessageBox type="success" style={{ marginBottom: '1.5rem' }}>
          {success}
        </MessageBox>
        <CountdownText>
          Redirecting to login in {countdown} second{countdown !== 1 ? 's' : ''}...
        </CountdownText>
        <MobileStyledButton 
          variant="outline-secondary" 
          type="button" 
          onClick={handleBackToLogin}
          style={{ 
            background: 'transparent',
            color: '#6b7280',
            border: '2px solid #e5e7eb',
            fontWeight: '400'
          }}
        >
          <ArrowLeft size={18} style={{ marginRight: '0.5rem' }} />
          Back to Login Now
        </MobileStyledButton>
      </SuccessCard>
    );
  }

  if (step === 'email') {
    return (
      <Card>
        <MobileTitle>Forgot Password? 🔒</MobileTitle>
        <MobileSubtitle>
          Enter your email address and we'll send you a password reset code for {platformName}
        </MobileSubtitle>
        
        {error && (
          <MessageBox type="error">
            {error}
          </MessageBox>
        )}
        
        {success && (
          <MessageBox type="success">
            {success}
          </MessageBox>
        )}

        <StyledForm onSubmit={handleSubmit}>
          <FormSection>
            <MobileLabel>
              Email Address
            </MobileLabel>
            <MobileStyledInputGroup>
              <MobileInputIcon>
                <Mail size={20} />
              </MobileInputIcon>
              <MobileStyledInput
                type="email"
                placeholder="Enter your email address"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </MobileStyledInputGroup>
          </FormSection>

          <MobileStyledButton 
            variant="primary" 
            type="submit" 
            disabled={isLoading || !email.trim()}
          >
            {isLoading ? 'Sending Reset Code...' : 'Send Reset Code'}
          </MobileStyledButton>

          <MobileStyledButton 
            variant="outline-secondary" 
            type="button" 
            onClick={handleBackToLogin}
            disabled={isLoading}
            style={{ 
              background: 'transparent',
              color: '#6b7280',
              border: '2px solid #e5e7eb',
              fontWeight: '400',
              marginBottom: 0
            }}
          >
            <ArrowLeft size={16} style={{ marginRight: '0.3rem' }} />
            Back to Login
          </MobileStyledButton>
        </StyledForm>
      </Card>
    );
  }

  // Verification step
  return (
    <Card>
      <MobileTitle>Reset Password 🔐</MobileTitle>
      <MobileSubtitle>
        Enter code sent to {email}
      </MobileSubtitle>
      
      {error && (
        <MessageBox type="error">
          {error}
        </MessageBox>
      )}
      
      {success && (
        <MessageBox type="success">
          {success}
        </MessageBox>
      )}

      <StyledForm onSubmit={handleSubmit}>
        <FormSection>
          <MobileLabel>
            Verification Code
          </MobileLabel>
          <CodeInput
            type="text"
            placeholder="000000"
            maxLength={6}
            value={confirmationCode}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '');
              setConfirmationCode(value);
            }}
            disabled={isLoading}
            autoComplete="one-time-code"
          />
        </FormSection>

        <FormSection>
          <InputPassword
            value={newPassword}
            onChange={setNewPassword}
            label="New Password"
            placeholder="Enter your new password"
          />
          <ValidationSection>
            <RuleList>
              {passwordRules.map((rule) => {
                const valid = rule.test(newPassword);
                let status: 'gray' | 'green' | 'red' = 'gray';
                if (newPassword.length > 0) {
                  status = valid ? 'green' : 'red';
                }
                return (
                  <RuleItem key={rule.label} status={status}>
                    {status === 'green' && <Check size={18} />}
                    {status === 'red' && <X size={18} />}
                    {status === 'gray' && <span style={{ width: 18, display: 'inline-block' }} />}
                    {rule.label}
                  </RuleItem>
                );
              })}
            </RuleList>
          </ValidationSection>
        </FormSection>

        <FormSection>
          <InputPassword
            value={confirmPassword}
            onChange={setConfirmPassword}
            label="Confirm New Password"
            placeholder="Confirm your new password"
          />
          {confirmPassword && newPassword !== confirmPassword && (
            <PasswordMatchIndicator type="mismatch">
              <X size={16} style={{ marginRight: '0.5rem' }} />
              Passwords do not match
            </PasswordMatchIndicator>
          )}
          {confirmPassword && newPassword === confirmPassword && newPassword.length > 0 && (
            <PasswordMatchIndicator type="match">
              <Check size={16} style={{ marginRight: '0.5rem' }} />
              Passwords match
            </PasswordMatchIndicator>
          )}
        </FormSection>

        <MobileStyledButton 
          variant="primary" 
          type="submit" 
          disabled={isLoading || !confirmationCode.trim() || !newPassword.trim() || !confirmPassword.trim()}
          style={{ marginBottom: '0.5rem' }}
        >
          {isLoading ? 'Resetting Password...' : 'Reset Password'}
        </MobileStyledButton>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <MobileStyledButton 
            variant="outline-secondary" 
            type="button" 
            onClick={handleBackToEmail}
            disabled={isLoading}
            style={{ 
              background: 'transparent',
              color: '#6b7280',
              border: '2px solid #e5e7eb',
              fontWeight: '400',
              flex: 1,
              marginBottom: 0
            }}
          >
            <ArrowLeft size={16} style={{ marginRight: '0.3rem' }} />
            Back to Email
          </MobileStyledButton>

          <MobileStyledButton 
            variant="outline-secondary" 
            type="button" 
            onClick={handleBackToLogin}
            disabled={isLoading}
            style={{ 
              background: 'transparent',
              color: '#6b7280',
              border: '2px solid #e5e7eb',
              fontWeight: '400',
              flex: 1,
              marginBottom: 0
            }}
          >
            Back to Login
          </MobileStyledButton>
        </div>
      </StyledForm>
    </Card>
  );
};

export default ForgotPassword;
