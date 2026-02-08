'use client';

import React, { useState } from 'react';
import { Icons } from '../Icons';
import { ALERT_STYLES, CARD_STYLES, COLORS, TYPOGRAPHY, SPACING } from '@/styles/constants';

export type AlertType = 'warning' | 'critical' | 'healthy' | 'info';

interface AlertItem {
  id: string;
  title: string;
  message: string;
  count?: number;
  items?: Array<{
    label: string;
    value: string | number;
    color?: string;
  }>;
}

interface AlertCardProps {
  title: string;
  alerts: AlertItem[];
  type?: AlertType;
  expandable?: boolean;
  icon?: React.ReactNode;
  emptyState?: {
    icon?: React.ReactNode;
    title: string;
    message: string;
  };
}

export const AlertCard: React.FC<AlertCardProps> = ({
  title,
  alerts,
  type = 'info',
  expandable = false,
  icon,
  emptyState
}) => {
  const [expandedAlert, setExpandedAlert] = useState<string | null>(null);
  
  const hasAlerts = alerts.length > 0;
  
  // Get alert styling based on type
  const getAlertStyle = (alertType: AlertType) => {
    switch (alertType) {
      case 'warning':
        return ALERT_STYLES.warning;
      case 'critical':
        return ALERT_STYLES.critical;
      case 'healthy':
        return ALERT_STYLES.healthy;
      default:
        return {
          background: COLORS.gray50,
          color: COLORS.gray700,
          border: `1px solid ${COLORS.gray200}`,
          borderRadius: SPACING[2],
          padding: SPACING[4]
        };
    }
  };

  const getAlertIcon = (alertType: AlertType) => {
    switch (alertType) {
      case 'warning':
        return <Icons.AlertCircle />;
      case 'critical':
        return <Icons.AlertCircle />;
      case 'healthy':
        return <Icons.Check />;
      default:
        return <Icons.Bell />;
    }
  };

  return (
    <div style={CARD_STYLES.base}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: SPACING[2],
        marginBottom: SPACING[3]
      }}>
        {icon || getAlertIcon(type)}
        <h3 style={{
          fontSize: TYPOGRAPHY.fontSize.base,
          fontWeight: TYPOGRAPHY.fontWeight.semibold,
          color: COLORS.navy,
          margin: 0,
          textTransform: 'uppercase',
          letterSpacing: TYPOGRAPHY.letterSpacing.widest
        }}>
          {title}
        </h3>
      </div>

      {/* Empty State */}
      {!hasAlerts && emptyState && (
        <div style={{
          ...getAlertStyle('healthy'),
          display: 'flex',
          alignItems: 'center',
          gap: SPACING[3]
        }}>
          {emptyState.icon || <Icons.Check />}
          <div>
            <div style={{
              fontSize: TYPOGRAPHY.fontSize.lg,
              fontWeight: TYPOGRAPHY.fontWeight.semibold,
              marginBottom: SPACING[1]
            }}>
              {emptyState.title}
            </div>
            <div style={{ fontSize: TYPOGRAPHY.fontSize.md }}>
              {emptyState.message}
            </div>
          </div>
        </div>
      )}

      {/* Alerts */}
      {hasAlerts && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: SPACING[3] }}>
          {alerts.map(alert => (
            <div key={alert.id}>
              {/* Alert Header */}
              <div
                style={{
                  ...getAlertStyle(type),
                  cursor: expandable ? 'pointer' : 'default',
                  transition: 'all 0.15s ease'
                }}
                onClick={() => expandable && setExpandedAlert(
                  expandedAlert === alert.id ? null : alert.id
                )}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div>
                    <div style={{
                      fontSize: TYPOGRAPHY.fontSize.md,
                      fontWeight: TYPOGRAPHY.fontWeight.bold,
                      marginBottom: SPACING[1]
                    }}>
                      {alert.title}
                      {alert.count !== undefined && ` (${alert.count})`}
                    </div>
                    <div style={{ fontSize: TYPOGRAPHY.fontSize.lg }}>
                      {alert.message}
                    </div>
                  </div>
                  
                  {expandable && (
                    <div style={{
                      transform: expandedAlert === alert.id ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.15s ease',
                      fontSize: TYPOGRAPHY.fontSize.sm
                    }}>
                      ▼
                    </div>
                  )}
                </div>
              </div>

              {/* Expanded Content */}
              {expandable && expandedAlert === alert.id && alert.items && (
                <div style={{
                  background: COLORS.gray50,
                  border: `1px solid ${COLORS.gray200}`,
                  borderTop: 'none',
                  borderRadius: `0 0 ${SPACING[2]} ${SPACING[2]}`,
                  padding: SPACING[4]
                }}>
                  <div style={{
                    fontSize: TYPOGRAPHY.fontSize.base,
                    fontWeight: TYPOGRAPHY.fontWeight.semibold,
                    color: COLORS.gray500,
                    marginBottom: SPACING[2],
                    textTransform: 'uppercase',
                    letterSpacing: TYPOGRAPHY.letterSpacing.widest
                  }}>
                    Details ({alert.items.length})
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: SPACING[1] }}>
                    {alert.items.map((item, index) => (
                      <div
                        key={index}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: `${SPACING[2]} ${SPACING[3]}`,
                          background: COLORS.white,
                          borderRadius: SPACING[1],
                          border: `1px solid ${COLORS.gray200}`,
                          fontSize: TYPOGRAPHY.fontSize.md
                        }}
                      >
                        <span style={{ fontWeight: TYPOGRAPHY.fontWeight.medium }}>
                          {item.label}
                        </span>
                        <span style={{
                          color: item.color || COLORS.gray600,
                          fontWeight: TYPOGRAPHY.fontWeight.semibold
                        }}>
                          {item.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};