-- ===========================================
-- KANBAN BOARD SYSTEM - SEED DATA
-- ===========================================
-- Run this SQL after creating the schema to seed initial data

-- Insert Boards
insert into public.boards (name, slug) values
  ('Sales Pipeline', 'sales'),
  ('Production', 'production')
on conflict (slug) do nothing;

-- Insert Columns for Sales Pipeline
insert into public.columns (board_id, name, position, color)
select 
  b.id,
  col.name,
  col.position,
  col.color
from public.boards b
cross join (values
  ('Leads', 0, null),
  ('Roof Scope Received', 1, null),
  ('Estimate Sent', 2, null),
  ('Proposal Sent', 3, null),
  ('Won', 4, '#059669'),
  ('Lost', 5, '#dc2626')
) as col(name, position, color)
where b.slug = 'sales'
on conflict do nothing;

-- Insert Columns for Production
insert into public.columns (board_id, name, position, color)
select 
  b.id,
  col.name,
  col.position,
  col.color
from public.boards b
cross join (values
  ('Scheduled', 0, null),
  ('Materials Ordered', 1, null),
  ('In Progress', 2, null),
  ('Punch List', 3, null),
  ('Complete', 4, '#059669')
) as col(name, position, color)
where b.slug = 'production'
on conflict do nothing;

-- Insert Default Labels
insert into public.labels (name, color) values
  ('Insurance Claim', '#3b82f6'),
  ('HOA Approval', '#f97316'),
  ('Steep Pitch', '#ef4444'),
  ('Multi-Family', '#a855f7'),
  ('Commercial', '#10b981'),
  ('Warranty Work', '#eab308')
on conflict do nothing;

-- Insert Sample Cards (2-3 realistic cards with Roaring Fork Valley addresses)
-- First, get column IDs for sample cards
do $$
declare
  sales_board_id uuid;
  leads_col_id uuid;
  estimate_col_id uuid;
  production_board_id uuid;
  scheduled_col_id uuid;
begin
  -- Get Sales Pipeline board and columns
  select id into sales_board_id from public.boards where slug = 'sales';
  select id into leads_col_id from public.columns where board_id = sales_board_id and name = 'Leads';
  select id into estimate_col_id from public.columns where board_id = sales_board_id and name = 'Estimate Sent';
  
  select id into production_board_id from public.boards where slug = 'production';
  select id into scheduled_col_id from public.columns where board_id = production_board_id and name = 'Scheduled';

  -- Sample card 1: Lead in Sales Pipeline
  insert into public.cards (
    column_id, position, address, job_type, client_name, client_phone, 
    client_email, quote_amount, priority, due_date
  ) values (
    leads_col_id, 0,
    '123 Main Street, Aspen, CO 81611',
    'Full Replacement',
    'John Smith',
    '970-555-0101',
    'john.smith@email.com',
    45000.00,
    'high',
    current_date + interval '14 days'
  );

  -- Sample card 2: Estimate Sent in Sales Pipeline
  insert into public.cards (
    column_id, position, address, job_type, client_name, client_phone,
    client_email, property_manager, quote_amount, projected_cost, projected_profit,
    priority, notes
  ) values (
    estimate_col_id, 0,
    '456 Mountain View Drive, Snowmass Village, CO 81615',
    'Repair',
    'Sarah Johnson',
    '970-555-0202',
    'sarah.j@email.com',
    'Aspen Property Management',
    12500.00,
    9750.00,
    2750.00,
    'medium',
    'Roof leak in master bedroom. Insurance claim in progress.'
  );

  -- Sample card 3: Scheduled in Production
  insert into public.cards (
    column_id, position, address, job_type, client_name, client_phone,
    client_email, quote_amount, projected_cost, projected_profit, projected_commission,
    priority, due_date, notes
  ) values (
    scheduled_col_id, 0,
    '789 Elk Run Road, Basalt, CO 81621',
    'Full Replacement',
    'Michael Chen',
    '970-555-0303',
    'mchen@email.com',
    52000.00,
    40560.00,
    11440.00,
    2288.00,
    'high',
    current_date + interval '7 days',
    'Large multi-family property. Materials ordered. Waiting for HOA approval.'
  );
end $$;

-- Assign labels to sample cards (Insurance Claim and HOA Approval to card 2, Multi-Family to card 3)
do $$
declare
  card2_id uuid;
  card3_id uuid;
  insurance_label_id uuid;
  hoa_label_id uuid;
  multifamily_label_id uuid;
begin
  -- Get card IDs (assuming they were just inserted)
  select id into card2_id from public.cards 
    where address = '456 Mountain View Drive, Snowmass Village, CO 81615' limit 1;
  select id into card3_id from public.cards 
    where address = '789 Elk Run Road, Basalt, CO 81621' limit 1;
  
  select id into insurance_label_id from public.labels where name = 'Insurance Claim';
  select id into hoa_label_id from public.labels where name = 'HOA Approval';
  select id into multifamily_label_id from public.labels where name = 'Multi-Family';

  -- Assign labels
  if card2_id is not null and insurance_label_id is not null then
    insert into public.card_labels (card_id, label_id) 
    values (card2_id, insurance_label_id)
    on conflict do nothing;
  end if;

  if card2_id is not null and hoa_label_id is not null then
    insert into public.card_labels (card_id, label_id) 
    values (card2_id, hoa_label_id)
    on conflict do nothing;
  end if;

  if card3_id is not null and multifamily_label_id is not null then
    insert into public.card_labels (card_id, label_id) 
    values (card3_id, multifamily_label_id)
    on conflict do nothing;
  end if;
end $$;

-- Create initial activity entries for sample cards
do $$
declare
  card_id uuid;
  col_name text;
begin
  -- Create "created" activity for each sample card
  for card_id in select id from public.cards loop
    select c.name into col_name 
    from public.columns c 
    where c.id = (select column_id from public.cards where id = card_id);
    
    insert into public.card_activity (card_id, activity_type, description)
    values (
      card_id,
      'created',
      'Card created in ' || col_name
    );
  end loop;
end $$;
