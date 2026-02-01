'use client';

import React, { useState, useRef, useEffect } from 'react';
import type { Label } from '@/types/kanban';

interface LabelPickerProps {
  isOpen: boolean;
  onClose: () => void;
  allLabels: Label[];
  selectedLabelIds: string[];
  onToggleLabel: (labelId: string) => void;
  anchorElement?: HTMLElement | null;
}

export const LabelPicker: React.FC<LabelPickerProps> = ({
  isOpen,
  onClose,
  allLabels,
  selectedLabelIds,
  onToggleLabel,
  anchorElement,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        if (anchorElement && anchorElement.contains(e.target as Node)) {
          return; // Don't close if clicking the anchor
        }
        onClose();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose, anchorElement]);

  // Calculate position relative to anchor
  useEffect(() => {
    if (anchorElement && isOpen) {
      const rect = anchorElement.getBoundingClientRect();
      setPosition({
        top: rect.bottom + 4,
        left: rect.left,
      });
    }
  }, [anchorElement, isOpen]);

  if (!isOpen) return null;

  const filteredLabels = allLabels.filter(label =>
    label.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div
      ref={popoverRef}
      style={{
        position: 'fixed',
        top: `${position.top}px`,
        left: `${position.left}px`,
        background: '#ffffff',
        borderRadius: 8,
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        border: '1px solid #dfe1e6',
        zIndex: 1000,
        minWidth: 280,
        maxWidth: 320,
        maxHeight: 400,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Search input */}
      <div style={{ padding: 8, borderBottom: '1px solid #dfe1e6' }}>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search labels..."
          autoFocus
          style={{
            width: '100%',
            padding: '6px 8px',
            borderRadius: 4,
            border: '1px solid #dfe1e6',
            fontSize: 14,
            fontFamily: 'inherit',
          }}
        />
      </div>

      {/* Labels list */}
      <div style={{ overflowY: 'auto', maxHeight: 300 }}>
        {filteredLabels.length === 0 ? (
          <div style={{ padding: 16, textAlign: 'center', color: '#5e6c84', fontSize: 13 }}>
            {searchQuery ? 'No labels found' : 'No labels available'}
          </div>
        ) : (
          filteredLabels.map((label) => {
            const isSelected = selectedLabelIds.includes(label.id);
            return (
              <button
                key={label.id}
                onClick={() => {
                  onToggleLabel(label.id);
                }}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: 'none',
                  background: isSelected ? '#e4f0f6' : 'transparent',
                  textAlign: 'left',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: 14,
                  color: '#172b4d',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = isSelected ? '#d4e8f0' : '#f4f5f7';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = isSelected ? '#e4f0f6' : 'transparent';
                }}
              >
                {/* Checkbox */}
                <div
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: 3,
                    border: `2px solid ${label.color}`,
                    background: isSelected ? label.color : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {isSelected && (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </div>
                {/* Label color indicator */}
                <div
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 3,
                    background: label.color,
                    flexShrink: 0,
                  }}
                />
                {/* Label name */}
                <span style={{ flex: 1 }}>{label.name}</span>
              </button>
            );
          })
        )}
      </div>

      {/* Create new label option (future enhancement) */}
      <div style={{ padding: 8, borderTop: '1px solid #dfe1e6' }}>
        <button
          onClick={() => {
            // TODO: Implement create label functionality
            console.log('Create new label');
          }}
          style={{
            width: '100%',
            padding: '8px',
            borderRadius: 4,
            border: '1px dashed #dfe1e6',
            background: 'transparent',
            color: '#5e6c84',
            fontSize: 13,
            cursor: 'pointer',
            textAlign: 'center',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#0079bf';
            e.currentTarget.style.color = '#0079bf';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#dfe1e6';
            e.currentTarget.style.color = '#5e6c84';
          }}
        >
          + Create new label
        </button>
      </div>
    </div>
  );
};
