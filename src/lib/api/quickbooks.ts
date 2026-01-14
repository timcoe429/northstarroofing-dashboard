// ===========================================
// QUICKBOOKS ONLINE API SERVICE
// ===========================================

import type { QBOInvoice, QBOCustomer, QBOPayment, FinancialSummary } from '@/types';

interface QBOConfig {
  clientId: string;
  clientSecret: string;
  realmId: string;
  refreshToken: string;
  environment: 'sandbox' | 'production';
}

interface TokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export class QuickBooksService {
  private config: QBOConfig;
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  constructor(config?: Partial<QBOConfig>) {
    this.config = {
      clientId: config?.clientId || process.env.QUICKBOOKS_CLIENT_ID || '',
      clientSecret: config?.clientSecret || process.env.QUICKBOOKS_CLIENT_SECRET || '',
      realmId: config?.realmId || process.env.QUICKBOOKS_REALM_ID || '',
      refreshToken: config?.refreshToken || process.env.QUICKBOOKS_REFRESH_TOKEN || '',
      environment: (config?.environment || process.env.QUICKBOOKS_ENVIRONMENT || 'sandbox') as 'sandbox' | 'production',
    };
  }

  private get baseUrl(): string {
    return this.config.environment === 'production'
      ? 'https://quickbooks.api.intuit.com'
      : 'https://sandbox-quickbooks.api.intuit.com';
  }

  // Refresh the OAuth access token
  private async refreshAccessToken(): Promise<void> {
    const tokenUrl = 'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer';
    
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${this.config.clientId}:${this.config.clientSecret}`).toString('base64')}`,
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: this.config.refreshToken,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to refresh QuickBooks token');
    }

    const data: TokenResponse = await response.json();
    this.accessToken = data.access_token;
    this.tokenExpiry = Date.now() + (data.expires_in * 1000);
    
    // Note: In production, you should save the new refresh_token
    // this.config.refreshToken = data.refresh_token;
  }

  // Get a valid access token
  private async getAccessToken(): Promise<string> {
    if (!this.accessToken || Date.now() >= this.tokenExpiry - 60000) {
      await this.refreshAccessToken();
    }
    return this.accessToken!;
  }

  // Make an authenticated API request
  private async apiRequest<T>(endpoint: string, query?: string): Promise<T> {
    const token = await this.getAccessToken();
    const url = `${this.baseUrl}/v3/company/${this.config.realmId}/${endpoint}${query ? `?query=${encodeURIComponent(query)}` : ''}`;

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`QuickBooks API error: ${response.status}`);
    }

    return response.json();
  }

  // Test connection
  async testConnection(): Promise<boolean> {
    try {
      await this.apiRequest('companyinfo/' + this.config.realmId);
      return true;
    } catch {
      return false;
    }
  }

  // Get all invoices
  async getInvoices(startDate?: string, endDate?: string): Promise<QBOInvoice[]> {
    let query = "SELECT * FROM Invoice";
    
    if (startDate && endDate) {
      query += ` WHERE TxnDate >= '${startDate}' AND TxnDate <= '${endDate}'`;
    }
    
    query += " ORDERBY TxnDate DESC MAXRESULTS 1000";
    
    const response = await this.apiRequest<{ QueryResponse: { Invoice: QBOInvoice[] } }>('query', query);
    return response.QueryResponse.Invoice || [];
  }

  // Get all payments
  async getPayments(startDate?: string, endDate?: string): Promise<QBOPayment[]> {
    let query = "SELECT * FROM Payment";
    
    if (startDate && endDate) {
      query += ` WHERE TxnDate >= '${startDate}' AND TxnDate <= '${endDate}'`;
    }
    
    query += " ORDERBY TxnDate DESC MAXRESULTS 1000";
    
    const response = await this.apiRequest<{ QueryResponse: { Payment: QBOPayment[] } }>('query', query);
    return response.QueryResponse.Payment || [];
  }

  // Get all customers
  async getCustomers(): Promise<QBOCustomer[]> {
    const query = "SELECT * FROM Customer MAXRESULTS 1000";
    const response = await this.apiRequest<{ QueryResponse: { Customer: QBOCustomer[] } }>('query', query);
    return response.QueryResponse.Customer || [];
  }

  // Get financial summary
  async getFinancialSummary(startDate?: string, endDate?: string): Promise<FinancialSummary> {
    const invoices = await this.getInvoices(startDate, endDate);
    
    const totalRevenue = invoices.reduce((sum, inv) => sum + inv.totalAmt, 0);
    const collected = invoices.reduce((sum, inv) => sum + (inv.totalAmt - inv.balance), 0);
    const uncollected = invoices.reduce((sum, inv) => sum + inv.balance, 0);
    
    // Estimate profit at ~22% margin (adjust based on your actual margins)
    const profit = totalRevenue * 0.22;
    const avgJobSize = invoices.length > 0 ? totalRevenue / invoices.length : 0;

    return {
      totalRevenue,
      collected,
      uncollected,
      profit,
      avgJobSize,
    };
  }

  // Get monthly revenue breakdown
  async getMonthlyRevenue(year: number): Promise<{ month: string; revenue: number; invoiceCount: number }[]> {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const startDate = `${year}-01-01`;
    const endDate = `${year}-12-31`;
    
    const invoices = await this.getInvoices(startDate, endDate);
    
    const monthlyData = months.map((month, index) => {
      const monthInvoices = invoices.filter(inv => {
        const invMonth = new Date(inv.txnDate).getMonth();
        return invMonth === index;
      });
      
      return {
        month,
        revenue: monthInvoices.reduce((sum, inv) => sum + inv.totalAmt, 0),
        invoiceCount: monthInvoices.length,
      };
    });

    return monthlyData;
  }
}

// Default instance
export const quickbooksService = new QuickBooksService();
