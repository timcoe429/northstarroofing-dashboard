'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { CardWithLabels, Label, CardActivity, CardFile, Column } from '@/types/kanban';
import { 
  updateCard, 
  updateCardLabels, 
  getLabels, 
  getCardActivities, 
  getCardFiles,
  getCardLabels,
  addComment,
  deleteCard,
  moveCard,
} from '@/lib/supabase/kanban';
import { useAutoSave } from '@/hooks/useAutoSave';
import { EditableTitle } from './card-modal/EditableTitle';
import { EditableField } from './card-modal/EditableField';
import { LabelPicker } from './card-modal/LabelPicker';
import { FinancialFields } from './card-modal/FinancialFields';
import { FileAttachments } from './card-modal/FileAttachments';
import { ActivityFeed } from './card-modal/ActivityFeed';

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
  // Data state
  const [allLabels, setAllLabels] = useState<Label[]>([]);
  const [cardLabels, setCardLabels] = useState<Label[]>([]);
  const [activities, setActivities] = useState<CardActivity[]>([]);
  const [files, setFiles] = useState<CardFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  // UI state
  const [showLabelPicker, setShowLabelPicker] = useState(false);
  const [showActivity, setShowActivity] = useState(true);
  const [labelPickerAnchor, setLabelPickerAnchor] = useState<HTMLElement | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);
  const [showDueDatePicker, setShowDueDatePicker] = useState(false);

  // Save states per field
  const [saveStates, setSaveStates] = useState<Record<string, 'idle' | 'saving' | 'saved' | 'error'>>({});

  // Refs
  const modalRef = useRef<HTMLDivElement>(null);
  const moveButtonRef = useRef<HTMLButtonElement>(null);
  const priorityButtonRef = useRef<HTMLButtonElement>(null);
  const dueDateButtonRef = useRef<HTMLButtonElement>(null);
  const fileUploadTriggerRef = useRef<(() => void) | null>(null);

  // Load related data
  const loadRelatedData = useCallback(async () => {
    if (!card) return;
    setIsLoading(true);
    try {
      const [labelsData, cardLabelsData, activitiesData, filesData] = await Promise.all([
        getLabels(),
        getCardLabels(card.id),
        getCardActivities(card.id),
        getCardFiles(card.id),
      ]);
      setAllLabels(labelsData);
      setCardLabels(cardLabelsData);
      setActivities(activitiesData);
      setFiles(filesData);
    } catch (error) {
      console.error('Error loading card data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [card]);

  useEffect(() => {
    if (card && isOpen) {
      loadRelatedData();
    }
  }, [card, isOpen, loadRelatedData]);

  // Handle ESC key and click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !showDeleteConfirm) {
        onClose();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.addEventListener('mousedown', handleClickOutside);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose, showDeleteConfirm]);

  // Reset save states when card changes
  useEffect(() => {
    if (card) {
      setSaveStates({});
    }
  }, [card]);

  // Auto-save hooks for each field
  const titleAutoSave = useAutoSave(
    card?.address || '',
    useCallback(async (value: string) => {
      if (!card) return;
      setSaveStates(prev => ({ ...prev, address: 'saving' }));
      try {
        await updateCard(card.id, { address: value });
        setSaveStates(prev => ({ ...prev, address: 'saved' }));
        setTimeout(() => setSaveStates(prev => ({ ...prev, address: 'idle' })), 2000);
      } catch (error) {
        console.error('Error saving title:', error);
        setSaveStates(prev => ({ ...prev, address: 'error' }));
        setTimeout(() => setSaveStates(prev => ({ ...prev, address: 'idle' })), 3000);
      }
    }, [card]),
    { debounceMs: 300 }
  );

  const descriptionAutoSave = useAutoSave(
    card?.notes || '',
    useCallback(async (value: string) => {
      if (!card) return;
      setSaveStates(prev => ({ ...prev, notes: 'saving' }));
      try {
        await updateCard(card.id, { notes: value || null });
        setSaveStates(prev => ({ ...prev, notes: 'saved' }));
        setTimeout(() => setSaveStates(prev => ({ ...prev, notes: 'idle' })), 2000);
      } catch (error) {
        console.error('Error saving description:', error);
        setSaveStates(prev => ({ ...prev, notes: 'error' }));
        setTimeout(() => setSaveStates(prev => ({ ...prev, notes: 'idle' })), 3000);
      }
    }, [card]),
    { debounceMs: 300 }
  );

  const clientNameAutoSave = useAutoSave(
    card?.client_name || '',
    useCallback(async (value: string | null) => {
      if (!card) return;
      setSaveStates(prev => ({ ...prev, client_name: 'saving' }));
      try {
        await updateCard(card.id, { client_name: value });
        setSaveStates(prev => ({ ...prev, client_name: 'saved' }));
        setTimeout(() => setSaveStates(prev => ({ ...prev, client_name: 'idle' })), 2000);
      } catch (error) {
        console.error('Error saving client name:', error);
        setSaveStates(prev => ({ ...prev, client_name: 'error' }));
        setTimeout(() => setSaveStates(prev => ({ ...prev, client_name: 'idle' })), 3000);
      }
    }, [card]),
    { debounceMs: 300 }
  );

  const clientPhoneAutoSave = useAutoSave(
    card?.client_phone || '',
    useCallback(async (value: string | null) => {
      if (!card) return;
      setSaveStates(prev => ({ ...prev, client_phone: 'saving' }));
      try {
        await updateCard(card.id, { client_phone: value });
        setSaveStates(prev => ({ ...prev, client_phone: 'saved' }));
        setTimeout(() => setSaveStates(prev => ({ ...prev, client_phone: 'idle' })), 2000);
      } catch (error) {
        console.error('Error saving client phone:', error);
        setSaveStates(prev => ({ ...prev, client_phone: 'error' }));
        setTimeout(() => setSaveStates(prev => ({ ...prev, client_phone: 'idle' })), 3000);
      }
    }, [card]),
    { debounceMs: 300 }
  );

  const clientEmailAutoSave = useAutoSave(
    card?.client_email || '',
    useCallback(async (value: string | null) => {
      if (!card) return;
      setSaveStates(prev => ({ ...prev, client_email: 'saving' }));
      try {
        await updateCard(card.id, { client_email: value });
        setSaveStates(prev => ({ ...prev, client_email: 'saved' }));
        setTimeout(() => setSaveStates(prev => ({ ...prev, client_email: 'idle' })), 2000);
      } catch (error) {
        console.error('Error saving client email:', error);
        setSaveStates(prev => ({ ...prev, client_email: 'error' }));
        setTimeout(() => setSaveStates(prev => ({ ...prev, client_email: 'idle' })), 3000);
      }
    }, [card]),
    { debounceMs: 300 }
  );

  const propertyManagerAutoSave = useAutoSave(
    card?.property_manager || '',
    useCallback(async (value: string | null) => {
      if (!card) return;
      setSaveStates(prev => ({ ...prev, property_manager: 'saving' }));
      try {
        await updateCard(card.id, { property_manager: value });
        setSaveStates(prev => ({ ...prev, property_manager: 'saved' }));
        setTimeout(() => setSaveStates(prev => ({ ...prev, property_manager: 'idle' })), 2000);
      } catch (error) {
        console.error('Error saving property manager:', error);
        setSaveStates(prev => ({ ...prev, property_manager: 'error' }));
        setTimeout(() => setSaveStates(prev => ({ ...prev, property_manager: 'idle' })), 3000);
      }
    }, [card]),
    { debounceMs: 300 }
  );

  const quoteAmountAutoSave = useAutoSave(
    card?.quote_amount || null,
    useCallback(async (value: number | null) => {
      if (!card) return;
      setSaveStates(prev => ({ ...prev, quote_amount: 'saving' }));
      try {
        await updateCard(card.id, { quote_amount: value });
        setSaveStates(prev => ({ ...prev, quote_amount: 'saved' }));
        setTimeout(() => setSaveStates(prev => ({ ...prev, quote_amount: 'idle' })), 2000);
      } catch (error) {
        console.error('Error saving quote amount:', error);
        setSaveStates(prev => ({ ...prev, quote_amount: 'error' }));
        setTimeout(() => setSaveStates(prev => ({ ...prev, quote_amount: 'idle' })), 3000);
      }
    }, [card]),
    { debounceMs: 500 }
  );

  const projectedCostAutoSave = useAutoSave(
    card?.projected_cost || null,
    useCallback(async (value: number | null) => {
      if (!card) return;
      setSaveStates(prev => ({ ...prev, projected_cost: 'saving' }));
      try {
        await updateCard(card.id, { projected_cost: value });
        setSaveStates(prev => ({ ...prev, projected_cost: 'saved' }));
        setTimeout(() => setSaveStates(prev => ({ ...prev, projected_cost: 'idle' })), 2000);
      } catch (error) {
        console.error('Error saving projected cost:', error);
        setSaveStates(prev => ({ ...prev, projected_cost: 'error' }));
        setTimeout(() => setSaveStates(prev => ({ ...prev, projected_cost: 'idle' })), 3000);
      }
    }, [card]),
    { debounceMs: 500 }
  );

  const projectedProfitAutoSave = useAutoSave(
    card?.projected_profit || null,
    useCallback(async (value: number | null) => {
      if (!card) return;
      setSaveStates(prev => ({ ...prev, projected_profit: 'saving' }));
      try {
        await updateCard(card.id, { projected_profit: value });
        setSaveStates(prev => ({ ...prev, projected_profit: 'saved' }));
        setTimeout(() => setSaveStates(prev => ({ ...prev, projected_profit: 'idle' })), 2000);
      } catch (error) {
        console.error('Error saving projected profit:', error);
        setSaveStates(prev => ({ ...prev, projected_profit: 'error' }));
        setTimeout(() => setSaveStates(prev => ({ ...prev, projected_profit: 'idle' })), 3000);
      }
    }, [card]),
    { debounceMs: 500 }
  );

  const projectedCommissionAutoSave = useAutoSave(
    card?.projected_commission || null,
    useCallback(async (value: number | null) => {
      if (!card) return;
      setSaveStates(prev => ({ ...prev, projected_commission: 'saving' }));
      try {
        await updateCard(card.id, { projected_commission: value });
        setSaveStates(prev => ({ ...prev, projected_commission: 'saved' }));
        setTimeout(() => setSaveStates(prev => ({ ...prev, projected_commission: 'idle' })), 2000);
      } catch (error) {
        console.error('Error saving projected commission:', error);
        setSaveStates(prev => ({ ...prev, projected_commission: 'error' }));
        setTimeout(() => setSaveStates(prev => ({ ...prev, projected_commission: 'idle' })), 3000);
      }
    }, [card]),
    { debounceMs: 500 }
  );

  const projectedOfficeAutoSave = useAutoSave(
    card?.projected_office || null,
    useCallback(async (value: number | null) => {
      if (!card) return;
      setSaveStates(prev => ({ ...prev, projected_office: 'saving' }));
      try {
        await updateCard(card.id, { projected_office: value });
        setSaveStates(prev => ({ ...prev, projected_office: 'saved' }));
        setTimeout(() => setSaveStates(prev => ({ ...prev, projected_office: 'idle' })), 2000);
      } catch (error) {
        console.error('Error saving projected office:', error);
        setSaveStates(prev => ({ ...prev, projected_office: 'error' }));
        setTimeout(() => setSaveStates(prev => ({ ...prev, projected_office: 'idle' })), 3000);
      }
    }, [card]),
    { debounceMs: 500 }
  );

  // Handlers
  const handleLabelToggle = async (labelId: string) => {
    if (!card) return;
    
    const isSelected = cardLabels.some(l => l.id === labelId);
    const newLabelIds = isSelected
      ? cardLabels.filter(l => l.id !== labelId).map(l => l.id)
      : [...cardLabels.map(l => l.id), labelId];

    // Optimistic update
    if (isSelected) {
      setCardLabels(prev => prev.filter(l => l.id !== labelId));
    } else {
      const labelToAdd = allLabels.find(l => l.id === labelId);
      if (labelToAdd) {
        setCardLabels(prev => [...prev, labelToAdd]);
      }
    }

    try {
      await updateCardLabels(card.id, newLabelIds);
      await loadRelatedData(); // Refresh to ensure sync
    } catch (error) {
      console.error('Error updating labels:', error);
      await loadRelatedData(); // Revert on error
    }
  };

  const handleColumnChange = async (newColumnId: string) => {
    if (!card || card.column_id === newColumnId) return;
    
    setSaveStates(prev => ({ ...prev, column_id: 'saving' }));
    try {
      // Get new column position (end of column)
      const targetColumn = columns.find(c => c.id === newColumnId);
      if (!targetColumn) return;

      await moveCard(card.id, newColumnId, 999); // Will be repositioned by moveCard
      setSaveStates(prev => ({ ...prev, column_id: 'saved' }));
      setTimeout(() => setSaveStates(prev => ({ ...prev, column_id: 'idle' })), 2000);
      onCardChange(); // Notify parent to refresh board
    } catch (error) {
      console.error('Error moving card:', error);
      setSaveStates(prev => ({ ...prev, column_id: 'error' }));
      setTimeout(() => setSaveStates(prev => ({ ...prev, column_id: 'idle' })), 3000);
    }
  };

  const handlePriorityChange = async (priority: 'low' | 'medium' | 'high' | 'urgent' | null) => {
    if (!card) return;
    
    setSaveStates(prev => ({ ...prev, priority: 'saving' }));
    try {
      await updateCard(card.id, { priority });
      setSaveStates(prev => ({ ...prev, priority: 'saved' }));
      setTimeout(() => setSaveStates(prev => ({ ...prev, priority: 'idle' })), 2000);
    } catch (error) {
      console.error('Error updating priority:', error);
      setSaveStates(prev => ({ ...prev, priority: 'error' }));
      setTimeout(() => setSaveStates(prev => ({ ...prev, priority: 'idle' })), 3000);
    }
  };

  const handleDueDateChange = async (dueDate: string | null) => {
    if (!card) return;
    
    setSaveStates(prev => ({ ...prev, due_date: 'saving' }));
    try {
      await updateCard(card.id, { due_date: dueDate });
      setSaveStates(prev => ({ ...prev, due_date: 'saved' }));
      setTimeout(() => setSaveStates(prev => ({ ...prev, due_date: 'idle' })), 2000);
    } catch (error) {
      console.error('Error updating due date:', error);
      setSaveStates(prev => ({ ...prev, due_date: 'error' }));
      setTimeout(() => setSaveStates(prev => ({ ...prev, due_date: 'idle' })), 3000);
    }
  };

  const handleAddComment = async (comment: string) => {
    if (!card) return;
    
    setIsSubmittingComment(true);
    try {
      await addComment(card.id, comment);
      await loadRelatedData(); // Refresh activities
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Failed to add comment. Please try again.');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleDeleteCard = async () => {
    if (!card) return;
    
    if (!confirm('Are you sure you want to delete this card? This action cannot be undone.')) {
      setShowDeleteConfirm(false);
      return;
    }

    try {
      await deleteCard(card.id);
      onCardChange(); // Refresh board
      onClose(); // Close modal
    } catch (error) {
      console.error('Error deleting card:', error);
      alert('Failed to delete card. Please try again.');
    }
  };

  const currentColumn = columns.find(c => c.id === card?.column_id);

  if (!isOpen || !card) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: 20,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#ffffff',
          borderRadius: 8,
          width: '100%',
          maxWidth: 900,
          maxHeight: '90vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
          boxSizing: 'border-box',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '32px 32px 16px',
          borderBottom: '1px solid #dfe1e6',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
            <div style={{ flex: 1 }}>
              <EditableTitle
                value={titleAutoSave.value}
                onChange={titleAutoSave.setValue}
                onSave={titleAutoSave.saveNow}
                saveState={saveStates.address}
              />
              <div style={{ marginTop: 8, fontSize: 13, color: '#5e6c84' }}>
                in list {currentColumn?.name || 'Unknown'}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: 14,
                  color: '#eb5a46',
                  cursor: 'pointer',
                  padding: '6px 12px',
                  borderRadius: 4,
                  fontWeight: 500,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#fef2f2';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                Delete
              </button>
              {/* Archive button - hidden for now */}
              {/* <button
                onClick={() => {}}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: 14,
                  color: '#5e6c84',
                  cursor: 'pointer',
                  padding: '6px 12px',
                  borderRadius: 4,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#f4f5f7';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                Archive
              </button> */}
              <button
                onClick={onClose}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: 24,
                  color: '#5e6c84',
                  cursor: 'pointer',
                  padding: 4,
                  lineHeight: 1,
                  borderRadius: 4,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#f4f5f7';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                ×
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          gap: 32,
          padding: 32,
        }}>
          {/* Left Side (60%) */}
          <div style={{ flex: '0 0 60%', display: 'flex', flexDirection: 'column', gap: 32 }}>
            {/* Labels */}
            <div>
              <h3 style={{
                fontSize: 14,
                fontWeight: 600,
                color: '#172b4d',
                marginBottom: 16,
                marginTop: 0,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
              }}>
                Labels
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, position: 'relative' }}>
                {cardLabels.map(label => (
                  <div
                    key={label.id}
                    style={{
                      padding: '4px 10px',
                      borderRadius: 4,
                      background: label.color,
                      color: 'white',
                      fontSize: 12,
                      fontWeight: 500,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    {label.name}
                  </div>
                ))}
                <button
                  onClick={(e) => {
                    setLabelPickerAnchor(e.currentTarget as HTMLElement);
                    setShowLabelPicker(true);
                  }}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 4,
                    border: '1px dashed #dfe1e6',
                    background: 'transparent',
                    color: '#5e6c84',
                    fontSize: 12,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
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
                  +
                </button>
                {showLabelPicker && labelPickerAnchor && (
                  <LabelPicker
                    isOpen={showLabelPicker}
                    onClose={() => setShowLabelPicker(false)}
                    allLabels={allLabels}
                    selectedLabelIds={cardLabels.map(l => l.id)}
                    onToggleLabel={handleLabelToggle}
                    anchorElement={labelPickerAnchor}
                  />
                )}
              </div>
            </div>

            {/* Add to Card */}
            <div>
              <h3 style={{
                fontSize: 14,
                fontWeight: 600,
                color: '#172b4d',
                marginBottom: 16,
                marginTop: 0,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
              }}>
                Add to Card
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <button
                  onClick={(e) => {
                    setLabelPickerAnchor(e.currentTarget);
                    setShowLabelPicker(true);
                  }}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 6,
                    border: '1px solid #dfe1e6',
                    background: '#ffffff',
                    color: '#172b4d',
                    fontSize: 14,
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#f4f5f7';
                    e.currentTarget.style.borderColor = '#c1c7d0';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#ffffff';
                    e.currentTarget.style.borderColor = '#dfe1e6';
                  }}
                >
                  <span>🏷️</span>
                  <span>Labels</span>
                </button>
                <button
                  onClick={() => {
                    fileUploadTriggerRef.current?.();
                  }}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 6,
                    border: '1px solid #dfe1e6',
                    background: '#ffffff',
                    color: '#172b4d',
                    fontSize: 14,
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#f4f5f7';
                    e.currentTarget.style.borderColor = '#c1c7d0';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#ffffff';
                    e.currentTarget.style.borderColor = '#dfe1e6';
                  }}
                >
                  <span>📎</span>
                  <span>Attachments</span>
                </button>
                <div style={{ position: 'relative' }}>
                  <button
                    ref={dueDateButtonRef}
                    onClick={() => setShowDueDatePicker(!showDueDatePicker)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: 6,
                      border: '1px solid #dfe1e6',
                      background: '#ffffff',
                      color: '#172b4d',
                      fontSize: 14,
                      textAlign: 'left',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#f4f5f7';
                      e.currentTarget.style.borderColor = '#c1c7d0';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#ffffff';
                      e.currentTarget.style.borderColor = '#dfe1e6';
                    }}
                  >
                    <span>📅</span>
                    <span>Due Date</span>
                  </button>
                  {showDueDatePicker && (
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      marginTop: 4,
                      background: '#ffffff',
                      border: '1px solid #dfe1e6',
                      borderRadius: 8,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                      zIndex: 1001,
                      padding: 8,
                    }}>
                      <input
                        type="date"
                        value={card.due_date || ''}
                        onChange={(e) => {
                          handleDueDateChange(e.target.value || null);
                          setShowDueDatePicker(false);
                        }}
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          border: '1px solid #dfe1e6',
                          borderRadius: 6,
                          fontSize: 14,
                          background: '#fafbfc',
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#0079bf';
                          e.target.style.borderWidth = '2px';
                          e.target.style.background = '#ffffff';
                          e.target.style.boxShadow = '0 0 0 2px rgba(0,121,191,0.2)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#dfe1e6';
                          e.target.style.borderWidth = '1px';
                          e.target.style.background = '#fafbfc';
                          e.target.style.boxShadow = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>
                <div style={{ position: 'relative' }}>
                  <button
                    ref={priorityButtonRef}
                    onClick={() => setShowPriorityDropdown(!showPriorityDropdown)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: 6,
                      border: '1px solid #dfe1e6',
                      background: '#ffffff',
                      color: '#172b4d',
                      fontSize: 14,
                      textAlign: 'left',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#f4f5f7';
                      e.currentTarget.style.borderColor = '#c1c7d0';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#ffffff';
                      e.currentTarget.style.borderColor = '#dfe1e6';
                    }}
                  >
                    <span>⚡</span>
                    <span>Priority</span>
                  </button>
                  {showPriorityDropdown && (
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      marginTop: 4,
                      background: '#ffffff',
                      border: '1px solid #dfe1e6',
                      borderRadius: 8,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                      zIndex: 1001,
                      minWidth: 150,
                    }}>
                      {(['low', 'medium', 'high', 'urgent', null] as const).map(priority => (
                        <button
                          key={priority || 'none'}
                          onClick={() => {
                            handlePriorityChange(priority);
                            setShowPriorityDropdown(false);
                          }}
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            border: 'none',
                            background: card.priority === priority ? '#e4f0f6' : 'transparent',
                            textAlign: 'left',
                            cursor: 'pointer',
                            fontSize: 13,
                            color: '#172b4d',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#f4f5f7';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = card.priority === priority ? '#e4f0f6' : 'transparent';
                          }}
                        >
                          {priority ? priority.charAt(0).toUpperCase() + priority.slice(1) : 'None'}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Description */}
            <EditableField
              label="Description"
              value={descriptionAutoSave.value}
              type="textarea"
              onChange={(value) => descriptionAutoSave.setValue(typeof value === 'string' ? value : (value?.toString() || ''))}
              onSave={descriptionAutoSave.saveNow}
              placeholder="Add a more detailed description..."
              saveState={saveStates.notes}
              rows={4}
            />

            {/* Client Information */}
            <div>
              <h3 style={{
                fontSize: 14,
                fontWeight: 600,
                color: '#172b4d',
                marginBottom: 16,
                marginTop: 0,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
              }}>
                Client Information
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <EditableField
                  label="Name"
                  value={clientNameAutoSave.value}
                  type="text"
                  onChange={(value) => clientNameAutoSave.setValue(typeof value === 'string' ? value : (value?.toString() || ''))}
                  onSave={clientNameAutoSave.saveNow}
                  placeholder="Client name"
                  saveState={saveStates.client_name}
                />
                <EditableField
                  label="Phone"
                  value={clientPhoneAutoSave.value}
                  type="tel"
                  onChange={(value) => clientPhoneAutoSave.setValue(typeof value === 'string' ? value : (value?.toString() || ''))}
                  onSave={clientPhoneAutoSave.saveNow}
                  placeholder="Phone number"
                  saveState={saveStates.client_phone}
                />
                <EditableField
                  label="Email"
                  value={clientEmailAutoSave.value}
                  type="email"
                  onChange={(value) => clientEmailAutoSave.setValue(typeof value === 'string' ? value : (value?.toString() || ''))}
                  onSave={clientEmailAutoSave.saveNow}
                  placeholder="Email address"
                  saveState={saveStates.client_email}
                />
                <EditableField
                  label="Property Manager"
                  value={propertyManagerAutoSave.value}
                  type="text"
                  onChange={(value) => propertyManagerAutoSave.setValue(typeof value === 'string' ? value : (value?.toString() || ''))}
                  onSave={propertyManagerAutoSave.saveNow}
                  placeholder="Property manager"
                  saveState={saveStates.property_manager}
                />
              </div>
            </div>

            {/* Financial Summary */}
            <FinancialFields
              quoteAmount={quoteAmountAutoSave.value}
              projectedCost={projectedCostAutoSave.value}
              projectedProfit={projectedProfitAutoSave.value}
              projectedCommission={projectedCommissionAutoSave.value}
              projectedOffice={projectedOfficeAutoSave.value}
              onQuoteAmountChange={quoteAmountAutoSave.setValue}
              onProjectedCostChange={projectedCostAutoSave.setValue}
              onProjectedProfitChange={projectedProfitAutoSave.setValue}
              onProjectedCommissionChange={projectedCommissionAutoSave.setValue}
              onProjectedOfficeChange={projectedOfficeAutoSave.setValue}
              onQuoteAmountSave={quoteAmountAutoSave.saveNow}
              onProjectedCostSave={projectedCostAutoSave.saveNow}
              onProjectedProfitSave={projectedProfitAutoSave.saveNow}
              onProjectedCommissionSave={projectedCommissionAutoSave.saveNow}
              onProjectedOfficeSave={projectedOfficeAutoSave.saveNow}
              saveStates={saveStates}
            />

            {/* Attachments */}
            <FileAttachments
              cardId={card.id}
              files={files}
              onFilesChange={loadRelatedData}
              triggerUploadRef={fileUploadTriggerRef}
            />
          </div>

          {/* Right Sidebar (40%) */}
          <div style={{ flex: '0 0 40%', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 32, boxSizing: 'border-box' }}>
            {/* Activity */}
            <ActivityFeed
              activities={activities}
              onAddComment={handleAddComment}
              showActivity={showActivity}
              onToggleActivity={() => setShowActivity(!showActivity)}
              isSubmittingComment={isSubmittingComment}
            />
          </div>
        </div>
      </div>

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000,
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: 8,
            padding: 24,
            maxWidth: 400,
            boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
          }}>
            <h3 style={{ margin: '0 0 12px', fontSize: 18, fontWeight: 600 }}>
              Delete Card?
            </h3>
            <p style={{ margin: '0 0 20px', fontSize: 14, color: '#5e6c84' }}>
              This will permanently delete this card. This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                style={{
                  padding: '8px 16px',
                  borderRadius: 4,
                  border: '1px solid #dfe1e6',
                  background: '#ffffff',
                  color: '#172b4d',
                  fontSize: 14,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteCard}
                style={{
                  padding: '8px 16px',
                  borderRadius: 4,
                  border: 'none',
                  background: '#eb5a46',
                  color: 'white',
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
