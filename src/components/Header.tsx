'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Icons } from './Icons';

interface HeaderProps {
  timeRange: string;
  onTimeRangeChange: (range: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ timeRange, onTimeRangeChange }) => {
  const router = useRouter();

  const handleSignOut = () => {
    // TODO: Replace with Supabase Auth - remove hardcoded credentials
    sessionStorage.removeItem('isLoggedIn');
    router.push('/login');
  };

  return (
    <header style={{ 
      background: 'white', 
      padding: '14px 24px', 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      borderBottom: '1px solid #e8ecf0', 
      position: 'sticky', 
      top: 0, 
      zIndex: 50 
    }}>
      <div>
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#00293f' }}>Dashboard</h1>
        <p style={{ margin: '2px 0 0', fontSize: 12, color: '#64748b' }}>Welcome back, Omiah</p>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {/* Time Range Dropdown */}
        <select
          value={timeRange}
          onChange={(e) => onTimeRangeChange(e.target.value)}
          style={{ 
            background: '#f8fafc', 
            border: '1px solid #e2e8f0', 
            borderRadius: 6, 
            padding: '8px 12px', 
            color: '#334155', 
            fontSize: 12, 
            cursor: 'pointer' 
          }}
        >
          <option value="1mo">Last Month</option>
          <option value="3mo">Last 3 Months</option>
          <option value="6mo">Last 6 Months</option>
          <option value="ytd">Year to Date</option>
        </select>
        {/* Notifications */}
        <button style={{ 
          background: '#f8fafc', 
          border: '1px solid #e2e8f0', 
          borderRadius: 8, 
          padding: 8, 
          color: '#64748b', 
          cursor: 'pointer', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center' 
        }}>
          <Icons.Bell />
        </button>
        <button
          onClick={handleSignOut}
          style={{
            background: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: 8,
            padding: '6px 10px',
            fontSize: 11,
            color: '#00293f',
            cursor: 'pointer'
          }}
        >
          Sign Out
        </button>
        {/* Avatar */}
        <div style={{ 
          width: 36, 
          height: 36, 
          borderRadius: '50%', 
          background: '#B1000F', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          color: 'white', 
          fontWeight: 600, 
          fontSize: 13 
        }}>
          OT
        </div>
      </div>
    </header>
  );
};
