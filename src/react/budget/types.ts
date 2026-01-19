// Type definitions for the budget calculator

export interface ExpenseCategory {
  id: string;
  name: string;
  max: number;
  step: number;
  value: number;
  actual: number;
  group: 'essential' | 'discretionary';
  note: string;
  tip?: string;
  baseline?: number;
  stats?: string;
}

export interface AllocationCategory {
  id: string;
  name: string;
  value: number;
  tip: string;
}

export interface BudgetState {
  income: number;
  investmentSplit: number;
  expenses: Record<string, number>;
  allocations: {
    etf: number;
    btc: number;
    eth: number;
  };
  bufferLimit: number;
  importedData: ImportedSpendingData | null;
  isUsingImportedBaseline: boolean;
}

export interface CalculatedValues {
  totalExpenses: number;
  surplus: number;
  totalInvestmentAmount: number;
  buffer: number;
  savingsRate: number;
  etfAmount: number;
  btcAmount: number;
  ethAmount: number;
  essentialTotal: number;
  discretionaryTotal: number;
}

export interface ChartData {
  labels: string[];
  datasets: any[];
  startingAmount: number;
  endingAmount: number;
  totalInvested: number;
  growth: number;
  bufferLimitReachedMonth: number;
  finalBuffer: number;
}

// CSV Import Types
export interface Transaction {
  type: string;
  product: string;
  startedDate: string;
  completedDate: string;
  description: string;
  amount: number;
  fee: number;
  currency: string;
  state: string;
  balance: number;
}

export interface CategorySpendingData {
  total: number;
  count: number;
  average: number;
  recurring: number;
  topMerchants: Array<{ name: string; amount: number; count: number }>;
  monthlyAverage: number;
  maxTransaction: number;
  minTransaction: number;
}

export interface ImportedSpendingData {
  fileName: string;
  dateRange: { start: string; end: string };
  totalTransactions: number;
  totalExpenses: number;
  categoryBreakdown: Record<string, CategorySpendingData>;
  uncategorized: Transaction[];
  monthsInRange: number;
}

export interface CategorizedTransaction extends Transaction {
  category: string;
  confidence: number;
}
