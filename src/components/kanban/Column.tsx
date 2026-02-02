'use client';

import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Card } from './Card';
import { AddCardForm } from './AddCardForm';
import type { ColumnWithCards, CardWithLabels } from '@/types/kanban';

interface ColumnProps {
  column: ColumnWithCards;
  onCardClick: (cardId: string) => void;
  onAddCard: (columnId: string, data: { address: string; job_type?: string; client_name?: string }) => Promise<void>;
}

export const Column: React.FC<ColumnProps> = ({ column, onCardClick, onAddCard }) => {
  const { setNodeRef } = useDroppable({
    id: column.id,
  });

  const [showAddForm, setShowAddForm] = React.useState(false);

  const cardIds = column.cards.map(card => card.id);

  return (
    <div
      ref={setNodeRef}
      style={{
        minWidth: 280,
        maxWidth: 280,
        background: '#ebecf0',
        borderRadius: 8,
        padding: 12,
        marginRight: 16,
        display: 'flex',
        flexDirection: 'column',
        height: 'fit-content',
        maxHeight: 'calc(100vh - 120px)',
      }}
    >
      {/* Column header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
        paddingBottom: 12,
        borderBottom: '2px solid #00293f',
      }}>
        <h3 style={{
          margin: 0,
          fontSize: 14,
          fontWeight: 600,
          color: '#242424',
        }}>
          {column.name}
        </h3>
        <span style={{
          fontSize: 12,
          color: 'white',
          background: '#00293f',
          padding: '2px 8px',
          borderRadius: 10,
          fontWeight: 500,
        }}>
          {column.cards.length}
        </span>
      </div>

      {/* Cards */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        marginBottom: 12,
      }}>
        <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
          {column.cards.map(card => (
            <Card
              key={card.id}
              card={card}
              onClick={() => onCardClick(card.id)}
            />
          ))}
        </SortableContext>
      </div>

      {/* Add card form or button */}
      {showAddForm ? (
        <AddCardForm
          columnId={column.id}
          onCancel={() => setShowAddForm(false)}
          onSubmit={async (data) => {
            await onAddCard(column.id, data);
            setShowAddForm(false);
          }}
        />
      ) : (
        <button
          onClick={() => setShowAddForm(true)}
          style={{
            width: '100%',
            padding: '8px',
            borderRadius: 6,
            border: '1px dashed #cbd5e1',
            background: 'white',
            color: '#00293f',
            fontSize: 12,
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all 0.15s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#00293f';
            e.currentTarget.style.color = '#00293f';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#cbd5e1';
            e.currentTarget.style.color = '#00293f';
          }}
        >
          + Add Card
        </button>
      )}
    </div>
  );
};
