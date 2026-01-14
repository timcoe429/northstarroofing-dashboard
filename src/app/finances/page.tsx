'use client';

import React, { useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { mockData } from '@/lib/mockData';
import { formatCurrency } from '@/lib/utils';

export default function FinancesPage() {
  const [timeRange, setTimeRange] = useState('6mo');

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f1f5f9', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      <Sidebar />
      <main style={{ flex: 1, marginLeft: 220 }}>
        <Header timeRange={timeRange} onTimeRangeChange={setTimeRange} />
        <div style={{ padding: 24 }}>
          <div style={{ marginBottom: 16 }}>
            <h2 style={{ margin: 0, color: '#00293f' }}>Finances</h2>
            <p style={{ margin: '6px 0 0', fontSize: 12, color: '#64748b' }}>Revenue, collections, and profitability overview</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 20 }}>
            {[
              { label: 'Total Revenue', value: formatCurrency(mockData.financials.totalRevenue), color: '#00293f' },
              { label: 'Collected', value: formatCurrency(mockData.financials.collected), color: '#059669' },
              { label: 'Outstanding', value: formatCurrency(mockData.financials.uncollected), color: '#B1000F' }
            ].map(card => (
              <div key={card.label} style={{ background: 'white', borderRadius: 12, border: '1px solid #e8ecf0', padding: 16 }}>
                <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>{card.label}</p>
                <p style={{ margin: '6px 0 0', fontSize: 20, fontWeight: 700, color: card.color }}>{card.value}</p>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
            <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e8ecf0', overflow: 'hidden' }}>
              <div style={{ padding: '14px 18px', borderBottom: '1px solid #e8ecf0', fontSize: 13, fontWeight: 600, color: '#00293f' }}>
                Invoices
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                  <thead style={{ background: '#f8fafc', textAlign: 'left' }}>
                    <tr>
                      {['Invoice #', 'Customer', 'Amount', 'Status', 'Due Date'].map(col => (
                        <th key={col} style={{ padding: '10px 12px', color: '#64748b', fontWeight: 600, borderBottom: '1px solid #e8ecf0' }}>
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {mockData.invoices.map(invoice => (
                      <tr key={invoice.id} style={{ borderBottom: '1px solid #eef2f6' }}>
                        <td style={{ padding: '10px 12px', fontWeight: 600, color: '#0f172a' }}>{invoice.id}</td>
                        <td style={{ padding: '10px 12px', color: '#334155' }}>{invoice.customer}</td>
                        <td style={{ padding: '10px 12px', color: '#334155' }}>{formatCurrency(invoice.amount)}</td>
                        <td style={{ padding: '10px 12px', color: '#334155' }}>{invoice.status}</td>
                        <td style={{ padding: '10px 12px', color: '#334155' }}>{invoice.dueDate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e8ecf0', padding: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#00293f', marginBottom: 12 }}>
                Profit Margins by Job Type
              </div>
              {mockData.profitDetails.byType.map(item => (
                <div key={item.type} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #eef2f6' }}>
                  <div>
                    <p style={{ margin: 0, fontSize: 12, color: '#334155', fontWeight: 600 }}>{item.type}</p>
                    <p style={{ margin: '4px 0 0', fontSize: 11, color: '#64748b' }}>{formatCurrency(item.revenue)} revenue</p>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#00293f' }}>{item.margin}%</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
