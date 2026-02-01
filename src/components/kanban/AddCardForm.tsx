'use client';

import React, { useState } from 'react';

interface AddCardFormProps {
  columnId: string;
  onCancel: () => void;
  onSubmit: (data: { address: string; job_type?: string; client_name?: string }) => Promise<void>;
}

export const AddCardForm: React.FC<AddCardFormProps> = ({ columnId, onCancel, onSubmit }) => {
  const [address, setAddress] = useState('');
  const [jobType, setJobType] = useState('');
  const [clientName, setClientName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        address: address.trim(),
        job_type: jobType || undefined,
        client_name: clientName || undefined,
      });
      setAddress('');
      setJobType('');
      setClientName('');
    } catch (error) {
      console.error('Error creating card:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ padding: '8px' }}>
      <input
        type="text"
        placeholder="Property address"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        required
        autoFocus
        style={{
          width: '100%',
          padding: '8px',
          borderRadius: 4,
          border: '1px solid #e2e8f0',
          fontSize: 13,
          marginBottom: 6,
        }}
      />
      <input
        type="text"
        placeholder="Client name (optional)"
        value={clientName}
        onChange={(e) => setClientName(e.target.value)}
        style={{
          width: '100%',
          padding: '8px',
          borderRadius: 4,
          border: '1px solid #e2e8f0',
          fontSize: 13,
          marginBottom: 6,
        }}
      />
      <select
        value={jobType}
        onChange={(e) => setJobType(e.target.value)}
        style={{
          width: '100%',
          padding: '8px',
          borderRadius: 4,
          border: '1px solid #e2e8f0',
          fontSize: 13,
          marginBottom: 8,
          background: 'white',
        }}
      >
        <option value="">Job Type (optional)</option>
        <option value="Full Replacement">Full Replacement</option>
        <option value="Repair">Repair</option>
        <option value="Inspection">Inspection</option>
        <option value="Gutters">Gutters</option>
      </select>
      <div style={{ display: 'flex', gap: 6 }}>
        <button
          type="submit"
          disabled={isSubmitting || !address.trim()}
          style={{
            flex: 1,
            padding: '6px 12px',
            borderRadius: 4,
            border: 'none',
            background: '#00293f',
            color: 'white',
            fontSize: 12,
            fontWeight: 600,
            cursor: isSubmitting || !address.trim() ? 'not-allowed' : 'pointer',
            opacity: isSubmitting || !address.trim() ? 0.5 : 1,
          }}
        >
          Add Card
        </button>
        <button
          type="button"
          onClick={onCancel}
          style={{
            padding: '6px 12px',
            borderRadius: 4,
            border: '1px solid #e2e8f0',
            background: 'white',
            color: '#64748b',
            fontSize: 12,
            cursor: 'pointer',
          }}
        >
          Cancel
        </button>
      </div>
    </form>
  );
};
