"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export const LoginForm: React.FC = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError('Invalid email or password');
        return;
      }

      if (data.user) {
        router.push('/');
      }
    } catch (err) {
      setError('An error occurred during sign in. Please try again.');
    } finally {
      setLoading(false);
    }
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
        disabled={loading}
        style={{
          marginTop: 6,
          width: '100%',
          padding: '12px 16px',
          borderRadius: 10,
          border: 'none',
          background: loading ? '#64748b' : '#00293f',
          color: 'white',
          fontWeight: 600,
          cursor: loading ? 'not-allowed' : 'pointer',
          fontSize: 14
        }}
      >
        {loading ? 'Signing In...' : 'Sign In'}
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
