'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Modal } from '../Modal';
import { LabelSelector } from './LabelSelector';
import { FileUpload } from './FileUpload';
import { ActivityTimeline } from './ActivityTimeline';
import type { CardWithLabels, Label, CardActivity, CardFile, Column } from '@/types/kanban';
import { 
  updateCard, 
  updateCardLabels, 
  getLabels, 
  getCardActivities, 
  getCardFiles 
} from '@/lib/supabase/kanban';

interface CardDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  card: CardWithLabels | null;
  columns: Column[];
  onCardChange: () => void;
}

export const CardDetailModal: React.FC<CardDetailModalProps> = ({
  isOpen,
  onClose,
  card,
  columns,
  onCardChange,
}) => {
  const [labels, setLabels] = useState<Label[]>([]);
  const [activities, setActivities] = useState<CardActivity[]>([]);
  const [files, setFiles] = useState<CardFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState<Partial<CardWithLabels>>({});

  const loadRelatedData = useCallback(async () => {
    if (!card) return;
    setIsLoading(true);
    try {
      const [labelsData, activitiesData, filesData] = await Promise.all([
        getLabels(),
        getCardActivities(card.id),
        getCardFiles(card.id),
      ]);
      setLabels(labelsData);
      setActivities(activitiesData);
      setFiles(filesData);
    } catch (error) {
      console.error('Error loading card data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [card]);

  useEffect(() => {
    if (card) {
      setFormData(card);
      loadRelatedData();
    }
  }, [card, loadRelatedData]);

  const handleSave = async () => {
    if (!card) return;

    setIsSaving(true);
    try {
      // Update card fields (excluding labels which are handled separately)
      const { labels, ...cardFields } = formData;
      await updateCard(card.id, cardFields);
      
      // Update labels separately
      const labelIds = (formData.labels || card.labels || []).map(l => l.id);
      await updateCardLabels(card.id, labelIds);
      
      onCardChange();
    } catch (error) {
      console.error('Error saving card:', error);
      alert('Failed to save changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleFieldChange = (field: keyof CardWithLabels, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLabelsChange = (labelIds: string[]) => {
    const selectedLabels = labels.filter(l => labelIds.includes(l.id));
    handleFieldChange('labels', selectedLabels);
  };

  const handleColumnChange = async (newColumnId: string) => {
    if (!card || card.column_id === newColumnId) return;
    
    setIsSaving(true);
    try {
      await updateCard(card.id, { column_id: newColumnId });
      onCardChange();
    } catch (error) {
      console.error('Error moving card:', error);
      alert('Failed to move card. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const formatCurrency = (amount: number | null) => {
    if (!amount) return '';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const parseCurrency = (value: string) => {
    const num = parseFloat(value.replace(/[^0-9.-]+/g, ''));
    return isNaN(num) ? null : num;
  };

  if (!card) return null;

  const currentColumn = columns.find(c => c.id === card.column_id);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="">
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        maxHeight: '85vh',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          paddingBottom: 16,
          borderBottom: '1px solid #e2e8f0',
          marginBottom: 20,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
            <div style={{ flex: 1 }}>
              <h2 style={{ 
                margin: '0 0 8px 0', 
                fontSize: 20, 
                fontWeight: 600, 
                color: '#0f172a' 
              }}>
                {formData.address || card.address}
              </h2>
              <select
                value={formData.column_id || card.column_id}
                onChange={(e) => handleColumnChange(e.target.value)}
                style={{
                  padding: '4px 8px',
                  borderRadius: 4,
                  border: '1px solid #e2e8f0',
                  fontSize: 12,
                  background: 'white',
                  color: '#334155',
                }}
              >
                {columns.map(col => (
                  <option key={col.id} value={col.id}>
                    {col.name}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <select
                value={formData.priority || card.priority || ''}
                onChange={(e) => handleFieldChange('priority', e.target.value || null)}
                style={{
                  padding: '6px 10px',
                  borderRadius: 4,
                  border: '1px solid #e2e8f0',
                  fontSize: 12,
                  background: 'white',
                }}
              >
                <option value="">Priority</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div style={{ 
          display: 'flex', 
          gap: 24, 
          overflow: 'hidden',
          flex: 1,
        }}>
          {/* Left Side - Main Content */}
          <div style={{ flex: 2, overflowY: 'auto', paddingRight: 8 }}>
            {/* Job Type */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ 
                display: 'block', 
                fontSize: 13, 
                fontWeight: 600, 
                color: '#334155', 
                marginBottom: 6 
              }}>
                Job Type
              </label>
              <select
                value={formData.job_type || card.job_type || ''}
                onChange={(e) => handleFieldChange('job_type', e.target.value || null)}
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: 4,
                  border: '1px solid #e2e8f0',
                  fontSize: 13,
                  background: 'white',
                }}
              >
                <option value="">Select job type</option>
                <option value="Full Replacement">Full Replacement</option>
                <option value="Repair">Repair</option>
                <option value="Inspection">Inspection</option>
                <option value="Gutters">Gutters</option>
              </select>
            </div>

            {/* Client Info */}
            <div style={{ marginBottom: 20 }}>
              <h3 style={{ 
                fontSize: 14, 
                fontWeight: 600, 
                color: '#00293f', 
                marginBottom: 12,
                marginTop: 0,
              }}>
                Client Information
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ 
                    display: 'block', 
                    fontSize: 12, 
                    color: '#64748b', 
                    marginBottom: 4 
                  }}>
                    Name
                  </label>
                  <input
                    type="text"
                    value={formData.client_name || card.client_name || ''}
                    onChange={(e) => handleFieldChange('client_name', e.target.value || null)}
                    style={{
                      width: '100%',
                      padding: '6px 8px',
                      borderRadius: 4,
                      border: '1px solid #e2e8f0',
                      fontSize: 13,
                    }}
                  />
                </div>
                <div>
                  <label style={{ 
                    display: 'block', 
                    fontSize: 12, 
                    color: '#64748b', 
                    marginBottom: 4 
                  }}>
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.client_phone || card.client_phone || ''}
                    onChange={(e) => handleFieldChange('client_phone', e.target.value || null)}
                    style={{
                      width: '100%',
                      padding: '6px 8px',
                      borderRadius: 4,
                      border: '1px solid #e2e8f0',
                      fontSize: 13,
                    }}
                  />
                </div>
                <div>
                  <label style={{ 
                    display: 'block', 
                    fontSize: 12, 
                    color: '#64748b', 
                    marginBottom: 4 
                  }}>
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.client_email || card.client_email || ''}
                    onChange={(e) => handleFieldChange('client_email', e.target.value || null)}
                    style={{
                      width: '100%',
                      padding: '6px 8px',
                      borderRadius: 4,
                      border: '1px solid #e2e8f0',
                      fontSize: 13,
                    }}
                  />
                </div>
                <div>
                  <label style={{ 
                    display: 'block', 
                    fontSize: 12, 
                    color: '#64748b', 
                    marginBottom: 4 
                  }}>
                    Property Manager
                  </label>
                  <input
                    type="text"
                    value={formData.property_manager || card.property_manager || ''}
                    onChange={(e) => handleFieldChange('property_manager', e.target.value || null)}
                    style={{
                      width: '100%',
                      padding: '6px 8px',
                      borderRadius: 4,
                      border: '1px solid #e2e8f0',
                      fontSize: 13,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Notes */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ 
                display: 'block', 
                fontSize: 13, 
                fontWeight: 600, 
                color: '#334155', 
                marginBottom: 6 
              }}>
                Notes
              </label>
              <textarea
                value={formData.notes || card.notes || ''}
                onChange={(e) => handleFieldChange('notes', e.target.value || null)}
                rows={4}
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: 4,
                  border: '1px solid #e2e8f0',
                  fontSize: 13,
                  fontFamily: 'inherit',
                  resize: 'vertical',
                }}
              />
            </div>

            {/* Files */}
            <div style={{ marginBottom: 20 }}>
              <FileUpload
                cardId={card.id}
                files={files}
                onFilesChange={async () => {
                  const updatedFiles = await getCardFiles(card.id);
                  setFiles(updatedFiles);
                  onCardChange();
                }}
              />
            </div>
          </div>

          {/* Right Sidebar */}
          <div style={{ 
            flex: 1, 
            borderLeft: '1px solid #e2e8f0', 
            paddingLeft: 24,
            overflowY: 'auto',
          }}>
            {/* Financial Summary */}
            <div style={{ marginBottom: 24 }}>
              <h3 style={{ 
                fontSize: 14, 
                fontWeight: 600, 
                color: '#00293f', 
                marginBottom: 12,
                marginTop: 0,
              }}>
                Financial Summary
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div>
                  <label style={{ 
                    display: 'block', 
                    fontSize: 12, 
                    color: '#64748b', 
                    marginBottom: 4 
                  }}>
                    Quote Amount
                  </label>
                  <input
                    type="text"
                    value={formData.quote_amount ? formatCurrency(formData.quote_amount) : ''}
                    onChange={(e) => handleFieldChange('quote_amount', parseCurrency(e.target.value))}
                    placeholder="$0.00"
                    style={{
                      width: '100%',
                      padding: '6px 8px',
                      borderRadius: 4,
                      border: '1px solid #e2e8f0',
                      fontSize: 13,
                    }}
                  />
                </div>
                <div>
                  <label style={{ 
                    display: 'block', 
                    fontSize: 12, 
                    color: '#64748b', 
                    marginBottom: 4 
                  }}>
                    Projected Cost
                  </label>
                  <input
                    type="text"
                    value={formData.projected_cost ? formatCurrency(formData.projected_cost) : ''}
                    onChange={(e) => handleFieldChange('projected_cost', parseCurrency(e.target.value))}
                    placeholder="$0.00"
                    style={{
                      width: '100%',
                      padding: '6px 8px',
                      borderRadius: 4,
                      border: '1px solid #e2e8f0',
                      fontSize: 13,
                    }}
                  />
                </div>
                <div>
                  <label style={{ 
                    display: 'block', 
                    fontSize: 12, 
                    color: '#64748b', 
                    marginBottom: 4 
                  }}>
                    Projected Profit
                  </label>
                  <input
                    type="text"
                    value={formData.projected_profit ? formatCurrency(formData.projected_profit) : ''}
                    onChange={(e) => handleFieldChange('projected_profit', parseCurrency(e.target.value))}
                    placeholder="$0.00"
                    style={{
                      width: '100%',
                      padding: '6px 8px',
                      borderRadius: 4,
                      border: '1px solid #e2e8f0',
                      fontSize: 13,
                    }}
                  />
                </div>
                <div>
                  <label style={{ 
                    display: 'block', 
                    fontSize: 12, 
                    color: '#64748b', 
                    marginBottom: 4 
                  }}>
                    Projected Commission
                  </label>
                  <input
                    type="text"
                    value={formData.projected_commission ? formatCurrency(formData.projected_commission) : ''}
                    onChange={(e) => handleFieldChange('projected_commission', parseCurrency(e.target.value))}
                    placeholder="$0.00"
                    style={{
                      width: '100%',
                      padding: '6px 8px',
                      borderRadius: 4,
                      border: '1px solid #e2e8f0',
                      fontSize: 13,
                    }}
                  />
                </div>
                <div>
                  <label style={{ 
                    display: 'block', 
                    fontSize: 12, 
                    color: '#64748b', 
                    marginBottom: 4 
                  }}>
                    Projected Office
                  </label>
                  <input
                    type="text"
                    value={formData.projected_office ? formatCurrency(formData.projected_office) : ''}
                    onChange={(e) => handleFieldChange('projected_office', parseCurrency(e.target.value))}
                    placeholder="$0.00"
                    style={{
                      width: '100%',
                      padding: '6px 8px',
                      borderRadius: 4,
                      border: '1px solid #e2e8f0',
                      fontSize: 13,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Labels */}
            <div style={{ marginBottom: 24 }}>
              <LabelSelector
                labels={labels}
                selectedLabelIds={(formData.labels || card.labels || []).map(l => l.id)}
                onSelectionChange={handleLabelsChange}
              />
            </div>

            {/* Due Date */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ 
                display: 'block', 
                fontSize: 13, 
                fontWeight: 600, 
                color: '#334155', 
                marginBottom: 6 
              }}>
                Due Date
              </label>
              <input
                type="date"
                value={formData.due_date || card.due_date || ''}
                onChange={(e) => handleFieldChange('due_date', e.target.value || null)}
                style={{
                  width: '100%',
                  padding: '6px 8px',
                  borderRadius: 4,
                  border: '1px solid #e2e8f0',
                  fontSize: 13,
                }}
              />
            </div>

            {/* Created Date (read-only) */}
            <div>
              <label style={{ 
                display: 'block', 
                fontSize: 12, 
                color: '#64748b', 
                marginBottom: 4 
              }}>
                Created
              </label>
              <p style={{ 
                margin: 0, 
                fontSize: 12, 
                color: '#334155' 
              }}>
                {new Date(card.created_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Activity Timeline */}
        <div style={{
          marginTop: 24,
          paddingTop: 24,
          borderTop: '1px solid #e2e8f0',
        }}>
          {isLoading ? (
            <p style={{ fontSize: 12, color: '#64748b' }}>Loading activity...</p>
          ) : (
            <ActivityTimeline activities={activities} />
          )}
        </div>

        {/* Footer Actions */}
        <div style={{
          marginTop: 20,
          paddingTop: 16,
          borderTop: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 8,
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '8px 16px',
              borderRadius: 6,
              border: '1px solid #e2e8f0',
              background: 'white',
              color: '#64748b',
              fontSize: 13,
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Close
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            style={{
              padding: '8px 16px',
              borderRadius: 6,
              border: 'none',
              background: isSaving ? '#94a3b8' : '#00293f',
              color: 'white',
              fontSize: 13,
              fontWeight: 600,
              cursor: isSaving ? 'not-allowed' : 'pointer',
            }}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </Modal>
  );
};
