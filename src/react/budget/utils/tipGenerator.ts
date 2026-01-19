import { iconifyIcon } from '../config';

/**
 * Generates dynamic tips for categories when spending is too high
 * Tips only appear when the category exceeds recommended thresholds
 */
export function generateTip(
  categoryId: string,
  currentSpending: number,
  income: number,
  _baseline?: number
): string | null {
  const percentOfIncome = (currentSpending / income) * 100;
  
  switch (categoryId) {
    case 'transport':
      // Show tip if spending more than €70/month or >4% of income
      if (currentSpending > 70 || percentOfIncome > 4) {
        const savings = Math.round(currentSpending - 50);
        return `${iconifyIcon('mdi:lightbulb', '1em')} Consider a public transport pass at €50/month to save €${savings}!`;
      }
      break;
    
    case 'food-delivery':
      // Show tip if spending more than €50/month or >3% of income
      if (currentSpending > 50 || percentOfIncome > 3) {
        const ordersPerMonth = Math.round(currentSpending / 15); // Assuming €15 avg order
        return `${iconifyIcon('mdi:lightbulb', '1em')} ~${ordersPerMonth} orders/month • Cooking at home could save €${Math.round(currentSpending * 0.7)}/month`;
      }
      break;
    
    case 'fast-food':
      // Show tip if spending more than €40/month
      if (currentSpending > 40) {
        return `${iconifyIcon('mdi:lightbulb', '1em')} Consider meal prepping to reduce fast food visits`;
      }
      break;
    
    case 'subscriptions':
      // Show tip if spending more than €100/month or >6% of income
      if (currentSpending > 100 || percentOfIncome > 6) {
        return `${iconifyIcon('mdi:lightbulb', '1em')} Review your subscriptions monthly • Cancel unused services to save`;
      }
      break;
    
    case 'shopping':
      // Show tip if spending more than €200/month or >12% of income
      if (currentSpending > 200 || percentOfIncome > 12) {
        const monthlyBudget = Math.round(income * 0.10);
        return `${iconifyIcon('mdi:lightbulb', '1em')} High spending detected • Try a monthly budget of €${monthlyBudget} (10% of income)`;
      }
      break;
    
    case 'gaming':
      // Show tip if spending more than €60/month
      if (currentSpending > 60) {
        return `${iconifyIcon('mdi:lightbulb', '1em')} Wait for Steam sales • Game Pass offers 100+ games for €10-15/month`;
      }
      break;
    
    case 'groceries':
      // Show tip if spending more than 20% of income
      if (percentOfIncome > 20) {
        const recommended = Math.round(income * 0.15);
        return `${iconifyIcon('mdi:lightbulb', '1em')} Groceries are ${percentOfIncome.toFixed(0)}% of income • Try to keep under €${recommended} (15%)`;
      }
      break;
    
    case 'rent':
      // Show tip if rent is more than 35% of income
      if (percentOfIncome > 35) {
        const recommended = Math.round(income * 0.30);
        return `${iconifyIcon('mdi:lightbulb', '1em')} Rent is ${percentOfIncome.toFixed(0)}% of income • Aim for max 30% (€${recommended})`;
      }
      break;
    
    case 'entertainment':
      // Show tip if spending more than €120/month or >7% of income
      if (currentSpending > 120 || percentOfIncome > 7) {
        return `${iconifyIcon('mdi:lightbulb', '1em')} Look for free events and activities to reduce costs`;
      }
      break;
    
    default:
      return null;
  }
  
  return null;
}
