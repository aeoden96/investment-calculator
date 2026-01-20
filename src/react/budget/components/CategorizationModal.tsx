import { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { Transaction } from '../types';
import { expenseCategories } from '../config';
import { getTranslatedCategoryName } from '../utils/getTranslatedCategory';

interface CategorizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  uncategorizedTransactions: Transaction[];
  onApplyMappings: (mappings: Record<string, string>) => void;
}

export function CategorizationModal({
  isOpen,
  onClose,
  uncategorizedTransactions,
  onApplyMappings
}: CategorizationModalProps) {
  const { t } = useTranslation();
  
  // Extract unique merchants with their total amounts
  const uniqueMerchants = useMemo(() => {
    const merchantMap = new Map<string, { totalAmount: number; count: number }>();
    
    uncategorizedTransactions.forEach(txn => {
      const merchant = txn.description;
      const existing = merchantMap.get(merchant);
      const amount = Math.abs(txn.amount);
      
      if (existing) {
        merchantMap.set(merchant, {
          totalAmount: existing.totalAmount + amount,
          count: existing.count + 1
        });
      } else {
        merchantMap.set(merchant, { totalAmount: amount, count: 1 });
      }
    });
    
    // Convert to array and sort by total amount (descending)
    return Array.from(merchantMap.entries())
      .map(([merchant, data]) => ({ merchant, ...data }))
      .sort((a, b) => b.totalAmount - a.totalAmount);
  }, [uncategorizedTransactions]);
  
  // State to track user selections
  const [selections, setSelections] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    uniqueMerchants.forEach(({ merchant }) => {
      initial[merchant] = 'undecided'; // Default to undecided
    });
    return initial;
  });
  
  const handleCategoryChange = (merchant: string, category: string) => {
    setSelections(prev => ({ ...prev, [merchant]: category }));
  };
  
  const handleApply = () => {
    // Filter out 'undecided' selections
    const validMappings = Object.entries(selections)
      .filter(([_, category]) => category !== 'undecided')
      .reduce((acc, [merchant, category]) => {
        acc[merchant] = category;
        return acc;
      }, {} as Record<string, string>);
    
    onApplyMappings(validMappings);
    onClose();
  };
  
  const categorizedCount = Object.values(selections).filter(cat => cat !== 'undecided').length;
  const allCategories = expenseCategories.map(cat => ({ id: cat.id, name: cat.name }));
  
  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
      
      return () => {
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen]);
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-0 md:p-4">
      <div className="bg-base-100 rounded-none md:rounded-xl shadow-xl w-full h-full md:h-auto md:max-w-4xl md:max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-4 md:p-6 border-b border-base-300">
          <h2 className="text-xl md:text-2xl font-bold mb-2">{t('categorization.title')}</h2>
          <p className="text-xs md:text-sm opacity-70">
            {t('categorization.description')}
          </p>
          <div className="mt-2 text-xs md:text-sm">
            {t('categorization.merchantsCategorized', { 
              count: categorizedCount, 
              total: uniqueMerchants.length 
            })}
          </div>
        </div>
        
        {/* Scrollable list */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="space-y-3">
            {uniqueMerchants.map(({ merchant, totalAmount, count }) => (
              <div 
                key={merchant} 
                className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4 p-3 md:p-4 bg-base-200 rounded-lg"
              >
                {/* Merchant info */}
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate" title={merchant}>
                    {merchant}
                  </div>
                  <div className="text-xs opacity-70">
                    {count > 1 
                      ? t('categorization.transactionsPlural', { count })
                      : t('categorization.transactions', { count })
                    } • {t('categorization.total')}: €{totalAmount.toFixed(2)}
                  </div>
                </div>
                
                {/* Category selector */}
                <select
                  value={selections[merchant] || 'undecided'}
                  onChange={(e) => handleCategoryChange(merchant, e.target.value)}
                  className="select select-bordered select-sm w-full md:w-64"
                >
                  <option value="undecided">{t('categorization.selectCategory')}</option>
                  <optgroup label={t('categorization.essential')}>
                    {allCategories
                      .filter(cat => expenseCategories.find(c => c.id === cat.id)?.group === 'essential')
                      .map(cat => {
                        const translatedName = getTranslatedCategoryName(cat.id, t);
                        return (
                          <option key={cat.id} value={cat.id}>
                            {translatedName.replace(/<[^>]*>/g, '')}
                          </option>
                        );
                      })}
                  </optgroup>
                  <optgroup label={t('categorization.discretionary')}>
                    {allCategories
                      .filter(cat => expenseCategories.find(c => c.id === cat.id)?.group === 'discretionary')
                      .map(cat => {
                        const translatedName = getTranslatedCategoryName(cat.id, t);
                        return (
                          <option key={cat.id} value={cat.id}>
                            {translatedName.replace(/<[^>]*>/g, '')}
                          </option>
                        );
                      })}
                  </optgroup>
                </select>
              </div>
            ))}
          </div>
        </div>
        
        {/* Footer */}
        <div className="p-4 md:p-6 border-t border-base-300 flex flex-col md:flex-row md:justify-between md:items-center gap-3">
          <div className="text-xs md:text-sm opacity-70">
            {t('categorization.uncategorizedIgnored')}
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} className="btn btn-ghost flex-1 md:flex-none">
              {t('categorization.cancel')}
            </button>
            <button 
              onClick={handleApply} 
              className="btn btn-primary flex-1 md:flex-none"
              disabled={categorizedCount === 0}
            >
              {t('categorization.apply', { count: categorizedCount })}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
