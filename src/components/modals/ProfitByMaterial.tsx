import React from 'react';
import { formatCurrency } from '@/lib/utils';
import { COLORS, TYPOGRAPHY, SPACING } from '@/styles/constants';

interface MaterialProfit {
  material: string;
  leads: number;
  revenue: number;
  profit: number;
  margin: number;
}

interface ProfitByMaterialProps {
  data: MaterialProfit[];
}

export const ProfitByMaterialContent: React.FC<ProfitByMaterialProps> = ({ data }) => {
  const totalRevenue = data.reduce((s, d) => s + d.revenue, 0);
  const totalProfit = data.reduce((s, d) => s + d.profit, 0);
  const totalLeads = data.reduce((s, d) => s + d.leads, 0);
  const avgMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

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
            Total Profit
          </div>
          <div style={{ 
            fontSize: TYPOGRAPHY.fontSize['3xl'], 
            fontWeight: TYPOGRAPHY.fontWeight.bold,
            color: COLORS.success 
          }}>
            {formatCurrency(totalProfit)}
          </div>
        </div>

        <div style={{ 
          background: '#eff6ff', 
          padding: SPACING[5], 
          borderRadius: SPACING[2], 
          textAlign: 'center' 
        }}>
          <div style={{ 
            fontSize: TYPOGRAPHY.fontSize.xs, 
            fontWeight: TYPOGRAPHY.fontWeight.semibold,
            color: COLORS.info, 
            marginBottom: SPACING[2],
            textTransform: 'uppercase',
            letterSpacing: TYPOGRAPHY.letterSpacing.widest
          }}>
            Avg Margin
          </div>
          <div style={{ 
            fontSize: TYPOGRAPHY.fontSize['3xl'], 
            fontWeight: TYPOGRAPHY.fontWeight.bold,
            color: COLORS.info 
          }}>
            {avgMargin.toFixed(1)}%
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
            Total Leads
          </div>
          <div style={{ 
            fontSize: TYPOGRAPHY.fontSize['3xl'], 
            fontWeight: TYPOGRAPHY.fontWeight.bold,
            color: COLORS.navy 
          }}>
            {totalLeads}
          </div>
        </div>
      </div>

      <div>
        <h4 style={{ 
          fontSize: TYPOGRAPHY.fontSize.lg, 
          fontWeight: TYPOGRAPHY.fontWeight.semibold,
          color: COLORS.navy, 
          marginBottom: SPACING[4],
          textTransform: 'uppercase',
          letterSpacing: TYPOGRAPHY.letterSpacing.wide
        }}>
          Profit by Material Type
        </h4>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: SPACING[3] }}>
          {data.map((material, index) => {
            const maxRevenue = Math.max(...data.map(m => m.revenue));
            const barWidth = maxRevenue > 0 ? (material.revenue / maxRevenue) * 100 : 0;
            
            return (
              <div key={material.material} style={{ position: 'relative' }}>
                {/* Background bar */}
                <div style={{
                  background: COLORS.gray100,
                  borderRadius: SPACING[1],
                  height: '48px',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  {/* Profit bar */}
                  <div style={{
                    background: COLORS.success,
                    height: '100%',
                    width: `${barWidth}%`,
                    borderRadius: SPACING[1],
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
                    padding: `0 ${SPACING[4]}`,
                    color: barWidth > 30 ? COLORS.white : COLORS.navy,
                    fontSize: TYPOGRAPHY.fontSize.md,
                    fontWeight: TYPOGRAPHY.fontWeight.semibold
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: SPACING[2] }}>
                      <span>{material.material}</span>
                      <span style={{
                        background: barWidth > 30 ? 'rgba(255,255,255,0.2)' : 'rgba(0,41,63,0.1)',
                        padding: `2px ${SPACING[1]}`,
                        borderRadius: SPACING[1],
                        fontSize: TYPOGRAPHY.fontSize.xs,
                        fontWeight: TYPOGRAPHY.fontWeight.medium
                      }}>
                        {material.leads} leads
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: SPACING[3] }}>
                      <span style={{ fontSize: TYPOGRAPHY.fontSize.sm }}>
                        {material.margin.toFixed(1)}% margin
                      </span>
                      <span style={{ fontWeight: TYPOGRAPHY.fontWeight.bold }}>
                        {formatCurrency(material.profit)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};