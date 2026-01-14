'use client';

import React from 'react';
import { Icons } from './Icons';
import { NorthstarLogo } from './NorthstarLogo';

interface NavItem {
  id: string;
  label: string;
  icon: React.FC;
}

interface SidebarProps {
  activeNav: string;
  onNavChange: (id: string) => void;
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: Icons.Dashboard },
  { id: 'projects', label: 'Projects', icon: Icons.Projects },
  { id: 'estimates', label: 'Estimates', icon: Icons.Estimates },
  { id: 'customers', label: 'Customers', icon: Icons.Customers },
  { id: 'finances', label: 'Finances', icon: Icons.Finances },
  { id: 'reports', label: 'Reports', icon: Icons.Reports },
];

export const Sidebar: React.FC<SidebarProps> = ({ activeNav, onNavChange }) => {
  return (
    <aside style={{ 
      width: 220, 
      background: '#00293f', 
      display: 'flex', 
      flexDirection: 'column', 
      position: 'fixed', 
      height: '100vh', 
      zIndex: 100 
    }}>
      {/* Logo */}
      <div style={{ padding: '20px 16px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <NorthstarLogo />
      </div>
      
      {/* Navigation */}
      <nav style={{ flex: 1, padding: '16px 12px' }}>
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => onNavChange(item.id)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '12px 14px',
              marginBottom: 4,
              background: activeNav === item.id ? 'rgba(255,255,255,0.1)' : 'transparent',
              border: 'none',
              borderRadius: 8,
              color: activeNav === item.id ? 'white' : 'rgba(255,255,255,0.6)',
              fontSize: 13,
              fontWeight: activeNav === item.id ? 600 : 400,
              cursor: 'pointer',
              transition: 'all 0.15s',
              textAlign: 'left'
            }}
          >
            <item.icon />
            {item.label}
          </button>
        ))}
      </nav>
      
      {/* Settings at bottom */}
      <div style={{ padding: '16px 12px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <button 
          onClick={() => onNavChange('settings')}
          style={{ 
            width: '100%', 
            display: 'flex', 
            alignItems: 'center', 
            gap: 12, 
            padding: '12px 14px', 
            background: activeNav === 'settings' ? 'rgba(255,255,255,0.1)' : 'transparent', 
            border: 'none', 
            borderRadius: 8, 
            color: activeNav === 'settings' ? 'white' : 'rgba(255,255,255,0.6)', 
            fontSize: 13, 
            cursor: 'pointer', 
            textAlign: 'left' 
          }}
        >
          <Icons.Settings />
          Settings
        </button>
      </div>
    </aside>
  );
};
