import React from 'react';
import { formatCurrency } from '@/lib/utils';
import { COLORS, TYPOGRAPHY, SPACING } from '@/styles/constants';

interface EstimateItem {
  id: string;
  address: string;
  stage: 'Estimate Sent' | 'Follow-Up';
  value: number;
  daysInStage: number;
  material: string;
}

interface EstimatesDetailProps {
  data: EstimateItem[];
}

export const EstimatesDetailContent: React.FC<EstimatesDetailProps> = ({ data }) => {
  const estimatesSent = data.filter(item => item.stage === 'Estimate Sent');
  const followUps = data.filter(item => item.stage === 'Follow-Up');
  const totalValue = data.reduce((s, d) => s + d.value, 0);
  const avgDays = data.length > 0 ? data.reduce((s, d) => s + d.daysInStage, 0) / data.length : 0;

  return (
    <div>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(4, 1fr)', 
        gap: SPACING.gridGap, 
        marginBottom: SPACING[6] 
      }}>
        <div style={{ 
          background: COLORS.gray50, 
          padding: SPACING[5], 
          borderRadius: SPACING[2], 
          textAlign: 'center' 
        }}>
          <div style={{ 
            fontSize: TYPOGRAPHY.fontSize.xs, 
            fontWeight: TYPOGRAPHY.fontWeight.semibold,
            color: COLORS.gray500, 
            marginBottom: SPACING[2],
            textTransform: 'uppercase',
            letterSpacing: TYPOGRAPHY.letterSpacing.widest
          }}>
            Total Estimates
          </div>
          <div style={{ 
            fontSize: TYPOGRAPHY.fontSize['3xl'], 
            fontWeight: TYPOGRAPHY.fontWeight.bold,
            color: COLORS.navy 
          }}>
            {data.length}
          </div>
        </div>

        <div style={{ 
          background: '#fef3c7', 
          padding: SPACING[5], 
          borderRadius: SPACING[2], 
          textAlign: 'center' 
        }}>
          <div style={{ 
            fontSize: TYPOGRAPHY.fontSize.xs, 
            fontWeight: TYPOGRAPHY.fontWeight.semibold,
            color: '#92400e', 
            marginBottom: SPACING[2],
            textTransform: 'uppercase',
            letterSpacing: TYPOGRAPHY.letterSpacing.widest
          }}>
            Estimates Sent
          </div>
          <div style={{ 
            fontSize: TYPOGRAPHY.fontSize['3xl'], 
            fontWeight: TYPOGRAPHY.fontWeight.bold,
            color: '#92400e' 
          }}>
            {estimatesSent.length}
          </div>
        </div>

        <div style={{ 
          background: '#dbeafe', 
          padding: SPACING[5], 
          borderRadius: SPACING[2], 
          textAlign: 'center' 
        }}>
          <div style={{ 
            fontSize: TYPOGRAPHY.fontSize.xs, 
            fontWeight: TYPOGRAPHY.fontWeight.semibold,
            color: '#1e40af', 
            marginBottom: SPACING[2],
            textTransform: 'uppercase',
            letterSpacing: TYPOGRAPHY.letterSpacing.widest
          }}>
            Follow-Ups
          </div>
          <div style={{ 
            fontSize: TYPOGRAPHY.fontSize['3xl'], 
            fontWeight: TYPOGRAPHY.fontWeight.bold,
            color: '#1e40af' 
          }}>
            {followUps.length}
          </div>
        </div>

        <div style={{ 
          background: '#f0fdf4', 
          padding: SPACING[5], 
          borderRadius: SPACING[2], 
          textAlign: 'center' 
        }}>
          <div style={{ 
            fontSize: TYPOGRAPHY.fontSize.xs, 
            fontWeight: TYPOGRAPHY.fontWeight.semibold,
            color: COLORS.success, 
            marginBottom: SPACING[2],
            textTransform: 'uppercase',
            letterSpacing: TYPOGRAPHY.letterSpacing.widest
          }}>
            Total Value
          </div>
          <div style={{ 
            fontSize: TYPOGRAPHY.fontSize['3xl'], 
            fontWeight: TYPOGRAPHY.fontWeight.bold,
            color: COLORS.success 
          }}>
            {formatCurrency(totalValue)}
          </div>
        </div>
      </div>

      {/* Estimates Sent Section */}
      {estimatesSent.length > 0 && (
        <div style={{ marginBottom: SPACING[6] }}>
          <h4 style={{ 
            fontSize: TYPOGRAPHY.fontSize.lg, 
            fontWeight: TYPOGRAPHY.fontWeight.semibold,
            color: COLORS.navy, 
            marginBottom: SPACING[4],
            textTransform: 'uppercase',
            letterSpacing: TYPOGRAPHY.letterSpacing.wide
          }}>
            Estimates Sent ({estimatesSent.length})
          </h4>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(2, 1fr)', 
            gap: SPACING[3] 
          }}>
            {estimatesSent.map(item => (
              <div 
                key={item.id}
                style={{
                  background: COLORS.white,
                  border: `1px solid ${COLORS.gray200}`,
                  borderRadius: SPACING[2],
                  padding: SPACING[4]
                }}
              >
                <div style={{ 
                  fontWeight: TYPOGRAPHY.fontWeight.semibold,
                  color: COLORS.navy, 
                  marginBottom: SPACING[1],
                  fontSize: TYPOGRAPHY.fontSize.md
                }}>
                  {item.address}
                </div>
                <div style={{ 
                  color: COLORS.gray500, 
                  fontSize: TYPOGRAPHY.fontSize.sm,
                  marginBottom: SPACING[2]
                }}>
                  {item.material}
                </div>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center' 
                }}>
                  <span style={{ 
                    fontWeight: TYPOGRAPHY.fontWeight.semibold,
                    color: COLORS.success 
                  }}>
                    {formatCurrency(item.value)}
                  </span>
                  <span style={{ 
                    color: item.daysInStage >= 7 ? COLORS.red : item.daysInStage >= 5 ? '#92400e' : COLORS.gray500,
                    fontSize: TYPOGRAPHY.fontSize.sm,
                    fontWeight: TYPOGRAPHY.fontWeight.medium
                  }}>
                    {item.daysInStage} days
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Follow-Up Section */}
      {followUps.length > 0 && (
        <div>
          <h4 style={{ 
            fontSize: TYPOGRAPHY.fontSize.lg, 
            fontWeight: TYPOGRAPHY.fontWeight.semibold,
            color: COLORS.navy, 
            marginBottom: SPACING[4],
            textTransform: 'uppercase',
            letterSpacing: TYPOGRAPHY.letterSpacing.wide
          }}>
            Follow-Up Required ({followUps.length})
          </h4>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(2, 1fr)', 
            gap: SPACING[3] 
          }}>
            {followUps.map(item => (
              <div 
                key={item.id}
                style={{
                  background: COLORS.white,
                  border: `1px solid ${COLORS.gray200}`,
                  borderRadius: SPACING[2],
                  padding: SPACING[4]
                }}
              >
                <div style={{ 
                  fontWeight: TYPOGRAPHY.fontWeight.semibold,
                  color: COLORS.navy, 
                  marginBottom: SPACING[1],
                  fontSize: TYPOGRAPHY.fontSize.md
                }}>
                  {item.address}
                </div>
                <div style={{ 
                  color: COLORS.gray500, 
                  fontSize: TYPOGRAPHY.fontSize.sm,
                  marginBottom: SPACING[2]
                }}>
                  {item.material}
                </div>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center' 
                }}>
                  <span style={{ 
                    fontWeight: TYPOGRAPHY.fontWeight.semibold,
                    color: COLORS.success 
                  }}>
                    {formatCurrency(item.value)}
                  </span>
                  <span style={{ 
                    color: item.daysInStage >= 7 ? COLORS.red : COLORS.gray500,
                    fontSize: TYPOGRAPHY.fontSize.sm,
                    fontWeight: TYPOGRAPHY.fontWeight.medium
                  }}>
                    {item.daysInStage} days
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: `${SPACING[8]} ${SPACING[4]}`,
          color: COLORS.gray500,
          fontSize: TYPOGRAPHY.fontSize.lg
        }}>
          No estimates currently out
        </div>
      )}
    </div>
  );
};