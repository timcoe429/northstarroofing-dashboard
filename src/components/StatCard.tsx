'use client';

import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon: string;
  trend?: number;
  color?: string;
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({ 
  label, 
  value, 
  subtext, 
  icon, 
  trend, 
  color = '#00293f', 
  onClick 
}) => {
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <div 
      onClick={onClick} 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ 
        background: 'white', 
        borderRadius: 10, 
        padding: 18, 
        boxShadow: isHovered && onClick ? '0 4px 12px rgba(0,0,0,0.1)' : '0 1px 3px rgba(0,0,0,0.06)', 
        border: '1px solid #e8ecf0', 
        cursor: onClick ? 'pointer' : 'default', 
        transition: 'all 0.2s', 
        position: 'relative',
        transform: isHovered && onClick ? 'translateY(-2px)' : 'none'
      }}
    >
      <div style={{ 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        width: 4, 
        height: '100%', 
        background: color, 
        borderRadius: '10px 0 0 10px' 
      }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={{ 
            fontSize: 11, 
            color: '#64748b', 
            margin: 0, 
            fontWeight: 600, 
            textTransform: 'uppercase', 
            letterSpacing: 0.3 
          }}>
            {label}
          </p>
          <p style={{ fontSize: 26, fontWeight: 700, color: '#00293f', margin: '5px 0 3px' }}>
            {value}
          </p>
          {subtext && (
            <p style={{ 
              fontSize: 11, 
              color: trend !== undefined && trend > 0 ? '#059669' : trend !== undefined && trend < 0 ? '#dc2626' : '#64748b', 
              margin: 0 
            }}>
              {trend !== undefined && <span>{trend > 0 ? '↑ ' : trend < 0 ? '↓ ' : ''}</span>}
              {subtext}
            </p>
          )}
        </div>
        <div style={{ 
          width: 40, 
          height: 40, 
          borderRadius: 8, 
          background: `${color}12`, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          fontSize: 20 
        }}>
          {icon}
        </div>
      </div>
      {onClick && (
        <p style={{ 
          position: 'absolute', 
          bottom: 6, 
          right: 10, 
          fontSize: 10, 
          color: '#94a3b8', 
          margin: 0 
        }}>
          View details →
        </p>
      )}
    </div>
  );
};
