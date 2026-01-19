import type { ImportedSpendingData } from '../types';

/**
 * Generates strategic moderate savings preset based on imported baseline data
 */
export function generateModeratePreset(
  baseline: Record<string, number>,
  _importedData: ImportedSpendingData | null
): Record<string, number> {
  const moderate: Record<string, number> = {};
  
  // Strategic reductions for moderate savings
  const strategies: Record<string, (baseline: number) => number> = {
    // Transport: Switch to public transport pass
    'transport': (b) => Math.min(50, b),
    
    // Food delivery: Cut by 50%
    'food-delivery': (b) => Math.round(b * 0.5),
    
    // Fast food: Cut by 50%
    'fast-food': (b) => Math.round(b * 0.5),
    
    // Subscriptions: Cancel redundant services (40% reduction)
    'subscriptions': (b) => Math.round(b * 0.6),
    
    // Shopping: Reduce impulse buying (40% reduction)
    'shopping': (b) => Math.round(b * 0.6),
    
    // Gaming: Reduce purchases (40% reduction)
    'gaming': (b) => Math.round(b * 0.6),
    
    // Groceries: Increase to compensate for less delivery (20% increase)
    'groceries': (b) => Math.round(b * 1.2),
    
    // Entertainment: Minor reduction (20%)
    'entertainment': (b) => Math.round(b * 0.8),
    
    // Books: Minor reduction (20%)
    'books': (b) => Math.round(b * 0.8),
    
    // Cash: Minor reduction (20%)
    'cash': (b) => Math.round(b * 0.8),
    
    // Essentials: Keep mostly the same
    'rent': (b) => b,
    'utilities': (b) => b,
    'health': (b) => b,
  };
  
  for (const [category, baselineValue] of Object.entries(baseline)) {
    const strategy = strategies[category];
    moderate[category] = strategy ? strategy(baselineValue) : Math.round(baselineValue * 0.8);
  }
  
  return moderate;
}

/**
 * Generates strategic aggressive savings preset based on imported baseline data
 */
export function generateAggressivePreset(
  baseline: Record<string, number>,
  _importedData: ImportedSpendingData | null
): Record<string, number> {
  const aggressive: Record<string, number> = {};
  
  // Strategic reductions for aggressive savings
  const strategies: Record<string, (baseline: number) => number> = {
    // Transport: Public transport only
    'transport': () => 50,
    
    // Food delivery: Eliminate completely
    'food-delivery': () => 0,
    
    // Fast food: Eliminate completely
    'fast-food': () => 0,
    
    // Subscriptions: Keep only essentials (70% reduction)
    'subscriptions': (b) => Math.round(b * 0.3),
    
    // Shopping: Minimal purchases only (80% reduction)
    'shopping': (b) => Math.round(b * 0.2),
    
    // Gaming: Drastically reduce (75% reduction)
    'gaming': (b) => Math.round(b * 0.25),
    
    // Groceries: Increase significantly for home cooking (33% increase)
    'groceries': (b) => Math.round(b * 1.33),
    
    // Entertainment: Cut by half
    'entertainment': (b) => Math.round(b * 0.5),
    
    // Books: Minimal reduction (books are educational)
    'books': (b) => Math.round(b * 0.7),
    
    // Cash: Reduce significantly
    'cash': (b) => Math.round(b * 0.6),
    
    // Utilities: Try to reduce (20% reduction - optimize usage)
    'utilities': (b) => Math.round(b * 0.8),
    
    // Essentials: Keep the same
    'rent': (b) => b,
    'health': (b) => b,
  };
  
  for (const [category, baselineValue] of Object.entries(baseline)) {
    const strategy = strategies[category];
    aggressive[category] = strategy ? strategy(baselineValue) : Math.round(baselineValue * 0.5);
  }
  
  return aggressive;
}

/**
 * Calculates potential savings for each preset
 */
export function calculateSavings(
  baseline: Record<string, number>,
  moderate: Record<string, number>,
  aggressive: Record<string, number>
): {
  baselineTotal: number;
  moderateSavings: number;
  aggressiveSavings: number;
} {
  const baselineTotal = Object.values(baseline).reduce((sum, val) => sum + val, 0);
  const moderateTotal = Object.values(moderate).reduce((sum, val) => sum + val, 0);
  const aggressiveTotal = Object.values(aggressive).reduce((sum, val) => sum + val, 0);
  
  return {
    baselineTotal,
    moderateSavings: baselineTotal - moderateTotal,
    aggressiveSavings: baselineTotal - aggressiveTotal,
  };
}
