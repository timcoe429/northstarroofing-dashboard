// ===========================================
// TRELLO ACTIONS / LIST-MOVE UTILITIES
// ===========================================
// Uses Trello Actions API (updateCard:idList) for accurate
// "days in column" — dateLastActivity updates on any edit.

import type { TrelloCard, TrelloList, TrelloListMoveAction } from '@/types';
import { calculateDaysSince } from './trello-helpers';

/**
 * Extract creation date from Trello card ID.
 * Trello uses MongoDB-style ObjectIds: first 8 hex chars = Unix timestamp (seconds).
 * Returns null if extraction fails.
 */
function getCreationDateFromCardId(cardId: string): Date | null {
  if (!cardId || cardId.length < 8) return null;
  const ts = parseInt(cardId.substring(0, 8), 16);
  if (isNaN(ts) || ts <= 0) return null;
  const date = new Date(ts * 1000);
  if (isNaN(date.getTime())) return null;
  return date;
}

/**
 * Build a map of card ID → days in current column.
 * Uses Trello Actions API list-move data when available.
 * Fallback for cards never moved: creation date from card ID (first 8 hex chars).
 * If ID extraction fails: dateLastActivity with known imperfection.
 */
export function buildCardDaysInColumnMap(
  cards: TrelloCard[],
  _lists: TrelloList[],
  actions: TrelloListMoveAction[]
): Record<string, number> {
  const map: Record<string, number> = {};

  // Actions are newest-first. For each card, find most recent move INTO its current list.
  // Trello uses data.list for the destination list (list card was moved TO)
  for (const card of cards) {
    const action = actions.find(
      (a) =>
        a.data?.card?.id === card.id &&
        (a.data.list?.id === card.idList || a.data.listAfter?.id === card.idList)
    );

    if (action?.date) {
      map[card.id] = calculateDaysSince(action.date);
    } else {
      // Card never moved — use creation date from ID
      const created = getCreationDateFromCardId(card.id);
      if (created) {
        map[card.id] = calculateDaysSince(created.toISOString());
      } else {
        // KNOWN IMPERFECTION: dateLastActivity updates on any edit; creation-from-ID preferred but unavailable
        if (card.dateLastActivity) {
          map[card.id] = calculateDaysSince(card.dateLastActivity);
        } else {
          map[card.id] = 0;
        }
      }
    }
  }

  return map;
}

/**
 * Build a map of card ID → ISO date when card entered a specific list.
 * Used for monthly revenue: when did each card enter "Invoice Sent".
 * For cards in Paid/Warranty, they passed through Invoice Sent — find that action.
 * Fallback: creation date from card ID, or dateLastActivity (known imperfection).
 */
export function buildCardDateEnteredListMap(
  cards: TrelloCard[],
  lists: TrelloList[],
  actions: TrelloListMoveAction[],
  targetListName: string
): Record<string, string> {
  const targetList = lists.find((l) => l.name === targetListName);
  if (!targetList) return {};

  const map: Record<string, string> = {};

  for (const card of cards) {
    const action = actions.find(
      (a) =>
        a.data?.card?.id === card.id &&
        (a.data.list?.id === targetList.id || a.data.listAfter?.id === targetList.id)
    );

    if (action?.date) {
      map[card.id] = action.date;
    } else {
      const created = getCreationDateFromCardId(card.id);
      if (created) {
        map[card.id] = created.toISOString();
      } else if (card.dateLastActivity) {
        // KNOWN IMPERFECTION: dateLastActivity updates on any edit
        map[card.id] = card.dateLastActivity;
      }
    }
  }

  return map;
}
