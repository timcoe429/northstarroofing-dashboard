"use client";

import React, { useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { RevenueChart } from '@/components/RevenueChart';
import { JobTypesCard } from '@/components/JobTypesCard';
import { mockData, formatCurrency } from '@/lib/utils';

export default function ReportsPage() {
  const [timeRange, setTimeRange] = useState('6mo');
  const [reportRange, setReportRange] = useState('Last 6 Months');

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f1f5f9', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      <Sidebar />
      <main style={{ flex: 1, marginLeft: 220 }}>
        <Header timeRange={timeRange} onTimeRangeChange={setTimeRange} />
        <div style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <h2 style={{ margin: 0, color: '#00293f' }}>Reports</h2>
              <p style={{ margin: '6px 0 0', fontSize: 12, color: '#64748b' }}>Business performance snapshots and trends</p>
            </div>
            <select
              value={reportRange}
              onChange={(event) => setReportRange(event.target.value)}
              style={{
                background: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: 6,
                padding: '8px 12px',
                color: '#334155',
                fontSize: 12
              }}
            >
              <option>Last 30 Days</option>
              <option>Last 90 Days</option>
              <option>Last 6 Months</option>
              <option>Year to Date</option>
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 20 }}>
            <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e8ecf0', padding: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#00293f', marginBottom: 12 }}>Revenue by Month</div>
              <RevenueChart data={mockData.monthlyTrend} />
            </div>
            <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e8ecf0', padding: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#00293f', marginBottom: 12 }}>Jobs by Type</div>
              <JobTypesCard data={mockData.jobTypes} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
            <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e8ecf0', padding: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#00293f', marginBottom: 12 }}>Crew Performance</div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead style={{ textAlign: 'left' }}>
                  <tr>
                    {['Crew', 'Jobs', 'On-Time %', 'Avg Job', 'Revenue'].map(col => (
                      <th key={col} style={{ padding: '8px 0', color: '#64748b', fontWeight: 600, borderBottom: '1px solid #eef2f6' }}>
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {mockData.crewPerformance.map(crew => (
                    <tr key={crew.crew}>
                      <td style={{ padding: '8px 0', fontWeight: 600, color: '#0f172a' }}>{crew.crew}</td>
                      <td style={{ padding: '8px 0', color: '#334155' }}>{crew.jobsCompleted}</td>
                      <td style={{ padding: '8px 0', color: '#334155' }}>{crew.onTimePct}%</td>
                      <td style={{ padding: '8px 0', color: '#334155' }}>{formatCurrency(crew.avgJobValue)}</td>
                      <td style={{ padding: '8px 0', color: '#334155' }}>{formatCurrency(crew.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e8ecf0', padding: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#00293f', marginBottom: 12 }}>Top Customers by Revenue</div>
              {mockData.topCustomers.map(customer => (
                <div key={customer.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #eef2f6' }}>
                  <div>
                    <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: '#334155' }}>{customer.name}</p>
                    <p style={{ margin: '4px 0 0', fontSize: 11, color: '#64748b' }}>{customer.jobs} jobs</p>
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#00293f' }}>{formatCurrency(customer.revenue)}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e8ecf0', padding: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#00293f', marginBottom: 12 }}>Profitability Trend</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 10 }}>
              {mockData.profitabilityTrend.map(point => (
                <div key={point.month} style={{ background: '#f8fafc', borderRadius: 8, padding: 12, textAlign: 'center' }}>
                  <p style={{ margin: 0, fontSize: 11, color: '#64748b' }}>{point.month}</p>
                  <p style={{ margin: '6px 0 0', fontSize: 16, fontWeight: 700, color: '#00293f' }}>{point.margin}%</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
