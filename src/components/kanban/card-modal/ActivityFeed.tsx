'use client';

import React from 'react';
import type { CardActivity } from '@/types/kanban';
import { CommentInput } from './CommentInput';

interface ActivityFeedProps {
  activities: CardActivity[];
  onAddComment: (comment: string) => Promise<void>;
  showActivity: boolean;
  onToggleActivity: () => void;
  isSubmittingComment?: boolean;
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({
  activities,
  onAddComment,
  showActivity,
  onToggleActivity,
  isSubmittingComment = false,
}) => {
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    // Show seconds for very recent activities
    if (diffSecs < 60) return diffSecs < 10 ? 'Just now' : `${diffSecs}s ago`;
    // Show minutes for activities < 1 hour
    if (diffMins < 60) return `${diffMins}m ago`;
    // Show hours for activities < 24 hours
    if (diffHours < 24) return diffHours === 1 ? 'an hour ago' : `${diffHours}h ago`;
    // Show "Yesterday" for activities from yesterday
    if (diffDays === 1) return 'Yesterday';
    // Show days for activities < 7 days
    if (diffDays < 7) return `${diffDays}d ago`;
    
    // For today's activities, show exact time
    const isToday = date.toDateString() === now.toDateString();
    if (isToday) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    }
    
    // For older activities, show date
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined 
    });
  };

  const getActivityIcon = (type: CardActivity['activity_type']) => {
    switch (type) {
      case 'created':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2v20M2 12h20" />
          </svg>
        );
      case 'moved':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        );
      case 'field_updated':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        );
      case 'file_uploaded':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
        );
      case 'comment':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        );
      default:
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
          </svg>
        );
    }
  };

  return (
    <div>
      {/* Header with toggle */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
      }}>
        <h3 style={{
          fontSize: 14,
          fontWeight: 600,
          color: '#172b4d',
          margin: 0,
          textTransform: 'uppercase',
          letterSpacing: 0.5,
        }}>
          Activity
        </h3>
        <button
          onClick={onToggleActivity}
          style={{
            padding: '4px 8px',
            borderRadius: 4,
            border: '1px solid #dfe1e6',
            background: showActivity ? '#0079bf' : '#f4f5f7',
            color: showActivity ? 'white' : '#5e6c84',
            fontSize: 11,
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all 0.15s',
          }}
        >
          {showActivity ? 'Hide' : 'Show'}
        </button>
      </div>

      {/* Comment input (always visible) */}
      <div style={{ marginBottom: 16 }}>
        <CommentInput onSubmit={onAddComment} isSubmitting={isSubmittingComment} />
      </div>

      {/* Activity feed */}
      {showActivity && (
        <div style={{ borderTop: '1px solid #dfe1e6', paddingTop: 16 }}>
          {activities.length === 0 ? (
            <p style={{ fontSize: 12, color: '#5e6c84', fontStyle: 'italic', margin: 0 }}>
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
                        background: '#dfe1e6',
                      }}
                    />
                  )}
                  
                  {/* Icon */}
                  <div
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      background: activity.activity_type === 'comment' ? '#e4f0f6' : '#f4f5f7',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: activity.activity_type === 'comment' ? '#0079bf' : '#5e6c84',
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
                      color: '#172b4d',
                      lineHeight: 1.5,
                      whiteSpace: 'pre-wrap',
                    }}>
                      {activity.description}
                    </p>
                    <p style={{
                      margin: '4px 0 0',
                      fontSize: 11,
                      color: '#5e6c84',
                    }}>
                      {formatTimestamp(activity.created_at)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
