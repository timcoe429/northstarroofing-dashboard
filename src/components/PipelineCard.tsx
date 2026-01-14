import React from 'react';

interface PipelineData {
  leads: number;
  estimates: number;
  scheduled: number;
  inProgress: number;
  completed: number;
}

interface PipelineCardProps {
  data: PipelineData;
}

const stages = [
  { key: 'leads' as const, label: 'Leads', color: '#94a3b8' },
  { key: 'estimates' as const, label: 'Estimates', color: '#60a5fa' },
  { key: 'scheduled' as const, label: 'Scheduled', color: '#fbbf24' },
  { key: 'inProgress' as const, label: 'In Progress', color: '#B1000F' },
  { key: 'completed' as const, label: 'Completed', color: '#059669' },
];

export const PipelineCard: React.FC<PipelineCardProps> = ({ data }) => {
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
        Project Pipeline
      </h3>
      <div style={{ 
        display: 'flex', 
        height: 8, 
        borderRadius: 4, 
        overflow: 'hidden', 
        marginBottom: 14, 
        background: '#f1f5f9' 
      }}>
        {stages.map(stage => (
          <div 
            key={stage.key} 
            style={{ 
              width: `${(data[stage.key] / total) * 100}%`, 
              background: stage.color 
            }} 
          />
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        {stages.map(stage => (
          <div key={stage.key} style={{ textAlign: 'center' }}>
            <div style={{ 
              width: 6, 
              height: 6, 
              borderRadius: '50%', 
              background: stage.color, 
              margin: '0 auto 5px' 
            }} />
            <p style={{ fontSize: 18, fontWeight: 700, color: '#00293f', margin: 0 }}>
              {data[stage.key]}
            </p>
            <p style={{ fontSize: 9, color: '#64748b', margin: '2px 0 0', textTransform: 'uppercase' }}>
              {stage.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
