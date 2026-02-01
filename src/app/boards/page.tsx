import React from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { BoardCard } from '@/components/kanban/BoardCard';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function BoardsPage() {
  let boardsWithStats: Array<{
    id: string;
    name: string;
    slug: string;
    created_at: string;
    card_count: number;
    in_progress_count: number;
  }> = [];
  let error: string | null = null;

  try {
    const supabase = createClient();
    
    // Fetch boards with columns and cards (left join to handle boards without columns)
    const { data: boards, error: queryError } = await supabase
      .from('boards')
      .select(`
        *,
        columns (
          name,
          cards (
            id,
            column_id
          )
        )
      `)
      .order('created_at', { ascending: true });

    if (queryError) {
      console.error('[Boards Page] Supabase query error:', queryError);
      error = `Database error: ${queryError.message}`;
    } else if (boards) {
      boardsWithStats = boards.map(board => {
        // Handle case where columns might be null or empty
        const columns = board.columns || [];
        const allCards = columns.flatMap((col: any) => col.cards || []);
        const inProgressColumns = columns.filter((col: any) => 
          col.name && ['In Progress', 'Estimate Sent', 'Proposal Sent'].includes(col.name)
        );
        const inProgressCards = inProgressColumns.flatMap((col: any) => col.cards || []);

        return {
          ...board,
          card_count: allCards.length,
          in_progress_count: inProgressCards.length,
        };
      });
    }
  } catch (err: any) {
    console.error('[Boards Page] Unexpected error:', err);
    error = err.message || 'An unexpected error occurred';
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f1f5f9', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      <Sidebar />
      <main style={{ flex: 1, marginLeft: 220 }}>
        <Header timeRange="6mo" />
        <div style={{ padding: 24 }}>
          <div style={{ marginBottom: 24 }}>
            <h1 style={{ margin: '0 0 8px 0', fontSize: 28, fontWeight: 600, color: '#00293f' }}>
              Project Boards
            </h1>
            <p style={{ margin: 0, fontSize: 14, color: '#64748b' }}>
              Manage your sales pipeline and production workflow
            </p>
          </div>

          {error ? (
            <div style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: 8,
              padding: 20,
              marginBottom: 20,
            }}>
              <h3 style={{ margin: '0 0 8px 0', fontSize: 16, fontWeight: 600, color: '#dc2626' }}>
                Error Loading Boards
              </h3>
              <p style={{ margin: '0 0 12px 0', fontSize: 14, color: '#991b1b' }}>
                {error}
              </p>
              <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>
                Please check your Supabase configuration and ensure the database tables are set up correctly.
                Check the server logs for more details.
              </p>
            </div>
          ) : boardsWithStats.length === 0 ? (
            <div style={{
              background: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: 12,
              padding: 48,
              textAlign: 'center',
            }}>
              <p style={{ margin: '0 0 8px 0', fontSize: 16, color: '#64748b' }}>
                No boards found
              </p>
              <p style={{ margin: 0, fontSize: 14, color: '#94a3b8' }}>
                Run the database migration to create boards and columns.
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
              {boardsWithStats.map(board => (
                <BoardCard key={board.id} board={board} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
