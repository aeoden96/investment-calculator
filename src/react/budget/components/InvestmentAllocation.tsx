import { useTranslation } from 'react-i18next';
import { BarChart3, Coins, Zap } from 'lucide-react';
import { allocationCategories } from '../config';
import type { CalculatedValues } from '../types';
import { getTranslatedAllocationName } from '../utils/getTranslatedCategory';

// Icon mappings for allocation categories
const allocationIcons: Record<string, typeof BarChart3> = {
  'etf': BarChart3,
  'btc': Coins,
  'eth': Zap
};

interface InvestmentAllocationProps {
  allocations: { etf: number; btc: number; eth: number };
  calculated: CalculatedValues;
  onAllocationChange: (type: 'etf' | 'btc' | 'eth', value: number) => void;
}

export function InvestmentAllocation({ 
  allocations, 
  calculated, 
  onAllocationChange 
}: InvestmentAllocationProps) {
  const { t } = useTranslation();
  const amounts = {
    etf: calculated.etfAmount,
    btc: calculated.btcAmount,
    eth: calculated.ethAmount
  };
  
  return (
    <div className="space-y-2">
      {allocationCategories.map(cat => {
        const translatedName = getTranslatedAllocationName(cat.id, t);
        const translatedTip = t(`allocationTips.${cat.id}`, { defaultValue: cat.tip });
        const IconComponent = allocationIcons[cat.id] || BarChart3;
        
        return (
          <div key={cat.id} className="bg-base-100 rounded-xl p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold flex items-center gap-2">
                <IconComponent className="w-5 h-5" />
                {translatedName}
              </span>
              <span className="text-xl font-bold">€{amounts[cat.id as keyof typeof amounts]}</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={allocations[cat.id as keyof typeof allocations]}
              onInput={(e) => onAllocationChange(cat.id as 'etf' | 'btc' | 'eth', parseInt((e.target as HTMLInputElement).value))}
              className="range range-primary w-full"
              style={{ touchAction: 'none' }}
            />
            <div className="text-sm text-success mt-1">{translatedTip}</div>
          </div>
        );
      })}
    </div>
  );
}
