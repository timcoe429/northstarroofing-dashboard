'use client';

import React from 'react';
import { formatCurrency, parseCustomFields, sumContractAmounts } from '@/utils/trello-helpers';
import type { TrelloCard, TrelloCustomField } from '@/types';

interface MaterialData {
  label: string;
  count: number;
  totalValue: number;
  cards: TrelloCard[];
  color: string;
}

interface MaterialBreakdownProps {
  cards: TrelloCard[];
  customFields: TrelloCustomField[];
}

// Material type labels with colors (excluding job-type/status labels)
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

export const MaterialBreakdown: React.FC<MaterialBreakdownProps> = ({ 
  cards, 
  customFields 
}) => {
  // Group cards by material labels
  const materialData: MaterialData[] = MATERIAL_TYPES.map(materialType => {
    const materialCards = cards.filter(card => 
      Array.isArray(card.labels) && card.labels.some(cardLabel => cardLabel.name === materialType.label)
    );
    
    const totalValue = sumContractAmounts(materialCards, customFields);
    
    return {
      label: materialType.label,
      count: materialCards.length,
      totalValue,
      cards: materialCards,
      color: materialType.color
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

      {materialData.map(material => {
        const barWidth = (material.totalValue / maxValue) * 100;
        
        return (
          <div key={material.label} style={{ marginBottom: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
              <span style={{ fontSize: 12, color: '#334155' }}>{material.label}</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#00293f' }}>
                {material.count} • {formatCurrency(material.totalValue)}
              </span>
            </div>
            <div style={{ height: 5, background: '#f1f5f9', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ 
                height: '100%', 
                width: `${barWidth}%`, 
                background: material.color, 
                borderRadius: 2 
              }} />
            </div>
          </div>
        );
      })}
    </div>
  );
};