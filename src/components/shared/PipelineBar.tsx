'use client';

import React from 'react';
import { CARD_STYLES, COLORS, TYPOGRAPHY, SPACING } from '@/styles/constants';

export interface PipelineSegment {
  key: string;
  label: string;
  count: number;
  value?: number;
  color: string;
}

interface PipelineBarProps {
  title: string;
  segments: PipelineSegment[];
  showValues?: boolean;
  formatValue?: (value: number) => string;
}

export const PipelineBar: React.FC<PipelineBarProps> = ({ 
  title, 
  segments, 
  showValues = false,
  formatValue = (value) => value.toString()
}) => {
  const totalCount = segments.reduce((sum, segment) => sum + segment.count, 0);
  
  return (
    <div style={CARD_STYLES.base}>
      <h3 style={{
        fontSize: TYPOGRAPHY.fontSize.base,
        fontWeight: TYPOGRAPHY.fontWeight.semibold,
        color: COLORS.navy,
        margin: `0 0 ${SPACING[3]}`,
        textTransform: 'uppercase',
        letterSpacing: TYPOGRAPHY.letterSpacing.widest
      }}>
        {title}
      </h3>
      
      {/* Progress Bar */}
      <div style={{
        display: 'flex',
        height: '8px',
        borderRadius: SPACING[1],
        overflow: 'hidden',
        marginBottom: SPACING[3],
        background: COLORS.gray100
      }}>
        {segments.map(segment => (
          <div
            key={segment.key}
            style={{
              width: totalCount > 0 ? `${(segment.count / totalCount) * 100}%` : '0%',
              background: segment.color,
              transition: 'width 0.3s ease'
            }}
          />
        ))}
      </div>
      
      {/* Legend */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: SPACING[2]
      }}>
        {segments.map(segment => (
          <div key={segment.key} style={{ 
            textAlign: 'center',
            flex: '1',
            minWidth: '60px'
          }}>
            {/* Color dot */}
            <div style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: segment.color,
              margin: `0 auto ${SPACING[1]}`
            }} />
            
            {/* Count */}
            <p style={{
              fontSize: TYPOGRAPHY.fontSize['2xl'],
              fontWeight: TYPOGRAPHY.fontWeight.bold,
              color: COLORS.navy,
              margin: 0,
              lineHeight: TYPOGRAPHY.lineHeight.tight
            }}>
              {segment.count}
            </p>
            
            {/* Value (if provided and showValues is true) */}
            {showValues && segment.value !== undefined && (
              <p style={{
                fontSize: TYPOGRAPHY.fontSize.xs,
                color: COLORS.gray500,
                margin: `2px 0 0`,
                lineHeight: TYPOGRAPHY.lineHeight.tight
              }}>
                {formatValue(segment.value)}
              </p>
            )}
            
            {/* Label */}
            <p style={{
              fontSize: TYPOGRAPHY.fontSize.xs,
              color: COLORS.gray500,
              margin: `2px 0 0`,
              textTransform: 'uppercase',
              letterSpacing: TYPOGRAPHY.letterSpacing.wide,
              lineHeight: TYPOGRAPHY.lineHeight.tight
            }}>
              {segment.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};