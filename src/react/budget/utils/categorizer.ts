import type { Transaction, CategorizedTransaction } from '../types';

// Pattern matching rules for categorization
interface CategoryPattern {
  merchant?: RegExp;
  type?: RegExp;
  description?: RegExp;
  weight: number;
}

// Comprehensive category patterns based on the analysis
const CATEGORY_PATTERNS: Record<string, CategoryPattern[]> = {
  'transport': [
    { merchant: /\bbolt\b/i, weight: 1.0 },
    { merchant: /\buber\b/i, weight: 1.0 },
    { merchant: /\btaxi\b/i, weight: 0.8 },
    { merchant: /\bcammeo\b/i, weight: 0.9 },
    { merchant: /\bzet\b/i, weight: 1.0 },
    { description: /\bparking\b/i, weight: 0.7 },
  ],
  'food-delivery': [
    { merchant: /\bwolt\b/i, weight: 1.0 },
    { merchant: /\buber\s*eats\b/i, weight: 1.0 },
    { merchant: /\bglovo\b/i, weight: 1.0 },
    { merchant: /\bdeliveroo\b/i, weight: 1.0 },
  ],
  'fast-food': [
    { merchant: /\bmcdonald/i, weight: 1.0 },
    { merchant: /\bkfc\b/i, weight: 1.0 },
    { merchant: /\bdomino/i, weight: 1.0 },
    { merchant: /\bburger\s*king\b/i, weight: 1.0 },
    { merchant: /\bsubmarine\b/i, weight: 0.9 },
    { merchant: /\bpizza\b/i, weight: 0.7 },
    { merchant: /\bmlinar\b/i, weight: 1.0 },
    { merchant: /\bkeindl\b/i, weight: 1.0 },
    { merchant: /\btorte\s*i\s*to\b/i, weight: 1.0 },
    { merchant: /\bumami\b/i, weight: 0.9 },
  ],
  'groceries': [
    { merchant: /\blidl\b/i, weight: 1.0 },
    { merchant: /\bkonzum\b/i, weight: 1.0 },
    { merchant: /\bkaufland\b/i, weight: 1.0 },
    { merchant: /\bplodine\b/i, weight: 1.0 },
    { merchant: /\bspar\b/i, weight: 1.0 },
    { merchant: /\btommy\b/i, weight: 0.9 },
    { merchant: /\bsupermarket\b/i, weight: 0.8 },
    { merchant: /\bstudenac\b/i, weight: 1.0 },
  ],
  'subscriptions': [
    { merchant: /\byoutube\b/i, weight: 1.0 },
    { merchant: /\bnetflix\b/i, weight: 1.0 },
    { merchant: /\bspotify\b/i, weight: 1.0 },
    { merchant: /\bcursor\b/i, weight: 1.0 },
    { merchant: /\bdisney/i, weight: 1.0 },
    { merchant: /\bpatreon\b/i, weight: 1.0 },
    { merchant: /\bonlyfans\b/i, weight: 1.0 },
    { merchant: /\bobsidian\b/i, weight: 1.0 },
    { merchant: /\bhack\s*the\s*box\b/i, weight: 1.0 },
    { merchant: /\bapple\s*music\b/i, weight: 1.0 },
  ],
  'gaming': [
    { merchant: /\bsteam\b/i, weight: 1.0 },
    { merchant: /\bblizzard\b/i, weight: 1.0 },
    { merchant: /\bepic\s*games\b/i, weight: 1.0 },
    { merchant: /\briots*games\b/i, weight: 1.0 },
    { merchant: /\bplaystation\b/i, weight: 1.0 },
    { merchant: /\bxbox\b/i, weight: 1.0 },
    { merchant: /\bnintendo\b/i, weight: 1.0 },
  ],
  'shopping': [
    { merchant: /\bamazon\b/i, weight: 1.0 },
    { merchant: /\btemu\b/i, weight: 1.0 },
    { merchant: /\bebay\b/i, weight: 1.0 },
    { merchant: /\baliexpress\b/i, weight: 1.0 },
    { merchant: /\bwish\b/i, weight: 1.0 },
    { merchant: /\bembossy\b/i, weight: 0.9 },
    { merchant: /\blibidex\b/i, weight: 0.9 },
    { merchant: /\beuropa\s*92\b/i, weight: 0.8 },
    { merchant: /\bpevex\b/i, weight: 1.0 },
    { merchant: /\bdeichmann\b/i, weight: 1.0 },
    { merchant: /\bcropp\b/i, weight: 1.0 },
    { merchant: /\bikea\b/i, weight: 1.0 },
    { merchant: /\blinks\b/i, weight: 0.9 },
    { merchant: /\bc\s*&\s*a\b/i, weight: 1.0 },
    { merchant: /\bvrutak\b/i, weight: 0.8 },
  ],
  'utilities': [
    { merchant: /\bkeks\s*pay\b/i, weight: 1.0 },
    { merchant: /\bhrvatski\s*telekom\b/i, weight: 1.0 },
    { merchant: /\ba1\b/i, weight: 0.9 },
    { merchant: /\btelemach\b/i, weight: 1.0 },
    { merchant: /\bcloudflare\b/i, weight: 1.0 },
    { merchant: /\bmicrosoft\b/i, weight: 0.8 },
    { merchant: /\bgoogle\s*play\b/i, weight: 0.7 },
    { merchant: /\bregulation\b/i, weight: 0.6 },
  ],
  'health': [
    { merchant: /\bdm\s*drogerie\b/i, weight: 1.0 },
    { merchant: /\bpharmacy\b/i, weight: 0.9 },
    { merchant: /\bljekarna\b/i, weight: 1.0 },
    { merchant: /\bapoteka\b/i, weight: 0.9 },
    { merchant: /dental/i, weight: 1.0 },
    { merchant: /\bdoctor\b/i, weight: 0.8 },
    { merchant: /\bm[üu]ller\b/i, weight: 1.0 },
    { merchant: /\bgymbeam\b/i, weight: 1.0 },
    { merchant: /\bbipa\b/i, weight: 1.0 },
    { merchant: /\bfarmacia\b/i, weight: 1.0 },
  ],
  'books': [
    { merchant: /\bkobo\b/i, weight: 1.0 },
    { merchant: /\bkindle\b/i, weight: 1.0 },
    { merchant: /\bbook/i, weight: 0.7 },
    { merchant: /\baudible\b/i, weight: 0.9 },
    { merchant: /\bgalileo\b/i, weight: 1.0 },
    { merchant: /\belipso\b/i, weight: 1.0 },
    { merchant: /\bznanje\b/i, weight: 1.0 },
  ],
  'entertainment': [
    { merchant: /\bcinema\b/i, weight: 0.9 },
    { merchant: /\btheater\b/i, weight: 0.9 },
    { merchant: /\bmuseum\b/i, weight: 0.8 },
    { merchant: /\bconcert\b/i, weight: 0.8 },
    { merchant: /\bbar\b/i, weight: 0.6 },
    { merchant: /\bcafe\b/i, weight: 0.5 },
    { merchant: /\brestaurant\b/i, weight: 0.6 },
    { merchant: /\b[žz]abac\b/i, weight: 1.0 },
    { merchant: /\bcinestar\b/i, weight: 1.0 },
    { merchant: /\btisak\b/i, weight: 0.8 },
  ],
  'cash': [
    { type: /\batm\b/i, weight: 1.0 },
    { description: /\batm\b/i, weight: 1.0 },
    { description: /\bcash\s*withdrawal\b/i, weight: 1.0 },
    { description: /\btransfer\b/i, weight: 0.6 },
    { merchant: /\bpaypal\b/i, weight: 0.9 },
    { merchant: /^[A-Z][a-z]+\s+[A-Z][a-z]+$/, weight: 0.5 }, // Person names like "mike.mordue"
  ],
};

/**
 * Categorizes a transaction based on merchant name, type, and description
 */
export function categorizeTransaction(transaction: Transaction): CategorizedTransaction {
  const { description, type } = transaction;
  
  let bestCategory = 'undecided';
  let bestScore = 0;
  
  // Try to match against each category's patterns
  for (const [category, patterns] of Object.entries(CATEGORY_PATTERNS)) {
    for (const pattern of patterns) {
      let score = 0;
      
      // Check merchant pattern
      if (pattern.merchant && description && pattern.merchant.test(description)) {
        score = pattern.weight;
      }
      
      // Check type pattern
      if (pattern.type && type && pattern.type.test(type)) {
        score = Math.max(score, pattern.weight);
      }
      
      // Check description pattern (if different from merchant)
      if (pattern.description && description && pattern.description.test(description)) {
        score = Math.max(score, pattern.weight);
      }
      
      // Update best match
      if (score > bestScore) {
        bestScore = score;
        bestCategory = category;
      }
    }
  }
  
  return {
    ...transaction,
    category: bestCategory,
    confidence: bestScore,
  };
}

/**
 * Categorizes multiple transactions
 */
export function categorizeTransactions(transactions: Transaction[]): CategorizedTransaction[] {
  return transactions.map(categorizeTransaction);
}

/**
 * Gets statistics about categorization quality
 */
export function getCategorizationStats(categorizedTransactions: CategorizedTransaction[]) {
  const total = categorizedTransactions.length;
  const categorized = categorizedTransactions.filter(t => t.category !== 'undecided').length;
  const highConfidence = categorizedTransactions.filter(t => t.confidence >= 0.9).length;
  const mediumConfidence = categorizedTransactions.filter(t => t.confidence >= 0.6 && t.confidence < 0.9).length;
  const lowConfidence = categorizedTransactions.filter(t => t.confidence > 0 && t.confidence < 0.6).length;
  
  return {
    total,
    categorized,
    uncategorized: total - categorized,
    categorizationRate: total > 0 ? (categorized / total) * 100 : 0,
    highConfidence,
    mediumConfidence,
    lowConfidence,
  };
}
