"use client";

import React from 'react';
import Image from 'next/image';
import { LoginForm } from '@/components/LoginForm';

export default function LoginPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 440 }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
          <Image src="/logo.png" alt="Northstar Roofing" width={250} height={80} priority />
        </div>
        <div style={{ background: 'white', borderRadius: 12, boxShadow: '0 12px 30px rgba(15, 23, 42, 0.08)', padding: 24 }}>
          <div style={{ textAlign: 'center', marginBottom: 18 }}>
            <h1 style={{ margin: 0, fontSize: 20, color: '#00293f' }}>Northstar Dashboard</h1>
            <p style={{ margin: '6px 0 0', fontSize: 12, color: '#64748b' }}>Sign in to access your business dashboard</p>
          </div>
          <LoginForm />
        </div>
        <p style={{ marginTop: 18, fontSize: 11, color: '#94a3b8', textAlign: 'center' }}>© 2026 Northstar Roofing. All rights reserved.</p>
      </div>
    </div>
  );
}
