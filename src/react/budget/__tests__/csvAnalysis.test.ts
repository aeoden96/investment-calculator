import { describe, it, expect } from 'vitest';
import { categorizeTransaction, getCategorizationStats } from '../utils/categorizer';
import { analyzeCSV } from '../utils/csvAnalyzer';
import type { Transaction } from '../types';

describe('CSV Analysis', () => {
  describe('categorizeTransaction', () => {
    it('should categorize Bolt transactions as transport', () => {
      const transaction: Transaction = {
        type: 'CARD_PAYMENT',
        product: 'Current',
        startedDate: '2025-01-01',
        completedDate: '2025-01-01',
        description: 'Bolt',
        amount: -10.50,
        fee: 0,
        currency: 'EUR',
        state: 'COMPLETED',
        balance: 1000,
      };
      
      const result = categorizeTransaction(transaction);
      expect(result.category).toBe('transport');
      expect(result.confidence).toBeGreaterThan(0);
    });
    
    it('should categorize Wolt transactions as food-delivery', () => {
      const transaction: Transaction = {
        type: 'CARD_PAYMENT',
        product: 'Current',
        startedDate: '2025-01-01',
        completedDate: '2025-01-01',
        description: 'Wolt',
        amount: -17.55,
        fee: 0,
        currency: 'EUR',
        state: 'COMPLETED',
        balance: 1000,
      };
      
      const result = categorizeTransaction(transaction);
      expect(result.category).toBe('food-delivery');
      expect(result.confidence).toBe(1.0);
    });
    
    it('should categorize McDonald\'s as fast-food', () => {
      const transaction: Transaction = {
        type: 'CARD_PAYMENT',
        product: 'Current',
        startedDate: '2025-01-01',
        completedDate: '2025-01-01',
        description: 'McDonald\'s',
        amount: -10.79,
        fee: 0,
        currency: 'EUR',
        state: 'COMPLETED',
        balance: 1000,
      };
      
      const result = categorizeTransaction(transaction);
      expect(result.category).toBe('fast-food');
      expect(result.confidence).toBe(1.0);
    });
    
    it('should categorize Lidl as groceries', () => {
      const transaction: Transaction = {
        type: 'CARD_PAYMENT',
        product: 'Current',
        startedDate: '2025-01-01',
        completedDate: '2025-01-01',
        description: 'Lidl',
        amount: -12.84,
        fee: 0,
        currency: 'EUR',
        state: 'COMPLETED',
        balance: 1000,
      };
      
      const result = categorizeTransaction(transaction);
      expect(result.category).toBe('groceries');
      expect(result.confidence).toBe(1.0);
    });
    
    it('should categorize Steam as gaming', () => {
      const transaction: Transaction = {
        type: 'CARD_PAYMENT',
        product: 'Current',
        startedDate: '2025-01-01',
        completedDate: '2025-01-01',
        description: 'Steam',
        amount: -45.36,
        fee: 0,
        currency: 'EUR',
        state: 'COMPLETED',
        balance: 1000,
      };
      
      const result = categorizeTransaction(transaction);
      expect(result.category).toBe('gaming');
      expect(result.confidence).toBe(1.0);
    });
    
    it('should categorize Amazon as shopping', () => {
      const transaction: Transaction = {
        type: 'CARD_PAYMENT',
        product: 'Current',
        startedDate: '2025-01-01',
        completedDate: '2025-01-01',
        description: 'Amazon',
        amount: -103.55,
        fee: 0,
        currency: 'EUR',
        state: 'COMPLETED',
        balance: 1000,
      };
      
      const result = categorizeTransaction(transaction);
      expect(result.category).toBe('shopping');
      expect(result.confidence).toBe(1.0);
    });
    
    it('should mark unknown merchants as undecided', () => {
      const transaction: Transaction = {
        type: 'CARD_PAYMENT',
        product: 'Current',
        startedDate: '2025-01-01',
        completedDate: '2025-01-01',
        description: 'Unknown Merchant XYZ',
        amount: -50.00,
        fee: 0,
        currency: 'EUR',
        state: 'COMPLETED',
        balance: 1000,
      };
      
      const result = categorizeTransaction(transaction);
      expect(result.category).toBe('undecided');
      expect(result.confidence).toBe(0);
    });
  });
  
  describe('analyzeCSV', () => {
    it('should parse and analyze a simple CSV', () => {
      const csvText = `Type,Product,Started Date,Completed Date,Description,Amount,Fee,Currency,State,Balance
CARD_PAYMENT,Current,2025-01-01,2025-01-01,Bolt,-10.50,0,EUR,COMPLETED,1000
CARD_PAYMENT,Current,2025-01-02,2025-01-02,Wolt,-17.55,0,EUR,COMPLETED,990
CARD_PAYMENT,Current,2025-01-03,2025-01-03,Lidl,-12.84,0,EUR,COMPLETED,980`;
      
      const result = analyzeCSV(csvText, 'test.csv');
      
      expect(result.totalTransactions).toBe(3);
      expect(result.categoryBreakdown['transport']).toBeDefined();
      expect(result.categoryBreakdown['transport'].count).toBe(1);
      expect(result.categoryBreakdown['food-delivery']).toBeDefined();
      expect(result.categoryBreakdown['food-delivery'].count).toBe(1);
      expect(result.categoryBreakdown['groceries']).toBeDefined();
      expect(result.categoryBreakdown['groceries'].count).toBe(1);
    });
  });
  
  describe('getCategorizationStats', () => {
    it('should calculate categorization statistics', () => {
      const transactions = [
        {
          type: 'CARD_PAYMENT',
          product: 'Current',
          startedDate: '2025-01-01',
          completedDate: '2025-01-01',
          description: 'Bolt',
          amount: -10.50,
          fee: 0,
          currency: 'EUR',
          state: 'COMPLETED',
          balance: 1000,
          category: 'transport',
          confidence: 1.0,
        },
        {
          type: 'CARD_PAYMENT',
          product: 'Current',
          startedDate: '2025-01-02',
          completedDate: '2025-01-02',
          description: 'Unknown',
          amount: -50.00,
          fee: 0,
          currency: 'EUR',
          state: 'COMPLETED',
          balance: 950,
          category: 'undecided',
          confidence: 0,
        },
      ];
      
      const stats = getCategorizationStats(transactions);
      
      expect(stats.total).toBe(2);
      expect(stats.categorized).toBe(1);
      expect(stats.uncategorized).toBe(1);
      expect(stats.categorizationRate).toBe(50);
    });
  });
});
