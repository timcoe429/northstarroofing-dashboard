'use client';

import React from 'react';
import { getCardsByList, getDaysInColumn } from '@/utils/trello-helpers';
import { COLORS, TYPOGRAPHY, CARD_STYLES } from '@/styles/constants';
import type { TrelloCard, TrelloList } from '@/types';

const COLUMNS = [
  'New Lead',
  'Need Quote',
  'Estimating',
  'Estimate Sent',
  'Follow-Up',
];

const BOTTLENECK_COLORS = {
  healthy: COLORS.navy, // 0-3 days
  warning: '#D4A017', // 3-7 days
  bottleneck: COLORS.red, // 7+ days
};

function getBarColor(avgDays: number): string {
  if (avgDays < 3) return BOTTLENECK_COLORS.healthy;
  if (avgDays < 7) return BOTTLENECK_COLORS.warning;
  return BOTTLENECK_COLORS.bottleneck;
}

interface TimeInColumnCardProps {
  cards: TrelloCard[];
  lists: TrelloList[];
  cardDaysInColumn: Record<string, number>;
}

export const TimeInColumnCard: React.FC<TimeInColumnCardProps> = ({
  cards,
  lists,
  cardDaysInColumn,
}) => {
  const columnData = COLUMNS.map((columnName) => {
    const columnCards = getCardsByList(cards, lists, columnName);
    const count = columnCards.length;
    const avgDays =
      count > 0
        ? columnCards.reduce((sum, card) => sum + getDaysInColumn(card, cardDaysInColumn), 0) /
          count
        : 0;

    return {
      columnName,
      count,
      avgDays,
    };
  });

  const maxAvgDays = Math.max(...columnData.map((c) => c.avgDays), 1);

  return (
    <div
      style={{
        ...CARD_STYLES.base,
        minHeight: 200,
      }}
    >
      <h3
        style={{
          fontSize: TYPOGRAPHY.fontSize.base,
          fontWeight: TYPOGRAPHY.fontWeight.semibold,
          color: COLORS.navy,
          margin: '0 0 14px',
          textTransform: 'uppercase',
          letterSpacing: 0.3,
        }}
      >
        Time in Column
      </h3>

      {columnData.map(({ columnName, count, avgDays }) => (
        <div key={columnName} style={{ marginBottom: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
            <span style={{ fontSize: 12, color: COLORS.gray700 }}>{columnName}</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: COLORS.navy }}>
              {count} • {count > 0 ? `avg ${avgDays.toFixed(1)} days` : '—'}
            </span>
          </div>
          {count > 0 && (
            <div
              style={{
                height: 5,
                background: COLORS.gray100,
                borderRadius: 2,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${(avgDays / maxAvgDays) * 100}%`,
                  background: getBarColor(avgDays),
                  borderRadius: 2,
                }}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
