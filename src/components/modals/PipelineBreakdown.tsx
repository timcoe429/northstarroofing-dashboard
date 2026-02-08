import React from 'react';
import { formatCurrency } from '@/lib/utils';
import { COLORS, TYPOGRAPHY, SPACING } from '@/styles/constants';

interface StageData {
  stage: string;
  count: number;
  value: number;
  percentage: number;
}

interface PipelineBreakdownProps {
  data: StageData[];
}

export const PipelineBreakdownContent: React.FC<PipelineBreakdownProps> = ({ data }) => {
  const summaryItems = [
    { 
      label: 'Total Pipeline Value', 
      value: data.reduce((s, d) => s + d.value, 0), 
      color: COLORS.navy 
    },
    { 
      label: 'Active Leads', 
      value: data.reduce((s, d) => s + d.count, 0), 
      color: COLORS.navy,
      isCount: true 
    },
    { 
      label: 'Avg Lead Value', 
      value: data.reduce((s, d) => s + d.count, 0) > 0 
        ? data.reduce((s, d) => s + d.value, 0) / data.reduce((s, d) => s + d.count, 0) 
        : 0, 
      color: COLORS.success 
    },
    { 
      label: 'Stages Active', 
      value: data.filter(d => d.count > 0).length, 
      color: COLORS.gray500,
      isCount: true 
    },
  ];

  return (
    <div>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(4, 1fr)', 
        gap: SPACING.gridGap, 
        marginBottom: SPACING[6] 
      }}>
        {summaryItems.map(item => (
          <div 
            key={item.label}
            style={{ 
              background: COLORS.gray50, 
              padding: SPACING[5], 
              borderRadius: SPACING[2], 
              textAlign: 'center' 
            }}
          >
            <div style={{ 
              fontSize: TYPOGRAPHY.fontSize.xs, 
              fontWeight: TYPOGRAPHY.fontWeight.semibold,
              color: COLORS.gray500, 
              marginBottom: SPACING[2],
              textTransform: 'uppercase',
              letterSpacing: TYPOGRAPHY.letterSpacing.widest
            }}>
              {item.label}
            </div>
            <div style={{ 
              fontSize: TYPOGRAPHY.fontSize['3xl'], 
              fontWeight: TYPOGRAPHY.fontWeight.bold,
              color: item.color 
            }}>
              {item.isCount ? item.value : formatCurrency(item.value)}
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginBottom: SPACING[4] }}>
        <h4 style={{ 
          fontSize: TYPOGRAPHY.fontSize.lg, 
          fontWeight: TYPOGRAPHY.fontWeight.semibold,
          color: COLORS.navy, 
          marginBottom: SPACING[4],
          textTransform: 'uppercase',
          letterSpacing: TYPOGRAPHY.letterSpacing.wide
        }}>
          Pipeline by Stage
        </h4>
        
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: `2px solid ${COLORS.gray200}` }}>
              {['Stage', 'Leads', 'Value', 'Avg Value', '% of Pipeline'].map(h => (
                <th 
                  key={h} 
                  style={{ 
                    textAlign: 'left', 
                    padding: `${SPACING[2]} ${SPACING[1]}`, 
                    fontSize: TYPOGRAPHY.fontSize.xs, 
                    fontWeight: TYPOGRAPHY.fontWeight.semibold,
                    color: COLORS.gray500, 
                    textTransform: 'uppercase',
                    letterSpacing: TYPOGRAPHY.letterSpacing.widest
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map(stage => (
              <tr key={stage.stage} style={{ borderBottom: `1px solid ${COLORS.gray100}` }}>
                <td style={{ 
                  padding: `${SPACING[3]} ${SPACING[1]}`, 
                  fontWeight: TYPOGRAPHY.fontWeight.semibold,
                  color: COLORS.navy, 
                  fontSize: TYPOGRAPHY.fontSize.md 
                }}>
                  {stage.stage}
                </td>
                <td style={{ 
                  padding: `${SPACING[3]} ${SPACING[1]}`, 
                  color: COLORS.gray700, 
                  fontSize: TYPOGRAPHY.fontSize.md 
                }}>
                  {stage.count}
                </td>
                <td style={{ 
                  padding: `${SPACING[3]} ${SPACING[1]}`, 
                  fontWeight: TYPOGRAPHY.fontWeight.semibold,
                  color: COLORS.navy, 
                  fontSize: TYPOGRAPHY.fontSize.md 
                }}>
                  {formatCurrency(stage.value)}
                </td>
                <td style={{ 
                  padding: `${SPACING[3]} ${SPACING[1]}`, 
                  color: COLORS.gray700, 
                  fontSize: TYPOGRAPHY.fontSize.md 
                }}>
                  {stage.count > 0 ? formatCurrency(stage.value / stage.count) : '$0'}
                </td>
                <td style={{ 
                  padding: `${SPACING[3]} ${SPACING[1]}`, 
                  color: COLORS.success, 
                  fontWeight: TYPOGRAPHY.fontWeight.semibold,
                  fontSize: TYPOGRAPHY.fontSize.md 
                }}>
                  {stage.percentage.toFixed(1)}%
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={{ 
              borderTop: `2px solid ${COLORS.gray200}`, 
              background: COLORS.gray50,
              fontWeight: TYPOGRAPHY.fontWeight.semibold 
            }}>
              <td style={{ 
                padding: `${SPACING[3]} ${SPACING[1]}`, 
                fontSize: TYPOGRAPHY.fontSize.md,
                color: COLORS.navy 
              }}>
                Total Pipeline
              </td>
              <td style={{ 
                padding: `${SPACING[3]} ${SPACING[1]}`, 
                fontSize: TYPOGRAPHY.fontSize.md,
                color: COLORS.navy 
              }}>
                {data.reduce((s, d) => s + d.count, 0)}
              </td>
              <td style={{ 
                padding: `${SPACING[3]} ${SPACING[1]}`, 
                fontSize: TYPOGRAPHY.fontSize.md,
                color: COLORS.navy 
              }}>
                {formatCurrency(data.reduce((s, d) => s + d.value, 0))}
              </td>
              <td style={{ 
                padding: `${SPACING[3]} ${SPACING[1]}`, 
                fontSize: TYPOGRAPHY.fontSize.md,
                color: COLORS.gray500 
              }}>
                —
              </td>
              <td style={{ 
                padding: `${SPACING[3]} ${SPACING[1]}`, 
                fontSize: TYPOGRAPHY.fontSize.md,
                color: COLORS.success 
              }}>
                100.0%
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};