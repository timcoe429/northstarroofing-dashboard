// ===========================================
// TRELLO API SERVICE
// ===========================================

import type { TrelloCard, TrelloList, Project } from '@/types';

const TRELLO_API_BASE = 'https://api.trello.com/1';

interface TrelloConfig {
  apiKey: string;
  token: string;
  boardId: string;
}

export class TrelloService {
  private config: TrelloConfig;

  constructor(config?: Partial<TrelloConfig>) {
    this.config = {
      apiKey: config?.apiKey || process.env.TRELLO_API_KEY || '',
      token: config?.token || process.env.TRELLO_TOKEN || '',
      boardId: config?.boardId || process.env.TRELLO_BOARD_ID || '',
    };
  }

  private get authParams(): string {
    return `key=${this.config.apiKey}&token=${this.config.token}`;
  }

  // Test connection
  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(
        `${TRELLO_API_BASE}/boards/${this.config.boardId}?${this.authParams}`
      );
      return response.ok;
    } catch {
      return false;
    }
  }

  // Get all lists on the board
  async getLists(): Promise<TrelloList[]> {
    const response = await fetch(
      `${TRELLO_API_BASE}/boards/${this.config.boardId}/lists?${this.authParams}`
    );
    if (!response.ok) throw new Error('Failed to fetch Trello lists');
    return response.json();
  }

  // Get all cards on the board
  async getCards(): Promise<TrelloCard[]> {
    const response = await fetch(
      `${TRELLO_API_BASE}/boards/${this.config.boardId}/cards?${this.authParams}&customFieldItems=true`
    );
    if (!response.ok) throw new Error('Failed to fetch Trello cards');
    return response.json();
  }

  // Get cards from a specific list
  async getCardsByList(listId: string): Promise<TrelloCard[]> {
    const response = await fetch(
      `${TRELLO_API_BASE}/lists/${listId}/cards?${this.authParams}&customFieldItems=true`
    );
    if (!response.ok) throw new Error('Failed to fetch cards from list');
    return response.json();
  }

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
}

// Default instance
export const trelloService = new TrelloService();
