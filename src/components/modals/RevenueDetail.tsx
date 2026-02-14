import React from 'react';
import { formatCurrency } from '@/lib/utils';

interface RevenueData {
  month: string;
  year?: number;
  revenue: number;
  jobs: number;
  replacements: number;
  repairs: number;
  inspections: number;
  gutters: number;
}

interface RevenueDetailContentProps {
  data: RevenueData[];
}

export const RevenueDetailContent: React.FC<RevenueDetailContentProps> = ({ data }) => {
  const summaryItems = [
    { label: 'Total Revenue', value: data.reduce((s, d) => s + d.revenue, 0), color: '#00293f' },
    { label: 'From Replacements', value: data.reduce((s, d) => s + d.replacements, 0), color: '#00293f' },
    { label: 'From Repairs', value: data.reduce((s, d) => s + d.repairs, 0), color: '#B1000F' },
    { label: 'Other Services', value: data.reduce((s, d) => s + d.inspections + d.gutters, 0), color: '#64748b' },
  ];

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {summaryItems.map(item => (
          <div 
            key={item.label} 
            style={{ 
              background: '#f8fafc', 
              padding: 16, 
              borderRadius: 10, 
              borderLeft: `4px solid ${item.color}` 
            }}
          >
            <p style={{ 
              margin: 0, 
              fontSize: 11, 
              color: '#64748b', 
              textTransform: 'uppercase', 
              fontWeight: 600 
            }}>
              {item.label}
            </p>
            <p style={{ margin: '8px 0 0', fontSize: 22, fontWeight: 700, color: '#00293f' }}>
              {formatCurrency(item.value)}
            </p>
          </div>
        ))}
      </div>
      <h3 style={{ 
        fontSize: 13, 
        fontWeight: 600, 
        color: '#00293f', 
        margin: '0 0 12px', 
        textTransform: 'uppercase' 
      }}>
        Monthly Breakdown
      </h3>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ background: '#f8fafc' }}>
            {['Month', 'Jobs', 'Replacements', 'Repairs', 'Inspections', 'Gutters', 'Total'].map(h => (
              <th 
                key={h} 
                style={{ 
                  padding: 10, 
                  textAlign: h === 'Month' ? 'left' : 'right', 
                  fontSize: 10, 
                  fontWeight: 600, 
                  color: '#64748b', 
                  textTransform: 'uppercase', 
                  borderBottom: '2px solid #e8ecf0' 
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={row.month} style={{ background: idx % 2 === 0 ? 'white' : '#fafbfc' }}>
              <td style={{ padding: 10, fontWeight: 600, color: '#00293f' }}>
                {row.month} {row.year ?? new Date().getFullYear()}
              </td>
              <td style={{ padding: 10, textAlign: 'right', color: '#64748b' }}>{row.jobs}</td>
              <td style={{ padding: 10, textAlign: 'right', color: '#334155' }}>{formatCurrency(row.replacements)}</td>
              <td style={{ padding: 10, textAlign: 'right', color: '#334155' }}>{formatCurrency(row.repairs)}</td>
              <td style={{ padding: 10, textAlign: 'right', color: '#334155' }}>{formatCurrency(row.inspections)}</td>
              <td style={{ padding: 10, textAlign: 'right', color: '#334155' }}>{formatCurrency(row.gutters)}</td>
              <td style={{ padding: 10, textAlign: 'right', fontWeight: 700, color: '#00293f' }}>{formatCurrency(row.revenue)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr style={{ background: '#00293f' }}>
            <td style={{ padding: 10, fontWeight: 700, color: 'white' }}>TOTAL</td>
            <td style={{ padding: 10, textAlign: 'right', color: '#94a3b8' }}>{data.reduce((s, d) => s + d.jobs, 0)}</td>
            <td style={{ padding: 10, textAlign: 'right', color: 'white' }}>{formatCurrency(data.reduce((s, d) => s + d.replacements, 0))}</td>
            <td style={{ padding: 10, textAlign: 'right', color: 'white' }}>{formatCurrency(data.reduce((s, d) => s + d.repairs, 0))}</td>
            <td style={{ padding: 10, textAlign: 'right', color: 'white' }}>{formatCurrency(data.reduce((s, d) => s + d.inspections, 0))}</td>
            <td style={{ padding: 10, textAlign: 'right', color: 'white' }}>{formatCurrency(data.reduce((s, d) => s + d.gutters, 0))}</td>
            <td style={{ padding: 10, textAlign: 'right', fontWeight: 700, color: '#B1000F', fontSize: 15 }}>{formatCurrency(data.reduce((s, d) => s + d.revenue, 0))}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};
