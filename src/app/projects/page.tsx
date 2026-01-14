'use client';

import React, { useMemo, useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { mockData, formatCurrency } from '@/lib/utils';

const filterTabs = ['All', 'In Progress', 'Scheduled', 'Completed'] as const;

export default function ProjectsPage() {
  const [timeRange, setTimeRange] = useState('6mo');
  const [activeFilter, setActiveFilter] = useState<(typeof filterTabs)[number]>('All');

  const projects = useMemo(() => {
    const combined = [...mockData.activeProjects, ...mockData.recentProjects].map(project => {
      const customerMatch = mockData.customers.find(c => c.name === project.name);
      return {
        ...project,
        customer: customerMatch?.name || project.name,
        address: customerMatch?.address || project.location,
        startDate: 'startDate' in project ? project.startDate : project.date,
      };
    });

    if (activeFilter === 'All') return combined;
    return combined.filter(project => project.status === activeFilter);
  }, [activeFilter]);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f1f5f9', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      <Sidebar />
      <main style={{ flex: 1, marginLeft: 220 }}>
        <Header timeRange={timeRange} onTimeRangeChange={setTimeRange} />
        <div style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <h2 style={{ margin: 0, color: '#00293f' }}>Projects</h2>
              <p style={{ margin: '6px 0 0', fontSize: 12, color: '#64748b' }}>Active and completed projects across the valley</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            {filterTabs.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveFilter(tab)}
                style={{
                  padding: '8px 12px',
                  borderRadius: 6,
                  border: '1px solid #e2e8f0',
                  background: activeFilter === tab ? '#00293f' : 'white',
                  color: activeFilter === tab ? 'white' : '#334155',
                  fontSize: 12,
                  cursor: 'pointer'
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e8ecf0', overflow: 'hidden' }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid #e8ecf0', fontSize: 13, fontWeight: 600, color: '#00293f' }}>
              Project Pipeline
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead style={{ background: '#f8fafc', textAlign: 'left' }}>
                  <tr>
                    {['Project Name', 'Customer', 'Address', 'Type', 'Status', 'Crew Assigned', 'Value', 'Start Date'].map(col => (
                      <th key={col} style={{ padding: '10px 12px', color: '#64748b', fontWeight: 600, borderBottom: '1px solid #e8ecf0' }}>
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {projects.map(project => (
                    <tr key={`${project.id}-${project.name}`} style={{ borderBottom: '1px solid #eef2f6' }}>
                      <td style={{ padding: '10px 12px', fontWeight: 600, color: '#0f172a' }}>{project.name}</td>
                      <td style={{ padding: '10px 12px', color: '#334155' }}>{project.customer}</td>
                      <td style={{ padding: '10px 12px', color: '#334155' }}>{project.address}</td>
                      <td style={{ padding: '10px 12px', color: '#334155' }}>{project.type}</td>
                      <td style={{ padding: '10px 12px', color: '#334155' }}>{project.status}</td>
                      <td style={{ padding: '10px 12px', color: '#334155' }}>{'crew' in project ? project.crew : 'Unassigned'}</td>
                      <td style={{ padding: '10px 12px', color: '#334155' }}>{formatCurrency(project.value)}</td>
                      <td style={{ padding: '10px 12px', color: '#334155' }}>{project.startDate}</td>
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
