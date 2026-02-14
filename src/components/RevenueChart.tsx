import React from 'react';

interface MonthlyData {
  month: string;
  revenue: number;
  jobs: number;
}

interface RevenueChartProps {
  data: MonthlyData[];
}

export const RevenueChart: React.FC<RevenueChartProps> = ({ data }) => {
  const maxRevenue = data.length > 0 ? Math.max(...data.map((d) => d.revenue), 1) : 1;

  if (data.length === 0) {
    return (
      <div
        style={{
          background: 'white',
          borderRadius: 10,
          padding: 18,
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          border: '1px solid #e8ecf0',
        }}
      >
        <h3 style={{ fontSize: 12, fontWeight: 600, color: '#00293f', margin: '0 0 16px', textTransform: 'uppercase', letterSpacing: 0.3 }}>
          Monthly Revenue
        </h3>
        <div style={{ textAlign: 'center', padding: 32, color: '#64748b', fontSize: 14 }}>
          No revenue data yet
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      background: 'white', 
      borderRadius: 10, 
      padding: 18, 
      boxShadow: '0 1px 3px rgba(0,0,0,0.06)', 
      border: '1px solid #e8ecf0' 
    }}>
      <h3 style={{ 
        fontSize: 12, 
        fontWeight: 600, 
        color: '#00293f', 
        margin: '0 0 16px', 
        textTransform: 'uppercase', 
        letterSpacing: 0.3 
      }}>
        Monthly Revenue
      </h3>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 120 }}>
        {data.map((item, idx) => (
          <div
            key={`${item.month}-${idx}`}
            style={{ 
              flex: 1, 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              gap: 4 
            }}
          >
            <span style={{ fontSize: 10, fontWeight: 600, color: '#00293f' }}>
              {Math.round(item.revenue / 1000)}k
            </span>
            <div style={{ 
              width: '100%', 
              background: idx === data.length - 1 ? '#B1000F' : '#00293f', 
              borderRadius: '3px 3px 0 0', 
              height: `${maxRevenue > 0 ? (item.revenue / maxRevenue) * 85 : 0}px`, 
              opacity: idx === data.length - 1 ? 1 : 0.6 + (idx * 0.06) 
            }} />
            <span style={{ fontSize: 10, color: '#64748b' }}>{item.month}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
