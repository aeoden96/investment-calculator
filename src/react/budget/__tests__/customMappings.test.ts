import { describe, it, expect } from 'vitest';
import { analyzeCSV } from '../utils/csvAnalyzer';

describe('Custom Merchant Mappings', () => {
  const sampleCSV = `Type,Product,Started Date,Completed Date,Description,Amount,Fee,Currency,State,Balance
Card Payment,Current,2025-01-01,2025-01-01,Unknown Merchant A,-100.00,0.00,EUR,COMPLETED,200.00
Card Payment,Current,2025-01-02,2025-01-02,Unknown Merchant A,-50.00,0.00,EUR,COMPLETED,150.00
Card Payment,Current,2025-01-03,2025-01-03,Unknown Merchant B,-75.00,0.00,EUR,COMPLETED,75.00
Card Payment,Current,2025-01-04,2025-01-04,Bolt,-10.00,0.00,EUR,COMPLETED,65.00`;

  it('should categorize transactions without custom mappings', () => {
    const result = analyzeCSV(sampleCSV, 'test.csv');
    
    // Unknown merchants should be uncategorized
    expect(result.uncategorized.length).toBe(3);
    
    // Bolt should be categorized as transport
    expect(result.categoryBreakdown['transport']).toBeDefined();
    expect(result.categoryBreakdown['transport'].count).toBe(1);
  });

  it('should apply custom mappings to uncategorized transactions', () => {
    const customMappings = {
      'Unknown Merchant A': 'shopping',
      'Unknown Merchant B': 'entertainment'
    };
    
    const result = analyzeCSV(sampleCSV, 'test.csv', customMappings);
    
    // Now uncategorized should be empty (all merchants categorized)
    expect(result.uncategorized.length).toBe(0);
    
    // Shopping should have 2 transactions (both Unknown Merchant A)
    expect(result.categoryBreakdown['shopping']).toBeDefined();
    expect(result.categoryBreakdown['shopping'].count).toBe(2);
    expect(result.categoryBreakdown['shopping'].total).toBe(150); // 100 + 50
    
    // Entertainment should have 1 transaction
    expect(result.categoryBreakdown['entertainment']).toBeDefined();
    expect(result.categoryBreakdown['entertainment'].count).toBe(1);
    expect(result.categoryBreakdown['entertainment'].total).toBe(75);
    
    // Transport should still have Bolt
    expect(result.categoryBreakdown['transport']).toBeDefined();
    expect(result.categoryBreakdown['transport'].count).toBe(1);
  });

  it('should override automatic categorization with custom mappings', () => {
    // Even if a merchant is automatically categorized, custom mapping should take precedence
    const customMappings = {
      'Bolt': 'entertainment' // Override transport -> entertainment
    };
    
    const result = analyzeCSV(sampleCSV, 'test.csv', customMappings);
    
    // Bolt should now be in entertainment instead of transport
    expect(result.categoryBreakdown['entertainment']).toBeDefined();
    expect(result.categoryBreakdown['entertainment'].count).toBe(1);
    
    // Transport should not exist (or be empty)
    expect(result.categoryBreakdown['transport']).toBeUndefined();
  });

  it('should have max confidence for user-assigned categories', () => {
    const customMappings = {
      'Unknown Merchant A': 'shopping'
    };
    
    const csvText = `Type,Product,Started Date,Completed Date,Description,Amount,Fee,Currency,State,Balance
Card Payment,Current,2025-01-01,2025-01-01,Unknown Merchant A,-100.00,0.00,EUR,COMPLETED,200.00`;
    
    const result = analyzeCSV(csvText, 'test.csv', customMappings);
    
    // The merchant should be categorized with confidence 1.0
    expect(result.categoryBreakdown['shopping']).toBeDefined();
    expect(result.categoryBreakdown['shopping'].count).toBe(1);
    
    // Since it was user-assigned, all uncategorized should be empty
    expect(result.uncategorized.length).toBe(0);
  });

  it('should ignore undecided custom mappings', () => {
    const customMappings = {
      'Unknown Merchant A': 'undecided',
      'Unknown Merchant B': 'shopping'
    };
    
    const result = analyzeCSV(sampleCSV, 'test.csv', customMappings);
    
    // Unknown Merchant A should still be uncategorized
    const uncategorizedDescriptions = result.uncategorized.map(t => t.description);
    expect(uncategorizedDescriptions).toContain('Unknown Merchant A');
    
    // Unknown Merchant B should be categorized
    expect(result.categoryBreakdown['shopping']).toBeDefined();
    expect(result.categoryBreakdown['shopping'].count).toBe(1);
  });
});
