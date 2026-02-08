'use client';

import React from 'react';
import { formatCurrency, parseCustomFields, sumContractAmounts } from '@/utils/trello-helpers';
import type { TrelloCard, TrelloCustomField } from '@/types';

interface MaterialData {
  label: string;
  count: number;
  totalValue: number;
  cards: TrelloCard[];
}

interface MaterialBreakdownProps {
  cards: TrelloCard[];
  customFields: TrelloCustomField[];
}

// Material type labels only (excluding job-type/status labels)
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

export const MaterialBreakdown: React.FC<MaterialBreakdownProps> = ({ 
  cards, 
  customFields 
}) => {
  // Group cards by material labels
  const materialData: MaterialData[] = MATERIAL_LABELS.map(label => {
    const materialCards = cards.filter(card => 
      card.labels.some(cardLabel => cardLabel.name === label)
    );
    
    const totalValue = sumContractAmounts(materialCards, customFields);
    
    return {
      label,
      count: materialCards.length,
      totalValue,
      cards: materialCards
    };
  }).filter(material => material.count > 0) // Only show materials with cards
    .sort((a, b) => b.totalValue - a.totalValue); // Sort by total value descending

  // Calculate max value for bar sizing
  const maxValue = Math.max(...materialData.map(m => m.totalValue), 1);

  if (materialData.length === 0) {
    return (
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
          Pipeline by Material Type
        </h3>
        <div style={{
          textAlign: 'center',
          padding: '32px 16px',
          color: '#64748b',
          fontSize: 14
        }}>
          No material labels found on pipeline cards
        </div>
      </div>
    );
  }

  return (
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
        Pipeline by Material Type
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {materialData.map((material, index) => {
          const barWidth = (material.totalValue / maxValue) * 100;
          
          // Color scheme - different shades of navy
          const colors = [
            '#00293f', '#1e3a5f', '#2d4a7f', '#3c5a9f', 
            '#4b6abf', '#5a7adf', '#698aff', '#789aff'
          ];
          const color = colors[index % colors.length];

          return (
            <div key={material.label} style={{ position: 'relative' }}>
              {/* Background bar */}
              <div style={{
                background: '#f1f5f9',
                borderRadius: 6,
                height: 48,
                position: 'relative',
                overflow: 'hidden'
              }}>
                {/* Value bar */}
                <div style={{
                  background: color,
                  height: '100%',
                  width: `${barWidth}%`,
                  borderRadius: 6,
                  transition: 'width 0.3s ease'
                }} />
                
                {/* Content overlay */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0 16px',
                  color: barWidth > 30 ? 'white' : '#00293f',
                  fontSize: 13,
                  fontWeight: 600
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span>{material.label}</span>
                    <span style={{
                      background: barWidth > 30 ? 'rgba(255,255,255,0.2)' : 'rgba(0,41,63,0.1)',
                      padding: '2px 6px',
                      borderRadius: 4,
                      fontSize: 11,
                      fontWeight: 500
                    }}>
                      {material.count} {material.count === 1 ? 'lead' : 'leads'}
                    </span>
                  </div>
                  <span style={{ fontWeight: 700 }}>
                    {formatCurrency(material.totalValue)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div style={{
        marginTop: 16,
        paddingTop: 16,
        borderTop: '1px solid #e8ecf0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: 12,
        color: '#64748b'
      }}>
        <span>
          {materialData.length} material {materialData.length === 1 ? 'type' : 'types'} • {' '}
          {materialData.reduce((sum, m) => sum + m.count, 0)} total leads
        </span>
        <span style={{ fontWeight: 600, color: '#00293f' }}>
          {formatCurrency(materialData.reduce((sum, m) => sum + m.totalValue, 0))}
        </span>
      </div>
    </div>
  );
};