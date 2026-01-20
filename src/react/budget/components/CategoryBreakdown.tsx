import { useTranslation } from 'react-i18next';
import { CheckCircle2, Target } from 'lucide-react';
import type { CalculatedValues } from '../types';

interface CategoryBreakdownProps {
  calculated: CalculatedValues;
  income: number;
}

export function CategoryBreakdown({ calculated, income }: CategoryBreakdownProps) {
  const { t } = useTranslation();
  const { essentialTotal, discretionaryTotal, totalExpenses } = calculated;
  
  const essentialPercent = totalExpenses > 0 ? ((essentialTotal / totalExpenses) * 100).toFixed(1) : 0;
  const discretionaryPercent = totalExpenses > 0 ? ((discretionaryTotal / totalExpenses) * 100).toFixed(1) : 0;
  const essentialPercentOfIncome = income > 0 ? ((essentialTotal / income) * 100).toFixed(1) : 0;
  const discretionaryPercentOfIncome = income > 0 ? ((discretionaryTotal / income) * 100).toFixed(1) : 0;
  
  return (
    <div className="rounded-lg">
      <div className="grid grid-cols-2 gap-3">
        <div className="text-center py-3 md:p-3 md:bg-success/10 rounded-lg md:border-2 md:border-success/30">
          <div className="text-xs text-success font-bold mb-1 uppercase tracking-wide flex items-center justify-center gap-1">
            <CheckCircle2 className="w-4 h-4" />
            {t('categories.essentials')}
          </div>
          <div className="text-xl font-bold text-success mb-1">€{essentialTotal.toLocaleString('en-US')}</div>
          <div className="text-xs text-base-content/70">{essentialPercent}% {t('categories.ofExpenses')}</div>
          <div className="text-xs text-success/80 mt-1">{essentialPercentOfIncome}% {t('categories.ofIncome')}</div>
        </div>
        <div className="text-center py-3 md:p-3 md:bg-warning/10 rounded-lg md:border-2 md:border-warning/30">
          <div className="text-xs text-warning font-bold mb-1 uppercase tracking-wide flex items-center justify-center gap-1">
            <Target className="w-4 h-4" />
            {t('categories.discretionary')}
          </div>
          <div className="text-xl font-bold text-warning mb-1">€{discretionaryTotal.toLocaleString('en-US')}</div>
          <div className="text-xs text-base-content/70">{discretionaryPercent}% {t('categories.ofExpenses')}</div>
          <div className="text-xs text-warning/80 mt-1">{discretionaryPercentOfIncome}% {t('categories.ofIncome')}</div>
        </div>
      </div>
      <div className="mt-3 pt-2 border-t border-base-300">
        <div className="flex justify-between items-center text-sm">
          <span className="font-semibold">{t('categories.totalExpenses')}:</span>
          <span className="text-lg font-bold">€{totalExpenses.toLocaleString('en-US')}</span>
        </div>
        {income > 0 && (
          <div className="flex justify-between items-center text-xs text-base-content/60 mt-1">
            <span>{t('categories.ofIncome')}:</span>
            <span>{((totalExpenses / income) * 100).toFixed(1)}%</span>
          </div>
        )}
      </div>
    </div>
  );
}
