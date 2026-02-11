'use client';

import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { StatCard } from '@/components/shared/StatCard';

export const dynamic = 'force-dynamic';
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
import type { TrelloCard, TrelloList, TrelloCustomField } from '@/types';

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
const MATERIAL_TYPES = [
  { label: 'Synthetic', color: '#3B82F6' },
  { label: 'Asphalt', color: '#00293f' },
  { label: 'Standing Seam Metal', color: '#64748b' },
  { label: 'TPO', color: '#0EA5E9' },
  { label: 'Corrugated Metal', color: '#6366F1' },
  { label: 'Pro Panel', color: '#8B5CF6' },
  { label: 'Wood Shingle', color: '#D97706' },
  { label: 'Asphalt-Presidential', color: '#059669' }
];

// Extract just the labels for compatibility
const MATERIAL_LABELS = MATERIAL_TYPES.map(type => type.label);

// Trello color name to hex mapping
const mapTrelloColorToHex = (colorName: string): string => {
  const colorMap: Record<string, string> = {
    'green': '#22c55e',
    'yellow': '#eab308', 
    'orange': '#f97316',
    'red': '#ef4444',
    'purple': '#a855f7',
    'blue': '#3b82f6',
    'sky': '#0ea5e9',
    'pink': '#ec4899',
    'black': '#1e293b',
    'lime': '#84cc16'
  };
  return colorMap[colorName] || '#64748b';
};

// Data processing functions for modals
const processMaterialProfitData = (cards: TrelloCard[], customFields: TrelloCustomField[]) => {
  const materialData = MATERIAL_LABELS.map(material => {
    const materialCards = cards.filter(card => 
      Array.isArray(card.labels) && card.labels.some(label => label.name === material)
    );
    
    const revenue = sumContractAmounts(materialCards, customFields);
    const profit = sumNetProfit(materialCards, customFields);
    const margin = revenue > 0 ? (profit / revenue) * 100 : 0;
    
    return {
      material,
      leads: materialCards.length,
      revenue,
      profit,
      margin
    };
  }).filter(m => m.leads > 0)
    .sort((a, b) => b.revenue - a.revenue);
  
  return materialData;
};

const processEstimatesData = (estimatesSentCards: TrelloCard[], followUpCards: TrelloCard[], customFields: TrelloCustomField[], lists: TrelloList[]) => {
  const allEstimateCards = [...estimatesSentCards, ...followUpCards];
  
  return allEstimateCards.map(card => {
    const financials = parseCustomFields(card, customFields);
    const stage = getCardListName(card, lists) as 'Estimate Sent' | 'Follow-Up';
    
    // Get primary material label
    const materialLabel = Array.isArray(card.labels) 
      ? card.labels.find(label => MATERIAL_LABELS.includes(label.name))?.name || 'Unknown'
      : 'Unknown';
    
    return {
      id: card.id,
      address: card.name,
      stage,
      value: financials.contractAmount,
      daysInStage: calculateDaysInColumn(card),
      material: materialLabel
    };
  });
};

const extractMaterialsFromCards = (cards: TrelloCard[], customFields: TrelloCustomField[]) => {
  const materialMap = new Map<string, { count: number; value: number }>();
  
  cards.forEach(card => {
    if (Array.isArray(card.labels)) {
      card.labels.forEach(label => {
        if (MATERIAL_LABELS.includes(label.name)) {
          const financials = parseCustomFields(card, customFields);
          const existing = materialMap.get(label.name) || { count: 0, value: 0 };
          materialMap.set(label.name, {
            count: existing.count + 1,
            value: existing.value + financials.contractAmount
          });
        }
      });
    }
  });
  
  return Array.from(materialMap.entries()).map(([material, data]) => ({
    material,
    count: data.count,
    value: data.value
  }));
};

export default function PipelinePage() {
  const { data, loading, error, refresh } = useTrelloBoard('sales');
  const [timeRange, setTimeRange] = useState('6mo');
  const [activeModal, setActiveModal] = useState<string | null>(null);

  // Loading state
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: COLORS.gray100 }}>
        <Header title="Pipeline" subtitle="Sales pipeline overview" showTimeRange={false} />
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
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div style={{ minHeight: '100vh', background: COLORS.gray100 }}>
        <Header title="Pipeline" subtitle="Sales pipeline overview" showTimeRange={false} />
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
      </div>
    );
  }

  // No data state
  if (!data) {
    return (
      <div style={{ minHeight: '100vh', background: COLORS.gray100 }}>
        <Header title="Pipeline" subtitle="Sales pipeline overview" showTimeRange={false} />
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

  // Process data for modals
  const materialProfitData = processMaterialProfitData(activePipelineCards, customFields);
  const estimatesData = processEstimatesData(estimatesSentCards, followUpCards, customFields, lists);
  const wonMaterials = extractMaterialsFromCards(wonCards, customFields);
  const lostMaterials = extractMaterialsFromCards(lostCards, customFields);

  // Generate action alerts
  const generateAlerts = () => {
    const alerts = [];

    // Need Quote alerts (3+ days = yellow, 5+ days = red)
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
          color: COLORS.warning
        }))
      });
    }

    // Estimating alerts (5+ days = yellow)
    const estimating5Plus = estimatingCards.filter(card => calculateDaysInColumn(card) >= 5);
    if (estimating5Plus.length > 0) {
      alerts.push({
        id: 'estimating-warning',
        title: 'Estimates Taking Too Long',
        message: `${estimating5Plus.length} estimates have been in progress for 5+ days`,
        count: estimating5Plus.length,
        items: estimating5Plus.map(card => ({
          label: card.name,
          value: `${calculateDaysInColumn(card)} days`,
          color: COLORS.warning
        }))
      });
    }

    // Estimate Sent alerts (5+ days = yellow, 7+ days = red)
    const estimateSent5Plus = estimatesSentCards.filter(card => calculateDaysInColumn(card) >= 5);
    const estimateSent7Plus = estimatesSentCards.filter(card => calculateDaysInColumn(card) >= 7);

    if (estimateSent7Plus.length > 0) {
      alerts.push({
        id: 'estimate-sent-critical',
        title: 'Critical: Estimates Need Follow-Up',
        message: `${estimateSent7Plus.length} estimates sent 7+ days ago with no response!`,
        count: estimateSent7Plus.length,
        items: estimateSent7Plus.map(card => ({
          label: card.name,
          value: `${calculateDaysInColumn(card)} days`,
          color: COLORS.red
        }))
      });
    } else if (estimateSent5Plus.length > 0) {
      alerts.push({
        id: 'estimate-sent-warning',
        title: 'Estimates Awaiting Response',
        message: `${estimateSent5Plus.length} estimates sent 5+ days ago`,
        count: estimateSent5Plus.length,
        items: estimateSent5Plus.map(card => ({
          label: card.name,
          value: `${calculateDaysInColumn(card)} days`,
          color: COLORS.warning
        }))
      });
    }

    // Follow-Up alerts (7+ days = red)
    const followUp7Plus = followUpCards.filter(card => calculateDaysInColumn(card) >= 7);
    if (followUp7Plus.length > 0) {
      alerts.push({
        id: 'follow-up-critical',
        title: 'Critical: Follow-Ups Overdue',
        message: `${followUp7Plus.length} leads need immediate follow-up (7+ days)!`,
        count: followUp7Plus.length,
        items: followUp7Plus.map(card => ({
          label: card.name,
          value: `${calculateDaysInColumn(card)} days`,
          color: COLORS.red
        }))
      });
    }

    return alerts;
  };

  const alerts = generateAlerts();

  return (
    <div style={{ 
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
        <ProfitByMaterialContent data={materialProfitData} />
      </Modal>
      
      <Modal 
        isOpen={activeModal === 'estimatesOut'} 
        onClose={() => setActiveModal(null)} 
        title="Estimates Detail"
      >
        <EstimatesDetailContent data={estimatesData} />
      </Modal>
      
      <Modal 
        isOpen={activeModal === 'conversionRate'} 
        onClose={() => setActiveModal(null)} 
        title="Win/Loss Analysis"
      >
        <WinLossAnalysisContent data={{
          won: { count: wonCards.length, value: sumContractAmounts(wonCards, customFields), materials: wonMaterials },
          lost: { count: lostCards.length, value: sumContractAmounts(lostCards, customFields), materials: lostMaterials },
          conversionRate
        }} />
      </Modal>

      <Header title="Pipeline" subtitle="Sales pipeline overview" showTimeRange={false} />
        
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
            title={`Pipeline Leads (${activePipelineCards.filter(card => card.name !== 'Address').length})`}
            filterable={true}
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
                key: 'labelsSort', 
                label: 'Labels',
                sortable: true,
                render: (value, row) => (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {(Array.isArray(row.labels) ? row.labels.slice(0, 3) : []).map((label: any) => (
                      <span
                        key={label.id}
                        style={{
                          background: label.color ? mapTrelloColorToHex(label.color) : COLORS.gray500,
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
                    {Array.isArray(row.labels) && row.labels.length > 3 && (
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
                key: 'office10Pct', 
                label: 'Office 10%', 
                sortable: true,
                render: (value) => (
                  <span style={{ 
                    fontWeight: TYPOGRAPHY.fontWeight.semibold,
                    color: COLORS.gray700 
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
            data={activePipelineCards
              .filter(card => card.name !== 'Address') // Exclude template card
              .map(card => {
                const financials = parseCustomFields(card, customFields);
                return {
                id: card.id,
                name: card.name,
                stage: getCardListName(card, lists),
                labels: Array.isArray(card.labels) ? card.labels : [],
                labelsSort: Array.isArray(card.labels) && card.labels.length > 0 ? card.labels[0].name : '',
                contractAmount: financials.contractAmount,
                office10Pct: financials.office10Pct,
                netProfit: financials.netProfit,
                daysInStage: calculateDaysInColumn(card)
                };
              })
            }
            sortable={true}
            initialSortColumn="daysInStage"
            initialSortDirection="desc"
            totalsRow={{
              name: `Total (${activePipelineCards.filter(card => card.name !== 'Address').length} leads)`,
              stage: '',
              labels: '',
              labelsSort: '',
              contractAmount: pipelineValue,
              office10Pct: activePipelineCards
                .filter(card => card.name !== 'Address')
                .reduce((sum, card) => {
                  const financials = parseCustomFields(card, customFields);
                  return sum + financials.office10Pct;
                }, 0),
              netProfit: potentialProfit,
              daysInStage: ''
            }}
          />
        </div>
    </div>
  );
}