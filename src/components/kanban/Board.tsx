'use client';

import React from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';
import { Column } from './Column';
import { Card } from './Card';
import type { ColumnWithCards, CardWithLabels } from '@/types/kanban';
import { moveCard } from '@/lib/supabase/kanban';

interface BoardProps {
  columns: ColumnWithCards[];
  onCardClick: (cardId: string) => void;
  onAddCard: (columnId: string, data: { address: string; job_type?: string; client_name?: string }) => Promise<void>;
  onCardsChange: () => void;
}

export const Board: React.FC<BoardProps> = ({ columns, onCardClick, onAddCard, onCardsChange }) => {
  const [activeCard, setActiveCard] = React.useState<CardWithLabels | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const card = findCardById(active.id as string);
    setActiveCard(card);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveCard(null);

    if (!over) return;

    const cardId = active.id as string;
    const newColumnId = over.id as string;
    const card = findCardById(cardId);

    if (!card || card.column_id === newColumnId) return;

    // Find new position (append to end of column)
    const targetColumn = columns.find(col => col.id === newColumnId);
    const newPosition = targetColumn ? targetColumn.cards.length : 0;

    try {
      await moveCard(cardId, newColumnId, newPosition);
      onCardsChange();
    } catch (error) {
      console.error('Error moving card:', error);
      alert('Failed to move card. Please try again.');
    }
  };

  const findCardById = (cardId: string): CardWithLabels | null => {
    for (const column of columns) {
      const card = column.cards.find(c => c.id === cardId);
      if (card) return card;
    }
    return null;
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div style={{
        display: 'flex',
        overflowX: 'auto',
        padding: '16px 0',
        minHeight: 'calc(100vh - 120px)',
      }}>
        {columns.map(column => (
          <Column
            key={column.id}
            column={column}
            onCardClick={onCardClick}
            onAddCard={onAddCard}
          />
        ))}
      </div>

      <DragOverlay>
        {activeCard ? (
          <div style={{ opacity: 0.8, transform: 'rotate(5deg)' }}>
            <Card card={activeCard} onClick={() => {}} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};
