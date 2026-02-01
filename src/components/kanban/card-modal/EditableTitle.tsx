'use client';

import React, { useState, useRef, useEffect } from 'react';
import { SaveIndicator } from './SaveIndicator';

type SaveState = 'idle' | 'saving' | 'saved' | 'error';

interface EditableTitleProps {
  value: string;
  onChange: (value: string) => void;
  onSave: () => Promise<void>;
  saveState?: SaveState;
}

export const EditableTitle: React.FC<EditableTitleProps> = ({
  value,
  onChange,
  onSave,
  saveState = 'idle',
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [displayValue, setDisplayValue] = useState(value);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setDisplayValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
      // Auto-resize
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [isEditing]);

  const handleClick = () => {
    setIsEditing(true);
  };

  const handleBlur = async () => {
    setIsEditing(false);
    await onSave();
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setDisplayValue(newValue);
    onChange(newValue);
    
    // Auto-resize
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleBlur();
    }
    if (e.key === 'Escape') {
      setIsEditing(false);
      setDisplayValue(value);
    }
  };

  return (
    <div>
      {isEditing ? (
        <div>
          <textarea
            ref={textareaRef}
            value={displayValue}
            onChange={handleChange}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            placeholder="Card title"
            style={{
              width: '100%',
              padding: '4px 8px',
              borderRadius: 4,
              border: '1px solid #0079bf',
              fontSize: 20,
              fontWeight: 600,
              fontFamily: 'inherit',
              lineHeight: 1.4,
              resize: 'none',
              overflow: 'hidden',
              background: '#ffffff',
              boxShadow: '0 0 0 2px rgba(0,121,191,0.2)',
              minHeight: 32,
            }}
          />
          <div style={{ marginTop: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
            <SaveIndicator state={saveState} />
            <span style={{ fontSize: 11, color: '#5e6c84' }}>
              Press Enter to save, Esc to cancel
            </span>
          </div>
        </div>
      ) : (
        <h2
          onClick={handleClick}
          style={{
            margin: 0,
            fontSize: 20,
            fontWeight: 600,
            color: '#172b4d',
            cursor: 'text',
            padding: '4px 8px',
            borderRadius: 4,
            transition: 'all 0.15s',
            minHeight: 32,
            display: 'flex',
            alignItems: 'center',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#f4f5f7';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
          }}
        >
          {displayValue || 'Untitled card'}
        </h2>
      )}
    </div>
  );
};
