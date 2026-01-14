'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icons } from './Icons';
import { NorthstarLogo } from './NorthstarLogo';

interface NavItem {
  id: string;
  label: string;
  icon: React.FC;
  href: string;
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: Icons.Dashboard, href: '/' },
  { id: 'projects', label: 'Projects', icon: Icons.Projects, href: '/projects' },
  { id: 'estimates', label: 'Estimates', icon: Icons.Estimates, href: '/estimates' },
  { id: 'customers', label: 'Customers', icon: Icons.Customers, href: '/customers' },
  { id: 'finances', label: 'Finances', icon: Icons.Finances, href: '/finances' },
  { id: 'reports', label: 'Reports', icon: Icons.Reports, href: '/reports' },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();

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
      <div style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <NorthstarLogo />
      </div>
      
      {/* Navigation */}
      <nav style={{ flex: 1, padding: '16px 12px' }}>
        {navItems.map(item => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.id}
              href={item.href}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 14px',
                marginBottom: 4,
                background: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
                borderRadius: 8,
                color: isActive ? 'white' : 'rgba(255,255,255,0.6)',
                fontSize: 13,
                fontWeight: isActive ? 600 : 400,
                cursor: 'pointer',
                transition: 'all 0.15s',
                textDecoration: 'none',
                textAlign: 'left'
              }}
            >
              <item.icon />
              {item.label}
            </Link>
          );
        })}
      </nav>
      
      {/* Settings at bottom */}
      <div style={{ padding: '16px 12px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <Link
          href="/settings"
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '12px 14px',
            background: pathname === '/settings' ? 'rgba(255,255,255,0.1)' : 'transparent',
            borderRadius: 8,
            color: pathname === '/settings' ? 'white' : 'rgba(255,255,255,0.6)',
            fontSize: 13,
            cursor: 'pointer',
            textAlign: 'left',
            textDecoration: 'none'
          }}
        >
          <Icons.Settings />
          Settings
        </Link>
      </div>
    </aside>
  );
};
