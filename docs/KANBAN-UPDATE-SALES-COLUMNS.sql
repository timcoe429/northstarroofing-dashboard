-- ===========================================
-- UPDATE SALES PIPELINE COLUMNS
-- ===========================================
-- Run this SQL in your Supabase SQL Editor to update Sales Pipeline columns
-- This preserves existing cards by moving them to a temporary column before deleting old columns

do $$
declare
  sales_board_id uuid;
  temp_column_id uuid;
  new_lead_column_id uuid;
  old_column_ids uuid[];
  card_position_offset int;
begin
  -- Get Sales Pipeline board ID
  select id into sales_board_id from public.boards where slug = 'sales' limit 1;
  
  if sales_board_id is null then
    raise exception 'Sales Pipeline board not found';
  end if;

  -- Step 1: Create a temporary column to preserve cards (use unique name to avoid conflicts)
  insert into public.columns (board_id, name, position, color)
  values (sales_board_id, '__TEMP_MIGRATION_COLUMN__', 999, null)
  on conflict do nothing
  returning id into temp_column_id;

  -- Get temp column ID if it already exists
  if temp_column_id is null then
    select id into temp_column_id 
    from public.columns 
    where board_id = sales_board_id and name = '__TEMP_MIGRATION_COLUMN__' 
    limit 1;
  end if;

  -- Step 2: Get all old column IDs that will be deleted
  select array_agg(id) into old_column_ids
  from public.columns
  where board_id = sales_board_id 
    and name in ('Leads', 'Roof Scope Received', 'Estimate Sent', 'Proposal Sent', 'Won', 'Lost');

  -- Step 3: Move all cards from old columns to temporary column
  if old_column_ids is not null and array_length(old_column_ids, 1) > 0 and temp_column_id is not null then
    -- Get current max position in temp column
    select coalesce(max(position), -1) into card_position_offset
    from public.cards
    where column_id = temp_column_id;

    -- Move cards with sequential positions
    update public.cards
    set column_id = temp_column_id,
        position = card_position_offset + row_number() over (order by created_at)
    where column_id = any(old_column_ids);
  end if;

  -- Step 4: Delete old Sales Pipeline columns
  -- Cards are already moved, so they won't be deleted
  delete from public.columns
  where board_id = sales_board_id
    and name in ('Leads', 'Roof Scope Received', 'Estimate Sent', 'Proposal Sent', 'Won', 'Lost');

  -- Step 5: Insert new Sales Pipeline columns with correct positions
  insert into public.columns (board_id, name, position, color)
  select 
    sales_board_id,
    col.name,
    col.position,
    col.color
  from (values
    ('New Lead', 0, null),
    ('Site Visit/Info Needed', 1, null),
    ('Estimating', 2, null),
    ('Estimate Sent', 3, null),
    ('Follow-Up', 4, null),
    ('Won', 5, '#059669'),
    ('Lost/Dead', 6, '#dc2626')
  ) as col(name, position, color)
  on conflict (board_id, name, position) do update
  set name = excluded.name,
      position = excluded.position,
      color = excluded.color;

  -- Step 6: Get the new "New Lead" column ID
  select id into new_lead_column_id
  from public.columns
  where board_id = sales_board_id and name = 'New Lead'
  limit 1;

  -- Step 7: Move cards from temp column to new "New Lead" column
  if temp_column_id is not null and new_lead_column_id is not null then
    -- Get current max position in New Lead column
    select coalesce(max(position), -1) into card_position_offset
    from public.cards
    where column_id = new_lead_column_id;

    -- Move cards with sequential positions
    update public.cards
    set column_id = new_lead_column_id,
        position = card_position_offset + row_number() over (order by position, created_at)
    where column_id = temp_column_id;
  end if;

  -- Step 8: Delete the temporary column (should be empty now)
  delete from public.columns
  where id = temp_column_id;

end $$;

-- Verify the update
select 
  b.name as board_name,
  c.name as column_name,
  c.position,
  count(cards.id) as card_count
from public.boards b
left join public.columns c on c.board_id = b.id
left join public.cards on cards.column_id = c.id
where b.slug = 'sales'
group by b.name, c.name, c.position
order by c.position;
