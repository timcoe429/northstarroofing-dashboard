// ===========================================
// NORTHSTAR DASHBOARD - TYPE DEFINITIONS
// ===========================================

// -----------------
// PIPELINE & PROJECTS
// -----------------
export interface Project {
  id: string;
  name: string;
  type: 'Replacement' | 'Repair' | 'Inspection' | 'Gutters';
  value: number;
  status: 'Lead' | 'Estimate' | 'Scheduled' | 'In Progress' | 'Completed';
  location: string;
  date: string;
  crew?: string;
  completion?: number;
  customerId?: string;
  trelloCardId?: string;
  estimateId?: string;
  invoiceId?: string;
}

export interface PipelineData {
  leads: number;
  estimates: number;
  scheduled: number;
  inProgress: number;
  completed: number;
}

// -----------------
// FINANCIALS
// -----------------
export interface FinancialSummary {
  totalRevenue: number;
  collected: number;
  uncollected: number;
  profit: number;
  avgJobSize: number;
}

export interface MonthlyRevenue {
  month: string;
  revenue: number;
  jobs: number;
  replacements: number;
  repairs: number;
  inspections: number;
  gutters: number;
}

export interface ProfitByType {
  type: string;
  revenue: number;
  cost: number;
  profit: number;
  margin: number;
}

// -----------------
// JOB TYPES
// -----------------
export interface JobTypeBreakdown {
  replacements: number;
  repairs: number;
  inspections: number;
  gutters: number;
}

// -----------------
// TRELLO INTEGRATION
// -----------------
export interface TrelloCard {
  id: string;
  name: string;
  desc: string;
  idList: string;
  labels: TrelloLabel[];
  due: string | null;
  dateLastActivity: string;
  shortLink: string;
  customFieldItems?: TrelloCustomFieldValue[];
  attachments?: TrelloAttachment[];
}

export interface TrelloLabel {
  id: string;
  name: string;
  color: string;
}

export interface TrelloCustomField {
  id: string;
  name: string;
  type: string;
}

export interface TrelloCustomFieldValue {
  idCustomField: string;
  value: {
    text?: string;
    number?: string;
    checked?: string;
    date?: string;
  };
}

export interface TrelloList {
  id: string;
  name: string;
  pos: number;
}

export interface TrelloAttachment {
  id: string;
  name: string;
  url: string;
}

export interface TrelloListMoveAction {
  id: string;
  type: string;
  date: string;
  data: {
    card: { id: string };
    list?: { id: string; name?: string };
    listAfter?: { id: string };
    listBefore?: { id: string };
  };
}

export interface TrelloBoardData {
  lists: TrelloList[];
  cards: TrelloCard[];
  labels: TrelloLabel[];
  customFields: TrelloCustomField[];
  cardDaysInColumn?: Record<string, number>;
}

export interface CardFinancials {
  contractAmount: number;
  office10Pct: number;
  netProfit: number;
}

// -----------------
// QUICKBOOKS INTEGRATION
// -----------------
export interface QBOInvoice {
  id: string;
  docNumber: string;
  totalAmt: number;
  balance: number;
  txnDate: string;
  dueDate: string;
  customerRef: {
    value: string;
    name: string;
  };
}

export interface QBOCustomer {
  id: string;
  displayName: string;
  primaryEmailAddr?: { address: string };
  primaryPhone?: { freeFormNumber: string };
  billAddr?: {
    line1: string;
    city: string;
    countrySubDivisionCode: string;
    postalCode: string;
  };
}

export interface QBOPayment {
  id: string;
  totalAmt: number;
  txnDate: string;
  customerRef: {
    value: string;
    name: string;
  };
}

// -----------------
// ESTIMATOR APP
// -----------------
export interface Estimate {
  id: string;
  projectName: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address: string;
  jobType: 'Replacement' | 'Repair' | 'Inspection' | 'Gutters';
  totalAmount: number;
  status: 'Draft' | 'Sent' | 'Viewed' | 'Accepted' | 'Declined';
  createdAt: string;
  sentAt?: string;
  acceptedAt?: string;
  lineItems: EstimateLineItem[];
}

export interface EstimateLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

// -----------------
// SETTINGS & API CONFIG
// -----------------
export interface APISettings {
  trello: {
    connected: boolean;
    boardId?: string;
    lastSync?: string;
  };
  quickbooks: {
    connected: boolean;
    companyName?: string;
    lastSync?: string;
  };
  estimator: {
    connected: boolean;
    lastSync?: string;
  };
}

// -----------------
// DASHBOARD STATE
// -----------------
export interface DashboardData {
  pipeline: PipelineData;
  financials: FinancialSummary;
  jobTypes: JobTypeBreakdown;
  recentProjects: Project[];
  monthlyTrend: MonthlyRevenue[];
  activeProjects: Project[];
}
