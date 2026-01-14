'use client';

import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { StatCard } from './StatCard';
import { PipelineCard } from './PipelineCard';
import { RevenueChart } from './RevenueChart';
import { JobTypesCard } from './JobTypesCard';
import { CollectionRing } from './CollectionRing';
import { RecentProjects } from './RecentProjects';
import { Modal } from './Modal';
import { RevenueDetailContent } from './modals/RevenueDetail';
import { ProfitDetailContent } from './modals/ProfitDetail';
import { ActiveProjectsContent } from './modals/ActiveProjects';
import { AvgJobSizeContent } from './modals/AvgJobSize';
import { mockData, formatCurrency } from '@/lib/utils';

export default function NorthstarDashboard() {
  const [activeNav, setActiveNav] = useState('dashboard');
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState('6mo');

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f1f5f9', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
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
      <Sidebar activeNav={activeNav} onNavChange={setActiveNav} />

      {/* Main Content */}
      <main style={{ flex: 1, marginLeft: 220 }}>
        <Header timeRange={timeRange} onTimeRangeChange={setTimeRange} />

        {/* Dashboard Content */}
        <div style={{ padding: 24 }}>
          {/* Top Stats Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 20 }}>
            <StatCard 
              label="Total Revenue" 
              value={formatCurrency(mockData.financials.totalRevenue)} 
              subtext="+18% from last period" 
              trend={18} 
              icon="💰" 
              color="#00293f" 
              onClick={() => setActiveModal('revenue')} 
            />
            <StatCard 
              label="Gross Profit" 
              value={formatCurrency(mockData.financials.profit)} 
              subtext="22% margin" 
              trend={0} 
              icon="📈" 
              color="#059669" 
              onClick={() => setActiveModal('profit')} 
            />
            <StatCard 
              label="Active Projects" 
              value={mockData.pipeline.inProgress + mockData.pipeline.scheduled} 
              subtext={`${mockData.pipeline.inProgress} in progress`} 
              icon="🏗️" 
              color="#B1000F" 
              onClick={() => setActiveModal('activeProjects')} 
            />
            <StatCard 
              label="Avg Job Size" 
              value={formatCurrency(mockData.financials.avgJobSize)} 
              subtext="+12% YoY" 
              trend={12} 
              icon="📊" 
              color="#00293f" 
              onClick={() => setActiveModal('avgJobSize')} 
            />
          </div>

          {/* Pipeline Row */}
          <div style={{ marginBottom: 20 }}>
            <PipelineCard data={mockData.pipeline} />
          </div>

          {/* Middle Row - Charts */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 16, marginBottom: 20 }}>
            <RevenueChart data={mockData.monthlyTrend} />
            <JobTypesCard data={mockData.jobTypes} />
            <CollectionRing collected={mockData.financials.collected} uncollected={mockData.financials.uncollected} />
          </div>

          {/* Recent Projects */}
          <RecentProjects projects={mockData.recentProjects} />

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
