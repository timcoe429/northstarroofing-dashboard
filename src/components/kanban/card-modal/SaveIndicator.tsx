'use client';

import React from 'react';

type SaveState = 'idle' | 'saving' | 'saved' | 'error';

interface SaveIndicatorProps {
  state: SaveState;
  fieldName?: string;
}

export const SaveIndicator: React.FC<SaveIndicatorProps> = ({ state, fieldName }) => {
  if (state === 'idle') return null;

  const getStyles = () => {
    switch (state) {
      case 'saving':
        return {
          color: '#5e6c84',
          fontSize: 12,
        };
      case 'saved':
        return {
          color: '#61bd4f',
          fontSize: 12,
        };
      case 'error':
        return {
          color: '#eb5a46',
          fontSize: 12,
        };
      default:
        return {};
    }
  };

  const getText = () => {
    switch (state) {
      case 'saving':
        return 'Saving...';
      case 'saved':
        return '✓ Saved';
      case 'error':
        return 'Failed to save';
      default:
        return '';
    }
  };

  return (
    <span style={getStyles()}>
      {getText()}
    </span>
  );
};
