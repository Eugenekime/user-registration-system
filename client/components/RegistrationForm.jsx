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
  max-width: 440px;
  padding: 36px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 20px;
  box-shadow: 0 12px 40px rgba(30, 41, 59, 0.08);
`;

const Title = styled.h1`
  margin: 0 0 8px;
  color: #172033;
  font-size: 28px;
  letter-spacing: -0.8px;
`;

const Subtitle = styled.p`
  margin: 0 0 28px;
  color: #64748b;
  line-height: 1.6;
  font-size: 14px;
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
  padding: 12px 14px;
  border: 1px solid #dbe1ea;
  border-radius: 10px;
  outline: none;
  font-size: 14px;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;

  &:focus {
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.12);
  }

  &:disabled {
    background: #f8fafc;
  }
`;

const Button = styled.button`
  width: 100%;
  margin-top: 5px;
  padding: 13px;
  border: none;
  border-radius: 10px;
  background: #4f46e5;
  color: white;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;

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

const OptionalHeading = styled.h2`
  margin: 5px 0 -5px;
  font-size: 15px;
  color: #334155;
`;

export default function RegistrationForm({ onRegistered }) {
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage('');
    setIsError(false);
    setLoading(true);

    try {
      const { username, email, password, firstName, lastName, bio } = form;

      const payload = {
        username: username.trim(),
        email: email.trim(),
        password,
        ...(firstName.trim() || lastName.trim()
          ? {
              profile: {
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                bio: bio && bio.trim(),
              },
            }
          : {}),
      };

      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const details = Array.isArray(data.errors)
          ? data.errors.map((error) => error.msg).join('. ')
          : data.message || 'Registration failed. Please try again.';

        throw new Error(details);
      }

      setMessage('Account created! Check the next step to verify your email.');
      onRegistered?.({ email: payload.email });
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
        <Title>Create account</Title>
        <Subtitle>
          Register to get started. Your password will be protected by the
          server.
        </Subtitle>

        <Form onSubmit={handleSubmit}>
          <Field>
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              name="username"
              value={form.username}
              onChange={handleChange}
              placeholder="Choose a username"
              minLength={3}
              maxLength={30}
              autoComplete="username"
              required
              disabled={loading}
            />
          </Field>

          <Field>
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              autoComplete="email"
              required
              disabled={loading}
            />
          </Field>

          <Field>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="At least 6 characters"
              minLength={6}
              maxLength={128}
              autoComplete="new-password"
              required
              disabled={loading}
            />
          </Field>

          <OptionalHeading>Profile</OptionalHeading>

          <Field>
            <Label htmlFor="firstName">First name</Label>
            <Input
              id="firstName"
              name="firstName"
              value={form.firstName}
              onChange={handleChange}
              placeholder="First name"
              maxLength={50}
              autoComplete="given-name"
              disabled={loading}
            />
          </Field>

          <Field>
            <Label htmlFor="lastName">Last name</Label>
            <Input
              id="lastName"
              name="lastName"
              value={form.lastName}
              onChange={handleChange}
              placeholder="Last name"
              maxLength={50}
              autoComplete="family-name"
              disabled={loading}
            />
          </Field>

          <Field>
            <Label htmlFor="bio">Bio (optional)</Label>
            <Input
              id="bio"
              name="bio"
              value={form.bio}
              onChange={handleChange}
              placeholder="Bio"
              maxLength={300}
              autoComplete="family-name"
              disabled={loading}
            />
          </Field>

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
            {loading ? 'Creating account...' : 'Create account'}
          </Button>
        </Form>
      </Card>
    </Page>
  );
}
