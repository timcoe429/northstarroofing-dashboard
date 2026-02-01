'use client';

import React from 'react';
import type { Label } from '@/types/kanban';

interface LabelSelectorProps {
  labels: Label[];
  selectedLabelIds: string[];
  onSelectionChange: (labelIds: string[]) => void;
}

export const LabelSelector: React.FC<LabelSelectorProps> = ({
  labels,
  selectedLabelIds,
  onSelectionChange,
}) => {
  const toggleLabel = (labelId: string) => {
    if (selectedLabelIds.includes(labelId)) {
      onSelectionChange(selectedLabelIds.filter(id => id !== labelId));
    } else {
      onSelectionChange([...selectedLabelIds, labelId]);
    }
  };

  return (
    <div>
      <label style={{ 
        display: 'block', 
        fontSize: 13, 
        fontWeight: 600, 
        color: '#334155', 
        marginBottom: 8 
      }}>
        Labels
      </label>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {labels.map(label => {
          const isSelected = selectedLabelIds.includes(label.id);
          return (
            <button
              key={label.id}
              onClick={() => toggleLabel(label.id)}
              style={{
                padding: '4px 10px',
                borderRadius: 4,
                border: `1px solid ${label.color}`,
                background: isSelected ? label.color : 'white',
                color: isSelected ? 'white' : label.color,
                fontSize: 11,
                fontWeight: isSelected ? 600 : 400,
                cursor: 'pointer',
                transition: 'all 0.15s',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              {isSelected && (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              )}
              {label.name}
            </button>
          );
        })}
      </div>
    </div>
  );
};
