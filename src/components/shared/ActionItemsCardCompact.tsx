'use client';

import React from 'react';
import { CARD_STYLES, COLORS, TYPOGRAPHY, SPACING } from '@/styles/constants';

const TIER_COLORS = {
  critical: COLORS.red,
  stale: '#D4A017',
  onTrack: COLORS.navy,
} as const;

export interface UrgencyTier {
  label: 'critical' | 'stale' | 'onTrack';
  count: number;
  items?: Array<{ name: string; subtext: string; trelloUrl: string }>;
  columnSummary?: string;
}

export interface ActionItemsTiers {
  critical: UrgencyTier;
  stale: UrgencyTier;
  onTrack: UrgencyTier;
}

interface ActionItemsCardCompactProps {
  title: string;
  tiers: ActionItemsTiers;
  emptyMessage?: string;
}

export const ActionItemsCardCompact: React.FC<ActionItemsCardCompactProps> = ({
  title,
  tiers,
  emptyMessage = 'All caught up!',
}) => {
  const totalCount =
    tiers.critical.count + tiers.stale.count + tiers.onTrack.count;

  return (
    <div style={{ ...CARD_STYLES.base, minHeight: 200, maxHeight: 320 }}>
      <div
        style={{
          marginBottom: SPACING[3],
          paddingBottom: SPACING[2],
          borderBottom: `1px solid ${COLORS.gray200}`,
        }}
      >
        <h3
          style={{
            fontSize: TYPOGRAPHY.fontSize.base,
            fontWeight: TYPOGRAPHY.fontWeight.bold,
            color: COLORS.navy,
            margin: 0,
            textTransform: 'uppercase',
            letterSpacing: TYPOGRAPHY.letterSpacing.widest,
          }}
        >
          {title} {totalCount > 0 && `(${totalCount})`}
        </h3>
      </div>

      {totalCount === 0 ? (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 120,
            color: COLORS.gray500,
            fontSize: TYPOGRAPHY.fontSize.lg,
            fontWeight: TYPOGRAPHY.fontWeight.medium,
          }}
        >
          {emptyMessage}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: SPACING[2] }}>
          {tiers.critical.count > 0 && (
            <div style={{ display: 'flex', gap: SPACING[2], alignItems: 'flex-start' }}>
              <span
                style={{
                  color: TIER_COLORS.critical,
                  fontSize: TYPOGRAPHY.fontSize.base,
                  lineHeight: 1,
                  flexShrink: 0,
                }}
              >
                ●
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <span style={{ fontSize: TYPOGRAPHY.fontSize.sm, fontWeight: 600, color: COLORS.gray700 }}>
                  {tiers.critical.count} critical
                </span>
                {tiers.critical.items && tiers.critical.items.length > 0 && (
                  <div
                    style={{
                      marginTop: 4,
                      maxHeight: 120,
                      overflowY: 'auto',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 2,
                    }}
                  >
                    {tiers.critical.items.map((item, i) => (
                      <a
                        key={i}
                        href={item.trelloUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          color: COLORS.navy,
                          fontSize: TYPOGRAPHY.fontSize.sm,
                          textDecoration: 'none',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.textDecoration = 'underline';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.textDecoration = 'none';
                        }}
                      >
                        {item.name} • {item.subtext}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {tiers.stale.count > 0 && (
            <div style={{ display: 'flex', gap: SPACING[2], alignItems: 'flex-start' }}>
              <span
                style={{
                  color: TIER_COLORS.stale,
                  fontSize: TYPOGRAPHY.fontSize.base,
                  lineHeight: 1,
                  flexShrink: 0,
                }}
              >
                ●
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <span style={{ fontSize: TYPOGRAPHY.fontSize.sm, fontWeight: 600, color: COLORS.gray700 }}>
                  {tiers.stale.count} stale
                </span>
                {tiers.stale.columnSummary && (
                  <div style={{ fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.gray500, marginTop: 2 }}>
                    {tiers.stale.columnSummary}
                  </div>
                )}
              </div>
            </div>
          )}

          {tiers.onTrack.count > 0 && (
            <div style={{ display: 'flex', gap: SPACING[2], alignItems: 'flex-start' }}>
              <span
                style={{
                  color: TIER_COLORS.onTrack,
                  fontSize: TYPOGRAPHY.fontSize.base,
                  lineHeight: 1,
                  flexShrink: 0,
                }}
              >
                ●
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <span style={{ fontSize: TYPOGRAPHY.fontSize.sm, fontWeight: 600, color: COLORS.gray700 }}>
                  {tiers.onTrack.count} cards on track
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
