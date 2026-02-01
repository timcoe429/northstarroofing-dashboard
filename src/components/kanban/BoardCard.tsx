'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface BoardCardProps {
  board: {
    id: string;
    name: string;
    slug: string;
    card_count: number;
    in_progress_count: number;
  };
}

export const BoardCard: React.FC<BoardCardProps> = ({ board }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link
      href={`/boards/${board.slug}`}
      style={{
        textDecoration: 'none',
        color: 'inherit',
      }}
    >
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          background: 'white',
          borderRadius: 12,
          border: '1px solid #e2e8f0',
          padding: 24,
          cursor: 'pointer',
          transition: 'all 0.2s',
          boxShadow: isHovered ? '0 4px 12px rgba(0,0,0,0.15)' : '0 1px 3px rgba(0,0,0,0.1)',
          transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
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
  );
};
