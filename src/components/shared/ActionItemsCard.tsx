'use client';

import React from 'react';
import { CARD_STYLES, COLORS, TYPOGRAPHY, SPACING } from '@/styles/constants';

export type ActionItemColor = 'red' | 'yellow' | 'orange';

export interface ActionItem {
  cardName: string;
  columnName: string;
  reason: string;
  color: ActionItemColor;
  trelloUrl: string;
}

interface ActionItemsCardProps {
  title: string;
  items: ActionItem[];
  emptyMessage?: string;
}

const COLOR_MAP: Record<ActionItemColor, string> = {
  red: COLORS.red,
  yellow: COLORS.warning,
  orange: COLORS.orange
};

export const ActionItemsCard: React.FC<ActionItemsCardProps> = ({
  title,
  items,
  emptyMessage = 'All caught up!'
}) => {
  const count = items.length;

  return (
    <div style={{ ...CARD_STYLES.base, minHeight: 200 }}>
      {/* Header */}
      <div style={{
        marginBottom: SPACING[3],
        paddingBottom: SPACING[2],
        borderBottom: `1px solid ${COLORS.gray200}`
      }}>
        <h3 style={{
          fontSize: TYPOGRAPHY.fontSize.base,
          fontWeight: TYPOGRAPHY.fontWeight.bold,
          color: COLORS.navy,
          margin: 0,
          textTransform: 'uppercase',
          letterSpacing: TYPOGRAPHY.letterSpacing.widest
        }}>
          {title} {count > 0 && `(${count})`}
        </h3>
      </div>

      {/* Content */}
      {count === 0 ? (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 120,
          color: COLORS.gray500,
          fontSize: TYPOGRAPHY.fontSize.lg,
          fontWeight: TYPOGRAPHY.fontWeight.medium
        }}>
          {emptyMessage}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: SPACING[3] }}>
          {items.map((item, index) => (
            <div key={index} style={{ display: 'flex', gap: SPACING[2], alignItems: 'flex-start' }}>
              {/* Color indicator */}
              <span
                style={{
                  color: COLOR_MAP[item.color],
                  fontSize: TYPOGRAPHY.fontSize.lg,
                  lineHeight: 1,
                  flexShrink: 0
                }}
              >
                ●
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <a
                  href={item.trelloUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: COLORS.navy,
                    fontWeight: TYPOGRAPHY.fontWeight.semibold,
                    fontSize: TYPOGRAPHY.fontSize.md,
                    textDecoration: 'none'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.textDecoration = 'underline';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.textDecoration = 'none';
                  }}
                >
                  {item.cardName}
                </a>
                <div style={{
                  color: COLORS.gray500,
                  fontSize: TYPOGRAPHY.fontSize.sm,
                  marginTop: 2
                }}>
                  {item.columnName} • {item.reason}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
