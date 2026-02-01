'use client';

import React, { useState } from 'react';
import type { CardFile } from '@/types/kanban';
import { uploadCardFile, deleteCardFile, getFileUrl } from '@/lib/supabase/kanban';

interface FileUploadProps {
  cardId: string;
  files: CardFile[];
  onFilesChange: () => void;
}

const FILE_TYPES: Array<{ value: CardFile['file_type']; label: string }> = [
  { value: 'estimate', label: 'Estimate' },
  { value: 'roof_scope', label: 'Roof Scope' },
  { value: 'photo', label: 'Photo' },
  { value: 'contract', label: 'Contract' },
  { value: 'other', label: 'Other' },
];

export const FileUpload: React.FC<FileUploadProps> = ({ cardId, files, onFilesChange }) => {
  const [uploading, setUploading] = useState(false);
  const [selectedFileType, setSelectedFileType] = useState<CardFile['file_type']>('other');

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      await uploadCardFile(cardId, file, selectedFileType);
      onFilesChange();
      e.target.value = ''; // Reset input
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Failed to upload file. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (fileId: string) => {
    if (!confirm('Are you sure you want to delete this file?')) return;

    try {
      await deleteCardFile(fileId);
      onFilesChange();
    } catch (error) {
      console.error('Error deleting file:', error);
      alert('Failed to delete file. Please try again.');
    }
  };

  const handleDownload = async (file: CardFile) => {
    try {
      const url = await getFileUrl(file.file_path);
      window.open(url, '_blank');
    } catch (error) {
      console.error('Error getting file URL:', error);
      alert('Failed to download file. Please try again.');
    }
  };

  const filesByType = FILE_TYPES.map(type => ({
    type: type.value,
    label: type.label,
    files: files.filter(f => f.file_type === type.value),
  }));

  return (
    <div>
      <div style={{ marginBottom: 12 }}>
        <label style={{ 
          display: 'block', 
          fontSize: 13, 
          fontWeight: 600, 
          color: '#334155', 
          marginBottom: 8 
        }}>
          Files
        </label>
        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          <select
            value={selectedFileType}
            onChange={(e) => setSelectedFileType(e.target.value as CardFile['file_type'])}
            style={{
              flex: 1,
              padding: '6px 10px',
              borderRadius: 4,
              border: '1px solid #e2e8f0',
              fontSize: 12,
              background: 'white',
            }}
          >
            {FILE_TYPES.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
          <label
            style={{
              padding: '6px 12px',
              borderRadius: 4,
              border: '1px solid #00293f',
              background: uploading ? '#94a3b8' : '#00293f',
              color: 'white',
              fontSize: 12,
              fontWeight: 600,
              cursor: uploading ? 'not-allowed' : 'pointer',
              display: 'inline-block',
            }}
          >
            {uploading ? 'Uploading...' : 'Upload'}
            <input
              type="file"
              onChange={handleFileSelect}
              disabled={uploading}
              style={{ display: 'none' }}
            />
          </label>
        </div>
      </div>

      {filesByType.map(({ type, label, files: typeFiles }) => {
        if (typeFiles.length === 0) return null;

        return (
          <div key={type} style={{ marginBottom: 16 }}>
            <h4 style={{ 
              fontSize: 12, 
              fontWeight: 600, 
              color: '#64748b', 
              marginBottom: 6,
              marginTop: 0,
            }}>
              {label}
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {typeFiles.map(file => (
                <div
                  key={file.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '6px 10px',
                    background: '#f8fafc',
                    borderRadius: 4,
                    border: '1px solid #e2e8f0',
                  }}
                >
                  <span
                    onClick={() => handleDownload(file)}
                    style={{
                      flex: 1,
                      fontSize: 12,
                      color: '#00293f',
                      cursor: 'pointer',
                      textDecoration: 'underline',
                    }}
                  >
                    {file.file_name}
                    {file.file_size && (
                      <span style={{ color: '#64748b', marginLeft: 8 }}>
                        ({(file.file_size / 1024).toFixed(1)} KB)
                      </span>
                    )}
                  </span>
                  <button
                    onClick={() => handleDelete(file.id)}
                    style={{
                      padding: '2px 6px',
                      borderRadius: 4,
                      border: '1px solid #e2e8f0',
                      background: 'white',
                      color: '#dc2626',
                      fontSize: 11,
                      cursor: 'pointer',
                      marginLeft: 8,
                    }}
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {files.length === 0 && (
        <p style={{ fontSize: 12, color: '#64748b', fontStyle: 'italic' }}>
          No files uploaded yet
        </p>
      )}
    </div>
  );
};
