'use client';

import React from 'react';
import { formatCurrency } from '@/utils/trello-helpers';

interface FunnelStage {
  name: string;
  count: number;
  value: number;
  isWon?: boolean;
}

interface PipelineFunnelProps {
  stages: FunnelStage[];
  lostCount?: number;
  lostValue?: number;
}

export const PipelineFunnel: React.FC<PipelineFunnelProps> = ({ 
  stages, 
  lostCount = 0, 
  lostValue = 0 
}) => {
  // Find max count for proportional sizing
  const maxCount = Math.max(...stages.map(s => s.count));
  
  return (
    <div>
      {/* Main Funnel */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 8,
        marginBottom: 16,
        overflowX: 'auto',
        paddingBottom: 8
      }}>
        {stages.map((stage, index) => {
          const isLast = index === stages.length - 1;
          const isWon = stage.isWon;
          
          // Calculate width based on count (minimum 80px, maximum 200px)
          const widthRatio = maxCount > 0 ? stage.count / maxCount : 0;
          const width = Math.max(80, Math.min(200, 80 + (widthRatio * 120)));
          
          // Color scheme
          const baseColor = isWon ? '#059669' : '#00293f';
          const opacity = isWon ? 1 : 0.7 + (index * 0.05); // Gradually lighter for pipeline stages
          
          return (
            <React.Fragment key={stage.name}>
              {/* Stage Block */}
              <div style={{
                background: `${baseColor}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`,
                color: 'white',
                padding: '12px 16px',
                borderRadius: 8,
                minWidth: width,
                textAlign: 'center',
                position: 'relative'
              }}>
                <div style={{ 
                  fontSize: 11, 
                  fontWeight: 600, 
                  marginBottom: 4,
                  textTransform: 'uppercase',
                  letterSpacing: 0.3
                }}>
                  {stage.name}
                </div>
                <div style={{ 
                  fontSize: 18, 
                  fontWeight: 700, 
                  marginBottom: 2 
                }}>
                  {stage.count}
                </div>
                <div style={{ 
                  fontSize: 10, 
                  opacity: 0.9 
                }}>
                  {formatCurrency(stage.value)}
                </div>
              </div>
              
              {/* Arrow */}
              {!isLast && (
                <div style={{
                  width: 0,
                  height: 0,
                  borderTop: '12px solid transparent',
                  borderBottom: '12px solid transparent',
                  borderLeft: '12px solid #64748b',
                  opacity: 0.3
                }} />
              )}
            </React.Fragment>
          );
        })}
      </div>
      
      {/* Lost/Dead Indicator */}
      {(lostCount > 0 || lostValue > 0) && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginTop: 12,
          paddingTop: 12,
          borderTop: '1px solid #e8ecf0'
        }}>
          <div style={{
            background: '#f1f5f9',
            color: '#64748b',
            padding: '8px 12px',
            borderRadius: 6,
            fontSize: 11,
            fontWeight: 600,
            border: '1px solid #e8ecf0'
          }}>
            Lost/Dead: {lostCount} leads • {formatCurrency(lostValue)}
          </div>
        </div>
      )}
    </div>
  );
};