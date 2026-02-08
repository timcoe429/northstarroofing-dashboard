'use client';

import React, { useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { COLORS, SPACING, TYPOGRAPHY } from '@/styles/constants';

export default function CustomersPage() {
  const [timeRange, setTimeRange] = useState('6mo');

  return (
    <div style={{ 
      display: 'flex', 
      minHeight: '100vh', 
      background: COLORS.gray100, 
      fontFamily: TYPOGRAPHY.fontFamily 
    }}>
      <Sidebar />
      
      <main style={{ flex: 1, marginLeft: 220 }}>
        <Header title="Customers" subtitle="Customer management coming soon" showTimeRange={false} />
        
        <div style={{ padding: SPACING[6] }}>
          {/* Page Title */}
          <div style={{ marginBottom: SPACING.sectionMargin }}>
            <h1 style={{ 
              fontSize: TYPOGRAPHY.fontSize['3xl'], 
              fontWeight: TYPOGRAPHY.fontWeight.bold, 
              color: COLORS.navy, 
              margin: 0,
              marginBottom: SPACING[1]
            }}>
              Customers
            </h1>
            <p style={{
              fontSize: TYPOGRAPHY.fontSize.lg,
              color: COLORS.gray500,
              margin: 0
            }}>
              Customer management and history
            </p>
          </div>

          {/* Coming Soon Message */}
          <div style={{
            background: COLORS.white,
            borderRadius: 10,
            padding: SPACING[8],
            textAlign: 'center',
            border: '1px solid #e8ecf0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
          }}>
            <div style={{ fontSize: 48, marginBottom: SPACING[4] }}>👥</div>
            <h2 style={{
              fontSize: TYPOGRAPHY.fontSize.xl,
              fontWeight: TYPOGRAPHY.fontWeight.semibold,
              color: COLORS.navy,
              margin: 0,
              marginBottom: SPACING[2]
            }}>
              Coming Soon
            </h2>
            <p style={{
              fontSize: TYPOGRAPHY.fontSize.base,
              color: COLORS.gray500,
              margin: 0
            }}>
              Customer management features are in development.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}