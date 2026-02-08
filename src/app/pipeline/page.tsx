'use client';

import React, { useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { StatCard } from '@/components/shared/StatCard';
import { PipelineBar } from '@/components/shared/PipelineBar';
import { AlertCard } from '@/components/shared/AlertCard';
import { DataTable } from '@/components/shared/DataTable';
import { Modal } from '@/components/shared/Modal';
import { MaterialBreakdown } from '@/components/MaterialBreakdown';
import { PipelineBreakdownContent } from '@/components/modals/PipelineBreakdown';
import { ProfitByMaterialContent } from '@/components/modals/ProfitByMaterial';
import { EstimatesDetailContent } from '@/components/modals/EstimatesDetail';
import { WinLossAnalysisContent } from '@/components/modals/WinLossAnalysis';
import { useTrelloBoard } from '@/hooks/useTrelloData';
import { 
  parseCustomFields, 
  getCardsByList, 
  getCardsByLists,
  formatCurrency, 
  calculateDaysInColumn,
  sumContractAmounts,
  sumNetProfit,
  getCardListName
} from '@/utils/trello-helpers';
import { COLORS, SPACING, TYPOGRAPHY } from '@/styles/constants';
import type { TrelloCard, TrelloList } from '@/types';

// Pipeline column names in order
const PIPELINE_COLUMNS = [
  'New Lead',
  'Need Quote', 
  'Estimating',
  'Estimate Sent',
  'Follow-Up',
  'Won → Create Job',
  'Lost / Dead'
];

// Active pipeline columns (exclude Won and Lost/Dead)
const ACTIVE_PIPELINE_COLUMNS = [
  'New Lead',
  'Need Quote', 
  'Estimating',
  'Estimate Sent',
  'Follow-Up'
];

// Material type labels for breakdown
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

export default function PipelinePage() {
  const { data, loading, error, refresh } = useTrelloBoard('sales');
  const [timeRange, setTimeRange] = useState('6mo');
  const [activeModal, setActiveModal] = useState<string | null>(null);

  // Loading state
  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: COLORS.gray100 }}>
        <Sidebar />
        <main style={{ flex: 1, marginLeft: 220 }}>
          <Header timeRange={timeRange} onTimeRangeChange={setTimeRange} />
          <div style={{ 
            padding: SPACING[6], 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            height: 'calc(100vh - 120px)'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div 
                className="pipeline-spinner"
                style={{ 
                  width: 40, 
                  height: 40, 
                  border: '3px solid #e8ecf0',
                  borderTop: '3px solid #00293f',
                  borderRadius: '50%',
                  margin: '0 auto 16px'
                }}
              />
              <p style={{ color: COLORS.gray500, fontSize: TYPOGRAPHY.fontSize.lg }}>
                Loading pipeline data...
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
      <div style={{ display: 'flex', minHeight: '100vh', background: COLORS.gray100 }}>
        <Sidebar />
        <main style={{ flex: 1, marginLeft: 220 }}>
          <Header timeRange={timeRange} onTimeRangeChange={setTimeRange} />
          <div style={{ 
            padding: SPACING[6], 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            height: 'calc(100vh - 120px)'
          }}>
            <AlertCard
              title="Connection Error"
              alerts={[]}
              type="critical"
              emptyState={{
                title: "Unable to connect to Trello",
                message: error
              }}
            />
          </div>
        </main>
      </div>
    );
  }

  // No data state
  if (!data) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: COLORS.gray100 }}>
        <Sidebar />
        <main style={{ flex: 1, marginLeft: 220 }}>
          <Header timeRange={timeRange} onTimeRangeChange={setTimeRange} />
          <div style={{ 
            padding: SPACING[6], 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            height: 'calc(100vh - 120px)'
          }}>
            <AlertCard
              title="Connect Trello"
              alerts={[]}
              type="info"
              emptyState={{
                title: "Trello not connected",
                message: "Connect your Trello account to view pipeline data."
              }}
            />
          </div>
        </main>
      </div>
    );
  }

  // Calculate data for components
  const { cards, lists, customFields } = data;
  
  // Get active pipeline cards (exclude Won and Lost/Dead)
  const activePipelineCards = getCardsByLists(cards, lists, ACTIVE_PIPELINE_COLUMNS);
  
  // Get cards by specific columns
  const newLeadCards = getCardsByList(cards, lists, 'New Lead');
  const needQuoteCards = getCardsByList(cards, lists, 'Need Quote');
  const estimatingCards = getCardsByList(cards, lists, 'Estimating');
  const estimatesSentCards = getCardsByList(cards, lists, 'Estimate Sent');
  const followUpCards = getCardsByList(cards, lists, 'Follow-Up');
  const wonCards = getCardsByList(cards, lists, 'Won → Create Job');
  const lostCards = getCardsByList(cards, lists, 'Lost / Dead');
  
  // Calculate KPIs
  const pipelineValue = sumContractAmounts(activePipelineCards, customFields);
  const potentialProfit = sumNetProfit(activePipelineCards, customFields);
  const profitMargin = pipelineValue > 0 ? (potentialProfit / pipelineValue) * 100 : 0;
  const estimatesOutCount = estimatesSentCards.length + followUpCards.length;
  const estimatesOutValue = sumContractAmounts([...estimatesSentCards, ...followUpCards], customFields);
  
  // Conversion rate
  const totalDecided = wonCards.length + lostCards.length;
  const conversionRate = totalDecided > 0 ? (wonCards.length / totalDecided) * 100 : 0;

  // Prepare data for modals
  const pipelineBreakdownData = ACTIVE_PIPELINE_COLUMNS.map(stage => {
    const stageCards = getCardsByList(cards, lists, stage);
    const stageValue = sumContractAmounts(stageCards, customFields);
    return {
      stage,
      count: stageCards.length,
      value: stageValue,
      percentage: pipelineValue > 0 ? (stageValue / pipelineValue) * 100 : 0
    };
  });

  // Generate action alerts
  const generateAlerts = () => {
    const alerts = [];

    // Need Quote alerts
    const needQuote3Plus = needQuoteCards.filter(card => calculateDaysInColumn(card) >= 3);
    const needQuote5Plus = needQuoteCards.filter(card => calculateDaysInColumn(card) >= 5);

    if (needQuote5Plus.length > 0) {
      alerts.push({
        id: 'need-quote-critical',
        title: 'Critical: Quotes Overdue',
        message: `${needQuote5Plus.length} leads have been waiting 5+ days for quotes!`,
        count: needQuote5Plus.length,
        items: needQuote5Plus.map(card => ({
          label: card.name,
          value: `${calculateDaysInColumn(card)} days`,
          color: COLORS.red
        }))
      });
    } else if (needQuote3Plus.length > 0) {
      alerts.push({
        id: 'need-quote-warning',
        title: 'Quotes Needed',
        message: `${needQuote3Plus.length} leads waiting for quotes`,
        count: needQuote3Plus.length,
        items: needQuote3Plus.map(card => ({
          label: card.name,
          value: `${calculateDaysInColumn(card)} days`,
          color: '#856404'
        }))
      });
    }

    // Add other alerts...
    return alerts;
  };

  const alerts = generateAlerts();

  return (
    <div style={{ 
      display: 'flex', 
      minHeight: '100vh', 
      background: COLORS.gray100, 
      fontFamily: TYPOGRAPHY.fontFamily 
    }}>
      {/* Modals */}
      <Modal 
        isOpen={activeModal === 'pipelineValue'} 
        onClose={() => setActiveModal(null)} 
        title="Pipeline Breakdown"
      >
        <PipelineBreakdownContent data={pipelineBreakdownData} />
      </Modal>
      
      <Modal 
        isOpen={activeModal === 'potentialProfit'} 
        onClose={() => setActiveModal(null)} 
        title="Profit by Material"
      >
        <ProfitByMaterialContent data={[]} />
      </Modal>
      
      <Modal 
        isOpen={activeModal === 'estimatesOut'} 
        onClose={() => setActiveModal(null)} 
        title="Estimates Detail"
      >
        <EstimatesDetailContent data={[]} />
      </Modal>
      
      <Modal 
        isOpen={activeModal === 'conversionRate'} 
        onClose={() => setActiveModal(null)} 
        title="Win/Loss Analysis"
      >
        <WinLossAnalysisContent data={{
          won: { count: wonCards.length, value: sumContractAmounts(wonCards, customFields), materials: [] },
          lost: { count: lostCards.length, value: sumContractAmounts(lostCards, customFields), materials: [] },
          conversionRate
        }} />
      </Modal>

      <Sidebar />
      
      <main style={{ flex: 1, marginLeft: 220 }}>
        <Header timeRange={timeRange} onTimeRangeChange={setTimeRange} />
        
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
              Pipeline
            </h1>
            <p style={{
              fontSize: TYPOGRAPHY.fontSize.lg,
              color: COLORS.gray500,
              margin: 0
            }}>
              Sales pipeline overview
            </p>
          </div>

          {/* Top Stats Row */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(4, 1fr)', 
            gap: SPACING.gridGap, 
            marginBottom: SPACING.sectionMargin 
          }}>
            <StatCard 
              label="Pipeline Value"
              value={formatCurrency(pipelineValue)}
              subtext={`${activePipelineCards.length} active leads`}
              icon="🚀"
              color={COLORS.navy}
              onClick={() => setActiveModal('pipelineValue')}
            />
            <StatCard 
              label="Potential Profit"
              value={formatCurrency(potentialProfit)}
              subtext={`${profitMargin.toFixed(1)}% margin`}
              icon="💰"
              color={COLORS.success}
              onClick={() => setActiveModal('potentialProfit')}
            />
            <StatCard 
              label="Estimates Out"
              value={estimatesOutCount.toString()}
              subtext={formatCurrency(estimatesOutValue)}
              icon="📋"
              color={COLORS.red}
              onClick={() => setActiveModal('estimatesOut')}
            />
            <StatCard 
              label="Conversion Rate"
              value={totalDecided > 0 ? `${conversionRate.toFixed(1)}%` : 'No data yet'}
              subtext={totalDecided > 0 ? `${wonCards.length} won / ${totalDecided} total decided` : ''}
              icon="🎯"
              color={COLORS.success}
              onClick={() => setActiveModal('conversionRate')}
            />
          </div>

          {/* Pipeline Row */}
          <div style={{ marginBottom: SPACING.sectionMargin }}>
            <PipelineBar 
              title="Sales Pipeline"
              segments={[
                { key: 'newLead', label: 'New Lead', count: newLeadCards.length, color: '#94a3b8' },
                { key: 'needQuote', label: 'Need Quote', count: needQuoteCards.length, color: '#60a5fa' },
                { key: 'estimating', label: 'Estimating', count: estimatingCards.length, color: '#fbbf24' },
                { key: 'estimateSent', label: 'Estimate Sent', count: estimatesSentCards.length, color: COLORS.red },
                { key: 'followUp', label: 'Follow-Up', count: followUpCards.length, color: '#8b5cf6' },
                { key: 'won', label: 'Won', count: wonCards.length, color: COLORS.success }
              ]}
            />
          </div>

          {/* Middle Row */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '2fr 1fr', 
            gap: SPACING.gridGap, 
            marginBottom: SPACING.sectionMargin 
          }}>
            <AlertCard
              title="Needs Attention"
              alerts={alerts}
              type={alerts.length > 0 ? 'warning' : 'healthy'}
              expandable={true}
              emptyState={{
                title: "Pipeline is healthy",
                message: "Nothing overdue 👍"
              }}
            />
            
            <MaterialBreakdown cards={activePipelineCards} customFields={customFields} />
          </div>

          {/* Pipeline Table */}
          <DataTable
            title="All Pipeline Leads"
            columns={[
              { 
                key: 'name', 
                label: 'Address', 
                sortable: true,
                render: (value) => (
                  <span style={{ fontWeight: TYPOGRAPHY.fontWeight.medium }}>{value}</span>
                )
              },
              { 
                key: 'stage', 
                label: 'Stage', 
                sortable: true,
                render: (value) => (
                  <span style={{
                    background: COLORS.gray100,
                    color: COLORS.navy,
                    padding: `4px 8px`,
                    borderRadius: 4,
                    fontSize: TYPOGRAPHY.fontSize.xs,
                    fontWeight: TYPOGRAPHY.fontWeight.medium
                  }}>
                    {value}
                  </span>
                )
              },
              { 
                key: 'labels', 
                label: 'Labels',
                render: (value, row) => (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {row.labels?.slice(0, 3).map((label: any) => (
                      <span
                        key={label.id}
                        style={{
                          background: label.color ? `#${label.color}` : COLORS.gray500,
                          color: COLORS.white,
                          padding: '2px 6px',
                          borderRadius: 3,
                          fontSize: TYPOGRAPHY.fontSize.xs,
                          fontWeight: TYPOGRAPHY.fontWeight.medium
                        }}
                      >
                        {label.name}
                      </span>
                    ))}
                    {row.labels?.length > 3 && (
                      <span style={{
                        color: COLORS.gray500,
                        fontSize: TYPOGRAPHY.fontSize.xs,
                        padding: '2px 4px'
                      }}>
                        +{row.labels.length - 3}
                      </span>
                    )}
                  </div>
                )
              },
              { 
                key: 'contractAmount', 
                label: 'Contract Amount', 
                sortable: true,
                render: (value) => (
                  <span style={{ 
                    fontWeight: TYPOGRAPHY.fontWeight.semibold,
                    color: COLORS.navy 
                  }}>
                    {formatCurrency(value)}
                  </span>
                )
              },
              { 
                key: 'netProfit', 
                label: 'Net Profit', 
                sortable: true,
                render: (value) => (
                  <span style={{ 
                    fontWeight: TYPOGRAPHY.fontWeight.semibold,
                    color: value >= 0 ? COLORS.success : COLORS.red
                  }}>
                    {formatCurrency(value)}
                  </span>
                )
              },
              { 
                key: 'daysInStage', 
                label: 'Days in Stage', 
                sortable: true,
                render: (value) => (
                  <span style={{ 
                    fontWeight: TYPOGRAPHY.fontWeight.semibold,
                    color: value < 3 ? COLORS.success : value <= 5 ? '#856404' : COLORS.red
                  }}>
                    {value}
                  </span>
                )
              }
            ]}
            data={activePipelineCards.map(card => {
              const financials = parseCustomFields(card, customFields);
              return {
                id: card.id,
                name: card.name,
                stage: getCardListName(card, lists),
                labels: card.labels,
                contractAmount: financials.contractAmount,
                netProfit: financials.netProfit,
                daysInStage: calculateDaysInColumn(card)
              };
            })}
            sortable={true}
            totalsRow={{
              name: `Total (${activePipelineCards.length} leads)`,
              stage: '',
              labels: '',
              contractAmount: pipelineValue,
              netProfit: potentialProfit,
              daysInStage: ''
            }}
          />
        </div>
      </main>
    </div>
  );
}