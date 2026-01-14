"use client";

import React, { useMemo, useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { mockData, formatCurrency } from '@/lib/utils';

export default function EstimatesPage() {
  const [timeRange, setTimeRange] = useState('6mo');

  const acceptanceRate = useMemo(() => {
    const actionable = mockData.estimates.filter(est => est.status !== 'Draft');
    const accepted = actionable.filter(est => est.status === 'Accepted').length;
    return actionable.length === 0 ? 0 : Math.round((accepted / actionable.length) * 100);
  }, []);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f1f5f9', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      <Sidebar />
      <main style={{ flex: 1, marginLeft: 220 }}>
        <Header timeRange={timeRange} onTimeRangeChange={setTimeRange} />
        <div style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <h2 style={{ margin: 0, color: '#00293f' }}>Estimates</h2>
              <p style={{ margin: '6px 0 0', fontSize: 12, color: '#64748b' }}>Proposal tracking for roofing and gutter projects</p>
            </div>
            <div style={{ background: 'white', border: '1px solid #e8ecf0', borderRadius: 10, padding: '10px 14px', minWidth: 180 }}>
              <p style={{ margin: 0, fontSize: 11, color: '#64748b' }}>Acceptance Rate</p>
              <p style={{ margin: '4px 0 0', fontSize: 18, fontWeight: 700, color: '#00293f' }}>{acceptanceRate}%</p>
            </div>
          </div>

          <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e8ecf0', overflow: 'hidden' }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid #e8ecf0', fontSize: 13, fontWeight: 600, color: '#00293f' }}>
              Recent Estimates
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead style={{ background: '#f8fafc', textAlign: 'left' }}>
                  <tr>
                    {['Estimate #', 'Customer', 'Address', 'Job Type', 'Amount', 'Status', 'Date'].map(col => (
                      <th key={col} style={{ padding: '10px 12px', color: '#64748b', fontWeight: 600, borderBottom: '1px solid #e8ecf0' }}>
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {mockData.estimates.map(estimate => (
                    <tr key={estimate.id} style={{ borderBottom: '1px solid #eef2f6' }}>
                      <td style={{ padding: '10px 12px', fontWeight: 600, color: '#0f172a' }}>{estimate.id}</td>
                      <td style={{ padding: '10px 12px', color: '#334155' }}>{estimate.customer}</td>
                      <td style={{ padding: '10px 12px', color: '#334155' }}>{estimate.address}</td>
                      <td style={{ padding: '10px 12px', color: '#334155' }}>{estimate.jobType}</td>
                      <td style={{ padding: '10px 12px', color: '#334155' }}>{formatCurrency(estimate.amount)}</td>
                      <td style={{ padding: '10px 12px', color: '#334155' }}>{estimate.status}</td>
                      <td style={{ padding: '10px 12px', color: '#334155' }}>{estimate.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
