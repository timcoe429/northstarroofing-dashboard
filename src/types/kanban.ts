// DEPRECATED: Custom Kanban removed. Keeping for reference during Trello API integration. Safe to delete after Trello integration is complete.
// ===========================================
// KANBAN BOARD SYSTEM - TYPE DEFINITIONS
// ===========================================

export interface Board {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface Column {
  id: string;
  board_id: string;
  name: string;
  position: number;
  color: string | null;
  created_at: string;
}

export interface Label {
  id: string;
  name: string;
  color: string;
  created_at: string;
}

export interface Card {
  id: string;
  column_id: string;
  position: number;
  created_at: string;
  updated_at: string;
  // Project Info
  address: string;
  job_type: string | null;
  client_name: string | null;
  client_phone: string | null;
  client_email: string | null;
  property_manager: string | null;
  notes: string | null;
  // Financial Fields
  quote_amount: number | null;
  projected_cost: number | null;
  projected_profit: number | null;
  projected_commission: number | null;
  projected_office: number | null;
  // Status Fields
  priority: 'low' | 'medium' | 'high' | 'urgent' | null;
  due_date: string | null;
}

export interface CardWithLabels extends Card {
  labels: Label[];
}

export interface CardLabel {
  id: string;
  card_id: string;
  label_id: string;
}

export interface CardActivity {
  id: string;
  card_id: string;
  activity_type: 'created' | 'moved' | 'field_updated' | 'file_uploaded' | 'comment';
  description: string;
  metadata: Record<string, any> | null;
  created_at: string;
}

export interface CardFile {
  id: string;
  card_id: string;
  file_name: string;
  file_type: 'estimate' | 'roof_scope' | 'photo' | 'contract' | 'other';
  file_path: string;
  file_size: number | null;
  uploaded_at: string;
}

export interface BoardWithStats extends Board {
  card_count: number;
  in_progress_count: number;
}

export interface ColumnWithCards extends Column {
  cards: CardWithLabels[];
}
