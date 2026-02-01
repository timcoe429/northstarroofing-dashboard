'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  onCardsChange?: () => void;
}

export const Board: React.FC<BoardProps> = ({ columns, onCardClick, onAddCard, onCardsChange }) => {
  const [activeCard, setActiveCard] = useState<CardWithLabels | null>(null);
  const [localColumns, setLocalColumns] = useState<ColumnWithCards[]>(columns);
  const [error, setError] = useState<string | null>(null);
  
  // Panning state
  const [isPanning, setIsPanning] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);
  
  // Ref for columns wrapper div
  const boardRef = useRef<HTMLDivElement>(null);

  // Sync local state when columns prop changes (e.g., after adding a card)
  useEffect(() => {
    setLocalColumns(columns);
  }, [columns]);

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
    setError(null); // Clear any previous errors
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveCard(null);

    if (!over) return;

    const cardId = active.id as string;
    const card = findCardById(cardId);
    if (!card) return;

    // Check if dropping on a column or another card
    const targetColumn = localColumns.find(col => col.id === over.id);
    const targetCard = targetColumn ? null : findCardById(over.id as string);
    
    let newColumnId: string;
    let newPosition: number;

    if (targetColumn) {
      // Dropped on a column (moving between columns)
      newColumnId = targetColumn.id;
      newPosition = targetColumn.cards.length;
    } else if (targetCard) {
      // Dropped on another card (reordering within same column or moving to different column)
      const targetCardColumn = localColumns.find(col => 
        col.cards.some(c => c.id === targetCard.id)
      );
      if (!targetCardColumn) return;
      
      newColumnId = targetCardColumn.id;
      const targetIndex = targetCardColumn.cards.findIndex(c => c.id === targetCard.id);
      newPosition = targetIndex >= 0 ? targetIndex : targetCardColumn.cards.length;
    } else {
      return;
    }

    // If no change, do nothing
    if (card.column_id === newColumnId && card.position === newPosition) return;

    // Store previous state for potential revert
    const previousColumns = JSON.parse(JSON.stringify(localColumns)) as ColumnWithCards[];

    // Optimistically update local state immediately
    const updatedColumns = localColumns.map(col => {
      if (col.id === card.column_id && col.id === newColumnId) {
        // Reordering within same column
        const cards = [...col.cards];
        const oldIndex = cards.findIndex(c => c.id === cardId);
        if (oldIndex === -1) return col;
        
        cards.splice(oldIndex, 1);
        cards.splice(newPosition, 0, { ...card, column_id: newColumnId, position: newPosition });
        
        // Update positions for all cards
        return {
          ...col,
          cards: cards.map((c, idx) => ({ ...c, position: idx })),
        };
      } else if (col.id === card.column_id) {
        // Remove card from old column
        return {
          ...col,
          cards: col.cards.filter(c => c.id !== cardId).map((c, idx) => ({ ...c, position: idx })),
        };
      } else if (col.id === newColumnId) {
        // Add card to new column
        const cards = [...col.cards];
        cards.splice(newPosition, 0, { ...card, column_id: newColumnId, position: newPosition });
        
        // Update positions for all cards
        return {
          ...col,
          cards: cards.map((c, idx) => ({ ...c, position: idx })),
        };
      }
      return col;
    });

    setLocalColumns(updatedColumns);

    // Make DB call in background (fire-and-forget with error handling)
    moveCard(cardId, newColumnId, newPosition)
      .then(() => {
        // Success - state already updated, just clear any errors
        setError(null);
      })
      .catch((err) => {
        console.error('Error moving card:', err);
        // Revert to previous state on error
        setLocalColumns(previousColumns);
        const errorMessage = err.message || 'Failed to move card. Please try again.';
        setError(errorMessage);
        // Auto-dismiss error after 5 seconds
        setTimeout(() => {
          setError(null);
        }, 5000);
      });
  };

  const findCardById = (cardId: string): CardWithLabels | null => {
    for (const column of localColumns) {
      const card = column.cards.find(c => c.id === cardId);
      if (card) return card;
    }
    return null;
  };

  // Panning handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    
    // Diagnostic logging
    const isOnCard = !!(target.closest('[style*="background: white"]') && target.closest('[style*="border-radius: 8"]'));
    const isOnButton = !!target.closest('button');
    const isOnColumn = target.closest('[style*="background: #f8fafc"]') !== null;
    const isOnHeader = !!target.closest('h3');
    const isOnCardsContainer = !!target.closest('[style*="flex: 1"]');
    
    console.log('mousedown', { 
      target: e.target, 
      targetTag: target.tagName,
      targetClasses: target.className,
      isOnCard,
      isOnButton,
      isOnColumn,
      isOnHeader,
      isOnCardsContainer,
      activeCard: !!activeCard,
    });
    
    // Don't start panning if a card is being dragged
    if (activeCard) {
      console.log('Panning blocked: card is being dragged');
      return;
    }
    
    // Check if clicking on interactive elements (buttons, links, inputs, etc.)
    if (isOnButton || target.closest('a, input, select, textarea, [role="button"]')) {
      console.log('Panning blocked: clicking on interactive element');
      return;
    }
    
    // Block cards (they have dnd-kit drag handlers)
    if (isOnCard) {
      console.log('Panning blocked: clicking on card');
      return;
    }
    
    // Helper function to find scroll container and start panning
    const startPanning = () => {
      if (!boardRef.current) return;
      
      setIsPanning(true);
      // Find scrollable parent container
      let scrollContainer: HTMLElement | null = boardRef.current.parentElement;
      
      // Traverse up to find the element with overflow-x: auto
      while (scrollContainer && scrollContainer !== document.body) {
        const style = window.getComputedStyle(scrollContainer);
        if (style.overflowX === 'auto' || style.overflowX === 'scroll' || 
            style.overflow === 'auto' || style.overflow === 'scroll') {
          break;
        }
        scrollContainer = scrollContainer.parentElement;
      }
      
      if (scrollContainer) {
        setStartX(e.pageX);
        setStartY(e.pageY);
        setScrollLeft(scrollContainer.scrollLeft);
        setScrollTop(scrollContainer.scrollTop);
        console.log('Panning started', { scrollContainer, scrollLeft: scrollContainer.scrollLeft });
        e.preventDefault();
      } else {
        console.log('Panning blocked: no scroll container found');
        setIsPanning(false);
      }
    };
    
    // Allow panning on column backgrounds (empty space in columns)
    // Check if we're clicking on the column div itself or empty space within it
    const columnElement = target.closest('[style*="background: #f8fafc"]');
    if (columnElement) {
      // Check if clicking on column header or cards container - don't pan
      // But allow panning on the column background itself (empty space)
      if (!isOnHeader && !isOnCardsContainer) {
        // Clicking on column background - allow panning
        console.log('Panning allowed: clicking on column background');
        startPanning();
      } else {
        console.log('Panning blocked: clicking on column header or cards container');
      }
      return;
    }
    
    // Allow panning on board background (between columns or padding)
    if (target === boardRef.current || 
        (boardRef.current && boardRef.current.contains(target))) {
      console.log('Panning allowed: clicking on board background');
      startPanning();
    } else {
      console.log('Panning blocked: target not on board');
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning || !boardRef.current) return;
    
    e.preventDefault();
    
    // Find scrollable parent container
    let scrollContainer: HTMLElement | null = boardRef.current.parentElement;
    while (scrollContainer && scrollContainer !== document.body) {
      const style = window.getComputedStyle(scrollContainer);
      if (style.overflowX === 'auto' || style.overflowX === 'scroll' || 
          style.overflow === 'auto' || style.overflow === 'scroll') {
        break;
      }
      scrollContainer = scrollContainer.parentElement;
    }
    
    if (scrollContainer) {
      const x = e.pageX;
      const y = e.pageY;
      const walkX = (x - startX) * 1.5; // Multiply for faster scroll
      const walkY = (y - startY) * 1.5;
      scrollContainer.scrollLeft = scrollLeft - walkX;
      scrollContainer.scrollTop = scrollTop - walkY;
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const handleMouseLeave = () => {
    setIsPanning(false);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {error && (
        <div style={{
          position: 'fixed',
          top: 80,
          right: 24,
          background: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: 8,
          padding: '12px 16px',
          zIndex: 1000,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          maxWidth: 300,
        }}>
          <p style={{ margin: 0, fontSize: 13, color: '#991b1b' }}>{error}</p>
        </div>
      )}
      <div 
        ref={boardRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        style={{
          display: 'flex',
          flexWrap: 'nowrap',
          padding: '16px 0',
          minHeight: 'calc(100vh - 120px)',
          width: 'max-content',
          minWidth: `${localColumns.length * 296}px`, // 280px column + 16px margin
          cursor: isPanning ? 'grabbing' : 'grab',
          userSelect: 'none', // Prevent text selection while panning
        }}
      >
        {localColumns.map(column => (
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
