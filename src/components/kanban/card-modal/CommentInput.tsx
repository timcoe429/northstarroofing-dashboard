'use client';

import React, { useState, useRef, useEffect } from 'react';

interface CommentInputProps {
  onSubmit: (comment: string) => Promise<void>;
  isSubmitting?: boolean;
}

export const CommentInput: React.FC<CommentInputProps> = ({
  onSubmit,
  isSubmitting = false,
}) => {
  const [comment, setComment] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [comment]);

  const handleSubmit = async () => {
    if (!comment.trim() || isSubmitting) return;
    
    const commentText = comment.trim();
    setComment('');
    await onSubmit(commentText);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div>
      <textarea
        ref={textareaRef}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Write a comment..."
        disabled={isSubmitting}
        style={{
          width: '100%',
          padding: '8px 12px',
          borderRadius: 4,
          border: '1px solid #dfe1e6',
          fontSize: 14,
          fontFamily: 'inherit',
          resize: 'none',
          overflow: 'hidden',
          minHeight: 60,
          background: '#ffffff',
          transition: 'all 0.15s',
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = '#0079bf';
          e.currentTarget.style.boxShadow = '0 0 0 2px rgba(0,121,191,0.2)';
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = '#dfe1e6';
          e.currentTarget.style.boxShadow = 'none';
        }}
      />
      <div style={{ marginTop: 8, display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={handleSubmit}
          disabled={!comment.trim() || isSubmitting}
          style={{
            padding: '6px 16px',
            borderRadius: 4,
            border: 'none',
            background: comment.trim() && !isSubmitting ? '#0079bf' : '#dfe1e6',
            color: comment.trim() && !isSubmitting ? 'white' : '#5e6c84',
            fontSize: 13,
            fontWeight: 500,
            cursor: comment.trim() && !isSubmitting ? 'pointer' : 'not-allowed',
            transition: 'all 0.15s',
          }}
          onMouseEnter={(e) => {
            if (comment.trim() && !isSubmitting) {
              e.currentTarget.style.background = '#026aa7';
            }
          }}
          onMouseLeave={(e) => {
            if (comment.trim() && !isSubmitting) {
              e.currentTarget.style.background = '#0079bf';
            }
          }}
        >
          {isSubmitting ? 'Saving...' : 'Save'}
        </button>
      </div>
      <div style={{ marginTop: 4, fontSize: 11, color: '#5e6c84' }}>
        Press Ctrl+Enter or Cmd+Enter to save
      </div>
    </div>
  );
};
