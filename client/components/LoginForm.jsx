import { useState } from 'react';
import styled from 'styled-components';

const API_URL = 'http://localhost:3000/api/auth';

const Form = styled.form`
  width: 100%;
  max-width: 440px;
  box-sizing: border-box;
  margin: 0 auto;
  padding: 36px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 20px;
  box-shadow: 0 12px 40px rgba(30, 41, 59, 0.08);
  font-family: Inter, system-ui, sans-serif;
`;

const Title = styled.h1`
  margin: 0 0 8px;
  color: #172033;
  font-size: 28px;
`;

const Description = styled.p`
  margin: 0 0 24px;
  color: #64748b;
  font-size: 14px;
  line-height: 1.6;
`;

const Field = styled.label`
  display: block;
  margin-bottom: 16px;
  color: #334155;
  font-size: 14px;
  font-weight: 600;
`;

const Input = styled.input`
  display: block;
  width: 100%;
  box-sizing: border-box;
  margin-top: 8px;
  padding: 12px;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  font: inherit;

  &:focus {
    outline: 2px solid #a5b4fc;
    border-color: #6366f1;
  }
`;

const SubmitButton = styled.button`
  width: 100%;
  margin-top: 8px;
  padding: 13px;
  border: none;
  border-radius: 10px;
  background: #4f46e5;
  color: white;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;

  &:hover {
    background: #4338ca;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const SwitchButton = styled.button`
  display: block;
  width: 100%;
  margin-top: 18px;
  padding: 8px;
  border: none;
  background: transparent;
  color: #4f46e5;
  font-size: 14px;
  cursor: pointer;
`;

const ErrorMessage = styled.p`
  margin: 0 0 12px;
  color: #dc2626;
  font-size: 14px;
`;

export default function LoginForm({ onLoggedIn, onShowRegistration }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        const message = Array.isArray(data.errors)
          ? data.errors.map((error) => error.msg).join(', ')
          : data.message || 'Login failed';

        throw new Error(message);
      }

      if (!data.accessToken) {
        throw new Error('The server did not return an access token');
      }

      onLoggedIn(data.accessToken);
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form onSubmit={handleSubmit}>
      <Title>Welcome back</Title>
      <Description>
        Enter your email and password to sign in to your account.
      </Description>

      <Field>
        Email
        <Input
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
      </Field>

      <Field>
        Password
        <Input
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
      </Field>

      {error && <ErrorMessage role="alert">{error}</ErrorMessage>}

      <SubmitButton
        type="submit"
        disabled={isLoading}
      >
        {isLoading ? 'Signing in...' : 'Log in'}
      </SubmitButton>

      <SwitchButton
        type="button"
        onClick={onShowRegistration}
      >
        Don't have an account? Register
      </SwitchButton>
    </Form>
  );
}
