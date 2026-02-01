'use client';

import React, { useState, useRef, useEffect } from 'react';
import type { CardFile } from '@/types/kanban';
import { uploadCardFile, deleteCardFile, getFileUrl } from '@/lib/supabase/kanban';

interface FileAttachmentsProps {
  cardId: string;
  files: CardFile[];
  onFilesChange: () => Promise<void>;
  triggerUploadRef?: React.MutableRefObject<(() => void) | null>;
}

export const FileAttachments: React.FC<FileAttachmentsProps> = ({
  cardId,
  files,
  onFilesChange,
}) => {
  const [hoveredFileId, setHoveredFileId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // Expose upload trigger via ref
  useEffect(() => {
    if (triggerUploadRef) {
      triggerUploadRef.current = handleUploadClick;
    }
  }, [triggerUploadRef]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    setIsUploading(true);
    try {
      for (const file of Array.from(selectedFiles)) {
        // Determine file type based on extension or use 'other' as default
        let fileType: CardFile['file_type'] = 'other';
        const ext = file.name.split('.').pop()?.toLowerCase();
        if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) {
          fileType = 'photo';
        } else if (['pdf'].includes(ext || '')) {
          fileType = 'contract';
        } else if (['doc', 'docx', 'xls', 'xlsx'].includes(ext || '')) {
          fileType = 'estimate';
        }

        await uploadCardFile(cardId, file, fileType);
      }
      await onFilesChange();
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Failed to upload file. Please try again.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDelete = async (fileId: string) => {
    if (!confirm('Are you sure you want to delete this file?')) return;

    try {
      await deleteCardFile(fileId);
      await onFilesChange();
    } catch (error) {
      console.error('Error deleting file:', error);
      alert('Failed to delete file. Please try again.');
    }
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (fileType: CardFile['file_type']) => {
    switch (fileType) {
      case 'photo':
        return '🖼️';
      case 'pdf':
      case 'contract':
        return '📄';
      case 'estimate':
        return '📊';
      default:
        return '📎';
    }
  };

  return (
    <div data-section="attachments">
      <h3 style={{
        fontSize: 14,
        fontWeight: 600,
        color: '#172b4d',
        marginBottom: 12,
        marginTop: 0,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
      }}>
        Attachments
      </h3>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        style={{ display: 'none' }}
        onChange={handleFileSelect}
      />

      {files.length === 0 && !isUploading ? (
        <div
          onClick={handleUploadClick}
          style={{
            padding: '24px',
            border: '2px dashed #dfe1e6',
            borderRadius: 8,
            textAlign: 'center',
            cursor: 'pointer',
            color: '#5e6c84',
            fontSize: 13,
            transition: 'all 0.15s',
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
          + Upload files
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 12 }}>
          {files.map((file) => (
            <div
              key={file.id}
              onMouseEnter={() => setHoveredFileId(file.id)}
              onMouseLeave={() => setHoveredFileId(null)}
              style={{
                position: 'relative',
                padding: 8,
                borderRadius: 8,
                border: '1px solid #dfe1e6',
                background: '#fafbfc',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
              onClick={async () => {
                try {
                  const url = await getFileUrl(file.file_path);
                  window.open(url, '_blank');
                } catch (error) {
                  console.error('Error opening file:', error);
                }
              }}
            >
              {/* File icon/thumbnail */}
              <div style={{
                fontSize: 32,
                textAlign: 'center',
                marginBottom: 8,
              }}>
                {getFileIcon(file.file_type)}
              </div>
              
              {/* File name */}
              <div style={{
                fontSize: 11,
                color: '#172b4d',
                fontWeight: 500,
                marginBottom: 4,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {file.file_name}
              </div>
              
              {/* File size */}
              <div style={{
                fontSize: 10,
                color: '#5e6c84',
              }}>
                {formatFileSize(file.file_size)}
              </div>

              {/* Delete button on hover */}
              {hoveredFileId === file.id && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(file.id);
                  }}
                  style={{
                    position: 'absolute',
                    top: 4,
                    right: 4,
                    width: 24,
                    height: 24,
                    borderRadius: 4,
                    border: 'none',
                    background: '#eb5a46',
                    color: 'white',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 12,
                  }}
                >
                  ×
                </button>
              )}
            </div>
          ))}
          
          {/* Upload button */}
          <div
            onClick={handleUploadClick}
            style={{
              padding: '24px 8px',
              border: '2px dashed #dfe1e6',
              borderRadius: 8,
              textAlign: 'center',
              cursor: 'pointer',
              color: '#5e6c84',
              fontSize: 11,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s',
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
            {isUploading ? 'Uploading...' : '+'}
          </div>
        </div>
      )}
    </div>
  );
};
