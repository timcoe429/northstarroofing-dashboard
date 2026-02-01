'use client';

import React, { useState, useRef, useEffect } from 'react';
import { SaveIndicator } from './SaveIndicator';

type SaveState = 'idle' | 'saving' | 'saved' | 'error';
type FieldType = 'text' | 'textarea' | 'currency' | 'date' | 'email' | 'tel';

interface EditableFieldProps {
  label?: string;
  value: string | number | null;
  type?: FieldType;
  onChange: (value: string | number | null) => void;
  onSave: () => Promise<void>;
  placeholder?: string;
  saveState?: SaveState;
  required?: boolean;
  rows?: number;
}

export const EditableField: React.FC<EditableFieldProps> = ({
  label,
  value,
  type = 'text',
  onChange,
  onSave,
  placeholder,
  saveState = 'idle',
  required = false,
  rows = 3,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [displayValue, setDisplayValue] = useState('');
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  // Format value for display
  useEffect(() => {
    if (type === 'currency') {
      if (value === null || value === undefined || value === '') {
        setDisplayValue('');
      } else {
        const numValue = typeof value === 'string' ? parseFloat(value) : value;
        setDisplayValue(numValue ? `$${numValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '');
      }
    } else {
      setDisplayValue(value?.toString() || '');
    }
  }, [value, type]);

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      if (type === 'text' || type === 'currency') {
        (inputRef.current as HTMLInputElement).select();
      }
    }
  }, [isEditing, type]);

  const handleClick = () => {
    setIsEditing(true);
  };

  const handleBlur = async () => {
    setIsEditing(false);
    await onSave();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setDisplayValue(newValue);
    
    if (type === 'currency') {
      // Parse currency input
      const numValue = parseFloat(newValue.replace(/[^0-9.-]+/g, ''));
      onChange(isNaN(numValue) ? null : numValue);
    } else {
      onChange(newValue || null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && type !== 'textarea') {
      e.preventDefault();
      handleBlur();
    }
    if (e.key === 'Escape') {
      setIsEditing(false);
      // Reset to original value
      if (type === 'currency') {
        const numValue = typeof value === 'string' ? parseFloat(value) : value;
        setDisplayValue(numValue ? `$${numValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '');
      } else {
        setDisplayValue(value?.toString() || '');
      }
    }
  };

  const handleInputMouseEnter = (e: React.MouseEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!isEditing) {
      e.currentTarget.style.borderColor = '#c1c7d0';
      e.currentTarget.style.background = '#f4f5f7';
    }
  };

  const handleInputMouseLeave = (e: React.MouseEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!isEditing) {
      e.currentTarget.style.borderColor = '#dfe1e6';
      e.currentTarget.style.background = '#fafbfc';
    }
  };

  const renderInput = () => {
    const commonStyle = {
      width: '100%',
      padding: '12px 16px',
      borderRadius: 6,
      border: '1px solid #dfe1e6',
      fontSize: 14,
      fontFamily: 'inherit',
      background: isEditing ? '#ffffff' : '#fafbfc',
      transition: 'all 0.15s',
      ...(isEditing && {
        border: '2px solid #0079bf',
        boxShadow: '0 0 0 2px rgba(0,121,191,0.2)',
      }),
    };

    const commonProps = {
      ref: inputRef as any,
      value: type === 'currency' ? displayValue.replace('$', '').replace(/,/g, '') : displayValue,
      onChange: handleChange,
      onBlur: handleBlur,
      onKeyDown: handleKeyDown,
      onMouseEnter: handleInputMouseEnter,
      onMouseLeave: handleInputMouseLeave,
      placeholder,
      style: commonStyle,
    };

    if (type === 'textarea') {
      return (
        <textarea
          {...commonProps}
          rows={rows}
          style={{
            ...commonStyle,
            minHeight: 80,
            resize: 'vertical',
          }}
        />
      );
    }

    return (
      <input
        {...commonProps}
        type={type === 'currency' ? 'text' : type}
      />
    );
  };

  return (
    <div style={{ marginBottom: 16 }}>
      {label && (
        <label style={{
          display: 'block',
          fontSize: 12,
          fontWeight: 600,
          color: '#5e6c84',
          marginBottom: 6,
          textTransform: 'uppercase',
          letterSpacing: 0.5,
        }}>
          {label}
          {required && <span style={{ color: '#eb5a46' }}> *</span>}
        </label>
      )}
      {isEditing ? (
        <div>
          {renderInput()}
          <div style={{ marginTop: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
            <SaveIndicator state={saveState} />
            <span style={{ fontSize: 11, color: '#5e6c84' }}>
              Press Enter to save, Esc to cancel
            </span>
          </div>
        </div>
      ) : (
        <div
          onClick={handleClick}
          style={{
            padding: '12px 16px',
            borderRadius: 6,
            border: '1px solid #dfe1e6',
            fontSize: 14,
            color: displayValue ? '#172b4d' : '#5e6c84',
            cursor: 'text',
            minHeight: type === 'textarea' ? 80 : 38,
            background: '#fafbfc',
            transition: 'all 0.15s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#f4f5f7';
            e.currentTarget.style.borderColor = '#c1c7d0';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#fafbfc';
            e.currentTarget.style.borderColor = '#dfe1e6';
          }}
        >
          {displayValue || placeholder || 'Click to edit...'}
        </div>
      )}
    </div>
  );
};
