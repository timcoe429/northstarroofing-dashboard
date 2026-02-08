'use client';

import React from 'react';
import { STATCARD_STYLES, COLORS, TYPOGRAPHY } from '@/styles/constants';

interface StatCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  subtextColor?: string;
  icon: string;
  iconColor?: string;
  trend?: number;
  color?: string;
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({ 
  label, 
  value, 
  subtext, 
  subtextColor,
  icon, 
  iconColor,
  trend, 
  color = COLORS.navy,
  onClick 
}) => {
  const isClickable = !!onClick;
  
  // Determine subtext color based on trend or explicit color
  const getSubtextColor = () => {
    if (subtextColor) return subtextColor;
    if (trend !== undefined) {
      if (trend > 0) return COLORS.success;
      if (trend < 0) return COLORS.red;
    }
    return COLORS.gray500;
  };

  return (
    <div 
      style={{
        ...STATCARD_STYLES.container,
        cursor: isClickable ? 'pointer' : 'default'
      }}
      onClick={onClick}
      onMouseEnter={(e) => {
        if (isClickable) {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = STATCARD_STYLES.container.boxShadow;
          const viewDetails = e.currentTarget.querySelector('.view-details') as HTMLElement;
          if (viewDetails) {
            viewDetails.style.opacity = '1';
          }
        }
      }}
      onMouseLeave={(e) => {
        if (isClickable) {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = STATCARD_STYLES.container.boxShadow;
          const viewDetails = e.currentTarget.querySelector('.view-details') as HTMLElement;
          if (viewDetails) {
            viewDetails.style.opacity = '0';
          }
        }
      }}
    >
      {/* Left border accent */}
      <div style={{
        ...STATCARD_STYLES.leftBorder,
        background: color
      }} />
      
      {/* Icon */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '40px',
        height: '40px',
        borderRadius: '8px',
        background: `${iconColor || color}12`,
        marginBottom: '12px',
        fontSize: '20px'
      }}>
        {icon}
      </div>
      
      {/* Content */}
      <div style={STATCARD_STYLES.label}>
        {label}
      </div>
      
      <div style={STATCARD_STYLES.value}>
        {value}
      </div>
      
      {subtext && (
        <div style={{
          ...STATCARD_STYLES.subtext,
          color: getSubtextColor()
        }}>
          {subtext}
        </div>
      )}
      
      {/* View details hint (only shown on hover if clickable) */}
      {isClickable && (
        <div 
          className="view-details"
          style={STATCARD_STYLES.viewDetails}
        >
          View details →
        </div>
      )}
    </div>
  );
};