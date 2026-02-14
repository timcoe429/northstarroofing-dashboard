// ===========================================
// TRELLO API SERVICE
// ===========================================

import type { 
  TrelloCard, 
  TrelloList, 
  TrelloLabel, 
  TrelloCustomField, 
  TrelloCustomFieldValue,
  TrelloAttachment,
  TrelloBoardData,
  TrelloListMoveAction,
  Project 
} from '@/types';

const TRELLO_API_BASE = 'https://api.trello.com/1';

interface TrelloConfig {
  apiKey: string;
  token: string;
  salesBoardId?: string;
  buildBoardId?: string;
}

export class TrelloService {
  private config: TrelloConfig;

  constructor(config?: Partial<TrelloConfig>) {
    this.config = {
      apiKey: config?.apiKey || process.env.TRELLO_API_KEY || '',
      token: config?.token || process.env.TRELLO_TOKEN || '',
      salesBoardId: config?.salesBoardId || process.env.TRELLO_SALES_BOARD_ID || '',
      buildBoardId: config?.buildBoardId || process.env.TRELLO_BUILD_BOARD_ID || '',
    };
  }

  private get authParams(): string {
    return `key=${this.config.apiKey}&token=${this.config.token}`;
  }

  // ===========================================
  // CONNECTION TESTING
  // ===========================================

  async testBoardConnection(boardId: string): Promise<boolean> {
    try {
      const response = await fetch(
        `${TRELLO_API_BASE}/boards/${boardId}?${this.authParams}`
      );
      return response.ok;
    } catch {
      return false;
    }
  }

  async testAllConnections(): Promise<{ sales: boolean; build: boolean }> {
    const results = { sales: false, build: false };

    if (this.config.salesBoardId) {
      results.sales = await this.testBoardConnection(this.config.salesBoardId);
    }

    if (this.config.buildBoardId) {
      results.build = await this.testBoardConnection(this.config.buildBoardId);
    }

    return results;
  }

  // ===========================================
  // BOARD-SPECIFIC DATA RETRIEVAL
  // ===========================================

  async getListsForBoard(boardId: string): Promise<TrelloList[]> {
    const response = await fetch(
      `${TRELLO_API_BASE}/boards/${boardId}/lists?${this.authParams}`
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch lists for board ${boardId}: ${response.statusText}`);
    }
    return response.json();
  }

  async getCardsForBoard(boardId: string): Promise<TrelloCard[]> {
    const response = await fetch(
      `${TRELLO_API_BASE}/boards/${boardId}/cards?${this.authParams}&customFieldItems=true&attachments=true`
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch cards for board ${boardId}: ${response.statusText}`);
    }
    return response.json();
  }

  async getLabelsForBoard(boardId: string): Promise<TrelloLabel[]> {
    const response = await fetch(
      `${TRELLO_API_BASE}/boards/${boardId}/labels?${this.authParams}`
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch labels for board ${boardId}: ${response.statusText}`);
    }
    return response.json();
  }

  async getCustomFields(boardId: string): Promise<TrelloCustomField[]> {
    const response = await fetch(
      `${TRELLO_API_BASE}/boards/${boardId}/customFields?${this.authParams}`
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch custom fields for board ${boardId}: ${response.statusText}`);
    }
    return response.json();
  }

  async getBoardListMoveActions(boardId: string): Promise<TrelloListMoveAction[]> {
    const response = await fetch(
      `${TRELLO_API_BASE}/boards/${boardId}/actions?${this.authParams}&filter=updateCard:idList&limit=1000`
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch list-move actions for board ${boardId}: ${response.statusText}`);
    }
    return response.json();
  }

  async getCard(cardId: string): Promise<TrelloCard> {
    const response = await fetch(
      `${TRELLO_API_BASE}/cards/${cardId}?${this.authParams}&customFieldItems=true&attachments=true`
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch card ${cardId}: ${response.statusText}`);
    }
    return response.json();
  }

  async getFullBoardData(boardId: string): Promise<TrelloBoardData> {
    try {
      const [lists, cards, labels, customFields] = await Promise.all([
        this.getListsForBoard(boardId),
        this.getCardsForBoard(boardId),
        this.getLabelsForBoard(boardId),
        this.getCustomFields(boardId),
      ]);

      return {
        lists,
        cards,
        labels,
        customFields,
      };
    } catch (error) {
      throw new Error(`Failed to fetch complete board data for ${boardId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // ===========================================
  // CONVENIENCE METHODS FOR DUAL BOARD SETUP
  // ===========================================

  async getSalesBoardData(): Promise<TrelloBoardData> {
    if (!this.config.salesBoardId) {
      throw new Error('Sales Board ID not configured');
    }
    return this.getFullBoardData(this.config.salesBoardId);
  }

  async getBuildBoardData(): Promise<TrelloBoardData> {
    if (!this.config.buildBoardId) {
      throw new Error('Build Board ID not configured');
    }
    return this.getFullBoardData(this.config.buildBoardId);
  }

  // ===========================================
  // LEGACY COMPATIBILITY METHODS
  // ===========================================

  // Get all lists (defaults to sales board for backward compatibility)
  async getLists(): Promise<TrelloList[]> {
    const boardId = this.config.salesBoardId || this.config.buildBoardId;
    if (!boardId) {
      throw new Error('No board ID configured');
    }
    return this.getListsForBoard(boardId);
  }

  // Get all cards (defaults to sales board for backward compatibility)
  async getCards(): Promise<TrelloCard[]> {
    const boardId = this.config.salesBoardId || this.config.buildBoardId;
    if (!boardId) {
      throw new Error('No board ID configured');
    }
    return this.getCardsForBoard(boardId);
  }

  // Get cards from a specific list
  async getCardsByList(listId: string): Promise<TrelloCard[]> {
    const response = await fetch(
      `${TRELLO_API_BASE}/lists/${listId}/cards?${this.authParams}&customFieldItems=true&attachments=true`
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch cards from list ${listId}: ${response.statusText}`);
    }
    return response.json();
  }

  // Test connection (defaults to sales board for backward compatibility)
  async testConnection(): Promise<boolean> {
    const boardId = this.config.salesBoardId || this.config.buildBoardId;
    if (!boardId) {
      return false;
    }
    return this.testBoardConnection(boardId);
  }

  // ===========================================
  // PROJECT MAPPING (LEGACY)
  // ===========================================

  // Map Trello cards to Projects
  async getProjectsFromBoard(listMappings: Record<string, Project['status']>): Promise<Project[]> {
    const [lists, cards] = await Promise.all([
      this.getLists(),
      this.getCards(),
    ]);

    const listIdToStatus = new Map<string, Project['status']>();
    lists.forEach(list => {
      const status = listMappings[list.name];
      if (status) {
        listIdToStatus.set(list.id, status);
      }
    });

    return cards.map(card => this.cardToProject(card, listIdToStatus.get(card.idList)));
  }

  // Convert a Trello card to a Project
  private cardToProject(card: TrelloCard, status?: Project['status']): Project {
    // Extract job type from labels
    const typeLabel = card.labels.find(l => 
      ['Replacement', 'Repair', 'Inspection', 'Gutters'].includes(l.name)
    );

    // Extract value from custom fields (assuming you have a "Value" custom field)
    const valueField = card.customFieldItems?.find(cf => 
      cf.value.number !== undefined
    );

    return {
      id: card.id,
      name: card.name,
      type: (typeLabel?.name as Project['type']) || 'Replacement',
      value: valueField?.value.number ? parseFloat(valueField.value.number) : 0,
      status: status || 'Lead',
      location: '', // Extract from card description or custom field
      date: card.due || new Date().toISOString(),
      trelloCardId: card.id,
    };
  }

  // Get pipeline counts
  async getPipelineCounts(listMappings: Record<string, Project['status']>): Promise<Record<Project['status'], number>> {
    const projects = await this.getProjectsFromBoard(listMappings);
    
    const counts: Record<Project['status'], number> = {
      'Lead': 0,
      'Estimate': 0,
      'Scheduled': 0,
      'In Progress': 0,
      'Completed': 0,
    };

    projects.forEach(project => {
      counts[project.status]++;
    });

    return counts;
  }

  // ===========================================
  // CONFIGURATION UPDATES
  // ===========================================

  updateConfig(newConfig: Partial<TrelloConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  getConfig(): TrelloConfig {
    return { ...this.config };
  }
}

// Default instance
export const trelloService = new TrelloService();
