// Invoice utility functions and types

export interface InvoiceLineItem {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface CompanyInfo {
  name: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  logo?: string;
}

export interface ClientInfo {
  name: string;
  email: string;
  address: string;
  phone: string;
}

export interface InvoiceData {
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  poNumber?: string;
  client: ClientInfo;
  lineItems: InvoiceLineItem[];
  taxRate: number;
  notes: string;
  subtotal: number;
  taxAmount: number;
  total: number;
}

export interface InvoiceSearchResult {
  invoiceNumber: string;
  clientName: string;
  updatedAt: string;
}

// localStorage keys
export const STORAGE_KEYS = {
  COMPANY_INFO: 'northstar_company_info',
  INVOICES: 'northstar_invoices',
  INVOICE_PREFIX: 'northstar_invoice_'
};

// Format currency
export function formatCurrency(amount: number): string {
  return '$' + amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// Format date for display
export function formatDate(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString + 'T00:00:00');
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
}

// Generate auto invoice number
export function generateInvoiceNumber(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const random = String(Math.floor(Math.random() * 900) + 100);
  return `INV-${year}${month}${day}-${random}`;
}

// Calculate line item amount
export function calculateLineAmount(quantity: number, rate: number): number {
  return (quantity || 0) * (rate || 0);
}

// Calculate invoice totals
export function calculateInvoiceTotals(lineItems: InvoiceLineItem[], taxRate: number) {
  const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0);
  const taxAmount = subtotal * (taxRate / 100);
  const total = subtotal + taxAmount;
  
  return {
    subtotal,
    taxAmount,
    total
  };
}

// Save company info to localStorage
export function saveCompanyInfo(companyInfo: CompanyInfo): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.COMPANY_INFO, JSON.stringify(companyInfo));
  }
}

// Load company info from localStorage
export function loadCompanyInfo(): CompanyInfo {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(STORAGE_KEYS.COMPANY_INFO);
    if (stored) {
      return JSON.parse(stored);
    }
  }
  
  // Default company info
  return {
    name: 'NorthStar Roofing',
    address: '',
    phone: '',
    email: '',
    website: ''
  };
}

// Save invoice to localStorage
export function saveInvoice(invoiceData: InvoiceData): void {
  if (typeof window === 'undefined') return;
  
  const invoiceKey = STORAGE_KEYS.INVOICE_PREFIX + invoiceData.invoiceNumber;
  const invoiceWithTimestamp = {
    ...invoiceData,
    updatedAt: new Date().toISOString()
  };
  
  localStorage.setItem(invoiceKey, JSON.stringify(invoiceWithTimestamp));
  
  // Update invoice list
  const invoicesList = getInvoicesList();
  const existingIndex = invoicesList.findIndex(inv => inv.invoiceNumber === invoiceData.invoiceNumber);
  
  const searchResult: InvoiceSearchResult = {
    invoiceNumber: invoiceData.invoiceNumber,
    clientName: invoiceData.client.name,
    updatedAt: invoiceWithTimestamp.updatedAt
  };
  
  if (existingIndex >= 0) {
    invoicesList[existingIndex] = searchResult;
  } else {
    invoicesList.unshift(searchResult);
  }
  
  localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(invoicesList));
}

// Load invoice from localStorage
export function loadInvoice(invoiceNumber: string): InvoiceData | null {
  if (typeof window === 'undefined') return null;
  
  const invoiceKey = STORAGE_KEYS.INVOICE_PREFIX + invoiceNumber;
  const stored = localStorage.getItem(invoiceKey);
  
  if (stored) {
    const parsed = JSON.parse(stored);
    // Remove the updatedAt timestamp for the return data
    const { updatedAt, ...invoiceData } = parsed;
    return invoiceData;
  }
  
  return null;
}

// Delete invoice from localStorage
export function deleteInvoice(invoiceNumber: string): void {
  if (typeof window === 'undefined') return;
  
  const invoiceKey = STORAGE_KEYS.INVOICE_PREFIX + invoiceNumber;
  localStorage.removeItem(invoiceKey);
  
  // Update invoice list
  const invoicesList = getInvoicesList();
  const filteredList = invoicesList.filter(inv => inv.invoiceNumber !== invoiceNumber);
  localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(filteredList));
}

// Get list of all invoices for search
export function getInvoicesList(): InvoiceSearchResult[] {
  if (typeof window === 'undefined') return [];
  
  const stored = localStorage.getItem(STORAGE_KEYS.INVOICES);
  return stored ? JSON.parse(stored) : [];
}

// Search invoices
export function searchInvoices(query: string): InvoiceSearchResult[] {
  const allInvoices = getInvoicesList();
  
  if (!query.trim()) {
    return allInvoices.slice(0, 20); // Return recent 20
  }
  
  const lowerQuery = query.toLowerCase();
  return allInvoices
    .filter(invoice => 
      invoice.invoiceNumber.toLowerCase().includes(lowerQuery) ||
      invoice.clientName.toLowerCase().includes(lowerQuery)
    )
    .slice(0, 20);
}

// Create new blank invoice data
export function createNewInvoice(): InvoiceData {
  const today = new Date();
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 30);
  
  return {
    invoiceNumber: generateInvoiceNumber(),
    invoiceDate: today.toISOString().split('T')[0],
    dueDate: dueDate.toISOString().split('T')[0],
    poNumber: '',
    client: {
      name: '',
      email: '',
      address: '',
      phone: ''
    },
    lineItems: [{
      description: '',
      quantity: 1,
      rate: 0,
      amount: 0
    }],
    taxRate: 0,
    notes: 'Payment is due within 30 days of invoice date. Thank you for your business!',
    subtotal: 0,
    taxAmount: 0,
    total: 0
  };
}