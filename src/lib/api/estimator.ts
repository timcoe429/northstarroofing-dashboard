// ===========================================
// ESTIMATOR APP API SERVICE
// ===========================================

import type { Estimate, EstimateLineItem } from '@/types';

interface EstimatorConfig {
  apiUrl: string;
  apiKey: string;
}

export class EstimatorService {
  private config: EstimatorConfig;

  constructor(config?: Partial<EstimatorConfig>) {
    this.config = {
      apiUrl: config?.apiUrl || process.env.ESTIMATOR_API_URL || '',
      apiKey: config?.apiKey || process.env.ESTIMATOR_API_KEY || '',
    };
  }

  private get headers(): HeadersInit {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.config.apiKey}`,
    };
  }

  // Make an API request
  private async apiRequest<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    body?: object
  ): Promise<T> {
    const url = `${this.config.apiUrl}${endpoint}`;
    
    const response = await fetch(url, {
      method,
      headers: this.headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      throw new Error(`Estimator API error: ${response.status}`);
    }

    return response.json();
  }

  // Test connection
  async testConnection(): Promise<boolean> {
    try {
      await this.apiRequest('/health');
      return true;
    } catch {
      return false;
    }
  }

  // Get all estimates
  async getEstimates(params?: {
    status?: Estimate['status'];
    startDate?: string;
    endDate?: string;
    limit?: number;
  }): Promise<Estimate[]> {
    const queryParams = new URLSearchParams();
    
    if (params?.status) queryParams.append('status', params.status);
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    
    const query = queryParams.toString();
    return this.apiRequest<Estimate[]>(`/estimates${query ? `?${query}` : ''}`);
  }

  // Get a single estimate by ID
  async getEstimate(id: string): Promise<Estimate> {
    return this.apiRequest<Estimate>(`/estimates/${id}`);
  }

  // Get estimate statistics
  async getEstimateStats(): Promise<{
    total: number;
    sent: number;
    accepted: number;
    acceptanceRate: number;
    totalValue: number;
    avgValue: number;
  }> {
    const estimates = await this.getEstimates();
    
    const sent = estimates.filter(e => e.status !== 'Draft').length;
    const accepted = estimates.filter(e => e.status === 'Accepted').length;
    const totalValue = estimates
      .filter(e => e.status === 'Accepted')
      .reduce((sum, e) => sum + e.totalAmount, 0);
    
    return {
      total: estimates.length,
      sent,
      accepted,
      acceptanceRate: sent > 0 ? (accepted / sent) * 100 : 0,
      totalValue,
      avgValue: accepted > 0 ? totalValue / accepted : 0,
    };
  }

  // Get estimates grouped by job type
  async getEstimatesByType(): Promise<Record<Estimate['jobType'], number>> {
    const estimates = await this.getEstimates({ status: 'Accepted' });
    
    const byType: Record<Estimate['jobType'], number> = {
      'Replacement': 0,
      'Repair': 0,
      'Inspection': 0,
      'Gutters': 0,
    };
    
    estimates.forEach(estimate => {
      byType[estimate.jobType]++;
    });
    
    return byType;
  }

  // Get recent estimates
  async getRecentEstimates(limit: number = 10): Promise<Estimate[]> {
    return this.getEstimates({ limit });
  }

  // Create a new estimate
  async createEstimate(data: Omit<Estimate, 'id' | 'createdAt'>): Promise<Estimate> {
    return this.apiRequest<Estimate>('/estimates', 'POST', data);
  }

  // Update an estimate
  async updateEstimate(id: string, data: Partial<Estimate>): Promise<Estimate> {
    return this.apiRequest<Estimate>(`/estimates/${id}`, 'PUT', data);
  }

  // Convert estimate to Project format
  estimateToProject(estimate: Estimate): {
    id: string;
    name: string;
    type: Estimate['jobType'];
    value: number;
    status: 'Estimate';
    location: string;
    date: string;
  } {
    return {
      id: estimate.id,
      name: estimate.projectName,
      type: estimate.jobType,
      value: estimate.totalAmount,
      status: 'Estimate',
      location: estimate.address,
      date: estimate.createdAt,
    };
  }
}

// Default instance
export const estimatorService = new EstimatorService();
