import React, { useState } from 'react';
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

const RuleList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0 0 16px 0;
`;

const RuleItem = styled.li<{ status: 'gray' | 'green' | 'red' }>`
  display: flex;
  align-items: center;
  color: ${({ status }) =>
    status === 'green' ? '#22c55e' : status === 'red' ? '#ef4444' : '#888'};
  font-size: 0.97rem;
  margin-bottom: 4px;
  svg {
    margin-right: 8px;
  }

  @media (max-width: 480px) {
    font-size: 0.9rem;
    margin-bottom: 6px;
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
  margin-bottom: 1rem;
  padding: 0.75rem;
  background-color: ${({ type }) => type === 'error' ? '#fef2f2' : '#f0fdf4'};
  border: 1px solid ${({ type }) => type === 'error' ? '#fecaca' : '#bbf7d0'};
  border-radius: 0.5rem;
  font-size: 0.9rem;
  line-height: 1.4;

  @media (max-width: 480px) {
    padding: 0.6rem;
    font-size: 0.85rem;
    margin-bottom: 0.8rem;
    border-radius: 0.4rem;
  }
`;

const PasswordMatchIndicator = styled.div<{ type: 'match' | 'mismatch' }>`
  color: ${({ type }) => type === 'match' ? '#22c55e' : '#ef4444'};
  font-size: 0.9rem;
  margin-top: 0.5rem;
  display: flex;
  align-items: center;

  @media (max-width: 480px) {
    font-size: 0.85rem;
    margin-top: 0.4rem;
  }
`;

const FormSection = styled.div`
  margin-bottom: 1rem;
  width: 100%;

  @media (max-width: 480px) {
    margin-bottom: 0.8rem;
  }
`;

const PasswordSection = styled.div`
  margin-bottom: 10px;
  width: 100%;

  @media (max-width: 480px) {
    margin-bottom: 8px;
  }
`;

const ValidationSection = styled.div`
  padding-top: 16px;

  @media (max-width: 480px) {
    padding-top: 12px;
  }
`;

const MobileStyledButton = styled(StyledButton)`
  @media (max-width: 480px) {
    font-size: 1.1rem;
    padding: 0.8rem 0;
    border-radius: 12px;
    margin-top: 0.4rem;
    margin-bottom: 0.4rem;
  }

  @media (max-width: 360px) {
    font-size: 1rem;
    padding: 0.75rem 0;
  }
`;

const MobileTitle = styled(Title)`
  @media (max-width: 480px) {
    font-size: 1.6rem;
    margin-bottom: 0.5rem;
  }

  @media (max-width: 360px) {
    font-size: 1.4rem;
  }
`;

const MobileSubtitle = styled(Subtitle)`
  @media (max-width: 480px) {
    font-size: 0.9rem;
    margin-bottom: 1rem;
    line-height: 1.3;
  }

  @media (max-width: 360px) {
    font-size: 0.85rem;
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
  onSubmit?: (email: string, newPassword: string, confirmPassword: string) => Promise<void>;
  onBackToLogin?: () => void;
  userType?: 'patient' | 'doctor';
  initialEmail?: string;
}

const ForgotPassword: React.FC<ForgotPasswordProps> = ({ 
  onSubmit, 
  onBackToLogin,
  userType = 'patient',
  initialEmail = ''
}) => {
  const [email, setEmail] = useState(initialEmail);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [touched, setTouched] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);
    setTouched(true);

    // Basic validation
    if (!email.trim()) {
      setError('Email is required');
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

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
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

    // Password confirmation validation
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      if (onSubmit) {
        await onSubmit(email, newPassword, confirmPassword);
        setSuccess('Your password has been reset successfully!');
      } else {
        // Default behavior - just log the attempt
        console.log('Password reset attempt:', { email, userType });
        setSuccess('Your password has been reset successfully!');
      }
    } catch (err: any) {
      let message = 'Failed to reset password';
      if (err.message === 'USER_NOT_FOUND') {
        message = 'No account found with this email address';
      } else if (err.message === 'INVALID_EMAIL') {
        message = 'Please enter a valid email address';
      } else if (err.message === 'WEAK_PASSWORD') {
        message = 'Password does not meet security requirements';
      } else if (err.message === 'RATE_LIMITED') {
        message = 'Too many requests. Please try again later';
      } else if (err.message) {
        message = err.message;
      }
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    if (onBackToLogin) {
      onBackToLogin();
    } else {
      // Default behavior - could navigate back
      console.log('Back to login clicked');
    }
  };

  const platformName = userType === 'doctor' ? 'OncoLife Doctor Portal' : 'OncoLife AI';

  return (
    <Card>
      <MobileTitle>Reset Password 🔒</MobileTitle>
      <MobileSubtitle>
        Enter your email and create a new password for {platformName}
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

        <PasswordSection
          onBlur={() => setTouched(true)}
          tabIndex={-1}
        >
          <InputPassword
            value={newPassword}
            onChange={(val) => {
              setNewPassword(val);
              if (!touched) setTouched(true);
            }}
            className="mb-1"
            label="New Password"
            placeholder="Enter your new password"
          />
          <ValidationSection>
            <RuleList>
              {passwordRules.map((rule) => {
                const valid = rule.test(newPassword);
                let status: 'gray' | 'green' | 'red' = 'gray';
                if (newPassword.length > 0) {
                  status = valid ? 'green' : touched ? 'red' : 'gray';
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
        </PasswordSection>

        <FormSection>
          <InputPassword
            value={confirmPassword}
            onChange={setConfirmPassword}
            className="mb-1"
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
          disabled={isLoading}
          style={{ marginBottom: '1rem' }}
        >
          {isLoading ? 'Resetting Password...' : 'Reset Password'}
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
            fontWeight: '400'
          }}
        >
          <ArrowLeft size={18} style={{ marginRight: '0.5rem' }} />
          Back to Login
        </MobileStyledButton>
      </StyledForm>
    </Card>
  );
};

export default ForgotPassword;
