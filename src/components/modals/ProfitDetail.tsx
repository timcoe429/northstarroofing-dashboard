import React from 'react';
import { formatCurrency } from '@/lib/utils';

interface ProfitByType {
  type: string;
  revenue: number;
  cost: number;
  profit: number;
  margin: number;
}

interface ProfitDetails {
  byType: ProfitByType[];
  byMonth: Array<{
    month: string;
    revenue: number;
    cost: number;
    profit: number;
  }>;
}

interface ProfitDetailContentProps {
  data: ProfitDetails;
}

export const ProfitDetailContent: React.FC<ProfitDetailContentProps> = ({ data }) => {
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        <div style={{ background: '#f0fdf4', padding: 20, borderRadius: 10, textAlign: 'center' }}>
          <p style={{ margin: 0, fontSize: 11, color: '#059669', textTransform: 'uppercase', fontWeight: 600 }}>
            Gross Profit
          </p>
          <p style={{ margin: '8px 0 0', fontSize: 28, fontWeight: 700, color: '#059669' }}>
            {formatCurrency(data.byType.reduce((s, d) => s + d.profit, 0))}
          </p>
        </div>
        <div style={{ background: '#f8fafc', padding: 20, borderRadius: 10, textAlign: 'center' }}>
          <p style={{ margin: 0, fontSize: 11, color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>
            Total Revenue
          </p>
          <p style={{ margin: '8px 0 0', fontSize: 28, fontWeight: 700, color: '#00293f' }}>
            {formatCurrency(data.byType.reduce((s, d) => s + d.revenue, 0))}
          </p>
        </div>
        <div style={{ background: '#f8fafc', padding: 20, borderRadius: 10, textAlign: 'center' }}>
          <p style={{ margin: 0, fontSize: 11, color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>
            Avg Margin
          </p>
          <p style={{ margin: '8px 0 0', fontSize: 28, fontWeight: 700, color: '#00293f' }}>22%</p>
        </div>
      </div>
      <h3 style={{ 
        fontSize: 13, 
        fontWeight: 600, 
        color: '#00293f', 
        margin: '0 0 12px', 
        textTransform: 'uppercase' 
      }}>
        Profit by Job Type
      </h3>
      {data.byType.map(item => (
        <div 
          key={item.type} 
          style={{ 
            background: '#f8fafc', 
            borderRadius: 10, 
            padding: 14, 
            marginBottom: 10, 
            display: 'grid', 
            gridTemplateColumns: '120px 1fr 90px 70px', 
            alignItems: 'center', 
            gap: 14 
          }}
        >
          <p style={{ margin: 0, fontWeight: 600, color: '#00293f', fontSize: 13 }}>{item.type}</p>
          <div>
            <div style={{ display: 'flex', height: 20, borderRadius: 4, overflow: 'hidden' }}>
              <div style={{ width: `${(item.cost / item.revenue) * 100}%`, background: '#cbd5e1' }} />
              <div style={{ width: `${(item.profit / item.revenue) * 100}%`, background: '#059669' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 3 }}>
              <span style={{ fontSize: 10, color: '#64748b' }}>Cost: {formatCurrency(item.cost)}</span>
              <span style={{ fontSize: 10, color: '#059669' }}>Profit: {formatCurrency(item.profit)}</span>
            </div>
          </div>
          <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#059669', textAlign: 'right' }}>
            {formatCurrency(item.profit)}
          </p>
          <div style={{ 
            background: '#059669', 
            color: 'white', 
            padding: '5px 10px', 
            borderRadius: 16, 
            textAlign: 'center', 
            fontSize: 12, 
            fontWeight: 600 
          }}>
            {item.margin}%
          </div>
        </div>
      ))}
    </div>
  );
};
