'use client';

import React from 'react';
import type { CardActivity } from '@/types/kanban';

interface ActivityTimelineProps {
  activities: CardActivity[];
}

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({ activities }) => {
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined });
  };

  const getActivityIcon = (type: CardActivity['activity_type']) => {
    switch (type) {
      case 'created':
        return '✨';
      case 'moved':
        return '➡️';
      case 'field_updated':
        return '✏️';
      case 'file_uploaded':
        return '📎';
      case 'comment':
        return '💬';
      default:
        return '•';
    }
  };

  return (
    <div>
      <h3 style={{ 
        fontSize: 14, 
        fontWeight: 600, 
        color: '#00293f', 
        marginBottom: 12,
        marginTop: 0,
      }}>
        Activity Timeline
      </h3>
      {activities.length === 0 ? (
        <p style={{ fontSize: 12, color: '#64748b', fontStyle: 'italic' }}>
          No activity yet
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {activities.map((activity, index) => (
            <div
              key={activity.id}
              style={{
                display: 'flex',
                gap: 12,
                paddingLeft: 8,
                position: 'relative',
              }}
            >
              {/* Timeline line */}
              {index < activities.length - 1 && (
                <div
                  style={{
                    position: 'absolute',
                    left: 15,
                    top: 24,
                    bottom: -12,
                    width: 2,
                    background: '#e2e8f0',
                  }}
                />
              )}
              {/* Icon */}
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  background: '#f1f5f9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 12,
                  flexShrink: 0,
                  zIndex: 1,
                }}
              >
                {getActivityIcon(activity.activity_type)}
              </div>
              {/* Content */}
              <div style={{ flex: 1, paddingBottom: 4 }}>
                <p style={{ 
                  margin: 0, 
                  fontSize: 13, 
                  color: '#0f172a',
                  lineHeight: 1.5,
                }}>
                  {activity.description}
                </p>
                <p style={{ 
                  margin: '4px 0 0', 
                  fontSize: 11, 
                  color: '#64748b' 
                }}>
                  {formatTimestamp(activity.created_at)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
