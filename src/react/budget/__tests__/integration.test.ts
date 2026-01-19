import { describe, it, expect } from 'vitest';
import { analyzeCSV } from '../utils/csvAnalyzer';
import { formatCategoryStats } from '../utils/statsFormatter';
import { generateModeratePreset, generateAggressivePreset } from '../utils/presetCalculator';

describe('Budget Import Integration', () => {
  const sampleCSV = `Type,Product,Started Date,Completed Date,Description,Amount,Fee,Currency,State,Balance
Card Payment,Current,2025-01-01,2025-01-01,Domino's pizza,-8.59,0.00,EUR,COMPLETED,242.04
Card Payment,Current,2025-01-02,2025-01-02,Wolt,-27.49,0.00,EUR,COMPLETED,214.55
Card Payment,Current,2025-01-03,2025-01-03,Wolt,-11.29,0.00,EUR,COMPLETED,203.26
Card Payment,Current,2025-01-04,2025-01-04,Amazon,-103.67,0.00,EUR,COMPLETED,99.59
Card Payment,Current,2025-01-05,2025-01-05,Bolt,-5.30,0.00,EUR,COMPLETED,94.29
Card Payment,Current,2025-01-06,2025-01-06,Konzum,-11.68,0.00,EUR,COMPLETED,82.61
Card Payment,Current,2025-01-07,2025-01-07,OnlyFans,-3.63,0.00,EUR,COMPLETED,78.98
Card Payment,Current,2025-01-08,2025-01-08,Netflix,-4.99,0.00,EUR,COMPLETED,73.99
Card Payment,Current,2025-01-09,2025-01-09,Steam,-45.36,0.00,EUR,COMPLETED,28.63
Card Payment,Current,2025-01-10,2025-01-10,McDonald's,-10.79,0.00,EUR,COMPLETED,17.84
Card Payment,Current,2025-01-11,2025-01-11,Lidl,-12.84,0.00,EUR,COMPLETED,5.00
Card Payment,Current,2025-01-12,2025-01-12,Bolt,-7.38,0.00,EUR,COMPLETED,-2.38
Card Payment,Current,2025-02-01,2025-02-01,YouTube Premium,-17.99,0.00,EUR,COMPLETED,-20.37
Card Payment,Current,2025-02-05,2025-02-05,Uber,-8.50,0.00,EUR,COMPLETED,-28.87
Card Payment,Current,2025-02-10,2025-02-10,Temu,-50.25,0.00,EUR,COMPLETED,-79.12`;

  it('should analyze CSV and categorize transactions correctly', () => {
    const result = analyzeCSV(sampleCSV, 'test.csv');
    
    // Check total transactions
    expect(result.totalTransactions).toBe(15);
    
    // Check that categories were detected
    expect(result.categoryBreakdown['fast-food']).toBeDefined();
    expect(result.categoryBreakdown['food-delivery']).toBeDefined();
    expect(result.categoryBreakdown['shopping']).toBeDefined();
    expect(result.categoryBreakdown['transport']).toBeDefined();
    expect(result.categoryBreakdown['groceries']).toBeDefined();
    expect(result.categoryBreakdown['subscriptions']).toBeDefined();
    expect(result.categoryBreakdown['gaming']).toBeDefined();
    
    // Verify counts (note: Domino's pizza might be categorized as fast-food due to "domino" pattern)
    expect(result.categoryBreakdown['fast-food'].count).toBeGreaterThanOrEqual(1); // McDonald's + possibly Domino's
    expect(result.categoryBreakdown['food-delivery'].count).toBe(2); // 2x Wolt
    expect(result.categoryBreakdown['transport'].count).toBe(3); // 2x Bolt, 1x Uber
    expect(result.categoryBreakdown['groceries'].count).toBe(2); // Konzum, Lidl
  });
  
  it('should calculate monthly averages correctly', () => {
    const result = analyzeCSV(sampleCSV, 'test.csv');
    
    // Data spans 2 months (Jan and Feb)
    expect(result.monthsInRange).toBe(2);
    
    // Check monthly averages
    const transportData = result.categoryBreakdown['transport'];
    expect(transportData.monthlyAverage).toBeGreaterThan(0);
    
    const foodDeliveryData = result.categoryBreakdown['food-delivery'];
    expect(foodDeliveryData.monthlyAverage).toBeGreaterThan(0);
  });
  
  it('should format category stats correctly', () => {
    const result = analyzeCSV(sampleCSV, 'test.csv');
    
    const transportStats = formatCategoryStats(
      'transport',
      result.categoryBreakdown['transport'],
      result.monthsInRange,
      2000
    );
    
    expect(transportStats).toContain('rides');
    expect(transportStats).toContain('avg');
  });
  
  it('should generate moderate preset from baseline', () => {
    const result = analyzeCSV(sampleCSV, 'test.csv');
    
    const baseline: Record<string, number> = {
      'transport': Math.round(result.categoryBreakdown['transport']?.monthlyAverage || 0),
      'food-delivery': Math.round(result.categoryBreakdown['food-delivery']?.monthlyAverage || 0),
      'fast-food': Math.round(result.categoryBreakdown['fast-food']?.monthlyAverage || 0),
      'groceries': Math.round(result.categoryBreakdown['groceries']?.monthlyAverage || 0),
      'subscriptions': Math.round(result.categoryBreakdown['subscriptions']?.monthlyAverage || 0),
      'shopping': Math.round(result.categoryBreakdown['shopping']?.monthlyAverage || 0),
      'gaming': Math.round(result.categoryBreakdown['gaming']?.monthlyAverage || 0),
    };
    
    const moderate = generateModeratePreset(baseline, result);
    
    // Transport should be capped at 50 (public pass)
    expect(moderate['transport']).toBeLessThanOrEqual(50);
    
    // Food delivery should be reduced
    expect(moderate['food-delivery']).toBeLessThan(baseline['food-delivery']);
    
    // Groceries should increase (to compensate for less delivery)
    expect(moderate['groceries']).toBeGreaterThan(baseline['groceries']);
  });
  
  it('should generate aggressive preset from baseline', () => {
    const result = analyzeCSV(sampleCSV, 'test.csv');
    
    const baseline: Record<string, number> = {
      'transport': Math.round(result.categoryBreakdown['transport']?.monthlyAverage || 0),
      'food-delivery': Math.round(result.categoryBreakdown['food-delivery']?.monthlyAverage || 0),
      'fast-food': Math.round(result.categoryBreakdown['fast-food']?.monthlyAverage || 0),
      'groceries': Math.round(result.categoryBreakdown['groceries']?.monthlyAverage || 0),
      'subscriptions': Math.round(result.categoryBreakdown['subscriptions']?.monthlyAverage || 0),
      'shopping': Math.round(result.categoryBreakdown['shopping']?.monthlyAverage || 0),
      'gaming': Math.round(result.categoryBreakdown['gaming']?.monthlyAverage || 0),
    };
    
    const aggressive = generateAggressivePreset(baseline, result);
    
    // Transport should be 50 (public pass)
    expect(aggressive['transport']).toBe(50);
    
    // Food delivery should be eliminated
    expect(aggressive['food-delivery']).toBe(0);
    
    // Fast food should be eliminated
    expect(aggressive['fast-food']).toBe(0);
    
    // Groceries should increase significantly
    expect(aggressive['groceries']).toBeGreaterThan(baseline['groceries']);
    
    // Shopping should be drastically reduced
    expect(aggressive['shopping']).toBeLessThan(baseline['shopping'] * 0.3);
  });
});
