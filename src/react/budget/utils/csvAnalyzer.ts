import type { Transaction, ImportedSpendingData, CategorySpendingData } from '../types';
import { categorizeTransactions } from './categorizer';

/**
 * Parses CSV text into Transaction objects
 */
export function parseCSV(csvText: string): Transaction[] {
  const lines = csvText.split('\n').filter(line => line.trim());
  if (lines.length === 0) return [];
  
  const headers = lines[0].split(',').map(h => h.trim());
  const transactions: Transaction[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const values: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());
    
    // Map to transaction object
    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    
    // Only process completed expenses (negative amounts)
    const amount = parseFloat(row['Amount'] || '0');
    const fee = parseFloat(row['Fee'] || '0');
    const state = row['State'] || '';
    
    if (state === 'COMPLETED' && amount < 0) {
      transactions.push({
        type: row['Type'] || '',
        product: row['Product'] || '',
        startedDate: row['Started Date'] || '',
        completedDate: row['Completed Date'] || '',
        description: row['Description'] || '',
        amount: amount,
        fee: fee,
        currency: row['Currency'] || '',
        state: state,
        balance: parseFloat(row['Balance'] || '0'),
      });
    }
  }
  
  return transactions;
}

/**
 * Analyzes CSV file and returns categorized spending data
 */
export function analyzeCSV(
  csvText: string, 
  fileName: string,
  customMappings?: Record<string, string>
): ImportedSpendingData {
  // Parse transactions
  const transactions = parseCSV(csvText);
  
  // Categorize transactions
  let categorized = categorizeTransactions(transactions);
  
  // Apply custom mappings if provided
  if (customMappings) {
    categorized = categorized.map(txn => {
      const customCategory = customMappings[txn.description];
      if (customCategory && customCategory !== 'undecided') {
        return {
          ...txn,
          category: customCategory,
          confidence: 1.0 // User-assigned categories have max confidence
        };
      }
      return txn;
    });
  }
  
  // Extract date range
  const dates = transactions
    .map(t => new Date(t.completedDate))
    .filter(d => !isNaN(d.getTime()))
    .sort((a, b) => a.getTime() - b.getTime());
  
  const startDate = dates.length > 0 ? dates[0] : new Date();
  const endDate = dates.length > 0 ? dates[dates.length - 1] : new Date();
  
  // Calculate months in range
  const monthsDiff = (endDate.getFullYear() - startDate.getFullYear()) * 12 + 
                     (endDate.getMonth() - startDate.getMonth()) + 1;
  const monthsInRange = Math.max(1, monthsDiff);
  
  // Group by category
  const categoryMap: Record<string, typeof categorized> = {};
  const uncategorized: Transaction[] = [];
  
  for (const transaction of categorized) {
    if (transaction.category === 'undecided') {
      uncategorized.push(transaction);
    } else {
      if (!categoryMap[transaction.category]) {
        categoryMap[transaction.category] = [];
      }
      categoryMap[transaction.category].push(transaction);
    }
  }
  
  // Calculate statistics for each category
  const categoryBreakdown: Record<string, CategorySpendingData> = {};
  let totalExpenses = 0;
  
  for (const [category, txns] of Object.entries(categoryMap)) {
    const amounts = txns.map(t => Math.abs(t.amount));
    const total = amounts.reduce((sum, amt) => sum + amt, 0);
    totalExpenses += total;
    
    // Find top merchants
    const merchantMap: Record<string, { amount: number; count: number }> = {};
    for (const txn of txns) {
      const merchant = txn.description;
      if (!merchantMap[merchant]) {
        merchantMap[merchant] = { amount: 0, count: 0 };
      }
      merchantMap[merchant].amount += Math.abs(txn.amount);
      merchantMap[merchant].count += 1;
    }
    
    const topMerchants = Object.entries(merchantMap)
      .map(([name, data]) => ({ name, amount: data.amount, count: data.count }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
    
    // Detect recurring transactions (same merchant appearing multiple times)
    const recurringCount = Object.values(merchantMap).filter(m => m.count > 1).length;
    
    categoryBreakdown[category] = {
      total,
      count: txns.length,
      average: txns.length > 0 ? total / txns.length : 0,
      recurring: recurringCount,
      topMerchants,
      monthlyAverage: total / monthsInRange,
      maxTransaction: amounts.length > 0 ? Math.max(...amounts) : 0,
      minTransaction: amounts.length > 0 ? Math.min(...amounts) : 0,
    };
  }
  
  return {
    fileName,
    dateRange: {
      start: startDate.toISOString().split('T')[0],
      end: endDate.toISOString().split('T')[0],
    },
    totalTransactions: transactions.length,
    totalExpenses,
    categoryBreakdown,
    uncategorized,
    monthsInRange,
  };
}

/**
 * Validates that a CSV has the expected Revolut format
 */
export function validateRevolutCSV(csvText: string): { 
  isValid: boolean; 
  errors: string[]; 
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  try {
    const lines = csvText.split('\n').filter(line => line.trim());
    if (lines.length === 0) {
      errors.push('CSV file is empty');
      return { isValid: false, errors, warnings };
    }
    
    const headers = lines[0].split(',').map(h => h.trim());
    const expectedHeaders = [
      'Type', 'Product', 'Started Date', 'Completed Date', 'Description',
      'Amount', 'Fee', 'Currency', 'State', 'Balance'
    ];
    
    const missingHeaders = expectedHeaders.filter(h => !headers.includes(h));
    if (missingHeaders.length > 0) {
      errors.push(`Missing required columns: ${missingHeaders.join(', ')}`);
      return { isValid: false, errors, warnings };
    }
    
    const extraHeaders = headers.filter(h => !expectedHeaders.includes(h));
    if (extraHeaders.length > 0) {
      warnings.push(`Extra columns found: ${extraHeaders.join(', ')}`);
    }
    
    if (lines.length < 2) {
      warnings.push('CSV file has no transaction data');
    }
    
    return { isValid: true, errors, warnings };
  } catch (error: any) {
    errors.push(`Error parsing CSV: ${error.message}`);
    return { isValid: false, errors, warnings };
  }
}
