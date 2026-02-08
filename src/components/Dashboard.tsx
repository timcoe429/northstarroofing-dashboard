'use client';

import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { StatCard } from './shared/StatCard';
import { PipelineBar } from './shared/PipelineBar';
import { DataTable } from './shared/DataTable';
import { Modal } from './shared/Modal';
import { RevenueChart } from './RevenueChart';
import { JobTypesCard } from './JobTypesCard';
import { CollectionRing } from './CollectionRing';
import { RevenueDetailContent } from './modals/RevenueDetail';
import { ProfitDetailContent } from './modals/ProfitDetail';
import { ActiveProjectsContent } from './modals/ActiveProjects';
import { AvgJobSizeContent } from './modals/AvgJobSize';
import { mockData, formatCurrency } from '@/lib/utils';
import { COLORS, SPACING } from '@/styles/constants';

export default function NorthstarDashboard() {
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState('6mo');

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: COLORS.gray100, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      {/* Modals */}
      <Modal isOpen={activeModal === 'revenue'} onClose={() => setActiveModal(null)} title="Revenue Breakdown">
        <RevenueDetailContent data={mockData.revenueDetails} />
      </Modal>
      <Modal isOpen={activeModal === 'profit'} onClose={() => setActiveModal(null)} title="Profit Analysis">
        <ProfitDetailContent data={mockData.profitDetails} />
      </Modal>
      <Modal isOpen={activeModal === 'activeProjects'} onClose={() => setActiveModal(null)} title="Active Projects">
        <ActiveProjectsContent projects={mockData.activeProjects} />
      </Modal>
      <Modal isOpen={activeModal === 'avgJobSize'} onClose={() => setActiveModal(null)} title="Average Job Size Analysis">
        <AvgJobSizeContent data={mockData.avgJobDetails} />
      </Modal>

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main style={{ flex: 1, marginLeft: 220 }}>
        <Header timeRange={timeRange} onTimeRangeChange={setTimeRange} />

        {/* Dashboard Content */}
        <div style={{ padding: SPACING[6] }}>
          {/* Top Stats Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: SPACING.gridGap, marginBottom: SPACING.sectionMargin }}>
            <StatCard 
              label="Total Revenue" 
              value={formatCurrency(mockData.financials.totalRevenue)} 
              subtext="+18% from last period" 
              trend={18} 
              icon="💰" 
              color={COLORS.navy} 
              onClick={() => setActiveModal('revenue')} 
            />
            <StatCard 
              label="Gross Profit" 
              value={formatCurrency(mockData.financials.profit)} 
              subtext="22% margin" 
              trend={0} 
              icon="📈" 
              color={COLORS.success} 
              onClick={() => setActiveModal('profit')} 
            />
            <StatCard 
              label="Active Projects" 
              value={mockData.pipeline.inProgress + mockData.pipeline.scheduled} 
              subtext={`${mockData.pipeline.inProgress} in progress`} 
              icon="🏗️" 
              color={COLORS.red} 
              onClick={() => setActiveModal('activeProjects')} 
            />
            <StatCard 
              label="Avg Job Size" 
              value={formatCurrency(mockData.financials.avgJobSize)} 
              subtext="+12% YoY" 
              trend={12} 
              icon="📊" 
              color={COLORS.navy} 
              onClick={() => setActiveModal('avgJobSize')} 
            />
          </div>

          {/* Pipeline Row */}
          <div style={{ marginBottom: SPACING.sectionMargin }}>
            <PipelineBar 
              title="Project Pipeline"
              segments={[
                { key: 'leads', label: 'Leads', count: mockData.pipeline.leads, color: '#94a3b8' },
                { key: 'estimates', label: 'Estimates', count: mockData.pipeline.estimates, color: '#60a5fa' },
                { key: 'scheduled', label: 'Scheduled', count: mockData.pipeline.scheduled, color: '#fbbf24' },
                { key: 'inProgress', label: 'In Progress', count: mockData.pipeline.inProgress, color: COLORS.red },
                { key: 'completed', label: 'Completed', count: mockData.pipeline.completed, color: COLORS.success }
              ]}
            />
          </div>

          {/* Middle Row - Charts */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: SPACING.gridGap, marginBottom: SPACING.sectionMargin }}>
            <RevenueChart data={mockData.monthlyTrend} />
            <JobTypesCard data={mockData.jobTypes} />
            <CollectionRing collected={mockData.financials.collected} uncollected={mockData.financials.uncollected} />
          </div>

          {/* Recent Projects */}
          <DataTable
            title="Recent Projects"
            columns={[
              { key: 'name', label: 'Project', sortable: true, render: (value) => (
                <span style={{ fontWeight: 600, color: COLORS.navy, fontSize: 12 }}>{value}</span>
              )},
              { key: 'type', label: 'Type', sortable: true, render: (value) => (
                <span style={{ color: '#334155', fontSize: 12 }}>{value}</span>
              )},
              { key: 'location', label: 'Location', sortable: true, render: (value) => (
                <span style={{ color: COLORS.gray500, fontSize: 12 }}>{value}</span>
              )},
              { key: 'value', label: 'Value', sortable: true, render: (value) => (
                <span style={{ fontWeight: 600, color: COLORS.navy, fontSize: 12 }}>{formatCurrency(value)}</span>
              )},
              { key: 'status', label: 'Status', render: (value) => {
                const statusColors: Record<string, { bg: string; text: string }> = {
                  'In Progress': { bg: '#fef3c7', text: '#92400e' },
                  'Scheduled': { bg: '#dbeafe', text: '#1e40af' },
                  'Completed': { bg: '#d1fae5', text: '#065f46' },
                };
                const colors = statusColors[value] || { bg: '#f1f5f9', text: COLORS.gray500 };
                return (
                  <span style={{
                    display: 'inline-block',
                    padding: '2px 6px',
                    borderRadius: 8,
                    fontSize: 10,
                    fontWeight: 500,
                    background: colors.bg,
                    color: colors.text
                  }}>
                    {value}
                  </span>
                );
              }}
            ]}
            data={mockData.recentProjects}
            sortable={true}
            showViewAll={true}
            onViewAll={() => console.log('View all projects')}
          />

          {/* Footer Note */}
          <div style={{ marginTop: 24, padding: '14px 18px', background: 'rgba(0, 41, 63, 0.04)', borderRadius: 8, borderLeft: '4px solid #00293f' }}>
            <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>
              <strong style={{ color: '#00293f' }}>Mockup Note:</strong> This dashboard uses sample data. Full implementation will pull live data from Trello boards and sync with your estimates and invoicing systems.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
