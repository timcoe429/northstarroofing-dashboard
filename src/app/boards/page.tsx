import React from 'react';
import Link from 'next/link';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { createClient } from '@/lib/supabase/server';

export default async function BoardsPage() {
  const supabase = createClient();
  
  // For server component, we'll fetch directly
  const { data: boards } = await supabase
    .from('boards')
    .select(`
      *,
      columns!inner (
        cards (
          id,
          column_id
        )
      )
    `)
    .order('created_at', { ascending: true });

  const boardsWithStats = (boards || []).map(board => {
    const allCards = board.columns.flatMap((col: any) => col.cards || []);
    const inProgressColumns = board.columns.filter((col: any) => 
      ['In Progress', 'Estimate Sent', 'Proposal Sent'].includes(col.name)
    );
    const inProgressCards = inProgressColumns.flatMap((col: any) => col.cards || []);

    return {
      ...board,
      card_count: allCards.length,
      in_progress_count: inProgressCards.length,
    };
  });

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f1f5f9', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      <Sidebar />
      <main style={{ flex: 1, marginLeft: 220 }}>
        <Header timeRange="6mo" onTimeRangeChange={() => {}} />
        <div style={{ padding: 24 }}>
          <div style={{ marginBottom: 24 }}>
            <h1 style={{ margin: '0 0 8px 0', fontSize: 28, fontWeight: 600, color: '#00293f' }}>
              Project Boards
            </h1>
            <p style={{ margin: 0, fontSize: 14, color: '#64748b' }}>
              Manage your sales pipeline and production workflow
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
            {boardsWithStats.map(board => (
              <Link
                key={board.id}
                href={`/boards/${board.slug}`}
                style={{
                  textDecoration: 'none',
                  color: 'inherit',
                }}
              >
                <div
                  style={{
                    background: 'white',
                    borderRadius: 12,
                    border: '1px solid #e2e8f0',
                    padding: 24,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  }}
                  className="board-card"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <h2 style={{ 
                    margin: '0 0 12px 0', 
                    fontSize: 20, 
                    fontWeight: 600, 
                    color: '#00293f' 
                  }}>
                    {board.name}
                  </h2>
                  <div style={{ display: 'flex', gap: 16, marginTop: 16 }}>
                    <div>
                      <div style={{ fontSize: 24, fontWeight: 600, color: '#00293f' }}>
                        {board.card_count}
                      </div>
                      <div style={{ fontSize: 12, color: '#64748b' }}>Total Cards</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 24, fontWeight: 600, color: '#B1000F' }}>
                        {board.in_progress_count}
                      </div>
                      <div style={{ fontSize: 12, color: '#64748b' }}>In Progress</div>
                    </div>
                  </div>
                  <div style={{ 
                    marginTop: 16, 
                    paddingTop: 16, 
                    borderTop: '1px solid #e2e8f0',
                    fontSize: 13,
                    color: '#00293f',
                    fontWeight: 500,
                  }}>
                    View Board →
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
