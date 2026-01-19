import type { ExpenseCategory, AllocationCategory } from './types';

// Helper function to create icon HTML
export function iconifyIcon(name: string, size = '1em', className = '') {
  return `<iconify-icon icon="${name}" style="font-size: ${size}; display: inline-block; vertical-align: middle;" class="${className}"></iconify-icon>`;
}

// Expense categories configuration with grouping
export const expenseCategories: ExpenseCategory[] = [
  { id: 'rent', name: `${iconifyIcon('mdi:home', '1.2em')} Rent`, max: 800, step: 10, value: 350, actual: 350, group: 'essential', note: 'Fixed monthly housing cost • Most important expense to budget for' },
  { id: 'groceries', name: `${iconifyIcon('mdi:cart', '1.2em')} Groceries`, max: 600, step: 10, value: 300, actual: 380, group: 'essential', note: '256 shopping trips • €12.84 avg per trip • ~5x/week at Lidl, Konzum, Kaufland' },
  { id: 'utilities', name: `${iconifyIcon('mdi:home', '1.2em')} Utilities & Services`, max: 300, step: 10, value: 150, actual: 140, group: 'essential', note: '48 utility payments • KEKS Pay, telecom (A1, Telemach), CloudFlare hosting' },
  { id: 'transport', name: `${iconifyIcon('mdi:car', '1.2em')} Transportation (Bolt/Uber)`, max: 200, step: 5, value: 132, actual: 132, group: 'essential', note: '214 rides total (196 Bolt, 18 Uber) • €7.38 avg ride • ~17x/month (~1 ride every 2 days)' },
  { id: 'health', name: `${iconifyIcon('mdi:pill', '1.2em')} Health & Personal Care`, max: 200, step: 10, value: 50, actual: 55, group: 'essential', note: '40 visits • dm drogerie, pharmacies, dental • €26.43 avg • ~3x/month' },
  { id: 'food-delivery', name: `${iconifyIcon('mdi:hamburger', '1.2em')} Food Delivery (Wolt, etc)`, max: 150, step: 5, value: 75, actual: 75, group: 'discretionary', note: '51 orders over 12 months • €17.55 avg per order • ~4x/month (every 7-8 days)' },
  { id: 'fast-food', name: `${iconifyIcon('mdi:pizza', '1.2em')} Fast Food`, max: 100, step: 5, value: 31, actual: 31, group: 'discretionary', note: '34 visits to McDonald\'s, KFC, Domino\'s • €10.79 avg • ~3x/month' },
  { id: 'subscriptions', name: `${iconifyIcon('mdi:cellphone', '1.2em')} Subscriptions`, max: 300, step: 5, value: 165, actual: 165, group: 'discretionary', note: '64 recurring charges • YouTube Premium, Cursor, Netflix, CloudFlare, Disney+' },
  { id: 'shopping', name: `${iconifyIcon('mdi:shopping', '1.2em')} Shopping (Amazon, Temu, etc)`, max: 500, step: 10, value: 250, actual: 250, group: 'discretionary', note: '20 online orders • €103.55 avg • ~2x/month • Biggest splurge: €533 on Amazon' },
  { id: 'gaming', name: `${iconifyIcon('mdi:gamepad-variant', '1.2em')} Gaming (Steam, etc)`, max: 200, step: 5, value: 85, actual: 85, group: 'discretionary', note: '24 game purchases on Steam • €45.36 avg • ~2x/month • Epic splurge: €569 in one go!' },
  { id: 'books', name: `${iconifyIcon('mdi:book-open-variant', '1.2em')} Books & Education`, max: 100, step: 5, value: 30, actual: 28, group: 'discretionary', note: '18 ebook/book purchases • €10.86 avg • ~1-2x/month from Kobo' },
  { id: 'entertainment', name: `${iconifyIcon('mdi:party-popper', '1.2em')} Entertainment & Other`, max: 300, step: 10, value: 100, actual: 95, group: 'discretionary', note: '44 entertainment expenses • €8.34 avg • ~3-4x/month (cinema, events, travel, dining out)' },
  { id: 'cash', name: `${iconifyIcon('mdi:credit-card', '1.2em')} Cash Withdrawals & Transfers`, max: 200, step: 10, value: 50, actual: 45, group: 'discretionary', note: '20 transactions (3 ATM withdrawals, 17 friend transfers) • ~2x/month' }
];

// Investment allocation categories
export const allocationCategories: AllocationCategory[] = [
  { id: 'etf', name: `${iconifyIcon('mdi:chart-bar', '1.2em')} ETF (Stocks - VWCE/IWDA)`, value: 60, tip: 'Recommended: 50-70% • Lower risk, diversified' },
  { id: 'btc', name: `${iconifyIcon('mdi:bitcoin', '1.2em')} Bitcoin (BTC)`, value: 25, tip: 'Recommended: 15-30% • Higher risk, higher potential' },
  { id: 'eth', name: `${iconifyIcon('mdi:ethereum', '1.2em')} Ethereum (ETH)`, value: 15, tip: 'Recommended: 10-20% • High risk, DeFi exposure' }
];

// Default values for presets
export const presets = {
  current: {
    income: 2000,
    rent: 350,
    'food-delivery': 75,
    'fast-food': 31,
    groceries: 300,
    transport: 132,
    subscriptions: 165,
    shopping: 250,
    gaming: 85,
    health: 50,
    books: 30,
    utilities: 150,
    entertainment: 100,
    cash: 50
  },
  moderate: {
    income: 2000,
    rent: 350,
    'food-delivery': 30,
    'fast-food': 15,
    groceries: 350,
    transport: 50,
    subscriptions: 100,
    shopping: 150,
    gaming: 50,
    health: 50,
    books: 20,
    utilities: 150,
    entertainment: 80,
    cash: 50
  },
  aggressive: {
    income: 2000,
    rent: 350,
    'food-delivery': 0,
    'fast-food': 0,
    groceries: 400,
    transport: 50,
    subscriptions: 50,
    shopping: 50,
    gaming: 20,
    health: 50,
    books: 10,
    utilities: 120,
    entertainment: 50,
    cash: 30
  }
};
