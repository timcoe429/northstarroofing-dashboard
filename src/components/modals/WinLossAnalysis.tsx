import React from 'react';
import { formatCurrency } from '@/lib/utils';
import { COLORS, TYPOGRAPHY, SPACING } from '@/styles/constants';

interface WinLossData {
  won: {
    count: number;
    value: number;
    materials: Array<{ material: string; count: number; value: number }>;
  };
  lost: {
    count: number;
    value: number;
    materials: Array<{ material: string; count: number; value: number }>;
  };
  conversionRate: number;
}

interface WinLossAnalysisProps {
  data: WinLossData;
}

export const WinLossAnalysisContent: React.FC<WinLossAnalysisProps> = ({ data }) => {
  const totalDecided = data.won.count + data.lost.count;
  const totalValue = data.won.value + data.lost.value;
  const avgWonValue = data.won.count > 0 ? data.won.value / data.won.count : 0;
  const avgLostValue = data.lost.count > 0 ? data.lost.value / data.lost.count : 0;

  return (
    <div>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(3, 1fr)', 
        gap: SPACING.gridGap, 
        marginBottom: SPACING[6] 
      }}>
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
            Conversion Rate
          </div>
          <div style={{ 
            fontSize: TYPOGRAPHY.fontSize['3xl'], 
            fontWeight: TYPOGRAPHY.fontWeight.bold,
            color: COLORS.success 
          }}>
            {data.conversionRate.toFixed(1)}%
          </div>
        </div>

        <div style={{ 
          background: '#fef2f2', 
          padding: SPACING[5], 
          borderRadius: SPACING[2], 
          textAlign: 'center' 
        }}>
          <div style={{ 
            fontSize: TYPOGRAPHY.fontSize.xs, 
            fontWeight: TYPOGRAPHY.fontWeight.semibold,
            color: COLORS.red, 
            marginBottom: SPACING[2],
            textTransform: 'uppercase',
            letterSpacing: TYPOGRAPHY.letterSpacing.widest
          }}>
            Total Decided
          </div>
          <div style={{ 
            fontSize: TYPOGRAPHY.fontSize['3xl'], 
            fontWeight: TYPOGRAPHY.fontWeight.bold,
            color: COLORS.red 
          }}>
            {totalDecided}
          </div>
        </div>

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
            Total Value
          </div>
          <div style={{ 
            fontSize: TYPOGRAPHY.fontSize['3xl'], 
            fontWeight: TYPOGRAPHY.fontWeight.bold,
            color: COLORS.navy 
          }}>
            {formatCurrency(totalValue)}
          </div>
        </div>
      </div>

      {/* Won vs Lost Comparison */}
      <div style={{ marginBottom: SPACING[6] }}>
        <h4 style={{ 
          fontSize: TYPOGRAPHY.fontSize.lg, 
          fontWeight: TYPOGRAPHY.fontWeight.semibold,
          color: COLORS.navy, 
          marginBottom: SPACING[4],
          textTransform: 'uppercase',
          letterSpacing: TYPOGRAPHY.letterSpacing.wide
        }}>
          Won vs Lost Breakdown
        </h4>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: SPACING[4] }}>
          {/* Won Section */}
          <div style={{
            background: '#f0fdf4',
            border: `1px solid ${COLORS.success}`,
            borderRadius: SPACING[2],
            padding: SPACING[4]
          }}>
            <h5 style={{
              fontSize: TYPOGRAPHY.fontSize.md,
              fontWeight: TYPOGRAPHY.fontWeight.semibold,
              color: COLORS.success,
              marginBottom: SPACING[3],
              textTransform: 'uppercase',
              letterSpacing: TYPOGRAPHY.letterSpacing.wide
            }}>
              Won Projects ({data.won.count})
            </h5>
            
            <div style={{ marginBottom: SPACING[3] }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                marginBottom: SPACING[1] 
              }}>
                <span style={{ fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.gray600 }}>
                  Total Value:
                </span>
                <span style={{ 
                  fontWeight: TYPOGRAPHY.fontWeight.semibold, 
                  color: COLORS.success 
                }}>
                  {formatCurrency(data.won.value)}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.gray600 }}>
                  Avg Value:
                </span>
                <span style={{ 
                  fontWeight: TYPOGRAPHY.fontWeight.semibold, 
                  color: COLORS.success 
                }}>
                  {formatCurrency(avgWonValue)}
                </span>
              </div>
            </div>

            {data.won.materials.length > 0 && (
              <div>
                <div style={{ 
                  fontSize: TYPOGRAPHY.fontSize.xs,
                  fontWeight: TYPOGRAPHY.fontWeight.semibold,
                  color: COLORS.gray500,
                  marginBottom: SPACING[2],
                  textTransform: 'uppercase',
                  letterSpacing: TYPOGRAPHY.letterSpacing.widest
                }}>
                  By Material:
                </div>
                {data.won.materials.map(material => (
                  <div 
                    key={material.material}
                    style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      fontSize: TYPOGRAPHY.fontSize.sm,
                      marginBottom: SPACING[1]
                    }}
                  >
                    <span>{material.material}</span>
                    <span>{material.count} • {formatCurrency(material.value)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Lost Section */}
          <div style={{
            background: '#fef2f2',
            border: `1px solid ${COLORS.red}`,
            borderRadius: SPACING[2],
            padding: SPACING[4]
          }}>
            <h5 style={{
              fontSize: TYPOGRAPHY.fontSize.md,
              fontWeight: TYPOGRAPHY.fontWeight.semibold,
              color: COLORS.red,
              marginBottom: SPACING[3],
              textTransform: 'uppercase',
              letterSpacing: TYPOGRAPHY.letterSpacing.wide
            }}>
              Lost Projects ({data.lost.count})
            </h5>
            
            <div style={{ marginBottom: SPACING[3] }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                marginBottom: SPACING[1] 
              }}>
                <span style={{ fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.gray600 }}>
                  Total Value:
                </span>
                <span style={{ 
                  fontWeight: TYPOGRAPHY.fontWeight.semibold, 
                  color: COLORS.red 
                }}>
                  {formatCurrency(data.lost.value)}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.gray600 }}>
                  Avg Value:
                </span>
                <span style={{ 
                  fontWeight: TYPOGRAPHY.fontWeight.semibold, 
                  color: COLORS.red 
                }}>
                  {formatCurrency(avgLostValue)}
                </span>
              </div>
            </div>

            {data.lost.materials.length > 0 && (
              <div>
                <div style={{ 
                  fontSize: TYPOGRAPHY.fontSize.xs,
                  fontWeight: TYPOGRAPHY.fontWeight.semibold,
                  color: COLORS.gray500,
                  marginBottom: SPACING[2],
                  textTransform: 'uppercase',
                  letterSpacing: TYPOGRAPHY.letterSpacing.widest
                }}>
                  By Material:
                </div>
                {data.lost.materials.map(material => (
                  <div 
                    key={material.material}
                    style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      fontSize: TYPOGRAPHY.fontSize.sm,
                      marginBottom: SPACING[1]
                    }}
                  >
                    <span>{material.material}</span>
                    <span>{material.count} • {formatCurrency(material.value)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Summary */}
      <div style={{
        background: COLORS.gray50,
        padding: SPACING[4],
        borderRadius: SPACING[2],
        textAlign: 'center'
      }}>
        <div style={{
          fontSize: TYPOGRAPHY.fontSize.md,
          color: COLORS.gray600,
          marginBottom: SPACING[1]
        }}>
          <strong>{data.won.count}</strong> won out of <strong>{totalDecided}</strong> decided leads
        </div>
        <div style={{
          fontSize: TYPOGRAPHY.fontSize.sm,
          color: COLORS.gray500
        }}>
          Won {formatCurrency(data.won.value)} • Lost {formatCurrency(data.lost.value)}
        </div>
      </div>
    </div>
  );
};