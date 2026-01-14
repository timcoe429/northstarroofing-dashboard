import React from 'react';
import { formatCurrency } from '@/lib/utils';

interface ActiveProject {
  id: number;
  name: string;
  type: string;
  value: number;
  status: string;
  location: string;
  startDate: string;
  crew: string;
  completion: number;
}

interface ActiveProjectsContentProps {
  projects: ActiveProject[];
}

export const ActiveProjectsContent: React.FC<ActiveProjectsContentProps> = ({ projects }) => {
  const inProgress = projects.filter(p => p.status === 'In Progress');
  const scheduled = projects.filter(p => p.status === 'Scheduled');
  
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 20 }}>
        <div style={{ background: '#fef3c7', padding: 14, borderRadius: 10, textAlign: 'center' }}>
          <p style={{ margin: 0, fontSize: 10, color: '#92400e', textTransform: 'uppercase', fontWeight: 600 }}>
            In Progress
          </p>
          <p style={{ margin: '6px 0 0', fontSize: 26, fontWeight: 700, color: '#92400e' }}>{inProgress.length}</p>
        </div>
        <div style={{ background: '#dbeafe', padding: 14, borderRadius: 10, textAlign: 'center' }}>
          <p style={{ margin: 0, fontSize: 10, color: '#1e40af', textTransform: 'uppercase', fontWeight: 600 }}>
            Scheduled
          </p>
          <p style={{ margin: '6px 0 0', fontSize: 26, fontWeight: 700, color: '#1e40af' }}>{scheduled.length}</p>
        </div>
        <div style={{ background: '#f8fafc', padding: 14, borderRadius: 10, textAlign: 'center' }}>
          <p style={{ margin: 0, fontSize: 10, color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>
            Total Value
          </p>
          <p style={{ margin: '6px 0 0', fontSize: 26, fontWeight: 700, color: '#00293f' }}>
            {formatCurrency(projects.reduce((s, p) => s + p.value, 0))}
          </p>
        </div>
        <div style={{ background: '#f8fafc', padding: 14, borderRadius: 10, textAlign: 'center' }}>
          <p style={{ margin: 0, fontSize: 10, color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>
            Crews Active
          </p>
          <p style={{ margin: '6px 0 0', fontSize: 26, fontWeight: 700, color: '#00293f' }}>
            {new Set(projects.map(p => p.crew)).size}
          </p>
        </div>
      </div>
      
      <h3 style={{ 
        fontSize: 12, 
        fontWeight: 600, 
        color: '#92400e', 
        margin: '0 0 12px', 
        textTransform: 'uppercase', 
        display: 'flex', 
        alignItems: 'center', 
        gap: 6 
      }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b' }} /> 
        In Progress ({inProgress.length})
      </h3>
      
      {inProgress.map(project => (
        <div 
          key={project.id} 
          style={{ 
            background: '#fffbeb', 
            border: '1px solid #fde68a', 
            borderRadius: 8, 
            padding: 12, 
            marginBottom: 10 
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <div>
              <p style={{ margin: 0, fontWeight: 600, color: '#00293f', fontSize: 14 }}>{project.name}</p>
              <p style={{ margin: '3px 0 0', fontSize: 12, color: '#64748b' }}>
                {project.location} • {project.type}
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ margin: 0, fontWeight: 700, color: '#00293f', fontSize: 16 }}>
                {formatCurrency(project.value)}
              </p>
              <p style={{ margin: '3px 0 0', fontSize: 11, color: '#64748b' }}>Crew: {project.crew}</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ flex: 1, height: 6, background: '#fde68a', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ 
                width: `${project.completion}%`, 
                height: '100%', 
                background: '#f59e0b', 
                borderRadius: 3 
              }} />
            </div>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#92400e' }}>{project.completion}%</span>
          </div>
        </div>
      ))}
      
      <h3 style={{ 
        fontSize: 12, 
        fontWeight: 600, 
        color: '#1e40af', 
        margin: '20px 0 12px', 
        textTransform: 'uppercase', 
        display: 'flex', 
        alignItems: 'center', 
        gap: 6 
      }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#3b82f6' }} /> 
        Scheduled ({scheduled.length})
      </h3>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
        {scheduled.map(project => (
          <div 
            key={project.id} 
            style={{ 
              background: '#eff6ff', 
              border: '1px solid #bfdbfe', 
              borderRadius: 8, 
              padding: 12 
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <p style={{ margin: 0, fontWeight: 600, color: '#00293f', fontSize: 13 }}>{project.name}</p>
                <p style={{ margin: '3px 0 0', fontSize: 11, color: '#64748b' }}>
                  {project.location} • {project.type}
                </p>
                <p style={{ margin: '6px 0 0', fontSize: 11, color: '#1e40af' }}>
                  Starts: {new Date(project.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ margin: 0, fontWeight: 700, color: '#00293f', fontSize: 14 }}>
                  {formatCurrency(project.value)}
                </p>
                <p style={{ margin: '3px 0 0', fontSize: 10, color: '#64748b' }}>{project.crew}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
