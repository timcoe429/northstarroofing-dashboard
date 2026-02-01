// ===========================================
// KANBAN BOARD SYSTEM - SUPABASE QUERIES & MUTATIONS
// ===========================================

import { createClient } from './client';
import type { 
  Board, 
  Column, 
  Card, 
  CardWithLabels, 
  Label, 
  CardActivity, 
  CardFile,
  BoardWithStats,
  ColumnWithCards 
} from '@/types/kanban';

const supabase = createClient();

// ===========================================
// BOARD OPERATIONS
// ===========================================

export async function getBoards(): Promise<Board[]> {
  const { data, error } = await supabase
    .from('boards')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function getBoardBySlug(slug: string): Promise<Board | null> {
  const { data, error } = await supabase
    .from('boards')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    throw error;
  }
  return data;
}

export async function getBoardsWithStats(): Promise<BoardWithStats[]> {
  const { data, error } = await supabase
    .from('boards')
    .select(`
      *,
      columns!inner (
        cards (
          id,
          column_id
        )
      )
    `);

  if (error) throw error;

  return (data || []).map(board => {
    const allCards = board.columns.flatMap((col: any) => col.cards || []);
    const inProgressColumns = board.columns.filter((col: any) => 
      ['In Progress', 'Estimate Sent', 'Proposal Sent'].includes(col.name)
    );
    const inProgressCards = inProgressColumns.flatMap((col: any) => col.cards || []);

    return {
      ...board,
      card_count: allCards.length,
      in_progress_count: inProgressCards.length,
    };
  });
}

// ===========================================
// COLUMN OPERATIONS
// ===========================================

export async function getColumnsByBoardId(boardId: string): Promise<Column[]> {
  const { data, error } = await supabase
    .from('columns')
    .select('*')
    .eq('board_id', boardId)
    .order('position', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function getColumnsWithCards(boardId: string): Promise<ColumnWithCards[]> {
  const { data, error } = await supabase
    .from('columns')
    .select(`
      *,
      cards (
        *,
        card_labels (
          labels (*)
        )
      )
    `)
    .eq('board_id', boardId)
    .order('position', { ascending: true });

  if (error) throw error;

  return (data || []).map(column => ({
    ...column,
    cards: (column.cards || []).map((card: any) => ({
      ...card,
      labels: (card.card_labels || []).map((cl: any) => cl.labels).filter(Boolean),
    })).sort((a: Card, b: Card) => a.position - b.position),
  }));
}

// ===========================================
// CARD OPERATIONS
// ===========================================

export async function getCardById(cardId: string): Promise<CardWithLabels | null> {
  const { data, error } = await supabase
    .from('cards')
    .select(`
      *,
      card_labels (
        labels (*)
      )
    `)
    .eq('id', cardId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }

  return {
    ...data,
    labels: (data.card_labels || []).map((cl: any) => cl.labels).filter(Boolean),
  };
}

export async function createCard(
  columnId: string,
  cardData: Partial<Card>
): Promise<CardWithLabels> {
  // Get max position in column
  const { data: existingCards } = await supabase
    .from('cards')
    .select('position')
    .eq('column_id', columnId)
    .order('position', { ascending: false })
    .limit(1);

  const maxPosition = existingCards && existingCards.length > 0 
    ? existingCards[0].position + 1 
    : 0;

  const { data, error } = await supabase
    .from('cards')
    .insert({
      column_id: columnId,
      position: maxPosition,
      address: cardData.address || '',
      job_type: cardData.job_type || null,
      client_name: cardData.client_name || null,
      client_phone: cardData.client_phone || null,
      client_email: cardData.client_email || null,
      property_manager: cardData.property_manager || null,
      notes: cardData.notes || null,
      quote_amount: cardData.quote_amount || null,
      projected_cost: cardData.projected_cost || null,
      projected_profit: cardData.projected_profit || null,
      projected_commission: cardData.projected_commission || null,
      projected_office: cardData.projected_office || null,
      priority: cardData.priority || null,
      due_date: cardData.due_date || null,
    })
    .select()
    .single();

  if (error) throw error;

  // Get column name for activity
  const { data: column } = await supabase
    .from('columns')
    .select('name')
    .eq('id', columnId)
    .single();

  // Create activity entry
  await createCardActivity(data.id, 'created', `Card created in ${column?.name || 'Unknown'}`);

  // Fetch with labels
  return getCardById(data.id) as Promise<CardWithLabels>;
}

export async function updateCard(
  cardId: string,
  updates: Partial<Card>
): Promise<CardWithLabels> {
  // Track field changes for activity
  const oldCard = await getCardById(cardId);
  if (!oldCard) throw new Error('Card not found');

  // Filter out fields that aren't actual columns on the cards table
  // Remove 'labels' and 'card_labels' which come from CardWithLabels but aren't columns
  const validCardColumns = [
    'column_id',
    'position',
    'address',
    'job_type',
    'client_name',
    'client_phone',
    'client_email',
    'property_manager',
    'notes',
    'quote_amount',
    'projected_cost',
    'projected_profit',
    'projected_commission',
    'projected_office',
    'priority',
    'due_date',
  ];
  
  const filteredUpdates: Record<string, any> = {};
  for (const key in updates) {
    if (validCardColumns.includes(key) && updates[key as keyof Card] !== undefined) {
      filteredUpdates[key] = updates[key as keyof Card];
    }
  }

  const { data, error } = await supabase
    .from('cards')
    .update(filteredUpdates)
    .eq('id', cardId)
    .select()
    .single();

  if (error) throw error;

  // Log field updates
  const fieldChanges: string[] = [];
  if (updates.address && updates.address !== oldCard.address) {
    fieldChanges.push(`Address updated to "${updates.address}"`);
  }
  if (updates.quote_amount !== undefined && updates.quote_amount !== oldCard.quote_amount) {
    fieldChanges.push(`Quote updated from ${formatCurrency(oldCard.quote_amount || 0)} to ${formatCurrency(updates.quote_amount || 0)}`);
  }
  if (updates.priority && updates.priority !== oldCard.priority) {
    fieldChanges.push(`Priority changed to ${updates.priority}`);
  }
  if (updates.job_type && updates.job_type !== oldCard.job_type) {
    fieldChanges.push(`Job type changed to ${updates.job_type}`);
  }

  if (fieldChanges.length > 0) {
    await createCardActivity(cardId, 'field_updated', fieldChanges.join(', '), {
      old_values: oldCard,
      new_values: updates,
    });
  }

  return getCardById(cardId) as Promise<CardWithLabels>;
}

export async function moveCard(
  cardId: string,
  newColumnId: string,
  newPosition: number
): Promise<void> {
  const card = await getCardById(cardId);
  if (!card) {
    throw new Error('Card not found');
  }

  const oldColumnId = card.column_id;

  // Get column names for activity
  const { data: columns, error: columnsError } = await supabase
    .from('columns')
    .select('id, name')
    .in('id', [oldColumnId, newColumnId]);

  if (columnsError) {
    throw new Error(`Failed to fetch column information: ${columnsError.message}`);
  }

  const oldColumn = columns?.find(c => c.id === oldColumnId);
  const newColumn = columns?.find(c => c.id === newColumnId);

  if (!newColumn) {
    throw new Error('Target column not found');
  }

  // Update card position
  const { error } = await supabase
    .from('cards')
    .update({
      column_id: newColumnId,
      position: newPosition,
    })
    .eq('id', cardId);

  if (error) {
    throw new Error(`Failed to move card: ${error.message}`);
  }

  // Log move activity (don't await - fire and forget for better performance)
  createCardActivity(
    cardId,
    'moved',
    `Moved from ${oldColumn?.name || 'Unknown'} to ${newColumn?.name || 'Unknown'}`,
    {
      old_column_id: oldColumnId,
      new_column_id: newColumnId,
      old_column_name: oldColumn?.name,
      new_column_name: newColumn?.name,
    }
  ).catch(err => {
    // Log activity errors but don't fail the move
    console.error('Failed to log card activity:', err);
  });
}

export async function deleteCard(cardId: string): Promise<void> {
  const { error } = await supabase
    .from('cards')
    .delete()
    .eq('id', cardId);

  if (error) throw error;
}

// ===========================================
// LABEL OPERATIONS
// ===========================================

export async function getLabels(): Promise<Label[]> {
  const { data, error } = await supabase
    .from('labels')
    .select('*')
    .order('name', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function updateCardLabels(cardId: string, labelIds: string[]): Promise<void> {
  // Remove all existing labels
  const { error: deleteError } = await supabase
    .from('card_labels')
    .delete()
    .eq('card_id', cardId);

  if (deleteError) throw deleteError;

  // Add new labels
  if (labelIds.length > 0) {
    const { error: insertError } = await supabase
      .from('card_labels')
      .insert(labelIds.map(labelId => ({ card_id: cardId, label_id: labelId })));

    if (insertError) throw insertError;
  }

  // Log activity
  const { data: labels } = await supabase
    .from('labels')
    .select('name')
    .in('id', labelIds);

  const labelNames = labels?.map(l => l.name).join(', ') || 'None';
  await createCardActivity(cardId, 'field_updated', `Labels updated: ${labelNames}`);
}

// ===========================================
// FILE OPERATIONS
// ===========================================

export async function getCardFiles(cardId: string): Promise<CardFile[]> {
  const { data, error } = await supabase
    .from('card_files')
    .select('*')
    .eq('card_id', cardId)
    .order('uploaded_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function uploadCardFile(
  cardId: string,
  file: File,
  fileType: CardFile['file_type']
): Promise<CardFile> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
  const filePath = `${cardId}/${fileType}/${fileName}`;

  // Upload to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from('project-files')
    .upload(filePath, file);

  if (uploadError) throw uploadError;

  // Create file record
  const { data, error } = await supabase
    .from('card_files')
    .insert({
      card_id: cardId,
      file_name: file.name,
      file_type: fileType,
      file_path: filePath,
      file_size: file.size,
    })
    .select()
    .single();

  if (error) throw error;

  // Log activity
  await createCardActivity(
    cardId,
    'file_uploaded',
    `File uploaded: ${file.name}`,
    { file_type: fileType, file_path: filePath }
  );

  return data;
}

export async function deleteCardFile(fileId: string): Promise<void> {
  // Get file info
  const { data: file } = await supabase
    .from('card_files')
    .select('file_path, card_id')
    .eq('id', fileId)
    .single();

  if (!file) throw new Error('File not found');

  // Delete from storage
  const { error: storageError } = await supabase.storage
    .from('project-files')
    .remove([file.file_path]);

  if (storageError) throw storageError;

  // Delete record
  const { error } = await supabase
    .from('card_files')
    .delete()
    .eq('id', fileId);

  if (error) throw error;

  // Log activity
  await createCardActivity(
    file.card_id,
    'field_updated',
    `File deleted: ${file.file_path.split('/').pop()}`,
    { file_path: file.file_path }
  );
}

export async function getFileUrl(filePath: string): Promise<string> {
  const { data } = await supabase.storage
    .from('project-files')
    .getPublicUrl(filePath);

  return data.publicUrl;
}

// ===========================================
// ACTIVITY OPERATIONS
// ===========================================

export async function getCardActivities(cardId: string): Promise<CardActivity[]> {
  const { data, error } = await supabase
    .from('card_activity')
    .select('*')
    .eq('card_id', cardId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function createCardActivity(
  cardId: string,
  activityType: CardActivity['activity_type'],
  description: string,
  metadata?: Record<string, any>
): Promise<CardActivity> {
  const { data, error } = await supabase
    .from('card_activity')
    .insert({
      card_id: cardId,
      activity_type: activityType,
      description,
      metadata: metadata || null,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ===========================================
// HELPER FUNCTIONS
// ===========================================

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}
