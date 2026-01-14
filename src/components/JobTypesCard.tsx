import React from 'react';

interface JobTypes {
  replacements: number;
  repairs: number;
  inspections: number;
  gutters: number;
}

interface JobTypesCardProps {
  data: JobTypes;
}

const types = [
  { key: 'replacements' as const, label: 'Replacements', color: '#00293f' },
  { key: 'repairs' as const, label: 'Repairs', color: '#B1000F' },
  { key: 'inspections' as const, label: 'Inspections', color: '#64748b' },
  { key: 'gutters' as const, label: 'Gutters', color: '#94a3b8' },
];

export const JobTypesCard: React.FC<JobTypesCardProps> = ({ data }) => {
  const total = Object.values(data).reduce((a, b) => a + b, 0);
  
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
        margin: '0 0 14px', 
        textTransform: 'uppercase', 
        letterSpacing: 0.3 
      }}>
        Jobs by Type
      </h3>
      {types.map(type => (
        <div key={type.key} style={{ marginBottom: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
            <span style={{ fontSize: 12, color: '#334155' }}>{type.label}</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#00293f' }}>{data[type.key]}</span>
          </div>
          <div style={{ height: 5, background: '#f1f5f9', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ 
              height: '100%', 
              width: `${(data[type.key] / total) * 100}%`, 
              background: type.color, 
              borderRadius: 2 
            }} />
          </div>
        </div>
      ))}
    </div>
  );
};
