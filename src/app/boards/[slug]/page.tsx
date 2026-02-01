'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { Board } from '@/components/kanban/Board';
import { CardDetailModal } from '@/components/kanban/CardDetailModal';
import { 
  getBoardBySlug, 
  getColumnsWithCards, 
  getCardById, 
  createCard 
} from '@/lib/supabase/kanban';
import type { ColumnWithCards, CardWithLabels, Column } from '@/types/kanban';

export default function BoardViewPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [board, setBoard] = useState<any>(null);
  const [columns, setColumns] = useState<ColumnWithCards[]>([]);
  const [selectedCard, setSelectedCard] = useState<CardWithLabels | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadBoard();
  }, [slug]);

  const loadBoard = async () => {
    setIsLoading(true);
    try {
      const boardData = await getBoardBySlug(slug);
      if (!boardData) {
        console.error('Board not found');
        return;
      }
      setBoard(boardData);
      
      const columnsData = await getColumnsWithCards(boardData.id);
      setColumns(columnsData);
    } catch (error) {
      console.error('Error loading board:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCardClick = async (cardId: string) => {
    try {
      const card = await getCardById(cardId);
      if (card) {
        setSelectedCard(card);
        setIsModalOpen(true);
      }
    } catch (error) {
      console.error('Error loading card:', error);
    }
  };

  const handleAddCard = async (
    columnId: string, 
    data: { address: string; job_type?: string; client_name?: string }
  ) => {
    try {
      await createCard(columnId, data);
      await loadBoard(); // Reload to get updated cards
    } catch (error) {
      console.error('Error creating card:', error);
      throw error;
    }
  };

  const handleCardChange = () => {
    loadBoard();
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: '#f1f5f9' }}>
        <Sidebar />
        <main style={{ flex: 1, marginLeft: 220, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ color: '#64748b' }}>Loading board...</p>
        </main>
      </div>
    );
  }

  if (!board) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: '#f1f5f9' }}>
        <Sidebar />
        <main style={{ flex: 1, marginLeft: 220, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ color: '#dc2626' }}>Board not found</p>
        </main>
      </div>
    );
  }

  const columnsForModal: Column[] = columns.map(col => ({
    id: col.id,
    board_id: col.board_id,
    name: col.name,
    position: col.position,
    color: col.color,
    created_at: col.created_at,
  }));

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f1f5f9', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      <Sidebar />
      <main style={{ flex: 1, marginLeft: 220 }}>
        <Header timeRange="6mo" onTimeRangeChange={() => {}} />
        <div style={{ padding: 24 }}>
          <div style={{ marginBottom: 20 }}>
            <h1 style={{ margin: '0 0 8px 0', fontSize: 28, fontWeight: 600, color: '#00293f' }}>
              {board.name}
            </h1>
            <p style={{ margin: 0, fontSize: 14, color: '#64748b' }}>
              Manage your projects and track progress
            </p>
          </div>

          <div style={{ 
            background: 'white', 
            borderRadius: 12, 
            border: '1px solid #e2e8f0',
            padding: 16,
            minHeight: 'calc(100vh - 200px)',
          }}>
            <Board
              columns={columns}
              onCardClick={handleCardClick}
              onAddCard={handleAddCard}
              onCardsChange={handleCardChange}
            />
          </div>
        </div>
      </main>

      <CardDetailModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedCard(null);
        }}
        card={selectedCard}
        columns={columnsForModal}
        onCardChange={handleCardChange}
      />
    </div>
  );
}
