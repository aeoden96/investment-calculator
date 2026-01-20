import type { TFunction } from "i18next";

/**
 * Generates dynamic tips for categories when spending is too high
 * Tips only appear when the category exceeds recommended thresholds
 */
export function generateTip(
  categoryId: string,
  currentSpending: number,
  income: number,
  t: TFunction,
  _baseline?: number
): string | null {
  const percentOfIncome = (currentSpending / income) * 100;
  
  switch (categoryId) {
    case 'transport':
      // Show tip if spending more than €70/month or >4% of income
      if (currentSpending > 70 || percentOfIncome > 4) {
        const savings = Math.round(currentSpending - 50);
        return t('tips.transport', { savings });
      }
      break;
    
    case 'food-delivery':
      // Show tip if spending more than €50/month or >3% of income
      if (currentSpending > 50 || percentOfIncome > 3) {
        const ordersPerMonth = Math.round(currentSpending / 15); // Assuming €15 avg order
        const savings = Math.round(currentSpending * 0.7);
        return t('tips.food-delivery', { orders: ordersPerMonth, savings });
      }
      break;
    
    case 'fast-food':
      // Show tip if spending more than €40/month
      if (currentSpending > 40) {
        return t('tips.fast-food');
      }
      break;
    
    case 'subscriptions':
      // Show tip if spending more than €100/month or >6% of income
      if (currentSpending > 100 || percentOfIncome > 6) {
        return t('tips.subscriptions');
      }
      break;
    
    case 'shopping':
      // Show tip if spending more than €200/month or >12% of income
      if (currentSpending > 200 || percentOfIncome > 12) {
        const monthlyBudget = Math.round(income * 0.10);
        return t('tips.shopping', { budget: monthlyBudget });
      }
      break;
    
    case 'gaming':
      // Show tip if spending more than €60/month
      if (currentSpending > 60) {
        return t('tips.gaming');
      }
      break;
    
    case 'groceries':
      // Show tip if spending more than 20% of income
      if (percentOfIncome > 20) {
        const recommended = Math.round(income * 0.15);
        return t('tips.groceries', { percent: percentOfIncome.toFixed(0), recommended });
      }
      break;
    
    case 'rent':
      // Show tip if rent is more than 35% of income
      if (percentOfIncome > 35) {
        const recommended = Math.round(income * 0.30);
        return t('tips.rent', { percent: percentOfIncome.toFixed(0), recommended });
      }
      break;
    
    case 'entertainment':
      // Show tip if spending more than €120/month or >7% of income
      if (currentSpending > 120 || percentOfIncome > 7) {
        return t('tips.entertainment');
      }
      break;
    
    default:
      return null;
  }
  
  return null;
}
