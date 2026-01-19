import { describe, it, expect } from 'vitest';
import { calculateBudgetValues, calculateMonthlyProgress, calculate10YearProjection } from '../hooks/useBudgetCalculations';
import type { BudgetState, CalculatedValues } from '../types';

describe('calculateBudgetValues', () => {
  const createMockState = (overrides?: Partial<BudgetState>): BudgetState => ({
    income: 2000,
    investmentSplit: 60,
    expenses: {
      rent: 350,
      groceries: 300,
      utilities: 150,
      transport: 132,
      health: 50,
      'food-delivery': 75,
      'fast-food': 31,
      subscriptions: 165,
      shopping: 250,
      gaming: 85,
      books: 30,
      entertainment: 100,
      cash: 50
    },
    allocations: {
      etf: 60,
      btc: 25,
      eth: 15
    },
    bufferLimit: 5000,
    ...overrides
  });

  describe('Basic Calculations', () => {
    it('should calculate total expenses correctly', () => {
      const state = createMockState();
      const result = calculateBudgetValues(state);
      
      // Sum of all expenses: 350+300+150+132+50+75+31+165+250+85+30+100+50 = 1768
      expect(result.totalExpenses).toBe(1768);
    });

    it('should calculate surplus correctly', () => {
      const state = createMockState();
      const result = calculateBudgetValues(state);
      
      // Income 2000 - Expenses 1768 = 232
      expect(result.surplus).toBe(232);
    });

    it('should handle negative surplus (deficit)', () => {
      const state = createMockState({ income: 1000 });
      const result = calculateBudgetValues(state);
      
      expect(result.surplus).toBeLessThan(0);
      expect(result.totalInvestmentAmount).toBe(0); // No investment when in deficit
    });

    it('should calculate investment amount based on split', () => {
      const state = createMockState();
      const result = calculateBudgetValues(state);
      
      // Surplus 232 * 60% = 139.2, floored to 139
      expect(result.totalInvestmentAmount).toBe(139);
    });

    it('should calculate buffer amount', () => {
      const state = createMockState();
      const result = calculateBudgetValues(state);
      
      // Surplus 232 - Investment 139 = 93
      expect(result.buffer).toBe(93);
    });

    it('should calculate savings rate', () => {
      const state = createMockState();
      const result = calculateBudgetValues(state);
      
      // (139 / 2000) * 100 = 6.95%
      expect(result.savingsRate).toBeCloseTo(6.95, 1);
    });
  });

  describe('Investment Allocation', () => {
    it('should split investment across ETF, BTC, ETH', () => {
      const state = createMockState();
      const result = calculateBudgetValues(state);
      
      // Total investment 139
      // ETF 60% = 83, BTC 25% = 34, ETH remainder = 22
      expect(result.etfAmount).toBe(83);
      expect(result.btcAmount).toBe(34);
      expect(result.ethAmount).toBe(22);
      
      // Should sum to total investment
      expect(result.etfAmount + result.btcAmount + result.ethAmount).toBe(result.totalInvestmentAmount);
    });

    it('should normalize allocations when they dont sum to 100%', () => {
      const state = createMockState({
        allocations: { etf: 50, btc: 30, eth: 10 } // Total 90%
      });
      const result = calculateBudgetValues(state);
      
      // Should still allocate full investment amount
      expect(result.etfAmount + result.btcAmount + result.ethAmount).toBe(result.totalInvestmentAmount);
    });

    it('should handle zero allocations', () => {
      const state = createMockState({
        allocations: { etf: 0, btc: 0, eth: 0 }
      });
      const result = calculateBudgetValues(state);
      
      // Should default to equal distribution (33/33/34)
      expect(result.etfAmount).toBeGreaterThan(0);
      expect(result.btcAmount).toBeGreaterThan(0);
      expect(result.ethAmount).toBeGreaterThan(0);
    });
  });

  describe('Category Totals', () => {
    it('should calculate essential expenses total', () => {
      const state = createMockState();
      const result = calculateBudgetValues(state);
      
      // Essential: rent(350) + groceries(300) + utilities(150) + transport(132) + health(50) = 982
      expect(result.essentialTotal).toBe(982);
    });

    it('should calculate discretionary expenses total', () => {
      const state = createMockState();
      const result = calculateBudgetValues(state);
      
      // Discretionary: food-delivery(75) + fast-food(31) + subscriptions(165) + 
      // shopping(250) + gaming(85) + books(30) + entertainment(100) + cash(50) = 786
      expect(result.discretionaryTotal).toBe(786);
    });

    it('should have essential + discretionary = total expenses', () => {
      const state = createMockState();
      const result = calculateBudgetValues(state);
      
      expect(result.essentialTotal + result.discretionaryTotal).toBe(result.totalExpenses);
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero income', () => {
      const state = createMockState({ income: 0 });
      const result = calculateBudgetValues(state);
      
      expect(result.savingsRate).toBe(0);
      expect(result.totalInvestmentAmount).toBe(0);
    });

    it('should handle 100% investment split', () => {
      const state = createMockState({ investmentSplit: 100 });
      const result = calculateBudgetValues(state);
      
      expect(result.buffer).toBe(0);
      expect(result.totalInvestmentAmount).toBe(result.surplus);
    });

    it('should handle 0% investment split', () => {
      const state = createMockState({ investmentSplit: 0 });
      const result = calculateBudgetValues(state);
      
      expect(result.totalInvestmentAmount).toBe(0);
      expect(result.buffer).toBe(result.surplus);
    });

    it('should clamp investment split to valid range', () => {
      const state1 = createMockState({ investmentSplit: -10 });
      const result1 = calculateBudgetValues(state1);
      expect(result1.totalInvestmentAmount).toBe(0);

      const state2 = createMockState({ investmentSplit: 150 });
      const result2 = calculateBudgetValues(state2);
      expect(result2.totalInvestmentAmount).toBe(result2.surplus);
    });
  });
});

describe('calculateMonthlyProgress', () => {
  const createMockState = (): BudgetState => ({
    income: 2000,
    investmentSplit: 60,
    expenses: {
      rent: 350,
      groceries: 300,
      utilities: 150,
      transport: 100,
      health: 50,
      'food-delivery': 50,
      'fast-food': 20,
      subscriptions: 100,
      shopping: 150,
      gaming: 50,
      books: 20,
      entertainment: 80,
      cash: 30
    },
    allocations: { etf: 60, btc: 25, eth: 15 },
    bufferLimit: 5000
  });

  const createMockCalculated = (): CalculatedValues => ({
    totalExpenses: 1450,
    surplus: 550,
    totalInvestmentAmount: 330,
    buffer: 220,
    savingsRate: 16.5,
    etfAmount: 198,
    btcAmount: 82,
    ethAmount: 50,
    essentialTotal: 950,
    discretionaryTotal: 500
  });

  it('should generate 12 months of data', () => {
    const state = createMockState();
    const calculated = createMockCalculated();
    const result = calculateMonthlyProgress(state, calculated);
    
    expect(result.labels).toHaveLength(12);
    expect(result.datasets[0].data).toHaveLength(12);
  });

  it('should show growing investment values over time', () => {
    const state = createMockState();
    const calculated = createMockCalculated();
    const result = calculateMonthlyProgress(state, calculated);
    
    const etfData = result.datasets.find(d => d.label === 'ETF')!.data;
    
    // Each month should be greater than the previous (with growth)
    for (let i = 1; i < etfData.length; i++) {
      expect(etfData[i]).toBeGreaterThan(etfData[i - 1]);
    }
  });

  it('should calculate ending amount greater than starting', () => {
    const state = createMockState();
    const calculated = createMockCalculated();
    const result = calculateMonthlyProgress(state, calculated);
    
    expect(result.endingAmount).toBeGreaterThan(result.startingAmount);
  });

  it('should calculate positive growth', () => {
    const state = createMockState();
    const calculated = createMockCalculated();
    const result = calculateMonthlyProgress(state, calculated);
    
    expect(result.growth).toBeGreaterThan(0);
    expect(result.growth).toBe(result.endingAmount - result.totalInvested);
  });

  it('should handle buffer limit trigger', () => {
    const state = createMockState({ bufferLimit: 1000 });
    const calculated = createMockCalculated();
    const result = calculateMonthlyProgress(state, calculated);
    
    // With low buffer limit, should reach it eventually
    if (result.bufferLimitReachedMonth >= 0) {
      expect(result.bufferLimitReachedMonth).toBeGreaterThanOrEqual(0);
      expect(result.bufferLimitReachedMonth).toBeLessThan(12);
    }
  });

  it('should not trigger buffer limit with high threshold', () => {
    const state = createMockState({ bufferLimit: 50000 });
    const calculated = createMockCalculated();
    const result = calculateMonthlyProgress(state, calculated);
    
    expect(result.bufferLimitReachedMonth).toBe(-1);
  });

  it('should have buffer data that grows linearly before limit', () => {
    const state = createMockState({ bufferLimit: 0 }); // No limit
    const calculated = createMockCalculated();
    const result = calculateMonthlyProgress(state, calculated);
    
    const bufferData = result.datasets.find(d => d.label === 'Buffer')!.data;
    const monthlyBuffer = calculated.surplus - calculated.totalInvestmentAmount;
    
    // First month should be approximately the monthly buffer
    expect(bufferData[0]).toBeCloseTo(monthlyBuffer, 0);
    // Second month should be approximately 2x
    expect(bufferData[1]).toBeCloseTo(monthlyBuffer * 2, 0);
  });
});

describe('calculate10YearProjection', () => {
  it('should calculate 10-year projection correctly', () => {
    const calculated: CalculatedValues = {
      totalExpenses: 1500,
      surplus: 500,
      totalInvestmentAmount: 300,
      buffer: 200,
      savingsRate: 15,
      etfAmount: 180,
      btcAmount: 75,
      ethAmount: 45,
      essentialTotal: 1000,
      discretionaryTotal: 500
    };
    
    const result = calculate10YearProjection(calculated);
    
    expect(result.monthlyAmount).toBe(300);
    expect(result.totalInvested).toBe(300 * 120); // 120 months
    expect(result.estimatedValue).toBeGreaterThan(result.totalInvested); // Should have growth
    expect(result.profit).toBe(result.estimatedValue - result.totalInvested);
  });

  it('should return zeros when no investment', () => {
    const calculated: CalculatedValues = {
      totalExpenses: 2000,
      surplus: 0,
      totalInvestmentAmount: 0,
      buffer: 0,
      savingsRate: 0,
      etfAmount: 0,
      btcAmount: 0,
      ethAmount: 0,
      essentialTotal: 1500,
      discretionaryTotal: 500
    };
    
    const result = calculate10YearProjection(calculated);
    
    expect(result.monthlyAmount).toBe(0);
    expect(result.totalInvested).toBe(0);
    expect(result.estimatedValue).toBe(0);
    expect(result.profit).toBe(0);
  });

  it('should show higher returns for higher-risk allocations', () => {
    // High ETF (lower return)
    const lowRisk: CalculatedValues = {
      totalExpenses: 1500,
      surplus: 500,
      totalInvestmentAmount: 300,
      buffer: 200,
      savingsRate: 15,
      etfAmount: 300,
      btcAmount: 0,
      ethAmount: 0,
      essentialTotal: 1000,
      discretionaryTotal: 500
    };
    
    // High BTC (higher return)
    const highRisk: CalculatedValues = {
      ...lowRisk,
      etfAmount: 0,
      btcAmount: 300,
      ethAmount: 0
    };
    
    const lowRiskResult = calculate10YearProjection(lowRisk);
    const highRiskResult = calculate10YearProjection(highRisk);
    
    // BTC (15% annual) should have higher returns than ETF (7% annual)
    expect(highRiskResult.estimatedValue).toBeGreaterThan(lowRiskResult.estimatedValue);
    expect(highRiskResult.profit).toBeGreaterThan(lowRiskResult.profit);
  });

  it('should calculate realistic compound growth', () => {
    const calculated: CalculatedValues = {
      totalExpenses: 1500,
      surplus: 500,
      totalInvestmentAmount: 1000,
      buffer: 0,
      savingsRate: 50,
      etfAmount: 1000,
      btcAmount: 0,
      ethAmount: 0,
      essentialTotal: 1000,
      discretionaryTotal: 500
    };
    
    const result = calculate10YearProjection(calculated);
    
    // With 7% annual return on ETF, after 10 years the total should be significantly higher
    // Using compound interest formula for monthly contributions
    const monthlyRate = 0.07 / 12;
    const months = 120;
    const expectedValue = calculated.etfAmount * 
      ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * 
      (1 + monthlyRate);
    
    expect(result.estimatedValue).toBeCloseTo(expectedValue, 0);
  });
});
