# Kanban Board Audit Report
## Date: February 7, 2026

## Critical Issues (Broken / Non-functional)

### 1. File Uploads Fail
**Description:** File uploads show error dialog "Failed to upload file. Please try again" when attempting to upload files to cards.

**Files Affected:**
- `src/lib/supabase/kanban.ts` - `uploadCardFile` function (lines 480-520)
- `src/components/kanban/card-modal/FileAttachments.tsx` - `handleFileSelect` function (lines 40-70)

**How Trello Handles It:** Trello uploads files to their CDN and stores metadata. Files are immediately available after upload.

**Root Cause Analysis:**
- The `uploadCardFile` function uploads to Supabase Storage bucket `project-files` but:
  1. Bucket may not exist (setup docs say to create it manually)
  2. Bucket may not have proper RLS policies allowing uploads
  3. Storage bucket permissions may be misconfigured (needs public or authenticated write access)
  4. Error handling doesn't provide specific error details to user

**Recommended Fix Approach:**
1. Add error logging to capture specific Supabase Storage error
2. Check if bucket exists before upload (or create it programmatically)
3. Verify RLS policies allow authenticated users to upload
4. Add better error messages showing specific failure reason
5. Consider adding retry logic for transient failures

**Estimated Complexity:** M

---

### 2. Currency Fields Broken - Cannot Type Naturally
**Description:** When editing currency fields (Quote Amount, Projected Cost, etc.), users must add one cent at a time. Typing "45000" doesn't work correctly - the field strips "$" and commas on edit, but parsing logic produces wrong values.

**Files Affected:**
- `src/components/kanban/card-modal/EditableField.tsx` - Currency handling (lines 36-48, 73-76, 132)
- `src/components/kanban/card-modal/FinancialFields.tsx` - Uses EditableField with currency type

**How Trello Handles It:** Trello allows natural typing in currency fields. User can type "45000" and it formats to "$45,000.00". The input accepts numeric input and formats on blur.

**Root Cause Analysis:**
- Line 132: Input value is `displayValue.replace('$', '').replace(/,/g, '')` - this strips formatting correctly
- Line 75: `parseFloat(newValue.replace(/[^0-9.-]+/g, ''))` - parsing logic looks correct
- Issue: The `displayValue` state (line 33) is formatted with `$` and commas, but when editing, the input shows the stripped version. The problem is likely:
  1. When user types "45000", `handleChange` fires and calls `onChange(numValue)` 
  2. This triggers auto-save hook which may save before user finishes typing
  3. The formatted display value may interfere with natural typing flow
  4. The input type is 'text' but value manipulation fights with display formatting

**Recommended Fix Approach:**
1. When editing currency, show raw numeric value (no $, no commas) in input
2. Only format on blur/display mode
3. Allow typing numbers naturally: "45000" → parse as 45000 → save as 45000.00
4. Format display as "$45,000.00" only when not editing
5. Consider using a currency input library or better state management for edit vs display modes

**Estimated Complexity:** M

---

### 3. Delete Card Doesn't Work
**Description:** Delete button exists in modal header, but clicking it doesn't actually delete the card. The confirm dialog appears, but deletion fails silently or doesn't complete.

**Files Affected:**
- `src/lib/supabase/kanban.ts` - `deleteCard` function (lines 330-337)
- `src/components/kanban/CardDetailModal.tsx` - `handleDeleteCard` function (lines 448-464)

**How Trello Handles It:** Trello deletes cards immediately after confirmation. Card disappears from board, and all related data (attachments, comments, activity) are deleted.

**Root Cause Analysis:**
- `deleteCard` function (line 330) only deletes from `cards` table
- Foreign keys have `ON DELETE CASCADE` (per schema), so `card_labels`, `card_activity`, `card_files` records should auto-delete
- However, `card_files` table stores `file_path` pointing to Supabase Storage - the actual files in storage are NOT deleted
- The function doesn't handle:
  1. Deleting files from Supabase Storage before deleting card record
  2. Error handling if deletion fails
  3. The confirm dialog uses `confirm()` which may be blocked by browser

**Recommended Fix Approach:**
1. Before deleting card, fetch all `card_files` for the card
2. Delete each file from Supabase Storage using `supabase.storage.from('project-files').remove([file_path])`
3. Then delete card record (which will CASCADE delete related records)
4. Add proper error handling and user feedback
5. Replace `confirm()` with custom modal (already have `showDeleteConfirm` state)
6. Add loading state during deletion

**Estimated Complexity:** M

---

## Major Issues (Works but poorly / wrong behavior)

### 4. Card Position Updates Not Optimized
**Description:** When moving cards, the `moveCard` function doesn't update positions of other cards in the column. If you move a card to position 2, cards at positions 2+ should shift down.

**Files Affected:**
- `src/lib/supabase/kanban.ts` - `moveCard` function (lines 271-328)
- `src/components/kanban/Board.tsx` - Drag handling (lines 61-157)

**How Trello Handles It:** Trello automatically repositions all cards in affected columns when a card is moved, ensuring no gaps in positions.

**Root Cause Analysis:**
- `moveCard` only updates the moved card's `column_id` and `position`
- Doesn't update positions of other cards in source or target columns
- Board.tsx optimistically updates local state with correct positions (lines 114-116, 122-123, 130-132), but database doesn't reflect this
- This can cause position conflicts and incorrect ordering on page refresh

**Recommended Fix Approach:**
1. In `moveCard`, after moving card, update positions of all affected cards:
   - Remove card from source column, shift remaining cards up
   - Insert card in target column, shift cards at/after target position down
2. Use a transaction to ensure atomicity
3. Or batch update all positions in the column

**Estimated Complexity:** M

---

### 5. Auto-Save Doesn't Cancel on Escape for Currency Fields
**Description:** When editing currency fields, pressing Escape should cancel edits and revert to original value, but the auto-save hook may have already triggered a save.

**Files Affected:**
- `src/components/kanban/card-modal/EditableField.tsx` - Escape handling (lines 87-96)
- `src/hooks/useAutoSave.ts` - Debounce logic (lines 59-78)

**How Trello Handles It:** Trello cancels edits on Escape and reverts to original value without saving.

**Root Cause Analysis:**
- `EditableField` handles Escape key (line 87) and resets `displayValue` to original
- However, `useAutoSave` hook has debounced save that may fire after Escape is pressed
- The debounce timer (line 69) isn't cleared when Escape is pressed
- Value may have already been passed to `onChange` which triggers debounced save

**Recommended Fix Approach:**
1. Clear debounce timer when Escape is pressed
2. Add a "cancel" method to `useAutoSave` hook that clears timer and resets value
3. Call cancel method from EditableField on Escape
4. Ensure onChange isn't called when canceling

**Estimated Complexity:** S

---

### 6. Calculated Profit Field Doesn't Auto-Update When Quote/Cost Change
**Description:** The FinancialFields component shows a "Calculated Profit" display field, but it only updates when the component re-renders. If user edits Quote Amount and Projected Cost, the calculated profit doesn't update in real-time.

**Files Affected:**
- `src/components/kanban/card-modal/FinancialFields.tsx` - Calculated profit (lines 52-54, 92-102)

**How Trello Handles It:** Trello doesn't have calculated fields, but custom fields that reference other fields update immediately when dependencies change.

**Root Cause Analysis:**
- Calculated profit is computed from props (lines 52-54)
- Props come from auto-save hooks which update asynchronously
- The calculation runs on every render, but the display value may be stale until parent re-renders
- No real-time update mechanism

**Recommended Fix Approach:**
1. Use `useMemo` to recalculate when quoteAmount or projectedCost change
2. Or make it a true calculated field that updates immediately when either dependency changes
3. Consider making it editable (override calculated value) like Trello custom fields

**Estimated Complexity:** S

---

### 7. Label Picker "Create New Label" Doesn't Work
**Description:** The label picker has a "Create new label" button at the bottom, but clicking it only logs to console. No actual label creation happens.

**Files Affected:**
- `src/components/kanban/card-modal/LabelPicker.tsx` - Create label button (lines 185-213)
- `src/lib/supabase/kanban.ts` - Missing `createLabel` function

**How Trello Handles It:** Trello allows creating new labels on-the-fly from the label picker. User can set name and color immediately.

**Root Cause Analysis:**
- Button has TODO comment (line 188)
- No `createLabel` function exists in kanban.ts
- No API endpoint to create labels

**Recommended Fix Approach:**
1. Add `createLabel` function to kanban.ts
2. Add form/modal to collect label name and color
3. Create label in database
4. Refresh label list
5. Optionally auto-select newly created label

**Estimated Complexity:** M

---

### 8. Activity Feed Doesn't Show All Activity Types
**Description:** Activity feed may not be logging all types of changes. Some field updates may not create activity entries.

**Files Affected:**
- `src/lib/supabase/kanban.ts` - `updateCard` function (lines 201-269)
- `src/lib/supabase/kanban.ts` - `createCardActivity` calls

**How Trello Handles It:** Trello logs every change: card creation, moves, field updates, label changes, file uploads, comments, due date changes, etc.

**Root Cause Analysis:**
- `updateCard` only logs activity for: address, quote_amount, priority, job_type (lines 248-259)
- Missing activity logging for:
  - client_name, client_phone, client_email, property_manager
  - projected_cost, projected_profit, projected_commission, projected_office
  - due_date changes
  - notes/description changes
- Label changes ARE logged (line 462 in `updateCardLabels`)

**Recommended Fix Approach:**
1. Add activity logging for all field changes in `updateCard`
2. Create helper function to generate activity descriptions for each field type
3. Log due_date changes in `handleDueDateChange` (already exists in CardDetailModal)
4. Ensure all mutations create appropriate activity entries

**Estimated Complexity:** S

---

### 9. Modal Doesn't Close on Escape When Delete Confirm is Open
**Description:** When delete confirmation dialog is open, pressing Escape closes the main modal instead of just the delete confirm dialog.

**Files Affected:**
- `src/components/kanban/CardDetailModal.tsx` - Escape handler (lines 117-141)

**How Trello Handles It:** Trello's delete confirmation is a modal overlay. Escape closes the confirmation, not the card detail modal.

**Root Cause Analysis:**
- Escape handler checks `showDeleteConfirm` (line 121) but still calls `onClose()` which closes main modal
- Delete confirm dialog doesn't have its own Escape handler
- The check prevents Escape from closing main modal, but doesn't close delete confirm

**Recommended Fix Approach:**
1. If `showDeleteConfirm` is true, close delete confirm on Escape instead of main modal
2. Add Escape handler to delete confirm dialog that sets `showDeleteConfirm` to false
3. Only close main modal on Escape if delete confirm is not showing

**Estimated Complexity:** S

---

### 10. Card Copy Function Not Accessible from UI
**Description:** The `copyCard` function exists in kanban.ts but there's no UI button to copy/duplicate a card.

**Files Affected:**
- `src/lib/supabase/kanban.ts` - `copyCard` function (lines 339-401)
- `src/components/kanban/CardDetailModal.tsx` - Missing copy button

**How Trello Handles It:** Trello has a "Copy" option in the card actions menu that duplicates the card.

**Root Cause Analysis:**
- Function exists and appears complete
- No button or menu item in CardDetailModal to trigger it
- No way for users to access this functionality

**Recommended Fix Approach:**
1. Add "Copy" button to card actions section in modal header
2. Call `copyCard` function on click
3. Refresh board to show new card
4. Optionally open the new card's modal

**Estimated Complexity:** S

---

## Minor Issues (Missing polish / UX gaps)

### 11. No Search/Filter Functionality
**Description:** There's no way to search for cards or filter cards by label, priority, due date, etc.

**Files Affected:**
- No search component exists
- `src/components/kanban/Board.tsx` - No filtering logic

**How Trello Handles It:** Trello has a search bar that filters cards by text, labels, members, etc.

**Recommended Fix Approach:**
1. Add search input to board header
2. Filter cards by address, client name, job type, etc.
3. Add filter dropdowns for labels, priority, due date
4. Highlight matching cards

**Estimated Complexity:** M

---

### 12. Column Headers Don't Show Card Count When Empty
**Description:** Column headers show card count badge, but it may not be visible or styled well when count is 0.

**Files Affected:**
- `src/components/kanban/Column.tsx` - Card count badge (lines 58-67)

**How Trello Handles It:** Trello shows card count even when 0, but styled subtly.

**Root Cause Analysis:**
- Badge shows `{column.cards.length}` which is correct
- Styling may make it hard to see when 0
- No visual distinction for empty columns

**Recommended Fix Approach:**
1. Always show count badge
2. Style differently when count is 0 (lighter color, smaller)
3. Consider showing "Empty" text when count is 0

**Estimated Complexity:** S

---

### 13. No Board-Level Operations (Rename, Delete Board)
**Description:** Users can't rename boards, delete boards, or manage board settings.

**Files Affected:**
- No board management UI exists
- `src/lib/supabase/kanban.ts` - Missing `updateBoard`, `deleteBoard` functions

**How Trello Handles It:** Trello allows renaming boards, changing board settings, archiving boards, etc.

**Recommended Fix Approach:**
1. Add board settings page/modal
2. Add `updateBoard` and `deleteBoard` functions
3. Add UI to rename board from board view
4. Add delete board option (with confirmation)

**Estimated Complexity:** M

---

### 14. No Column Management (Reorder, Rename, Add, Delete)
**Description:** Users can't reorder columns, rename columns, add new columns, or delete columns.

**Files Affected:**
- No column management UI exists
- `src/lib/supabase/kanban.ts` - Missing column CRUD functions

**How Trello Handles It:** Trello allows reordering lists (columns), renaming, adding, archiving.

**Recommended Fix Approach:**
1. Add drag-and-drop for columns (horizontal)
2. Add "Add Column" button
3. Add rename column (click header to edit)
4. Add delete column option
5. Add `updateColumn`, `createColumn`, `deleteColumn` functions

**Estimated Complexity:** L

---

### 15. Horizontal Scrolling May Not Work Well on Mobile
**Description:** Board has horizontal scrolling for many columns, but mobile experience may be poor.

**Files Affected:**
- `src/app/boards/[slug]/page.tsx` - Scroll container (lines 137-150)
- `src/components/kanban/Board.tsx` - Board layout (lines 315-331)

**How Trello Handles It:** Trello has responsive design that adapts to mobile screens, sometimes stacking columns vertically.

**Root Cause Analysis:**
- Board uses `overflowX: 'auto'` for horizontal scroll
- Columns have fixed `minWidth: 280, maxWidth: 280`
- No responsive breakpoints
- Panning gesture may conflict with touch scrolling

**Recommended Fix Approach:**
1. Add responsive breakpoints
2. On mobile, consider vertical stacking or swipeable columns
3. Improve touch gesture handling
4. Test on actual mobile devices

**Estimated Complexity:** M

---

### 16. File Attachments Don't Show Thumbnails for Images
**Description:** File attachments show generic icons (🖼️, 📄) but don't show actual image thumbnails for photos.

**Files Affected:**
- `src/components/kanban/card-modal/FileAttachments.tsx` - File display (lines 154-235)

**How Trello Handles It:** Trello shows image thumbnails for image files, making it easy to identify photos.

**Root Cause Analysis:**
- Files are displayed with emoji icons based on `file_type` (lines 91-104)
- No logic to detect if file is an image and show thumbnail
- No thumbnail generation or storage

**Recommended Fix Approach:**
1. Check file extension or MIME type for images
2. Use Supabase Storage `getPublicUrl` to get image URL
3. Display `<img>` tag with thumbnail (limit size to ~100x100px)
4. Show full image on click
5. Consider generating thumbnails on upload

**Estimated Complexity:** M

---

### 17. Activity Feed Timestamps Could Be More Relative
**Description:** Activity feed shows "2h ago", "3d ago" but could be more specific (e.g., "2 hours 15 minutes ago" or show exact time for recent activities).

**Files Affected:**
- `src/components/kanban/card-modal/ActivityFeed.tsx` - `formatTimestamp` function (lines 22-41)

**How Trello Handles It:** Trello shows very specific relative times ("2 minutes ago", "an hour ago") and exact dates for older items.

**Root Cause Analysis:**
- Current implementation rounds to hours/days
- Doesn't show minutes for recent activities (< 1 hour)
- Could be more granular

**Recommended Fix Approach:**
1. Show minutes for activities < 1 hour ("5m ago", "23m ago")
2. Show "Just now" for < 1 minute
3. Show exact time for today's activities ("2:34 PM")
4. Keep relative format for older items

**Estimated Complexity:** S

---

### 18. No Loading States for Initial Board Load
**Description:** When board page loads, there's a loading state, but individual card modals don't show loading while fetching card data.

**Files Affected:**
- `src/components/kanban/CardDetailModal.tsx` - `loadRelatedData` (lines 82-101)
- `src/app/boards/[slug]/page.tsx` - `handleCardClick` (lines 50-60)

**How Trello Handles It:** Trello shows skeleton loaders or spinners while loading card details.

**Root Cause Analysis:**
- Modal opens immediately when card clicked
- `loadRelatedData` runs asynchronously but modal shows empty/loading state
- `isLoading` state exists but may not be used in UI

**Recommended Fix Approach:**
1. Show loading spinner in modal while `isLoading` is true
2. Show skeleton placeholders for fields
3. Disable interactions until data loads

**Estimated Complexity:** S

---

### 19. No Undo/Redo Functionality
**Description:** There's no way to undo accidental changes or deletions.

**Files Affected:**
- No undo system exists

**How Trello Handles It:** Trello doesn't have undo either, but shows clear confirmations for destructive actions.

**Recommended Fix Approach:**
1. Implement undo stack for field edits
2. Store previous values before changes
3. Show "Undo" toast notification after saves
4. Consider implementing for deletions (soft delete with undo period)

**Estimated Complexity:** L

---

### 20. Card Modal Two-Column Layout May Overflow on Small Screens
**Description:** Modal uses fixed widths (460px for right sidebar) which may cause horizontal overflow on smaller screens.

**Files Affected:**
- `src/components/kanban/CardDetailModal.tsx` - Modal layout (lines 589-984)

**How Trello Handles It:** Trello's modal is responsive and adapts to screen size, sometimes stacking columns vertically.

**Root Cause Analysis:**
- Right sidebar has `width: 460, minWidth: 460` (line 962)
- Left side has `flexBasis: 460` (line 597)
- Total width ~920px + padding, which exceeds many screen widths
- No responsive breakpoints

**Recommended Fix Approach:**
1. Add media queries for smaller screens
2. Stack columns vertically on mobile/tablet
3. Make sidebar collapsible
4. Use flexible widths with max constraints

**Estimated Complexity:** M

---

## Missing Features (Trello has it, we don't)

### 21. No Card Templates
**Description:** Can't create card templates for common project types.

**How Trello Handles It:** Trello allows creating card templates that pre-fill fields.

**Recommended Fix Approach:**
1. Add template system
2. Allow saving cards as templates
3. Create card from template option

**Estimated Complexity:** M

---

### 22. No Checklists/Subtasks
**Description:** Cards can't have checklists or subtasks.

**How Trello Handles It:** Trello has a checklist feature where cards can have multiple checkable items.

**Recommended Fix Approach:**
1. Add checklist table
2. Add checklist UI component
3. Allow adding/removing/checking items

**Estimated Complexity:** M

---

### 23. No Card Members/Assignees
**Description:** Can't assign cards to team members.

**How Trello Handles It:** Trello allows adding members to cards and assigning them.

**Recommended Fix Approach:**
1. Add user/member system
2. Add assignee field to cards
3. Show assignee avatars on cards

**Estimated Complexity:** L (requires user system)

---

### 24. No Card Cover Images
**Description:** Can't set a cover image for cards that displays on the board view.

**How Trello Handles It:** Trello allows setting a cover image from attachments.

**Recommended Fix Approach:**
1. Add cover_image_path field to cards
2. Allow selecting image from attachments
3. Display cover image on card in board view

**Estimated Complexity:** S

---

### 25. No Power-Ups/Integrations
**Description:** No way to integrate with external services (calendar, time tracking, etc.).

**How Trello Handles It:** Trello has Power-Ups for integrations.

**Recommended Fix Approach:**
1. Build integration system
2. Allow third-party integrations

**Estimated Complexity:** L

---

## Working Correctly

The following features appear to be working as expected:

1. ✅ **Board View Rendering** - Boards, columns, and cards display correctly
2. ✅ **Drag and Drop Between Columns** - Cards can be dragged between columns
3. ✅ **Card Reordering Within Columns** - Cards can be reordered within same column
4. ✅ **Card Creation** - New cards can be created from column "Add Card" button
5. ✅ **Card Detail Modal Opening/Closing** - Modal opens on card click, closes on overlay/X/Escape
6. ✅ **Label Display** - Labels show correctly on cards and in modal
7. ✅ **Label Toggling** - Labels can be added/removed from cards (with optimistic updates)
8. ✅ **Priority Display** - Priority indicators show on cards
9. ✅ **Due Date Display** - Due dates show on cards with overdue styling
10. ✅ **Overdue Styling** - Cards with overdue due dates show red border
11. ✅ **Label Color Borders** - First label color shows as card border
12. ✅ **Column Card Counts** - Column headers show correct card counts
13. ✅ **Auto-Save for Text Fields** - Text fields auto-save with debounce
14. ✅ **Save Indicators** - Save indicators show saving/saved/error states
15. ✅ **Activity Feed Display** - Activity feed shows card history
16. ✅ **Comment Adding** - Comments can be added to cards
17. ✅ **Activity Hide/Show Toggle** - Activity feed can be hidden/shown
18. ✅ **Card Field Updates** - Most card fields can be edited and saved
19. ✅ **Move Card from Modal** - Column dropdown in modal can move cards
20. ✅ **File List Display** - File attachments list displays correctly
21. ✅ **File Deletion** - Files can be deleted from cards
22. ✅ **File Type Detection** - File types are detected from extensions
23. ✅ **Horizontal Scrolling** - Board scrolls horizontally when many columns
24. ✅ **Panning Gesture** - Board can be panned by clicking and dragging empty space

---

## Summary Statistics

- **Critical Issues:** 3
- **Major Issues:** 7
- **Minor Issues:** 9
- **Missing Features:** 5
- **Working Features:** 24

**Total Issues Found:** 24
**Total Features Working:** 24
