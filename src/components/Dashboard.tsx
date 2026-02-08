'use client';

import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useAuthContext, getDisplayName } from '@/contexts/AuthContext';
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
import { useTrelloBoard } from '@/hooks/useTrelloData';
import { 
  parseCustomFields, 
  getCardsByList, 
  getCardsByLists,
  formatCurrency, 
  sumContractAmounts,
  sumNetProfit,
  getCardListName
} from '@/utils/trello-helpers';
import { COLORS, SPACING } from '@/styles/constants';

// Build/Jobs board columns in order
const BUILD_COLUMNS = [
  'Ready to Schedule',
  'Scheduled',
  'Materials Ordered',
  'In Progress',
  'Final Inspection',
  'Invoice Sent',
  'Paid',
  'Warranty / Closeout'
];

// Active project columns (before invoicing)
const ACTIVE_COLUMNS = [
  'Ready to Schedule',
  'Scheduled', 
  'Materials Ordered',
  'In Progress',
  'Final Inspection'
];

// Material type labels (same as Pipeline)
const MATERIAL_LABELS = [
  'Asphalt',
  'Synthetic', 
  'TPO',
  'Standing Seam Metal',
  'Wood Shingle',
  'Pro Panel',
  'Corrugated Metal',
  'Asphalt-Presidential'
];

export default function NorthstarDashboard() {
  const { data, loading, error } = useTrelloBoard('build');
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const { user } = useAuthContext();

  // Loading state
  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: COLORS.gray100, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
        <Sidebar />
        <main style={{ flex: 1, marginLeft: 220 }}>
          <Header title="Dashboard" subtitle={`Welcome back, ${user?.email ? getDisplayName(user.email) : 'User'}`} showTimeRange={false} />
          <div style={{ 
            padding: SPACING[6], 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            height: 'calc(100vh - 120px)'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                width: 40, 
                height: 40, 
                border: '3px solid #e8ecf0',
                borderTop: '3px solid #00293f',
                borderRadius: '50%',
                margin: '0 auto 16px',
                animation: 'spin 1s linear infinite'
              }} />
              <p style={{ color: COLORS.gray500, fontSize: 16 }}>
                Loading dashboard data...
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: COLORS.gray100, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
        <Sidebar />
        <main style={{ flex: 1, marginLeft: 220 }}>
          <Header title="Dashboard" subtitle={`Welcome back, ${user?.email ? getDisplayName(user.email) : 'User'}`} showTimeRange={false} />
          <div style={{ 
            padding: SPACING[6], 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            height: 'calc(100vh - 120px)'
          }}>
            <div style={{
              background: COLORS.white,
              borderRadius: 12,
              padding: SPACING[8],
              textAlign: 'center',
              border: '1px solid #fecaca',
              maxWidth: 400
            }}>
              <h3 style={{ color: COLORS.red, marginBottom: SPACING[4] }}>Connection Error</h3>
              <p style={{ color: COLORS.gray600, marginBottom: 0 }}>{error}</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Extract data or use empty defaults
  const { cards = [], lists = [], customFields = [] } = data || {};
  
  // Calculate KPIs from real data
  const totalRevenue = sumContractAmounts(cards, customFields);
  const grossProfit = sumNetProfit(cards, customFields);
  const profitMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;
  
  // Active projects: Ready to Schedule through Final Inspection
  const activeCards = getCardsByLists(cards, lists, ACTIVE_COLUMNS);
  const inProgressCards = getCardsByList(cards, lists, 'In Progress');
  
  // Average job size
  const avgJobSize = cards.length > 0 ? totalRevenue / cards.length : 0;
  
  // Collections data: Invoice Sent vs Paid
  const invoiceSentCards = getCardsByList(cards, lists, 'Invoice Sent');
  const paidCards = getCardsByList(cards, lists, 'Paid');
  const invoiceSentValue = sumContractAmounts(invoiceSentCards, customFields);
  const paidValue = sumContractAmounts(paidCards, customFields);
  const collectionRate = (invoiceSentValue + paidValue) > 0 ? (paidValue / (invoiceSentValue + paidValue)) * 100 : 0;
  
  // Pipeline segments for Build/Jobs board
  const pipelineSegments = BUILD_COLUMNS.slice(0, -1).map((column, index) => { // Exclude Warranty/Closeout
    const columnCards = getCardsByList(cards, lists, column);
    const colors = ['#94a3b8', '#60a5fa', '#fbbf24', COLORS.red, '#8b5cf6', '#22c55e', COLORS.success];
    return {
      key: column.toLowerCase().replace(/\s+/g, ''),
      label: column,
      count: columnCards.length,
      color: colors[index] || COLORS.gray500
    };
  });
  
  // Job types breakdown - map to expected interface
  const replacementCards = cards.filter(card => 
    Array.isArray(card.labels) && card.labels.some(label => 
      ['Asphalt', 'Synthetic', 'TPO', 'Standing Seam Metal', 'Wood Shingle', 'Pro Panel', 'Corrugated Metal', 'Asphalt-Presidential'].includes(label.name)
    )
  );
  const repairCards = cards.filter(card => 
    Array.isArray(card.labels) && card.labels.some(label => label.name === 'Repair')
  );
  const inspectionCards = cards.filter(card => 
    Array.isArray(card.labels) && card.labels.some(label => label.name === 'Insurance')
  );
  const gutterCards = cards.filter(card => 
    card.name.toLowerCase().includes('gutter')
  );
  
  const jobTypeData = {
    replacements: replacementCards.length,
    repairs: repairCards.length,
    inspections: inspectionCards.length,
    gutters: gutterCards.length
  };
  
  // Recent projects table data
  const recentProjectsData = activeCards.slice(0, 8).map(card => {
    const financials = parseCustomFields(card, customFields);
    const stage = getCardListName(card, lists);
    const materialLabel = Array.isArray(card.labels) 
      ? card.labels.find(label => MATERIAL_LABELS.includes(label.name))?.name || 'Other'
      : 'Other';
    
    return {
      project: card.name,
      type: materialLabel,
      stage,
      value: financials.contractAmount,
      status: stage
    };
  });

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: COLORS.gray100, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      {/* Modals */}
      <Modal isOpen={activeModal === 'revenue'} onClose={() => setActiveModal(null)} title="Revenue Breakdown">
        <RevenueDetailContent data={[]} />
      </Modal>
      <Modal isOpen={activeModal === 'profit'} onClose={() => setActiveModal(null)} title="Profit Analysis">
        <ProfitDetailContent data={{ byType: [], byMonth: [] }} />
      </Modal>
      <Modal isOpen={activeModal === 'activeProjects'} onClose={() => setActiveModal(null)} title="Active Projects">
        <ActiveProjectsContent projects={activeCards.map((card, index) => {
          const financials = parseCustomFields(card, customFields);
          const materialLabel = Array.isArray(card.labels) 
            ? card.labels.find(label => MATERIAL_LABELS.includes(label.name))?.name || 'Other'
            : 'Other';
          return {
            id: index + 1,
            name: card.name,
            type: materialLabel,
            value: financials.contractAmount,
            status: getCardListName(card, lists),
            location: 'TBD',
            startDate: new Date().toISOString().split('T')[0],
            crew: 'TBD',
            completion: 0
          };
        })} />
      </Modal>
      <Modal isOpen={activeModal === 'avgJobSize'} onClose={() => setActiveModal(null)} title="Average Job Size Analysis">
        <AvgJobSizeContent data={{ byType: [], trend: [] }} />
      </Modal>

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main style={{ flex: 1, marginLeft: 220 }}>
        <Header title="Dashboard" subtitle={`Welcome back, ${user?.email ? getDisplayName(user.email) : 'User'}`} showTimeRange={false} />

        {/* Dashboard Content */}
        <div style={{ padding: SPACING[6] }}>
          {/* Top Stats Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: SPACING.gridGap, marginBottom: SPACING.sectionMargin }}>
            <StatCard 
              label="Total Revenue" 
              value={formatCurrency(totalRevenue)} 
              subtext={cards.length > 0 ? `${cards.length} total projects` : 'No projects yet'} 
              icon="💰" 
              color={COLORS.navy} 
              onClick={() => setActiveModal('revenue')} 
            />
            <StatCard 
              label="Gross Profit" 
              value={formatCurrency(grossProfit)} 
              subtext={`${profitMargin.toFixed(1)}% margin`} 
              icon="📈" 
              color={COLORS.success} 
              onClick={() => setActiveModal('profit')} 
            />
            <StatCard 
              label="Active Projects" 
              value={activeCards.length.toString()} 
              subtext={`${inProgressCards.length} in progress`} 
              icon="🏗️" 
              color={COLORS.info} 
              onClick={() => setActiveModal('activeProjects')} 
            />
            <StatCard 
              label="Avg Job Size" 
              value={formatCurrency(avgJobSize)} 
              subtext={cards.length > 0 ? `Based on ${cards.length} projects` : 'No data yet'} 
              icon="📊" 
              color={COLORS.navy} 
              onClick={() => setActiveModal('avgJobSize')} 
            />
          </div>

          {/* Pipeline Row */}
          <div style={{ marginBottom: SPACING.sectionMargin }}>
            <PipelineBar 
              title="Project Pipeline"
              segments={pipelineSegments}
            />
          </div>

          {/* Middle Row - Charts */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: SPACING.gridGap, marginBottom: SPACING.sectionMargin }}>
            <RevenueChart data={[]} />
            <JobTypesCard data={jobTypeData} />
            <CollectionRing collected={paidValue} uncollected={invoiceSentValue} />
          </div>

          {/* Recent Projects */}
          <DataTable
            title="Recent Projects"
            columns={[
              { key: 'project', label: 'Project', sortable: true, render: (value) => (
                <span style={{ fontWeight: 600, color: COLORS.navy, fontSize: 12 }}>{value}</span>
              )},
              { key: 'type', label: 'Material', sortable: true, render: (value) => (
                <span style={{ color: '#334155', fontSize: 12 }}>{value}</span>
              )},
              { key: 'stage', label: 'Stage', sortable: true, render: (value) => (
                <span style={{ color: COLORS.gray500, fontSize: 12 }}>{value}</span>
              )},
              { key: 'value', label: 'Value', sortable: true, render: (value) => (
                <span style={{ fontWeight: 600, color: COLORS.navy, fontSize: 12 }}>{formatCurrency(value)}</span>
              )},
              { key: 'status', label: 'Status', render: (value) => {
                const statusColors: Record<string, { bg: string; text: string }> = {
                  'In Progress': { bg: '#fef3c7', text: '#92400e' },
                  'Scheduled': { bg: '#dbeafe', text: '#1e40af' },
                  'Ready to Schedule': { bg: '#f3f4f6', text: '#374151' },
                  'Materials Ordered': { bg: '#e0e7ff', text: '#3730a3' },
                  'Final Inspection': { bg: '#fef3c7', text: '#92400e' },
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
            data={recentProjectsData}
            sortable={true}
            showViewAll={true}
            onViewAll={() => console.log('View all projects')}
            emptyMessage={activeCards.length === 0 ? "No active projects found. Projects will appear here once added to your Build/Jobs Trello board." : undefined}
          />
        </div>
      </main>
    </div>
  );
}
