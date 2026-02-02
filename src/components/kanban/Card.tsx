'use client';

import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { CardWithLabels } from '@/types/kanban';

interface CardProps {
  card: CardWithLabels;
  onClick: () => void;
}

export const Card: React.FC<CardProps> = ({ card, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const formatCurrency = (amount: number | null) => {
    if (!amount) return null;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getPriorityColor = (priority: string | null) => {
    switch (priority) {
      case 'urgent': return '#dc2626';
      case 'high': return '#f97316';
      case 'medium': return '#eab308';
      case 'low': return '#64748b';
      default: return 'transparent';
    }
  };

  const isOverdue = card.due_date && new Date(card.due_date) < new Date();
  const firstLabelColor = card.labels && card.labels.length > 0 ? card.labels[0].color : null;

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        ...style,
        position: 'relative',
        background: isHovered 
          ? `${isOverdue ? '#B1000F' : (firstLabelColor || '#00293f')}20` 
          : 'white',
        borderRadius: 8,
        padding: 12,
        marginBottom: 10,
        border: isOverdue 
          ? '3px solid #B1000F' 
          : (firstLabelColor ? `2px solid ${firstLabelColor}` : '1px solid #e2e8f0'),
        cursor: 'pointer',
        transition: 'background 0.15s',
      }}
    >
      {/* Priority indicator */}
      {card.priority && (
        <div
          style={{
            position: 'absolute',
            top: 8,
            right: 8,
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: getPriorityColor(card.priority),
          }}
        />
      )}

      {/* Address (primary identifier) */}
      <h4 style={{
        margin: '0 0 8px 0',
        fontSize: 13,
        fontWeight: 600,
        color: '#242424',
        lineHeight: 1.4,
      }}>
        {card.address}
      </h4>

      {/* Client name */}
      {card.client_name && (
        <p style={{
          margin: '0 0 6px 0',
          fontSize: 12,
          color: '#64748b',
        }}>
          {card.client_name}
        </p>
      )}

      {/* Job type */}
      {card.job_type && (
        <div style={{ marginBottom: 6 }}>
          <span style={{
            fontSize: 11,
            padding: '2px 6px',
            borderRadius: 4,
            background: '#f1f5f9',
            color: '#475569',
          }}>
            {card.job_type}
          </span>
        </div>
      )}

      {/* Labels */}
      {card.labels && card.labels.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 6 }}>
          {card.labels.map(label => (
            <span
              key={label.id}
              style={{
                fontSize: 10,
                padding: '2px 6px',
                borderRadius: 3,
                background: label.color + '20',
                color: label.color,
                border: `1px solid ${label.color}40`,
              }}
            >
              {label.name}
            </span>
          ))}
        </div>
      )}

      {/* Quote amount */}
      {card.quote_amount && (
        <div style={{
          marginTop: 8,
          paddingTop: 8,
          borderTop: '1px solid #e2e8f0',
        }}>
          <span style={{
            fontSize: 13,
            fontWeight: 600,
            color: '#242424',
          }}>
            {formatCurrency(card.quote_amount)}
          </span>
        </div>
      )}

      {/* Due date */}
      {card.due_date && (
        <div style={{ marginTop: 6 }}>
          <span style={{
            fontSize: 11,
            color: isOverdue ? '#B1000F' : '#64748b',
            fontWeight: isOverdue ? 600 : 400,
          }}>
            Due: {new Date(card.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        </div>
      )}
    </div>
  );
};
