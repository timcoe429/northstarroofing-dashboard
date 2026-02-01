-- ===========================================
-- KANBAN BOARD SYSTEM - DATABASE SCHEMA
-- ===========================================
-- Run this SQL in your Supabase SQL Editor to create all tables

-- Boards table
create table if not exists public.boards (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now()
);

-- Columns table
create table if not exists public.columns (
  id uuid primary key default gen_random_uuid(),
  board_id uuid not null references public.boards(id) on delete cascade,
  name text not null,
  position integer not null,
  color text,
  created_at timestamptz not null default now()
);

create index if not exists columns_board_id_idx on public.columns(board_id);
create index if not exists columns_position_idx on public.columns(board_id, position);

-- Cards table
create table if not exists public.cards (
  id uuid primary key default gen_random_uuid(),
  column_id uuid not null references public.columns(id) on delete cascade,
  position integer not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  
  -- Project Info
  address text not null,
  job_type text,
  client_name text,
  client_phone text,
  client_email text,
  property_manager text,
  notes text,
  -- Financial Fields
  quote_amount decimal(12,2),
  projected_cost decimal(12,2),
  projected_profit decimal(12,2),
  projected_commission decimal(12,2),
  projected_office decimal(12,2),
  -- Status Fields
  priority text check (priority in ('low', 'medium', 'high', 'urgent')),
  due_date date
);

create index if not exists cards_column_id_idx on public.cards(column_id);
create index if not exists cards_position_idx on public.cards(column_id, position);

-- Labels table
create table if not exists public.labels (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  color text not null,
  created_at timestamptz not null default now()
);

-- Card Labels junction table
create table if not exists public.card_labels (
  id uuid primary key default gen_random_uuid(),
  card_id uuid not null references public.cards(id) on delete cascade,
  label_id uuid not null references public.labels(id) on delete cascade,
  unique(card_id, label_id)
);

create index if not exists card_labels_card_id_idx on public.card_labels(card_id);
create index if not exists card_labels_label_id_idx on public.card_labels(label_id);

-- Card Activity table (auto-populated on mutations)
create table if not exists public.card_activity (
  id uuid primary key default gen_random_uuid(),
  card_id uuid not null references public.cards(id) on delete cascade,
  activity_type text not null check (activity_type in ('created', 'moved', 'field_updated', 'file_uploaded', 'comment')),
  description text not null,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create index if not exists card_activity_card_id_idx on public.card_activity(card_id);
create index if not exists card_activity_created_at_idx on public.card_activity(card_id, created_at desc);

-- Card Files table
create table if not exists public.card_files (
  id uuid primary key default gen_random_uuid(),
  card_id uuid not null references public.cards(id) on delete cascade,
  file_name text not null,
  file_type text not null check (file_type in ('estimate', 'roof_scope', 'photo', 'contract', 'other')),
  file_path text not null,
  file_size integer,
  uploaded_at timestamptz not null default now()
);

create index if not exists card_files_card_id_idx on public.card_files(card_id);
create index if not exists card_files_file_type_idx on public.card_files(card_id, file_type);

-- Function to update updated_at timestamp on cards
create or replace function update_cards_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger cards_updated_at_trigger
before update on public.cards
for each row
execute function update_cards_updated_at();
