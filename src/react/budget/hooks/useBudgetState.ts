import { useState, useEffect, useCallback } from 'react';
import type { BudgetState, ImportedSpendingData } from '../types';
import { expenseCategories, presets } from '../config';
import { generateModeratePreset, generateAggressivePreset } from '../utils/presetCalculator';

const STORAGE_KEY = 'budgetDashboardState';

function getInitialState(): BudgetState {
  const defaultState: BudgetState = {
    income: 2000,
    investmentSplit: 60,
    expenses: {},
    allocations: {
      etf: 60,
      btc: 25,
      eth: 15
    },
    bufferLimit: 5000,
    importedData: null,
    isUsingImportedBaseline: false,
  };
  
  // Initialize expenses from categories
  expenseCategories.forEach(cat => {
    defaultState.expenses[cat.id] = cat.value;
  });
  
  // Try to load from localStorage
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        
        // Validate and sanitize the loaded data
        const validatedState = {
          ...defaultState,
          income: typeof parsed.income === 'number' && parsed.income >= 0 && parsed.income <= 100000 
            ? parsed.income 
            : defaultState.income,
          investmentSplit: typeof parsed.investmentSplit === 'number' && parsed.investmentSplit >= 0 && parsed.investmentSplit <= 100
            ? parsed.investmentSplit
            : defaultState.investmentSplit,
          bufferLimit: typeof parsed.bufferLimit === 'number' && parsed.bufferLimit >= 0
            ? parsed.bufferLimit
            : defaultState.bufferLimit,
          expenses: {} as Record<string, number>,
          allocations: {
            etf: typeof parsed.allocations?.etf === 'number' ? parsed.allocations.etf : defaultState.allocations.etf,
            btc: typeof parsed.allocations?.btc === 'number' ? parsed.allocations.btc : defaultState.allocations.btc,
            eth: typeof parsed.allocations?.eth === 'number' ? parsed.allocations.eth : defaultState.allocations.eth,
          },
          importedData: parsed.importedData || null,
          isUsingImportedBaseline: parsed.isUsingImportedBaseline || false,
        };
        
        // Validate expenses - ensure they're within category limits
        expenseCategories.forEach(cat => {
          const savedValue = parsed.expenses?.[cat.id];
          if (typeof savedValue === 'number' && savedValue >= 0 && savedValue <= cat.max) {
            validatedState.expenses[cat.id] = savedValue;
          } else {
            validatedState.expenses[cat.id] = cat.value;
          }
        });
        
        return validatedState;
      }
    } catch (e) {
      console.error('Failed to load saved state:', e);
      // Clear corrupted localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }
  
  return defaultState;
}

export function useBudgetState() {
  const [state, setState] = useState<BudgetState>(getInitialState);
  
  // Save to localStorage whenever state changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch (e) {
        console.error('Failed to save state:', e);
      }
    }
  }, [state]);
  
  const updateIncome = useCallback((income: number) => {
    setState(prev => ({ ...prev, income: Math.max(0, Math.min(100000, income)) }));
  }, []);
  
  const updateInvestmentSplit = useCallback((split: number) => {
    setState(prev => ({ ...prev, investmentSplit: Math.max(0, Math.min(100, split)) }));
  }, []);
  
  const updateExpense = useCallback((categoryId: string, value: number) => {
    setState(prev => ({
      ...prev,
      expenses: {
        ...prev.expenses,
        [categoryId]: value
      }
    }));
  }, []);
  
  const updateAllocation = useCallback((type: 'etf' | 'btc' | 'eth', value: number) => {
    setState(prev => {
      const newAllocations = { ...prev.allocations, [type]: value };
      const total = newAllocations.etf + newAllocations.btc + newAllocations.eth;
      
      // Auto-normalize to 100%
      if (total > 0 && total !== 100) {
        const scale = 100 / total;
        newAllocations.etf = Math.round(newAllocations.etf * scale);
        newAllocations.btc = Math.round(newAllocations.btc * scale);
        newAllocations.eth = 100 - newAllocations.etf - newAllocations.btc;
      }
      
      return { ...prev, allocations: newAllocations };
    });
  }, []);
  
  const updateBufferLimit = useCallback((limit: number) => {
    setState(prev => ({ ...prev, bufferLimit: Math.max(0, limit) }));
  }, []);
  
  const loadPreset = useCallback((presetName: 'current' | 'moderate' | 'aggressive') => {
    setState(prev => {
      let newExpenses: Record<string, number> = {};
      
      if (prev.isUsingImportedBaseline && prev.importedData) {
        // Generate presets from imported baseline
        const baseline: Record<string, number> = {};
        expenseCategories.forEach(cat => {
          const categoryData = prev.importedData?.categoryBreakdown[cat.id];
          baseline[cat.id] = categoryData ? Math.round(categoryData.monthlyAverage) : cat.value;
        });
        
        if (presetName === 'current') {
          newExpenses = baseline;
        } else if (presetName === 'moderate') {
          newExpenses = generateModeratePreset(baseline, prev.importedData);
        } else if (presetName === 'aggressive') {
          newExpenses = generateAggressivePreset(baseline, prev.importedData);
        }
      } else {
        // Use hardcoded presets
        const preset = presets[presetName];
        expenseCategories.forEach(cat => {
          const key = cat.id as keyof typeof preset;
          newExpenses[cat.id] = preset[key] !== undefined ? preset[key] : cat.value;
        });
      }
      
      return {
        ...prev,
        expenses: newExpenses
      };
    });
  }, []);
  
  const applyImportedBaseline = useCallback((importedData: ImportedSpendingData) => {
    setState(prev => {
      const newExpenses: Record<string, number> = {};
      
      // Set expenses based on monthly averages from imported data
      expenseCategories.forEach(cat => {
        const categoryData = importedData.categoryBreakdown[cat.id];
        if (categoryData && categoryData.count > 0) {
          newExpenses[cat.id] = Math.round(categoryData.monthlyAverage);
        } else {
          newExpenses[cat.id] = 0;
        }
      });
      
      return {
        ...prev,
        expenses: newExpenses,
        importedData,
        isUsingImportedBaseline: true,
      };
    });
  }, []);
  
  const resetToDefaults = useCallback(() => {
    const newExpenses: Record<string, number> = {};
    expenseCategories.forEach(cat => {
      newExpenses[cat.id] = cat.value;
    });
    
    setState(prev => ({
      ...prev,
      expenses: newExpenses,
      importedData: null,
      isUsingImportedBaseline: false,
      income: 2000,
    }));
  }, []);
  
  return {
    state,
    updateIncome,
    updateInvestmentSplit,
    updateExpense,
    updateAllocation,
    updateBufferLimit,
    loadPreset,
    applyImportedBaseline,
    resetToDefaults,
  };
}
