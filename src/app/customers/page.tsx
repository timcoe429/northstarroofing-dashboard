'use client';

import React, { useMemo, useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { mockData, formatCurrency } from '@/lib/utils';

export default function CustomersPage() {
  const [timeRange, setTimeRange] = useState('6mo');
  const [query, setQuery] = useState('');

  const customers = useMemo(() => {
    if (!query) return mockData.customers;
    const q = query.toLowerCase();
    return mockData.customers.filter(customer =>
      customer.name.toLowerCase().includes(q) ||
      customer.address.toLowerCase().includes(q) ||
      customer.email.toLowerCase().includes(q)
    );
  }, [query]);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f1f5f9', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      <Sidebar />
      <main style={{ flex: 1, marginLeft: 220 }}>
        <Header timeRange={timeRange} onTimeRangeChange={setTimeRange} />
        <div style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <h2 style={{ margin: 0, color: '#00293f' }}>Customers</h2>
              <p style={{ margin: '6px 0 0', fontSize: 12, color: '#64748b' }}>Roaring Fork Valley customer directory</p>
            </div>
            <input
              type="text"
              placeholder="Search customers..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              style={{
                width: 240,
                padding: '8px 12px',
                borderRadius: 8,
                border: '1px solid #e2e8f0',
                fontSize: 12
              }}
            />
          </div>

          <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e8ecf0', overflow: 'hidden' }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid #e8ecf0', fontSize: 13, fontWeight: 600, color: '#00293f' }}>
              Customer Directory
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead style={{ background: '#f8fafc', textAlign: 'left' }}>
                  <tr>
                    {['Name', 'Address', 'Phone', 'Email', 'Total Jobs', 'Total Revenue', 'Last Job Date'].map(col => (
                      <th key={col} style={{ padding: '10px 12px', color: '#64748b', fontWeight: 600, borderBottom: '1px solid #e8ecf0' }}>
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {customers.map(customer => (
                    <tr key={customer.email} style={{ borderBottom: '1px solid #eef2f6' }}>
                      <td style={{ padding: '10px 12px', fontWeight: 600, color: '#0f172a' }}>{customer.name}</td>
                      <td style={{ padding: '10px 12px', color: '#334155' }}>{customer.address}</td>
                      <td style={{ padding: '10px 12px', color: '#334155' }}>{customer.phone}</td>
                      <td style={{ padding: '10px 12px', color: '#334155' }}>{customer.email}</td>
                      <td style={{ padding: '10px 12px', color: '#334155' }}>{customer.totalJobs}</td>
                      <td style={{ padding: '10px 12px', color: '#334155' }}>{formatCurrency(customer.totalRevenue)}</td>
                      <td style={{ padding: '10px 12px', color: '#334155' }}>{customer.lastJobDate}</td>
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
