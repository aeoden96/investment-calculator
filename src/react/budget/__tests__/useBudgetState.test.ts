import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useBudgetState } from '../hooks/useBudgetState';

describe('useBudgetState', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should initialize with default values', () => {
      const { result } = renderHook(() => useBudgetState());
      
      expect(result.current.state.income).toBe(2000);
      expect(result.current.state.investmentSplit).toBe(60);
      expect(result.current.state.bufferLimit).toBe(5000);
      expect(result.current.state.allocations).toEqual({
        etf: 60,
        btc: 25,
        eth: 15
      });
    });

    it('should initialize expenses from categories', () => {
      const { result } = renderHook(() => useBudgetState());
      
      expect(result.current.state.expenses).toHaveProperty('rent');
      expect(result.current.state.expenses).toHaveProperty('groceries');
      expect(result.current.state.expenses).toHaveProperty('utilities');
    });

    it('should load saved state from localStorage', () => {
      const savedState = {
        income: 3000,
        investmentSplit: 70,
        expenses: { rent: 500 },
        allocations: { etf: 50, btc: 30, eth: 20 }
      };
      
      localStorage.setItem('budgetDashboardState', JSON.stringify(savedState));
      
      const { result } = renderHook(() => useBudgetState());
      
      expect(result.current.state.income).toBe(3000);
      expect(result.current.state.investmentSplit).toBe(70);
    });

    it('should handle corrupted localStorage gracefully', () => {
      localStorage.setItem('budgetDashboardState', 'invalid json');
      
      const { result } = renderHook(() => useBudgetState());
      
      // Should still initialize with defaults
      expect(result.current.state.income).toBe(2000);
    });
  });

  describe('updateIncome', () => {
    it('should update income value', () => {
      const { result } = renderHook(() => useBudgetState());
      
      act(() => {
        result.current.updateIncome(3500);
      });
      
      expect(result.current.state.income).toBe(3500);
    });

    it('should clamp income to minimum 0', () => {
      const { result } = renderHook(() => useBudgetState());
      
      act(() => {
        result.current.updateIncome(-500);
      });
      
      expect(result.current.state.income).toBe(0);
    });

    it('should clamp income to maximum 100000', () => {
      const { result } = renderHook(() => useBudgetState());
      
      act(() => {
        result.current.updateIncome(150000);
      });
      
      expect(result.current.state.income).toBe(100000);
    });

    it('should save to localStorage after update', () => {
      const { result } = renderHook(() => useBudgetState());
      const setItemSpy = vi.spyOn(localStorage, 'setItem');
      
      act(() => {
        result.current.updateIncome(2500);
      });
      
      expect(setItemSpy).toHaveBeenCalled();
      setItemSpy.mockRestore();
    });
  });

  describe('updateInvestmentSplit', () => {
    it('should update investment split', () => {
      const { result } = renderHook(() => useBudgetState());
      
      act(() => {
        result.current.updateInvestmentSplit(75);
      });
      
      expect(result.current.state.investmentSplit).toBe(75);
    });

    it('should clamp to 0-100 range', () => {
      const { result } = renderHook(() => useBudgetState());
      
      act(() => {
        result.current.updateInvestmentSplit(-10);
      });
      expect(result.current.state.investmentSplit).toBe(0);
      
      act(() => {
        result.current.updateInvestmentSplit(150);
      });
      expect(result.current.state.investmentSplit).toBe(100);
    });
  });

  describe('updateExpense', () => {
    it('should update specific expense category', () => {
      const { result } = renderHook(() => useBudgetState());
      
      act(() => {
        result.current.updateExpense('rent', 500);
      });
      
      expect(result.current.state.expenses.rent).toBe(500);
    });

    it('should not affect other expense categories', () => {
      const { result } = renderHook(() => useBudgetState());
      const initialGroceries = result.current.state.expenses.groceries;
      
      act(() => {
        result.current.updateExpense('rent', 500);
      });
      
      expect(result.current.state.expenses.groceries).toBe(initialGroceries);
    });

    it('should handle new expense categories', () => {
      const { result } = renderHook(() => useBudgetState());
      
      act(() => {
        result.current.updateExpense('newCategory', 100);
      });
      
      expect(result.current.state.expenses.newCategory).toBe(100);
    });
  });

  describe('updateAllocation', () => {
    it('should update ETF allocation', () => {
      const { result } = renderHook(() => useBudgetState());
      
      act(() => {
        result.current.updateAllocation('etf', 70);
      });
      
      expect(result.current.state.allocations.etf).toBeGreaterThan(0);
    });

    it('should auto-normalize allocations to 100%', () => {
      const { result } = renderHook(() => useBudgetState());
      
      act(() => {
        result.current.updateAllocation('etf', 50);
      });
      
      const { etf, btc, eth } = result.current.state.allocations;
      expect(etf + btc + eth).toBe(100);
    });

    it('should handle BTC allocation update', () => {
      const { result } = renderHook(() => useBudgetState());
      
      act(() => {
        result.current.updateAllocation('btc', 40);
      });
      
      const { etf, btc, eth } = result.current.state.allocations;
      expect(btc).toBeGreaterThan(0);
      expect(etf + btc + eth).toBe(100);
    });

    it('should handle ETH allocation update', () => {
      const { result } = renderHook(() => useBudgetState());
      
      act(() => {
        result.current.updateAllocation('eth', 30);
      });
      
      const { etf, btc, eth } = result.current.state.allocations;
      expect(eth).toBeGreaterThan(0);
      expect(etf + btc + eth).toBe(100);
    });

    it('should maintain proportions when normalizing', () => {
      const { result } = renderHook(() => useBudgetState());
      
      // Set allocations that don't sum to 100
      act(() => {
        result.current.updateAllocation('etf', 30); // This will auto-normalize
      });
      
      const { etf, btc, eth } = result.current.state.allocations;
      
      // Should maintain relative proportions
      expect(etf).toBeGreaterThan(btc);
      expect(btc).toBeGreaterThan(eth);
    });
  });

  describe('updateBufferLimit', () => {
    it('should update buffer limit', () => {
      const { result } = renderHook(() => useBudgetState());
      
      act(() => {
        result.current.updateBufferLimit(8000);
      });
      
      expect(result.current.state.bufferLimit).toBe(8000);
    });

    it('should not allow negative buffer limit', () => {
      const { result } = renderHook(() => useBudgetState());
      
      act(() => {
        result.current.updateBufferLimit(-1000);
      });
      
      expect(result.current.state.bufferLimit).toBe(0);
    });
  });

  describe('loadPreset', () => {
    it('should load current preset', () => {
      const { result } = renderHook(() => useBudgetState());
      
      act(() => {
        result.current.loadPreset('current');
      });
      
      expect(result.current.state.income).toBe(2000);
      expect(result.current.state.expenses.rent).toBe(350);
    });

    it('should load moderate preset with reduced expenses', () => {
      const { result } = renderHook(() => useBudgetState());
      
      act(() => {
        result.current.loadPreset('moderate');
      });
      
      expect(result.current.state.income).toBe(2000);
      // Moderate has lower discretionary spending
      expect(result.current.state.expenses['food-delivery']).toBe(30);
      expect(result.current.state.expenses['fast-food']).toBe(15);
    });

    it('should load aggressive preset with minimal expenses', () => {
      const { result } = renderHook(() => useBudgetState());
      
      act(() => {
        result.current.loadPreset('aggressive');
      });
      
      expect(result.current.state.income).toBe(2000);
      // Aggressive has zero discretionary spending
      expect(result.current.state.expenses['food-delivery']).toBe(0);
      expect(result.current.state.expenses['fast-food']).toBe(0);
    });

    it('should maintain essential expenses across presets', () => {
      const { result } = renderHook(() => useBudgetState());
      
      act(() => {
        result.current.loadPreset('aggressive');
      });
      
      // Essential expenses should still be reasonable
      expect(result.current.state.expenses.rent).toBe(350);
      expect(result.current.state.expenses.groceries).toBe(400);
    });

    it('should preserve allocations when loading preset', () => {
      const { result } = renderHook(() => useBudgetState());
      
      const initialAllocations = { ...result.current.state.allocations };
      
      act(() => {
        result.current.loadPreset('moderate');
      });
      
      // Allocations should not change
      expect(result.current.state.allocations).toEqual(initialAllocations);
    });
  });

  describe('localStorage persistence', () => {
    it('should save state to localStorage on every update', () => {
      const { result } = renderHook(() => useBudgetState());
      const setItemSpy = vi.spyOn(localStorage, 'setItem');
      
      act(() => {
        result.current.updateIncome(2500);
      });
      
      expect(setItemSpy).toHaveBeenCalled();
      setItemSpy.mockRestore();
    });

    it('should save complete state object', () => {
      const { result } = renderHook(() => useBudgetState());
      const setItemSpy = vi.spyOn(localStorage, 'setItem');
      
      act(() => {
        result.current.updateIncome(3000);
      });
      
      const savedCall = setItemSpy.mock.calls.find(call => call[0] === 'budgetDashboardState');
      expect(savedCall).toBeDefined();
      if (savedCall) {
        const savedState = JSON.parse(savedCall[1]);
        expect(savedState).toHaveProperty('income');
        expect(savedState).toHaveProperty('expenses');
        expect(savedState).toHaveProperty('allocations');
        expect(savedState).toHaveProperty('investmentSplit');
      }
      setItemSpy.mockRestore();
    });
  });

  describe('State immutability', () => {
    it('should not mutate state directly', () => {
      const { result } = renderHook(() => useBudgetState());
      
      const initialState = result.current.state;
      
      act(() => {
        result.current.updateIncome(2500);
      });
      
      // Initial state reference should remain unchanged
      expect(result.current.state).not.toBe(initialState);
    });

    it('should create new expense object on update', () => {
      const { result } = renderHook(() => useBudgetState());
      
      const initialExpenses = result.current.state.expenses;
      
      act(() => {
        result.current.updateExpense('rent', 400);
      });
      
      expect(result.current.state.expenses).not.toBe(initialExpenses);
    });
  });
});
