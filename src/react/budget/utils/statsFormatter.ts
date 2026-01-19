import type { CategorySpendingData, ImportedSpendingData } from '../types';

/**
 * Formats category statistics into a human-readable string
 */
export function formatCategoryStats(
  categoryId: string,
  data: CategorySpendingData | undefined,
  monthsInRange: number,
  income: number
): string {
  if (!data || data.count === 0) {
    // No imported data - generate generic percentage-based stats
    return generateGenericStats(categoryId, income);
  }
  
  const { count, average, monthlyAverage, topMerchants, recurring, maxTransaction } = data;
  const perMonth = monthsInRange > 0 ? count / monthsInRange : count;
  
  // Category-specific formatting
  switch (categoryId) {
    case 'transport':
      return formatTransportStats(count, average, perMonth, topMerchants, monthlyAverage);
    
    case 'food-delivery':
      return formatFoodDeliveryStats(count, average, perMonth, maxTransaction);
    
    case 'fast-food':
      return formatFastFoodStats(count, average, perMonth, topMerchants);
    
    case 'groceries':
      return formatGroceriesStats(count, average, perMonth, topMerchants);
    
    case 'subscriptions':
      return formatSubscriptionsStats(count, recurring, monthlyAverage, topMerchants);
    
    case 'shopping':
      return formatShoppingStats(count, average, perMonth, topMerchants, maxTransaction);
    
    case 'gaming':
      return formatGamingStats(count, average, perMonth, topMerchants, maxTransaction);
    
    case 'books':
      return formatBooksStats(count, average, perMonth);
    
    case 'health':
      return formatHealthStats(count, average, perMonth, topMerchants);
    
    case 'utilities':
      return formatUtilitiesStats(count, topMerchants);
    
    case 'entertainment':
      return formatEntertainmentStats(count, average, perMonth);
    
    case 'cash':
      return formatCashStats(count, perMonth);
    
    default:
      return formatGenericTransactionStats(count, average, perMonth);
  }
}

function formatTransportStats(
  count: number,
  average: number,
  perMonth: number,
  topMerchants: Array<{ name: string; amount: number; count: number }>,
  monthlyAverage: number
): string {
  const merchantBreakdown = topMerchants
    .map(m => `${m.count} ${m.name}`)
    .join(', ');
  
  return `${count} rides total (${merchantBreakdown}) • €${average.toFixed(2)} avg • ~${Math.round(perMonth)}x/month • €${Math.round(monthlyAverage)}/month avg • Consider €50/month public pass to save €${Math.round(monthlyAverage - 50)}!`;
}

function formatFoodDeliveryStats(
  count: number,
  average: number,
  perMonth: number,
  maxTransaction: number
): string {
  const frequency = perMonth >= 4 ? 'every 7-8 days' : perMonth >= 2 ? 'every 2 weeks' : 'occasionally';
  return `${count} orders • €${average.toFixed(2)} avg per order • ~${Math.round(perMonth)}x/month (${frequency}) • Most expensive: €${maxTransaction.toFixed(2)}`;
}

function formatFastFoodStats(
  count: number,
  average: number,
  perMonth: number,
  topMerchants: Array<{ name: string; amount: number; count: number }>
): string {
  const topThree = topMerchants.slice(0, 3)
    .map(m => `${m.name} (€${Math.round(m.amount)})`)
    .join(', ');
  
  return `${count} visits • €${average.toFixed(2)} avg • ~${Math.round(perMonth)}x/month${topThree ? ` • Top: ${topThree}` : ''}`;
}

function formatGroceriesStats(
  count: number,
  average: number,
  perMonth: number,
  topMerchants: Array<{ name: string; amount: number; count: number }>
): string {
  const perWeek = perMonth / 4.33;
  const topStores = topMerchants.slice(0, 3)
    .map(m => `${m.name} (€${Math.round(m.amount)})`)
    .join(', ');
  
  return `${count} shopping trips • €${average.toFixed(2)} avg • ~${perWeek.toFixed(1)}x/week${topStores ? ` • ${topStores}` : ''}`;
}

function formatSubscriptionsStats(
  _count: number,
  recurring: number,
  monthlyAverage: number,
  topMerchants: Array<{ name: string; amount: number; count: number }>
): string {
  const topSubs = topMerchants.slice(0, 3)
    .map(m => `${m.name} (€${(m.amount / m.count).toFixed(2)}/mo)`)
    .join(', ');
  
  return `${recurring} recurring charges detected • €${Math.round(monthlyAverage)}/month avg${topSubs ? ` • ${topSubs}` : ''}`;
}

function formatShoppingStats(
  count: number,
  average: number,
  perMonth: number,
  topMerchants: Array<{ name: string; amount: number; count: number }>,
  maxTransaction: number
): string {
  const topSites = topMerchants.slice(0, 3)
    .map(m => m.name)
    .join(', ');
  
  return `${count} online orders • €${average.toFixed(2)} avg • ~${Math.round(perMonth)}x/month${topSites ? ` • ${topSites}` : ''} • Biggest splurge: €${Math.round(maxTransaction)}`;
}

function formatGamingStats(
  count: number,
  average: number,
  perMonth: number,
  topMerchants: Array<{ name: string; amount: number; count: number }>,
  maxTransaction: number
): string {
  const platforms = topMerchants.slice(0, 2)
    .map(m => m.name)
    .join(', ');
  
  return `${count} game purchases • €${average.toFixed(2)} avg • ~${Math.round(perMonth)}x/month${platforms ? ` on ${platforms}` : ''}${maxTransaction > 100 ? ` • Epic splurge: €${Math.round(maxTransaction)} in one go!` : ''}`;
}

function formatBooksStats(
  count: number,
  average: number,
  perMonth: number
): string {
  return `${count} ebook/book purchases • €${average.toFixed(2)} avg • ~${Math.round(perMonth)}x/month`;
}

function formatHealthStats(
  count: number,
  average: number,
  perMonth: number,
  topMerchants: Array<{ name: string; amount: number; count: number }>
): string {
  const stores = topMerchants.slice(0, 2)
    .map(m => m.name)
    .join(', ');
  
  return `${count} visits • €${average.toFixed(2)} avg • ~${Math.round(perMonth)}x/month${stores ? ` • ${stores}` : ''}`;
}

function formatUtilitiesStats(
  count: number,
  topMerchants: Array<{ name: string; amount: number; count: number }>
): string {
  const services = topMerchants.slice(0, 3)
    .map(m => m.name)
    .join(', ');
  
  return `${count} utility payments${services ? ` • ${services}` : ''}`;
}

function formatEntertainmentStats(
  count: number,
  average: number,
  perMonth: number
): string {
  return `${count} entertainment expenses • €${average.toFixed(2)} avg • ~${Math.round(perMonth)}x/month (cinema, events, dining out)`;
}

function formatCashStats(
  count: number,
  perMonth: number
): string {
  return `${count} transactions (ATM withdrawals, transfers) • ~${Math.round(perMonth)}x/month`;
}

function formatGenericTransactionStats(
  count: number,
  average: number,
  perMonth: number
): string {
  return `${count} transactions • €${average.toFixed(2)} avg • ~${Math.round(perMonth)}x/month`;
}

/**
 * Generates generic stats when no import data is available
 */
function generateGenericStats(categoryId: string, _income: number): string {
  switch (categoryId) {
    case 'rent':
      return 'Fixed monthly housing cost • Typically 15-30% of income';
    
    case 'groceries':
      return 'Weekly shopping for essentials • Plan meals to reduce waste';
    
    case 'utilities':
      return 'Electricity, water, internet, phone, and other services';
    
    case 'transport':
      return 'Public transport, ride-sharing, or fuel costs • Consider monthly passes';
    
    case 'health':
      return 'Pharmacy, dental care, gym, and personal care items';
    
    case 'food-delivery':
      return 'Delivery apps like Wolt, Glovo • Cooking at home saves money';
    
    case 'fast-food':
      return 'Quick meals and takeaway • Consider meal prepping';
    
    case 'subscriptions':
      return 'Streaming services, apps, software • Review regularly for unused subs';
    
    case 'shopping':
      return 'Online and retail purchases • Set a monthly limit to avoid impulse buys';
    
    case 'gaming':
      return 'Game purchases and in-game content • Wait for sales to save';
    
    case 'books':
      return 'Books, audiobooks, courses • Libraries and sales offer savings';
    
    case 'entertainment':
      return 'Cinema, events, dining out, travel • Budget for experiences';
    
    case 'cash':
      return 'ATM withdrawals and transfers • Track cash spending carefully';
    
    default:
      return 'Adjust based on your spending habits';
  }
}

/**
 * Formats a summary of imported spending data
 */
export function formatImportSummary(data: ImportedSpendingData): string {
  const categorizedCount = Object.values(data.categoryBreakdown)
    .reduce((sum, cat) => sum + cat.count, 0);
  const categorizationRate = data.totalTransactions > 0 
    ? (categorizedCount / data.totalTransactions * 100).toFixed(1)
    : '0';
  
  return `Analyzed ${data.totalTransactions} transactions from ${data.dateRange.start} to ${data.dateRange.end} • ${categorizedCount} categorized (${categorizationRate}%) • ${data.uncategorized.length} uncategorized`;
}
