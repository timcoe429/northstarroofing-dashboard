'use client';

import React, { useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { StatCard } from '@/components/StatCard';
import { PipelineFunnel } from '@/components/PipelineFunnel';
import { ActionAlerts } from '@/components/ActionAlerts';
import { MaterialBreakdown } from '@/components/MaterialBreakdown';
import { PipelineTable } from '@/components/PipelineTable';
import { Icons } from '@/components/Icons';
import { useTrelloBoard } from '@/hooks/useTrelloData';
import { 
  parseCustomFields, 
  getCardsByList, 
  getCardsByLists,
  formatCurrency, 
  calculateDaysInColumn,
  groupCardsByList,
  sumContractAmounts,
  sumNetProfit,
  getCardListName
} from '@/utils/trello-helpers';
import type { TrelloCard, TrelloList } from '@/types';

// Material type labels for the breakdown chart
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

interface AlertItem {
  type: 'warning' | 'critical' | 'healthy';
  title: string;
  count: number;
  cards: Array<{
    address: string;
    days: number;
  }>;
}

interface MaterialBreakdown {
  label: string;
  count: number;
  totalValue: number;
}

export default function PipelinePage() {
  const { data, loading, error, refresh } = useTrelloBoard('sales');
  const [timeRange, setTimeRange] = useState('6mo');
  const [expandedAlert, setExpandedAlert] = useState<string | null>(null);
  const [tableSort, setTableSort] = useState<{ column: string; direction: 'asc' | 'desc' }>({
    column: 'daysInStage',
    direction: 'desc'
  });
  const [stageFilter, setStageFilter] = useState<string>('all');
  const [labelFilter, setLabelFilter] = useState<string[]>([]);

  // Loading state
  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: '#f1f5f9' }}>
        <Sidebar />
        <main style={{ flex: 1, marginLeft: 220 }}>
          <Header timeRange={timeRange} onTimeRangeChange={setTimeRange} />
          <div style={{ 
            padding: 24, 
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
              <p style={{ color: '#64748b', fontSize: 14 }}>Loading pipeline data...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: '#f1f5f9' }}>
        <Sidebar />
        <main style={{ flex: 1, marginLeft: 220 }}>
          <Header timeRange={timeRange} onTimeRangeChange={setTimeRange} />
          <div style={{ 
            padding: 24, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            height: 'calc(100vh - 120px)'
          }}>
            <div style={{ 
              textAlign: 'center',
              background: 'white',
              padding: 32,
              borderRadius: 10,
              border: '1px solid #e8ecf0',
              maxWidth: 400
            }}>
              <Icons.AlertCircle />
              <h3 style={{ color: '#00293f', margin: '16px 0 8px', fontSize: 18 }}>
                Connection Error
              </h3>
              <p style={{ color: '#64748b', margin: '0 0 20px', fontSize: 14 }}>
                {error}
              </p>
              <button
                onClick={refresh}
                style={{
                  background: '#00293f',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: 6,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  marginRight: 12
                }}
              >
                Try Again
              </button>
              <a
                href="/settings"
                style={{
                  color: '#00293f',
                  textDecoration: 'none',
                  fontSize: 13,
                  fontWeight: 600
                }}
              >
                Check Settings
              </a>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // No data state
  if (!data) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: '#f1f5f9' }}>
        <Sidebar />
        <main style={{ flex: 1, marginLeft: 220 }}>
          <Header timeRange={timeRange} onTimeRangeChange={setTimeRange} />
          <div style={{ 
            padding: 24, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            height: 'calc(100vh - 120px)'
          }}>
            <div style={{ 
              textAlign: 'center',
              background: 'white',
              padding: 32,
              borderRadius: 10,
              border: '1px solid #e8ecf0',
              maxWidth: 400
            }}>
              <Icons.Link />
              <h3 style={{ color: '#00293f', margin: '16px 0 8px', fontSize: 18 }}>
                Connect Trello
              </h3>
              <p style={{ color: '#64748b', margin: '0 0 20px', fontSize: 14 }}>
                Connect your Trello account to view pipeline data.
              </p>
              <a
                href="/settings"
                style={{
                  background: '#00293f',
                  color: 'white',
                  textDecoration: 'none',
                  padding: '10px 20px',
                  borderRadius: 6,
                  fontSize: 13,
                  fontWeight: 600,
                  display: 'inline-block'
                }}
              >
                Go to Settings
              </a>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Calculate KPIs and data for components
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

  // Prepare funnel data
  const funnelStages = [
    {
      name: 'New Lead',
      count: newLeadCards.length,
      value: sumContractAmounts(newLeadCards, customFields)
    },
    {
      name: 'Need Quote',
      count: needQuoteCards.length,
      value: sumContractAmounts(needQuoteCards, customFields)
    },
    {
      name: 'Estimating',
      count: estimatingCards.length,
      value: sumContractAmounts(estimatingCards, customFields)
    },
    {
      name: 'Estimate Sent',
      count: estimatesSentCards.length,
      value: sumContractAmounts(estimatesSentCards, customFields)
    },
    {
      name: 'Follow-Up',
      count: followUpCards.length,
      value: sumContractAmounts(followUpCards, customFields)
    },
    {
      name: 'Won',
      count: wonCards.length,
      value: sumContractAmounts(wonCards, customFields),
      isWon: true
    }
  ];

  return (
    <div style={{ 
      display: 'flex', 
      minHeight: '100vh', 
      background: '#f1f5f9', 
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' 
    }}>
      <Sidebar />
      
      <main style={{ flex: 1, marginLeft: 220 }}>
        <Header timeRange={timeRange} onTimeRangeChange={setTimeRange} />
        
        <div style={{ padding: 24 }}>
          {/* Page Title with Refresh Button */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: 24 
          }}>
            <h1 style={{ 
              fontSize: 24, 
              fontWeight: 700, 
              color: '#00293f', 
              margin: 0 
            }}>
              Sales Pipeline
            </h1>
            <button
              onClick={refresh}
              style={{
                background: 'white',
                border: '1px solid #e8ecf0',
                borderRadius: 6,
                padding: '8px 16px',
                fontSize: 13,
                fontWeight: 600,
                color: '#00293f',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}
            >
              <Icons.Search />
              Refresh
            </button>
          </div>

          {/* Top KPI Cards */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(4, 1fr)', 
            gap: 16, 
            marginBottom: 24 
          }}>
            <StatCard 
              label="Pipeline Value"
              value={formatCurrency(pipelineValue)}
              subtext={`${activePipelineCards.length} active leads`}
              icon="🚀"
              color="#00293f"
            />
            <StatCard 
              label="Potential Profit"
              value={formatCurrency(potentialProfit)}
              subtext={`${profitMargin.toFixed(1)}% margin`}
              icon="💰"
              color="#059669"
            />
            <StatCard 
              label="Estimates Out"
              value={estimatesOutCount.toString()}
              subtext={formatCurrency(estimatesOutValue)}
              icon="📋"
              color="#B1000F"
            />
            <StatCard 
              label="Conversion Rate"
              value={totalDecided > 0 ? `${conversionRate.toFixed(1)}%` : 'No data yet'}
              subtext={totalDecided > 0 ? `${wonCards.length} won / ${totalDecided} total decided` : ''}
              icon="🎯"
              color="#059669"
            />
          </div>

          {/* Pipeline Funnel */}
          <div style={{
            background: 'white',
            borderRadius: 10,
            padding: 18,
            border: '1px solid #e8ecf0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            marginBottom: 24
          }}>
            <h3 style={{
              fontSize: 12,
              fontWeight: 600,
              color: '#00293f',
              margin: '0 0 14px',
              textTransform: 'uppercase',
              letterSpacing: 0.3
            }}>
              Pipeline Funnel
            </h3>
            <PipelineFunnel 
              stages={funnelStages}
              lostCount={lostCards.length}
              lostValue={sumContractAmounts(lostCards, customFields)}
            />
          </div>

          {/* Action Alerts */}
          <ActionAlerts cards={cards} lists={lists} />

          {/* Two-column layout for Material Breakdown and future component */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 24,
            marginBottom: 24
          }}>
            {/* Material Breakdown */}
            <MaterialBreakdown cards={activePipelineCards} customFields={customFields} />
            
            {/* Placeholder for future component */}
            <div style={{
              background: 'white',
              borderRadius: 10,
              padding: 18,
              border: '1px solid #e8ecf0',
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
            }}>
              <h3 style={{
                fontSize: 12,
                fontWeight: 600,
                color: '#00293f',
                margin: '0 0 14px',
                textTransform: 'uppercase',
                letterSpacing: 0.3
              }}>
                Additional Insights
              </h3>
              <p style={{ color: '#64748b', fontSize: 14, margin: 0 }}>
                Space for additional pipeline insights...
              </p>
            </div>
          </div>

          {/* Pipeline Table */}
          <PipelineTable cards={cards} lists={lists} customFields={customFields} />
        </div>
      </main>
    </div>
  );
}