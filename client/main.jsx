import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import styled from 'styled-components';

import RegistrationForm from './components/RegistrationForm.jsx';
import EmailVerification from './components/EmailVerification.jsx';
import LoginForm from './components/LoginForm.jsx';

const Page = styled.main`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  box-sizing: border-box;
  background: #f4f6fb;
  font-family: Inter, system-ui, sans-serif;
`;

const NoticeCard = styled.section`
  width: 100%;
  max-width: 440px;
  box-sizing: border-box;
  padding: 36px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 20px;
  box-shadow: 0 12px 40px rgba(30, 41, 59, 0.08);
`;

const NoticeIcon = styled.div`
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

const NoticeTitle = styled.h2`
  margin: 0 0 12px;
  color: #172033;
  font-size: 26px;
  letter-spacing: -0.7px;
`;

const NoticeText = styled.p`
  margin: 0 0 24px;
  color: #64748b;
  font-size: 14px;
  line-height: 1.7;
  overflow-wrap: anywhere;
`;

const ActionButton = styled.button`
  width: 100%;
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
`;

const SecondaryButton = styled.button`
  width: 100%;
  margin-top: 6px;
  padding: 12px;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  background: white;
  color: #334155;
  font-size: 14px;
  cursor: pointer;
`;

function App() {
  const params = new URLSearchParams(window.location.search);
  const [pendingEmail, setPendingEmail] = useState('');
  const [mode, setMode] = useState('register');
  const [accessToken, setAccessToken] = useState('');

  const urlToken = params.get('token') || '';

  if (urlToken) {
    return (
      <EmailVerification
        onVerified={() => {
          window.history.replaceState({}, '', '/');
        }}
      />
    );
  }

  if (pendingEmail) {
    return (
      <Page>
        <NoticeCard>
          <NoticeIcon aria-hidden="true">✉</NoticeIcon>

          <NoticeTitle>Check your email</NoticeTitle>

          <NoticeText>
            We sent a verification link to <strong>{pendingEmail}</strong>. Open
            your inbox and click the link to verify your account. If you don't
            see the email, check your spam folder.
          </NoticeText>

          <ActionButton onClick={() => setPendingEmail('')}>
            Back to registration
          </ActionButton>
        </NoticeCard>
      </Page>
    );
  }

  if (accessToken) {
    return (
      <Page>
        <NoticeCard>
          <NoticeIcon aria-hidden="true">✓</NoticeIcon>

          <NoticeTitle>You're logged in!</NoticeTitle>

          <NoticeText>
            Login was successful. Your access token is stored in the
            application's memory.
          </NoticeText>

          <ActionButton
            onClick={() => {
              setAccessToken('');
              setMode('login');
            }}
          >
            Log out
          </ActionButton>
        </NoticeCard>
      </Page>
    );
  }

  return (
    <Page>
      {mode === 'login' ? (
        <LoginForm
          onLoggedIn={(token) => setAccessToken(token)}
          onShowRegistration={() => setMode('register')}
        />
      ) : (
        <div style={{ width: '100%', maxWidth: 440 }}>
          <RegistrationForm
            onRegistered={({ email }) => setPendingEmail(email)}
          />

          <SecondaryButton onClick={() => setMode('login')}>
            Already have an account? Log in
          </SecondaryButton>
        </div>
      )}
    </Page>
  );
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
