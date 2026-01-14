import React from 'react';
import { formatCurrency } from '@/lib/utils';

interface Project {
  id: number;
  name: string;
  type: string;
  value: number;
  status: string;
  location: string;
  date: string;
}

interface RecentProjectsProps {
  projects: Project[];
}

const statusColors: Record<string, { bg: string; text: string }> = {
  'In Progress': { bg: '#fef3c7', text: '#92400e' },
  'Scheduled': { bg: '#dbeafe', text: '#1e40af' },
  'Completed': { bg: '#d1fae5', text: '#065f46' },
};

export const RecentProjects: React.FC<RecentProjectsProps> = ({ projects }) => {
  return (
    <div style={{ 
      background: 'white', 
      borderRadius: 10, 
      padding: 18, 
      boxShadow: '0 1px 3px rgba(0,0,0,0.06)', 
      border: '1px solid #e8ecf0' 
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <h3 style={{ 
          fontSize: 12, 
          fontWeight: 600, 
          color: '#00293f', 
          margin: 0, 
          textTransform: 'uppercase', 
          letterSpacing: 0.3 
        }}>
          Recent Projects
        </h3>
        <button style={{ 
          background: 'none', 
          border: '1px solid #e2e8f0', 
          borderRadius: 5, 
          padding: '4px 8px', 
          fontSize: 10, 
          color: '#64748b', 
          cursor: 'pointer' 
        }}>
          View All →
        </button>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #e8ecf0' }}>
            {['Project', 'Type', 'Location', 'Value', 'Status'].map(h => (
              <th 
                key={h} 
                style={{ 
                  textAlign: 'left', 
                  padding: '8px 6px', 
                  fontSize: 9, 
                  fontWeight: 600, 
                  color: '#64748b', 
                  textTransform: 'uppercase' 
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {projects.map(project => (
            <tr key={project.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
              <td style={{ padding: '10px 6px', fontWeight: 600, color: '#00293f', fontSize: 12 }}>
                {project.name}
              </td>
              <td style={{ padding: '10px 6px', color: '#334155', fontSize: 12 }}>
                {project.type}
              </td>
              <td style={{ padding: '10px 6px', color: '#64748b', fontSize: 12 }}>
                {project.location}
              </td>
              <td style={{ padding: '10px 6px', fontWeight: 600, color: '#00293f', fontSize: 12 }}>
                {formatCurrency(project.value)}
              </td>
              <td style={{ padding: '10px 6px' }}>
                <span style={{ 
                  display: 'inline-block', 
                  padding: '2px 6px', 
                  borderRadius: 8, 
                  fontSize: 10, 
                  fontWeight: 500, 
                  background: statusColors[project.status]?.bg || '#f1f5f9', 
                  color: statusColors[project.status]?.text || '#64748b' 
                }}>
                  {project.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
