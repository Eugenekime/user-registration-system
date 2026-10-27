import { useState } from 'react';
import styled from 'styled-components';

const API_URL = 'http://localhost:3000/api/auth';

const Page = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: #f4f6fb;
  font-family: Inter, system-ui, sans-serif;
`;

const Card = styled.div`
  width: 100%;
  max-width: 420px;
  padding: 36px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 20px;
  box-shadow: 0 12px 40px rgba(30, 41, 59, 0.08);
`;

const Icon = styled.div`
  width: 52px;
  height: 52px;
  display: grid;
  place-items: center;
  margin-bottom: 22px;
  border-radius: 15px;
  background: #eef2ff;
  color: #4f46e5;
  font-size: 25px;
`;

const Title = styled.h1`
  margin: 0 0 10px;
  color: #172033;
  font-size: 26px;
  letter-spacing: -0.7px;
`;

const Description = styled.p`
  margin: 0 0 26px;
  color: #64748b;
  font-size: 14px;
  line-height: 1.7;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 17px;
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 7px;
`;

const Label = styled.label`
  color: #334155;
  font-size: 13px;
  font-weight: 600;
`;

const Input = styled.input`
  box-sizing: border-box;
  width: 100%;
  padding: 13px 14px;
  border: 1px solid #dbe1ea;
  border-radius: 10px;
  outline: none;
  font-size: 14px;

  &:focus {
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.12);
  }
`;

const Button = styled.button`
  padding: 13px;
  margin-top: 4px;
  border: none;
  border-radius: 10px;
  background: #4f46e5;
  color: white;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;

  &:hover:not(:disabled) {
    background: #4338ca;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const Message = styled.p`
  margin: 0;
  padding: 12px;
  border-radius: 9px;
  font-size: 13px;
  line-height: 1.5;
  color: ${({ $error }) => ($error ? '#b91c1c' : '#166534')};
  background: ${({ $error }) => ($error ? '#fef2f2' : '#f0fdf4')};
`;

export default function EmailVerification({ onVerified }) {
  const params = new URLSearchParams(window.location.search);

  const [token, setToken] = useState(params.get('token') || '');

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage('');
    setIsError(false);
    setLoading(true);
    if (!token) {
      setIsError(true);
      setMessage('Verification token is missing from the URL.');
      return;
    }
    try {
      const response = await fetch(`${API_URL}/verify-email?token=${token}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message || 'Verification failed. Check your code and try again.'
        );
      }

      setMessage('Email verified successfully!');
      onVerified?.(data);
    } catch (error) {
      setIsError(true);
      setMessage(
        error instanceof Error
          ? error.message
          : 'Unable to connect to the server.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Page>
      <Card>
        <Icon aria-hidden="true">✉</Icon>
        <Title>Verify your email</Title>
        <Description>
          Enter your email address and the verification code or token provided
          by your server.
        </Description>

        <Form onSubmit={handleSubmit}>
          {message && (
            <Message
              $error={isError}
              role="status"
            >
              {message}
            </Message>
          )}

          <Button
            type="submit"
            disabled={loading}
          >
            {loading ? 'Verifying...' : 'Verify email'}
          </Button>
        </Form>
      </Card>
    </Page>
  );
}
