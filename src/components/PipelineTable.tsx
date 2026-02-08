'use client';

import React, { useState, useMemo } from 'react';
import { 
  parseCustomFields, 
  formatCurrency, 
  calculateDaysInColumn, 
  getCardListName,
  sumContractAmounts,
  sumNetProfit
} from '@/utils/trello-helpers';
import type { TrelloCard, TrelloList, TrelloCustomField } from '@/types';

interface PipelineTableProps {
  cards: TrelloCard[];
  lists: TrelloList[];
  customFields: TrelloCustomField[];
}

type SortColumn = 'name' | 'stage' | 'contractAmount' | 'office10Pct' | 'netProfit' | 'daysInStage';
type SortDirection = 'asc' | 'desc';

interface TableCard extends TrelloCard {
  stage: string;
  contractAmount: number;
  office10Pct: number;
  netProfit: number;
  daysInStage: number;
}

export const PipelineTable: React.FC<PipelineTableProps> = ({ 
  cards, 
  lists, 
  customFields 
}) => {
  const [sortColumn, setSortColumn] = useState<SortColumn>('daysInStage');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [stageFilter, setStageFilter] = useState<string>('all');
  const [labelFilter, setLabelFilter] = useState<string[]>([]);

  // Exclude Lost/Dead cards from the table
  const pipelineCards = cards.filter(card => {
    const stage = getCardListName(card, lists);
    return stage !== 'Lost / Dead';
  });

  // Transform cards with calculated fields
  const tableCards: TableCard[] = useMemo(() => {
    return pipelineCards.map(card => {
      const stage = getCardListName(card, lists);
      const financials = parseCustomFields(card, customFields);
      const daysInStage = calculateDaysInColumn(card);

      return {
        ...card,
        stage,
        contractAmount: financials.contractAmount,
        office10Pct: financials.office10Pct,
        netProfit: financials.netProfit,
        daysInStage
      };
    });
  }, [pipelineCards, lists, customFields]);

  // Get unique stages and labels for filters
  const uniqueStages = Array.from(new Set(tableCards.map(card => card.stage))).sort();
  const uniqueLabels = Array.from(new Set(
    tableCards.flatMap(card => card.labels.map(label => label.name))
  )).sort();

  // Apply filters
  const filteredCards = useMemo(() => {
    return tableCards.filter(card => {
      // Stage filter
      if (stageFilter !== 'all' && card.stage !== stageFilter) {
        return false;
      }

      // Label filter
      if (labelFilter.length > 0) {
        const cardLabels = card.labels.map(label => label.name);
        const hasSelectedLabel = labelFilter.some(label => cardLabels.includes(label));
        if (!hasSelectedLabel) {
          return false;
        }
      }

      return true;
    });
  }, [tableCards, stageFilter, labelFilter]);

  // Apply sorting
  const sortedCards = useMemo(() => {
    return [...filteredCards].sort((a, b) => {
      let aValue: any = a[sortColumn];
      let bValue: any = b[sortColumn];

      // Handle string comparisons
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) {
        return sortDirection === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [filteredCards, sortColumn, sortDirection]);

  // Handle column header click
  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('desc');
    }
  };

  // Get days color
  const getDaysColor = (days: number) => {
    if (days < 3) return '#059669'; // green
    if (days <= 5) return '#856404'; // yellow/orange
    return '#B1000F'; // red
  };

  // Calculate totals
  const totalContractAmount = sumContractAmounts(filteredCards, customFields);
  const totalNetProfit = sumNetProfit(filteredCards, customFields);

  return (
    <div style={{
      background: 'white',
      borderRadius: 10,
      padding: 18,
      border: '1px solid #e8ecf0',
      boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16
      }}>
        <h3 style={{
          fontSize: 12,
          fontWeight: 600,
          color: '#00293f',
          margin: 0,
          textTransform: 'uppercase',
          letterSpacing: 0.3
        }}>
          All Pipeline Leads ({sortedCards.length})
        </h3>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          {/* Stage Filter */}
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            style={{
              padding: '6px 10px',
              border: '1px solid #e8ecf0',
              borderRadius: 6,
              fontSize: 12,
              background: 'white',
              color: '#00293f'
            }}
          >
            <option value="all">All Stages</option>
            {uniqueStages.map(stage => (
              <option key={stage} value={stage}>{stage}</option>
            ))}
          </select>

          {/* Label Filter */}
          <select
            multiple
            value={labelFilter}
            onChange={(e) => {
              const values = Array.from(e.target.selectedOptions, option => option.value);
              setLabelFilter(values);
            }}
            style={{
              padding: '6px 10px',
              border: '1px solid #e8ecf0',
              borderRadius: 6,
              fontSize: 12,
              background: 'white',
              color: '#00293f',
              minWidth: 120,
              maxHeight: 100
            }}
          >
            {uniqueLabels.map(label => (
              <option key={label} value={label}>{label}</option>
            ))}
          </select>

          {/* Clear Filters */}
          {(stageFilter !== 'all' || labelFilter.length > 0) && (
            <button
              onClick={() => {
                setStageFilter('all');
                setLabelFilter([]);
              }}
              style={{
                padding: '6px 10px',
                border: '1px solid #e8ecf0',
                borderRadius: 6,
                fontSize: 12,
                background: 'white',
                color: '#64748b',
                cursor: 'pointer'
              }}
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #e8ecf0' }}>
              {[
                { key: 'name', label: 'Address' },
                { key: 'stage', label: 'Stage' },
                { key: 'labels', label: 'Labels' },
                { key: 'contractAmount', label: 'Contract Amount' },
                { key: 'office10Pct', label: 'Office 10%' },
                { key: 'netProfit', label: 'Net Profit' },
                { key: 'daysInStage', label: 'Days in Stage' }
              ].map(({ key, label }) => (
                <th
                  key={key}
                  onClick={() => key !== 'labels' && handleSort(key as SortColumn)}
                  style={{
                    padding: '10px 6px',
                    textAlign: 'left',
                    fontSize: 9,
                    fontWeight: 600,
                    color: '#64748b',
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                    cursor: key !== 'labels' ? 'pointer' : 'default',
                    userSelect: 'none'
                  }}
                >
                  {label}
                  {key !== 'labels' && sortColumn === key && (
                    <span style={{ marginLeft: 4 }}>
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedCards.map((card, index) => (
              <tr
                key={card.id}
                style={{
                  borderBottom: '1px solid #f1f5f9',
                  background: index % 2 === 0 ? 'white' : '#fafbfc'
                }}
              >
                {/* Address */}
                <td style={{ padding: '10px 6px', fontSize: 13, fontWeight: 500 }}>
                  {card.name}
                </td>

                {/* Stage */}
                <td style={{ padding: '10px 6px', fontSize: 12 }}>
                  <span style={{
                    background: '#f1f5f9',
                    color: '#00293f',
                    padding: '4px 8px',
                    borderRadius: 4,
                    fontSize: 11,
                    fontWeight: 500
                  }}>
                    {card.stage}
                  </span>
                </td>

                {/* Labels */}
                <td style={{ padding: '10px 6px' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {card.labels.slice(0, 3).map(label => (
                      <span
                        key={label.id}
                        style={{
                          background: label.color ? `#${label.color}` : '#64748b',
                          color: 'white',
                          padding: '2px 6px',
                          borderRadius: 3,
                          fontSize: 10,
                          fontWeight: 500
                        }}
                      >
                        {label.name}
                      </span>
                    ))}
                    {card.labels.length > 3 && (
                      <span style={{
                        color: '#64748b',
                        fontSize: 10,
                        padding: '2px 4px'
                      }}>
                        +{card.labels.length - 3}
                      </span>
                    )}
                  </div>
                </td>

                {/* Contract Amount */}
                <td style={{ 
                  padding: '10px 6px', 
                  fontSize: 13, 
                  fontWeight: 600,
                  color: '#00293f'
                }}>
                  {formatCurrency(card.contractAmount)}
                </td>

                {/* Office 10% */}
                <td style={{ 
                  padding: '10px 6px', 
                  fontSize: 13,
                  color: '#64748b'
                }}>
                  {formatCurrency(card.office10Pct)}
                </td>

                {/* Net Profit */}
                <td style={{ 
                  padding: '10px 6px', 
                  fontSize: 13, 
                  fontWeight: 600,
                  color: card.netProfit >= 0 ? '#059669' : '#B1000F'
                }}>
                  {formatCurrency(card.netProfit)}
                </td>

                {/* Days in Stage */}
                <td style={{ 
                  padding: '10px 6px', 
                  fontSize: 13, 
                  fontWeight: 600,
                  color: getDaysColor(card.daysInStage)
                }}>
                  {card.daysInStage}
                </td>
              </tr>
            ))}
          </tbody>

          {/* Totals Row */}
          <tfoot>
            <tr style={{
              borderTop: '2px solid #e8ecf0',
              background: '#f8f9fa',
              fontWeight: 600
            }}>
              <td colSpan={3} style={{ 
                padding: '12px 6px', 
                fontSize: 13, 
                color: '#00293f' 
              }}>
                Total ({filteredCards.length} leads)
              </td>
              <td style={{ 
                padding: '12px 6px', 
                fontSize: 13, 
                color: '#00293f' 
              }}>
                {formatCurrency(totalContractAmount)}
              </td>
              <td style={{ 
                padding: '12px 6px', 
                fontSize: 13, 
                color: '#64748b' 
              }}>
                —
              </td>
              <td style={{ 
                padding: '12px 6px', 
                fontSize: 13, 
                color: totalNetProfit >= 0 ? '#059669' : '#B1000F'
              }}>
                {formatCurrency(totalNetProfit)}
              </td>
              <td style={{ 
                padding: '12px 6px', 
                fontSize: 13, 
                color: '#64748b' 
              }}>
                —
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {sortedCards.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '32px 16px',
          color: '#64748b',
          fontSize: 14
        }}>
          No leads match the current filters
        </div>
      )}
    </div>
  );
};