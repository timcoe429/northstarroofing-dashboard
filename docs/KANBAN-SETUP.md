# Kanban Board System - Setup Guide

## Prerequisites

1. Supabase project created and configured
2. Environment variables set up (see `QUICK-START.md`)

## Database Setup

### Step 1: Create Tables

Run the SQL from `docs/KANBAN-SCHEMA.sql` in your Supabase SQL Editor.

This creates:
- `boards` - Board definitions
- `columns` - Column definitions with positions
- `cards` - Card data with all project/financial fields
- `labels` - Reusable label definitions
- `card_labels` - Many-to-many relationship
- `card_activity` - Activity timeline tracking
- `card_files` - File metadata

### Step 2: Seed Initial Data

Run the SQL from `docs/KANBAN-SEED.sql` in your Supabase SQL Editor.

This seeds:
- 2 boards (Sales Pipeline, Production)
- 11 columns (6 for Sales, 5 for Production)
- 6 default labels
- 2-3 sample cards with Roaring Fork Valley addresses

### Step 3: Create Storage Bucket

1. Go to Supabase Dashboard → Storage
2. Create a new bucket named `project-files`
3. Set it to **Public** (or configure RLS policies as needed)
4. The folder structure will be created automatically when files are uploaded:
   - `project-files/{card_id}/estimates/`
   - `project-files/{card_id}/roof-scopes/`
   - `project-files/{card_id}/photos/`
   - `project-files/{card_id}/contracts/`
   - `project-files/{card_id}/other/`

## Install Dependencies

```bash
npm install
```

This will install the new @dnd-kit packages:
- `@dnd-kit/core`
- `@dnd-kit/sortable`
- `@dnd-kit/utilities`

## Verify Setup

1. Start the dev server: `npm run dev`
2. Navigate to `/boards` - you should see the board selector
3. Click on a board to view the Kanban interface
4. Try creating a card, dragging it between columns, and editing it

## Features

- ✅ View boards with columns and cards
- ✅ Create new cards with basic info
- ✅ Drag cards between columns (updates database and logs activity)
- ✅ Open card detail modal and edit all fields
- ✅ Upload files to cards (stored in Supabase Storage)
- ✅ View activity timeline showing card history
- ✅ Edit financial fields
- ✅ Assign labels to cards

## Troubleshooting

### Cards not appearing
- Check that columns were created correctly
- Verify board_id matches in columns table

### Drag and drop not working
- Ensure @dnd-kit packages are installed
- Check browser console for errors

### File uploads failing
- Verify `project-files` bucket exists in Supabase Storage
- Check bucket permissions (should be public or have proper RLS policies)
- Check browser console for errors

### Activity not logging
- Check that `card_activity` table exists
- Verify mutations are calling `createCardActivity` function
