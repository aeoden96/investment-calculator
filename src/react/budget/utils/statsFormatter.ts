import type { TFunction } from 'i18next';
import type { CategorySpendingData, ImportedSpendingData } from '../types';

/**
 * Formats category statistics into a human-readable string
 */
export function formatCategoryStats(
  categoryId: string,
  data: CategorySpendingData | undefined,
  monthsInRange: number,
  income: number,
  t: TFunction
): string {
  if (!data || data.count === 0) {
    // No imported data - generate generic percentage-based stats
    return generateGenericStats(categoryId, income, t);
  }
  
  const { count, average, monthlyAverage, topMerchants, recurring, maxTransaction } = data;
  const perMonth = monthsInRange > 0 ? count / monthsInRange : count;
  
  // Category-specific formatting
  switch (categoryId) {
    case 'transport':
      return formatTransportStats(count, average, perMonth, topMerchants, monthlyAverage, t);
    
    case 'food-delivery':
      return formatFoodDeliveryStats(count, average, perMonth, maxTransaction, t);
    
    case 'fast-food':
      return formatFastFoodStats(count, average, perMonth, topMerchants, t);
    
    case 'groceries':
      return formatGroceriesStats(count, average, perMonth, topMerchants, t);
    
    case 'subscriptions':
      return formatSubscriptionsStats(count, recurring, monthlyAverage, topMerchants, t);
    
    case 'shopping':
      return formatShoppingStats(count, average, perMonth, topMerchants, maxTransaction, t);
    
    case 'gaming':
      return formatGamingStats(count, average, perMonth, topMerchants, maxTransaction, t);
    
    case 'books':
      return formatBooksStats(count, average, perMonth, t);
    
    case 'health':
      return formatHealthStats(count, average, perMonth, topMerchants, t);
    
    case 'utilities':
      return formatUtilitiesStats(count, topMerchants, t);
    
    case 'entertainment':
      return formatEntertainmentStats(count, average, perMonth, t);
    
    case 'cash':
      return formatCashStats(count, perMonth, t);
    
    default:
      return formatGenericTransactionStats(count, average, perMonth, t);
  }
}

function formatTransportStats(
  count: number,
  average: number,
  perMonth: number,
  topMerchants: Array<{ name: string; amount: number; count: number }>,
  monthlyAverage: number,
  t: TFunction
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
  maxTransaction: number,
  t: TFunction
): string {
  const frequency = perMonth >= 4 ? 'every 7-8 days' : perMonth >= 2 ? 'every 2 weeks' : 'occasionally';
  return `${count} orders • €${average.toFixed(2)} avg per order • ~${Math.round(perMonth)}x/month (${frequency}) • Most expensive: €${maxTransaction.toFixed(2)}`;
}

function formatFastFoodStats(
  count: number,
  average: number,
  perMonth: number,
  topMerchants: Array<{ name: string; amount: number; count: number }>,
  t: TFunction
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
  topMerchants: Array<{ name: string; amount: number; count: number }>,
  t: TFunction
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
  topMerchants: Array<{ name: string; amount: number; count: number }>,
  t: TFunction
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
  maxTransaction: number,
  t: TFunction
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
  maxTransaction: number,
  t: TFunction
): string {
  const platforms = topMerchants.slice(0, 2)
    .map(m => m.name)
    .join(', ');
  
  return `${count} game purchases • €${average.toFixed(2)} avg • ~${Math.round(perMonth)}x/month${platforms ? ` on ${platforms}` : ''}${maxTransaction > 100 ? ` • Epic splurge: €${Math.round(maxTransaction)} in one go!` : ''}`;
}

function formatBooksStats(
  count: number,
  average: number,
  perMonth: number,
  t: TFunction
): string {
  return `${count} ebook/book purchases • €${average.toFixed(2)} avg • ~${Math.round(perMonth)}x/month`;
}

function formatHealthStats(
  count: number,
  average: number,
  perMonth: number,
  topMerchants: Array<{ name: string; amount: number; count: number }>,
  t: TFunction
): string {
  const stores = topMerchants.slice(0, 2)
    .map(m => m.name)
    .join(', ');
  
  return `${count} visits • €${average.toFixed(2)} avg • ~${Math.round(perMonth)}x/month${stores ? ` • ${stores}` : ''}`;
}

function formatUtilitiesStats(
  count: number,
  topMerchants: Array<{ name: string; amount: number; count: number }>,
  t: TFunction
): string {
  const services = topMerchants.slice(0, 3)
    .map(m => m.name)
    .join(', ');
  
  return `${count} utility payments${services ? ` • ${services}` : ''}`;
}

function formatEntertainmentStats(
  count: number,
  average: number,
  perMonth: number,
  t: TFunction
): string {
  return `${count} entertainment expenses • €${average.toFixed(2)} avg • ~${Math.round(perMonth)}x/month (cinema, events, dining out)`;
}

function formatCashStats(
  count: number,
  perMonth: number,
  t: TFunction
): string {
  return `${count} transactions (ATM withdrawals, transfers) • ~${Math.round(perMonth)}x/month`;
}

function formatGenericTransactionStats(
  count: number,
  average: number,
  perMonth: number,
  t: TFunction
): string {
  return `${count} transactions • €${average.toFixed(2)} avg • ~${Math.round(perMonth)}x/month`;
}

/**
 * Generates generic stats when no import data is available
 */
function generateGenericStats(categoryId: string, _income: number, t: TFunction): string {
  return t(`stats.generic.${categoryId}`, { defaultValue: t('stats.generic.default') });
}

/**
 * Formats a summary of imported spending data
 */
export function formatImportSummary(data: ImportedSpendingData, t: TFunction): string {
  const categorizedCount = Object.values(data.categoryBreakdown)
    .reduce((sum, cat) => sum + cat.count, 0);
  const categorizationRate = data.totalTransactions > 0 
    ? (categorizedCount / data.totalTransactions * 100).toFixed(1)
    : '0';
  
  const analyzed = t('stats.analyzed', { 
    count: data.totalTransactions, 
    start: data.dateRange.start, 
    end: data.dateRange.end 
  });
  const categorized = t('stats.categorized', { count: categorizedCount, percent: categorizationRate });
  const uncategorized = t('stats.uncategorized', { uncategorized: data.uncategorized.length });
  
  return `${analyzed} • ${categorized} • ${uncategorized}`;
}
