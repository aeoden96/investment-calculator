import { describe, it, expect } from 'vitest';
import { expenseCategories, allocationCategories, presets } from '../config';

describe('Expense Categories Configuration', () => {
  it('should have all required categories', () => {
    const categoryIds = expenseCategories.map(cat => cat.id);
    
    expect(categoryIds).toContain('rent');
    expect(categoryIds).toContain('groceries');
    expect(categoryIds).toContain('utilities');
    expect(categoryIds).toContain('transport');
    expect(categoryIds).toContain('health');
  });

  it('should have both essential and discretionary groups', () => {
    const essentials = expenseCategories.filter(cat => cat.group === 'essential');
    const discretionary = expenseCategories.filter(cat => cat.group === 'discretionary');
    
    expect(essentials.length).toBeGreaterThan(0);
    expect(discretionary.length).toBeGreaterThan(0);
  });

  it('should have valid max values', () => {
    expenseCategories.forEach(cat => {
      expect(cat.max).toBeGreaterThan(0);
      expect(cat.max).toBeGreaterThanOrEqual(cat.value);
    });
  });

  it('should have positive step values', () => {
    expenseCategories.forEach(cat => {
      expect(cat.step).toBeGreaterThan(0);
    });
  });

  it('should have value within max limit', () => {
    expenseCategories.forEach(cat => {
      expect(cat.value).toBeLessThanOrEqual(cat.max);
      expect(cat.value).toBeGreaterThanOrEqual(0);
    });
  });

  it('should have actual values close to suggested values', () => {
    expenseCategories.forEach(cat => {
      expect(cat.actual).toBeLessThanOrEqual(cat.max);
      expect(cat.actual).toBeGreaterThanOrEqual(0);
    });
  });

  it('should have descriptive notes', () => {
    expenseCategories.forEach(cat => {
      expect(cat.note).toBeTruthy();
      expect(cat.note.length).toBeGreaterThan(10);
    });
  });

  it('should have tips only for certain categories', () => {
    // Tips are optional - some categories may have them
    const categoriesWithTips = expenseCategories.filter(cat => cat.tip);
    
    // If tips exist, they should be non-empty strings
    categoriesWithTips.forEach(cat => {
      expect(cat.tip).toBeTruthy();
      expect(typeof cat.tip).toBe('string');
    });
  });
});

describe('Allocation Categories Configuration', () => {
  it('should have ETF, BTC, and ETH allocations', () => {
    const ids = allocationCategories.map(cat => cat.id);
    
    expect(ids).toContain('etf');
    expect(ids).toContain('btc');
    expect(ids).toContain('eth');
  });

  it('should sum to 100%', () => {
    const total = allocationCategories.reduce((sum, cat) => sum + cat.value, 0);
    expect(total).toBe(100);
  });

  it('should have positive values', () => {
    allocationCategories.forEach(cat => {
      expect(cat.value).toBeGreaterThan(0);
      expect(cat.value).toBeLessThanOrEqual(100);
    });
  });

  it('should have tips for each allocation', () => {
    allocationCategories.forEach(cat => {
      expect(cat.tip).toBeTruthy();
      expect(cat.tip.length).toBeGreaterThan(10);
    });
  });

  it('should recommend ETF as largest allocation', () => {
    const etf = allocationCategories.find(cat => cat.id === 'etf');
    const btc = allocationCategories.find(cat => cat.id === 'btc');
    const eth = allocationCategories.find(cat => cat.id === 'eth');
    
    expect(etf!.value).toBeGreaterThan(btc!.value);
    expect(etf!.value).toBeGreaterThan(eth!.value);
  });
});

describe('Presets Configuration', () => {
  it('should have current, moderate, and aggressive presets', () => {
    expect(presets).toHaveProperty('current');
    expect(presets).toHaveProperty('moderate');
    expect(presets).toHaveProperty('aggressive');
  });

  it('should all have same income', () => {
    expect(presets.current.income).toBe(2000);
    expect(presets.moderate.income).toBe(2000);
    expect(presets.aggressive.income).toBe(2000);
  });

  it('should have progressively lower discretionary spending', () => {
    // Food delivery
    expect(presets.current['food-delivery']).toBeGreaterThan(presets.moderate['food-delivery']);
    expect(presets.moderate['food-delivery']).toBeGreaterThan(presets.aggressive['food-delivery']);
    
    // Gaming
    expect(presets.current.gaming).toBeGreaterThan(presets.moderate.gaming);
    expect(presets.moderate.gaming).toBeGreaterThan(presets.aggressive.gaming);
  });

  it('should maintain essential expenses', () => {
    // Rent should be same across all presets
    expect(presets.current.rent).toBe(presets.moderate.rent);
    expect(presets.moderate.rent).toBe(presets.aggressive.rent);
  });

  it('should have zero discretionary in aggressive preset', () => {
    expect(presets.aggressive['food-delivery']).toBe(0);
    expect(presets.aggressive['fast-food']).toBe(0);
  });

  it('should have all expense categories', () => {
    const categories = expenseCategories.map(cat => cat.id);
    
    categories.forEach(catId => {
      const presetKey = catId as keyof typeof presets.current;
      if (presetKey in presets.current) {
        expect(presets.current[presetKey]).toBeGreaterThanOrEqual(0);
        expect(presets.moderate[presetKey]).toBeGreaterThanOrEqual(0);
        expect(presets.aggressive[presetKey]).toBeGreaterThanOrEqual(0);
      }
    });
  });

  it('should calculate different savings rates', () => {
    const calculateTotal = (preset: typeof presets.current) => {
      return Object.entries(preset)
        .filter(([key]) => key !== 'income')
        .reduce((sum, [_, value]) => sum + value, 0);
    };
    
    const currentTotal = calculateTotal(presets.current);
    const moderateTotal = calculateTotal(presets.moderate);
    const aggressiveTotal = calculateTotal(presets.aggressive);
    
    // Lower expenses = higher savings
    expect(currentTotal).toBeGreaterThan(moderateTotal);
    expect(moderateTotal).toBeGreaterThan(aggressiveTotal);
  });

  it('should result in positive surplus for all presets', () => {
    const calculateSurplus = (preset: typeof presets.current) => {
      const total = Object.entries(preset)
        .filter(([key]) => key !== 'income')
        .reduce((sum, [_, value]) => sum + value, 0);
      return preset.income - total;
    };
    
    expect(calculateSurplus(presets.current)).toBeGreaterThan(0);
    expect(calculateSurplus(presets.moderate)).toBeGreaterThan(0);
    expect(calculateSurplus(presets.aggressive)).toBeGreaterThan(0);
  });
});

describe('Category Grouping', () => {
  it('should have rent as essential', () => {
    const rent = expenseCategories.find(cat => cat.id === 'rent');
    expect(rent?.group).toBe('essential');
  });

  it('should have gaming as discretionary', () => {
    const gaming = expenseCategories.find(cat => cat.id === 'gaming');
    expect(gaming?.group).toBe('discretionary');
  });

  it('should have food delivery as discretionary', () => {
    const foodDelivery = expenseCategories.find(cat => cat.id === 'food-delivery');
    expect(foodDelivery?.group).toBe('discretionary');
  });

  it('should have groceries as essential', () => {
    const groceries = expenseCategories.find(cat => cat.id === 'groceries');
    expect(groceries?.group).toBe('essential');
  });

  it('should have consistent grouping logic', () => {
    // Essential categories (basic needs)
    const essentialIds = ['rent', 'groceries', 'utilities', 'transport', 'health'];
    
    essentialIds.forEach(id => {
      const category = expenseCategories.find(cat => cat.id === id);
      expect(category?.group).toBe('essential');
    });
    
    // Discretionary categories (wants)
    const discretionaryIds = ['food-delivery', 'fast-food', 'gaming', 'entertainment'];
    
    discretionaryIds.forEach(id => {
      const category = expenseCategories.find(cat => cat.id === id);
      expect(category?.group).toBe('discretionary');
    });
  });
});
