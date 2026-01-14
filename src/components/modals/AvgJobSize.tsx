import React from 'react';
import { formatCurrency } from '@/lib/utils';

interface AvgJobByType {
  type: string;
  avgSize: number;
  count: number;
  total: number;
}

interface AvgJobTrend {
  period: string;
  avgSize: number;
}

interface AvgJobDetails {
  byType: AvgJobByType[];
  trend: AvgJobTrend[];
}

interface AvgJobSizeContentProps {
  data: AvgJobDetails;
}

export const AvgJobSizeContent: React.FC<AvgJobSizeContentProps> = ({ data }) => {
  const maxAvg = Math.max(...data.byType.map(d => d.avgSize));
  const colors = ['#00293f', '#B1000F', '#64748b', '#94a3b8'];
  
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 20 }}>
        <div style={{ 
          background: '#f8fafc', 
          padding: 18, 
          borderRadius: 10, 
          textAlign: 'center', 
          borderLeft: '4px solid #00293f' 
        }}>
          <p style={{ margin: 0, fontSize: 11, color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>
            Overall Average
          </p>
          <p style={{ margin: '8px 0 0', fontSize: 28, fontWeight: 700, color: '#00293f' }}>
            {formatCurrency(18032)}
          </p>
        </div>
        <div style={{ background: '#f8fafc', padding: 18, borderRadius: 10, textAlign: 'center' }}>
          <p style={{ margin: 0, fontSize: 11, color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>
            Total Jobs
          </p>
          <p style={{ margin: '8px 0 0', fontSize: 28, fontWeight: 700, color: '#00293f' }}>
            {data.byType.reduce((s, d) => s + d.count, 0)}
          </p>
        </div>
        <div style={{ background: '#f0fdf4', padding: 18, borderRadius: 10, textAlign: 'center' }}>
          <p style={{ margin: 0, fontSize: 11, color: '#059669', textTransform: 'uppercase', fontWeight: 600 }}>
            YoY Growth
          </p>
          <p style={{ margin: '8px 0 0', fontSize: 28, fontWeight: 700, color: '#059669' }}>+12%</p>
        </div>
      </div>
      
      <h3 style={{ fontSize: 12, fontWeight: 600, color: '#00293f', margin: '0 0 12px', textTransform: 'uppercase' }}>
        Average by Job Type
      </h3>
      
      {data.byType.map((item, idx) => (
        <div 
          key={item.type} 
          style={{ 
            display: 'grid', 
            gridTemplateColumns: '120px 1fr 100px', 
            alignItems: 'center', 
            gap: 14, 
            marginBottom: 14 
          }}
        >
          <div>
            <p style={{ margin: 0, fontWeight: 600, color: '#00293f', fontSize: 13 }}>{item.type}</p>
            <p style={{ margin: '2px 0 0', fontSize: 11, color: '#64748b' }}>{item.count} jobs</p>
          </div>
          <div style={{ height: 28, background: '#f1f5f9', borderRadius: 5, overflow: 'hidden' }}>
            <div style={{ 
              height: '100%', 
              width: `${(item.avgSize / maxAvg) * 100}%`, 
              background: colors[idx], 
              borderRadius: 5, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'flex-end', 
              paddingRight: 10 
            }}>
              {item.avgSize / maxAvg > 0.3 && (
                <span style={{ color: 'white', fontSize: 12, fontWeight: 600 }}>
                  {formatCurrency(item.avgSize)}
                </span>
              )}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ margin: 0, fontSize: 10, color: '#64748b' }}>Total</p>
            <p style={{ margin: 0, fontWeight: 600, color: '#00293f', fontSize: 13 }}>
              {formatCurrency(item.total)}
            </p>
          </div>
        </div>
      ))}
      
      <h3 style={{ fontSize: 12, fontWeight: 600, color: '#00293f', margin: '28px 0 12px', textTransform: 'uppercase' }}>
        Quarterly Trend
      </h3>
      
      <div style={{ display: 'flex', gap: 10 }}>
        {data.trend.map((item, idx) => (
          <div 
            key={item.period} 
            style={{ 
              flex: 1, 
              background: idx === data.trend.length - 1 ? '#00293f' : '#f8fafc', 
              padding: 16, 
              borderRadius: 8, 
              textAlign: 'center' 
            }}
          >
            <p style={{ 
              margin: 0, 
              fontSize: 10, 
              color: idx === data.trend.length - 1 ? '#94a3b8' : '#64748b', 
              textTransform: 'uppercase' 
            }}>
              {item.period}
            </p>
            <p style={{ 
              margin: '6px 0 0', 
              fontSize: 20, 
              fontWeight: 700, 
              color: idx === data.trend.length - 1 ? 'white' : '#00293f' 
            }}>
              {formatCurrency(item.avgSize)}
            </p>
            {idx > 0 && (
              <p style={{ margin: '3px 0 0', fontSize: 11, color: '#059669' }}>
                +{Math.round(((item.avgSize - data.trend[idx - 1].avgSize) / data.trend[idx - 1].avgSize) * 100)}%
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
