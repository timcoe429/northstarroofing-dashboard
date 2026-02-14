// ===========================================
// TRELLO HELPER UTILITIES
// ===========================================

import type { 
  TrelloCard, 
  TrelloList, 
  TrelloCustomField, 
  CardFinancials 
} from '@/types';

// ===========================================
// CUSTOM FIELD PARSING
// ===========================================

/**
 * Parse custom field values from a card, returning a clean financial object
 * Cross-references card's customFieldItems with board's custom field definitions
 */
export function parseCustomFields(
  card: TrelloCard, 
  fieldDefinitions: TrelloCustomField[]
): CardFinancials {
  const financials: CardFinancials = {
    contractAmount: 0,
    office10Pct: 0,
    netProfit: 0,
  };

  if (!Array.isArray(card.customFieldItems) || !fieldDefinitions.length) {
    return financials;
  }

  // Create a map of field ID to field name for quick lookup
  const fieldMap = new Map<string, string>();
  fieldDefinitions.forEach(field => {
    fieldMap.set(field.id, field.name.toLowerCase());
  });

  // Parse each custom field value
  card.customFieldItems.forEach(item => {
    const fieldName = fieldMap.get(item.idCustomField);
    if (!fieldName) return;

    // Parse numeric value from either number or text field
    let numericValue = 0;
    if (item.value.number !== undefined) {
      numericValue = parseFloat(item.value.number);
    } else if (item.value.text !== undefined) {
      // Strip currency symbols, commas, spaces and parse
      const cleanedText = item.value.text.replace(/[\$,\s]/g, '');
      const parsed = parseFloat(cleanedText);
      if (!isNaN(parsed)) {
        numericValue = parsed;
      }
    }

    // Map field names to financial properties
    if (fieldName.includes('contract') && fieldName.includes('amount')) {
      financials.contractAmount = numericValue;
    } else if (fieldName.includes('office') && fieldName.includes('10')) {
      financials.office10Pct = numericValue;
    } else if (fieldName.includes('net') && fieldName.includes('profit')) {
      financials.netProfit = numericValue;
    }
  });

  return financials;
}

// ===========================================
// DATE AND AGING CALCULATIONS
// ===========================================

/**
 * Get days in column: uses accurate map when available, else falls back to dateLastActivity.
 */
export function getDaysInColumn(
  card: TrelloCard,
  cardDaysInColumn?: Record<string, number>
): number {
  if (cardDaysInColumn && card.id in cardDaysInColumn) {
    return cardDaysInColumn[card.id];
  }
  return calculateDaysInColumn(card);
}

/**
 * Calculate how many days a card has been in its current column
 * Uses dateLastActivity as the proxy for "last moved" (used as fallback when map unavailable)
 */
export function calculateDaysInColumn(card: TrelloCard): number {
  if (!card.dateLastActivity) {
    return 0;
  }

  const lastActivity = new Date(card.dateLastActivity);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - lastActivity.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
}

/**
 * Calculate days since a specific date
 */
export function calculateDaysSince(dateString: string): number {
  const targetDate = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - targetDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
}

// ===========================================
// FORMATTING UTILITIES
// ===========================================

/**
 * Format currency for display
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format currency with cents for detailed views
 */
export function formatCurrencyDetailed(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

// ===========================================
// DATA FILTERING AND LOOKUP
// ===========================================

/**
 * Get the list name for a card given the lists array
 */
export function getCardListName(card: TrelloCard, lists: TrelloList[]): string {
  const list = lists.find(l => l.id === card.idList);
  return list?.name || 'Unknown';
}

/**
 * Filter cards by list name
 */
export function getCardsByList(
  cards: TrelloCard[], 
  lists: TrelloList[], 
  listName: string
): TrelloCard[] {
  const targetList = lists.find(l => l.name === listName);
  if (!targetList) {
    return [];
  }

  return cards.filter(card => card.idList === targetList.id);
}

/**
 * Filter cards by multiple list names
 */
export function getCardsByLists(
  cards: TrelloCard[], 
  lists: TrelloList[], 
  listNames: string[]
): TrelloCard[] {
  const targetListIds = lists
    .filter(l => listNames.includes(l.name))
    .map(l => l.id);

  return cards.filter(card => targetListIds.includes(card.idList));
}

/**
 * Group cards by list name
 */
export function groupCardsByList(
  cards: TrelloCard[], 
  lists: TrelloList[]
): Record<string, TrelloCard[]> {
  const grouped: Record<string, TrelloCard[]> = {};

  // Initialize with empty arrays for all lists
  lists.forEach(list => {
    grouped[list.name] = [];
  });

  // Group cards by their list
  cards.forEach(card => {
    const listName = getCardListName(card, lists);
    if (grouped[listName]) {
      grouped[listName].push(card);
    }
  });

  return grouped;
}

// ===========================================
// FINANCIAL AGGREGATIONS
// ===========================================

/**
 * Sum contract amounts for an array of cards
 */
export function sumContractAmounts(
  cards: TrelloCard[], 
  fieldDefinitions: TrelloCustomField[]
): number {
  return cards.reduce((total, card) => {
    const financials = parseCustomFields(card, fieldDefinitions);
    return total + financials.contractAmount;
  }, 0);
}

/**
 * Sum net profit for an array of cards
 */
export function sumNetProfit(
  cards: TrelloCard[], 
  fieldDefinitions: TrelloCustomField[]
): number {
  return cards.reduce((total, card) => {
    const financials = parseCustomFields(card, fieldDefinitions);
    return total + financials.netProfit;
  }, 0);
}

/**
 * Calculate average contract amount for an array of cards
 */
export function calculateAverageContractAmount(
  cards: TrelloCard[], 
  fieldDefinitions: TrelloCustomField[]
): number {
  if (cards.length === 0) return 0;

  const total = sumContractAmounts(cards, fieldDefinitions);
  return total / cards.length;
}

/**
 * Get financial summary for a list of cards
 */
export function getFinancialSummary(
  cards: TrelloCard[], 
  fieldDefinitions: TrelloCustomField[]
) {
  const totalContract = sumContractAmounts(cards, fieldDefinitions);
  const totalProfit = sumNetProfit(cards, fieldDefinitions);
  const averageContract = calculateAverageContractAmount(cards, fieldDefinitions);
  const count = cards.length;

  return {
    totalContract,
    totalProfit,
    averageContract,
    count,
    profitMargin: totalContract > 0 ? (totalProfit / totalContract) * 100 : 0,
  };
}

// ===========================================
// CARD SORTING AND FILTERING
// ===========================================

/**
 * Sort cards by date (newest first)
 */
export function sortCardsByDate(cards: TrelloCard[]): TrelloCard[] {
  return [...cards].sort((a, b) => {
    const dateA = new Date(a.dateLastActivity || a.due || 0);
    const dateB = new Date(b.dateLastActivity || b.due || 0);
    return dateB.getTime() - dateA.getTime();
  });
}

/**
 * Sort cards by contract amount (highest first)
 */
export function sortCardsByValue(
  cards: TrelloCard[], 
  fieldDefinitions: TrelloCustomField[]
): TrelloCard[] {
  return [...cards].sort((a, b) => {
    const financialsA = parseCustomFields(a, fieldDefinitions);
    const financialsB = parseCustomFields(b, fieldDefinitions);
    return financialsB.contractAmount - financialsA.contractAmount;
  });
}

/**
 * Filter cards by minimum contract amount
 */
export function filterCardsByMinValue(
  cards: TrelloCard[], 
  fieldDefinitions: TrelloCustomField[], 
  minAmount: number
): TrelloCard[] {
  return cards.filter(card => {
    const financials = parseCustomFields(card, fieldDefinitions);
    return financials.contractAmount >= minAmount;
  });
}

/**
 * Filter cards by age (days in current column)
 */
export function filterCardsByAge(
  cards: TrelloCard[], 
  minDays: number
): TrelloCard[] {
  return cards.filter(card => {
    return calculateDaysInColumn(card) >= minDays;
  });
}

// ===========================================
// SEARCH AND MATCHING
// ===========================================

/**
 * Search cards by name or description
 */
export function searchCards(cards: TrelloCard[], query: string): TrelloCard[] {
  const lowerQuery = query.toLowerCase();
  return cards.filter(card => 
    card.name.toLowerCase().includes(lowerQuery) ||
    card.desc.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Find cards with specific labels
 */
export function findCardsByLabel(
  cards: TrelloCard[], 
  labelName: string
): TrelloCard[] {
  return cards.filter(card => 
    Array.isArray(card.labels) && card.labels.some(label => label.name === labelName)
  );
}

/**
 * Find overdue cards (past due date)
 */
export function findOverdueCards(cards: TrelloCard[]): TrelloCard[] {
  const now = new Date();
  return cards.filter(card => {
    if (!card.due) return false;
    const dueDate = new Date(card.due);
    return dueDate < now;
  });
}

/**
 * Calculate how many days past due a card is. Returns 0 if no due date or not overdue.
 */
export function calculateDaysOverdue(card: TrelloCard): number {
  if (!card.due) return 0;
  const dueDate = new Date(card.due);
  const now = new Date();
  if (dueDate >= now) return 0;
  const diffMs = now.getTime() - dueDate.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Check if a card has the "Urgent" label
 */
export function hasUrgentLabel(card: TrelloCard): boolean {
  return Array.isArray(card.labels) && card.labels.some(l => l.name === 'Urgent');
}