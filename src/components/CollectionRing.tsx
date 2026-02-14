import React from 'react';
import { formatCurrency } from '@/lib/utils';

interface CollectionRingProps {
  collected: number;
  uncollected: number;
  emptySubtext?: string;
}

export const CollectionRing: React.FC<CollectionRingProps> = ({ collected, uncollected, emptySubtext }) => {
  const total = collected + uncollected;
  const percentage = total > 0 ? Math.round((collected / total) * 100) : 0;
  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (percentage / 100) * circumference;
  
  return (
    <div style={{ 
      background: 'white', 
      borderRadius: 10, 
      padding: 18, 
      boxShadow: '0 1px 3px rgba(0,0,0,0.06)', 
      border: '1px solid #e8ecf0', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center' 
    }}>
      <h3 style={{ 
        fontSize: 12, 
        fontWeight: 600, 
        color: '#00293f', 
        margin: '0 0 12px', 
        textTransform: 'uppercase', 
        letterSpacing: 0.3, 
        alignSelf: 'flex-start' 
      }}>
        Collections
      </h3>
      <div style={{ position: 'relative', width: 100, height: 100 }}>
        <svg width="100" height="100" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="50" cy="50" r="45" fill="none" stroke="#f1f5f9" strokeWidth="8" />
          <circle 
            cx="50" 
            cy="50" 
            r="45" 
            fill="none" 
            stroke="#00293f" 
            strokeWidth="8" 
            strokeLinecap="round" 
            strokeDasharray={circumference} 
            strokeDashoffset={offset} 
          />
        </svg>
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
        }}>
          <p style={{ fontSize: 20, fontWeight: 700, color: '#00293f', margin: 0 }}>{percentage}%</p>
          {total === 0 && emptySubtext && (
            <p style={{ fontSize: 9, color: '#64748b', margin: '2px 0 0' }}>{emptySubtext}</p>
          )}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 16, marginTop: 12, width: '100%', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: '#059669', margin: 0 }}>
            {formatCurrency(collected)}
          </p>
          <p style={{ fontSize: 9, color: '#64748b', margin: '2px 0 0' }}>Collected</p>
        </div>
        <div style={{ width: 1, background: '#e8ecf0' }} />
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: '#B1000F', margin: 0 }}>
            {formatCurrency(uncollected)}
          </p>
          <p style={{ fontSize: 9, color: '#64748b', margin: '2px 0 0' }}>Outstanding</p>
        </div>
      </div>
    </div>
  );
};
