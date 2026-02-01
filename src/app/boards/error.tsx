'use client';

import React from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function BoardsError({ error, reset }: ErrorProps) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f1f5f9', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      <Sidebar />
      <main style={{ flex: 1, marginLeft: 220 }}>
        <Header timeRange="6mo" />
        <div style={{ padding: 24 }}>
          <div style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: 12,
            padding: 32,
            maxWidth: 600,
            margin: '40px auto',
          }}>
            <h2 style={{ 
              margin: '0 0 12px 0', 
              fontSize: 20, 
              fontWeight: 600, 
              color: '#dc2626' 
            }}>
              Something went wrong
            </h2>
            
            <p style={{ 
              margin: '0 0 16px 0', 
              fontSize: 14, 
              color: '#991b1b',
              lineHeight: 1.6,
            }}>
              {error.message || 'An unexpected error occurred while loading the boards page.'}
            </p>

            {error.digest && (
              <p style={{ 
                margin: '0 0 16px 0', 
                fontSize: 12, 
                color: '#64748b',
                fontFamily: 'monospace',
              }}>
                Error ID: {error.digest}
              </p>
            )}

            <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
              <button
                onClick={reset}
                style={{
                  padding: '10px 20px',
                  borderRadius: 6,
                  border: 'none',
                  background: '#00293f',
                  color: 'white',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Try again
              </button>
              <button
                onClick={() => window.location.href = '/'}
                style={{
                  padding: '10px 20px',
                  borderRadius: 6,
                  border: '1px solid #e2e8f0',
                  background: 'white',
                  color: '#334155',
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                Go to Dashboard
              </button>
            </div>

            <div style={{ 
              marginTop: 24, 
              paddingTop: 24, 
              borderTop: '1px solid #fecaca' 
            }}>
              <p style={{ 
                margin: '0 0 8px 0', 
                fontSize: 12, 
                fontWeight: 600, 
                color: '#64748b' 
              }}>
                Troubleshooting:
              </p>
              <ul style={{ 
                margin: 0, 
                paddingLeft: 20, 
                fontSize: 12, 
                color: '#64748b',
                lineHeight: 1.8,
              }}>
                <li>Check that Supabase environment variables are set correctly</li>
                <li>Verify the database tables exist (run the migration SQL)</li>
                <li>Check Vercel logs for detailed error information</li>
                <li>Ensure the Supabase project is active and accessible</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
