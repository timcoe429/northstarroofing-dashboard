"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export const LoginForm: React.FC = () => {
  const router = useRouter();
  const [email, setEmail] = useState('omiah@northstarroof.com');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    // TODO: Replace with Supabase Auth - remove hardcoded credentials
    if (email === 'test' && password === 'test123') {
      sessionStorage.setItem('isLoggedIn', 'true');
      router.push('/');
      return;
    }

    setError('Invalid email or password');
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12, color: '#0f172a' }}>
        Email
        <input
          type="email"
          name="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@northstarroof.com"
          style={{
            padding: '10px 12px',
            borderRadius: 8,
            border: '1px solid #e2e8f0',
            fontSize: 13
          }}
        />
      </label>
      <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12, color: '#0f172a' }}>
        Password
        <input
          type="password"
          name="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Enter your password"
          style={{
            padding: '10px 12px',
            borderRadius: 8,
            border: '1px solid #e2e8f0',
            fontSize: 13
          }}
        />
      </label>
      <button
        type="submit"
        style={{
          marginTop: 6,
          width: '100%',
          padding: '12px 16px',
          borderRadius: 10,
          border: 'none',
          background: '#00293f',
          color: 'white',
          fontWeight: 600,
          cursor: 'pointer',
          fontSize: 14
        }}
      >
        Sign In
      </button>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 }}>
        <span style={{ fontSize: 11, color: '#64748b' }} />
        <span style={{ fontSize: 11, color: '#64748b', textDecoration: 'underline', cursor: 'pointer' }}>
          Forgot Password?
        </span>
      </div>
      {error ? (
        <p style={{ margin: 0, fontSize: 12, color: '#B1000F' }}>{error}</p>
      ) : null}
    </form>
  );
};
