import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { BudgetState, CalculatedValues } from '../types';
import { InvestmentAllocation } from './InvestmentAllocation';
import { Alerts } from './Alerts';
import { calculate10YearProjection } from '../hooks/useBudgetCalculations';

interface SavingsDrawerProps {
  state: BudgetState;
  calculated: CalculatedValues;
  onInvestmentSplitChange: (value: number) => void;
  onAllocationChange: (type: 'etf' | 'btc' | 'eth', value: number) => void;
}

export function SavingsDrawer({ 
  state, 
  calculated, 
  onInvestmentSplitChange,
  onAllocationChange 
}: SavingsDrawerProps) {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);
  const projection = calculate10YearProjection(calculated);
  
  const bufferSplitPercent = 100 - state.investmentSplit;
  
  // Lock body scroll when drawer is expanded on mobile
  useEffect(() => {
    if (isExpanded && typeof window !== 'undefined') {
      // Check if mobile (you can adjust this breakpoint)
      const isMobile = window.innerWidth < 768;
      
      if (isMobile) {
        // Save current scroll position
        const scrollY = window.scrollY;
        document.body.style.position = 'fixed';
        document.body.style.top = `-${scrollY}px`;
        document.body.style.width = '100%';
        
        return () => {
          // Restore scroll position
          document.body.style.position = '';
          document.body.style.top = '';
          document.body.style.width = '';
          window.scrollTo(0, scrollY);
        };
      }
    }
  }, [isExpanded]);
  
  return (
    <div 
      className={`fixed bottom-0 left-0 right-0 z-50 bg-base-100 md:bg-base-100/95 md:backdrop-blur-md border-t border-base-300 transition-all duration-300 ${
        isExpanded ? 'md:max-h-[85vh] h-[100svh] md:h-auto' : ''
      }`}
      style={{ 
        maxHeight: isExpanded ? undefined : '20vh',
        overflowY: 'auto'
      }}
    >
      <div className="max-w-7xl mx-auto px-4 py-3 h-full flex flex-col">
        
        <div className="flex items-center justify-between gap-4 flex-shrink-0">
          <div className="flex items-center gap-4 flex-1">
            <div className="flex-shrink-0">
              <div className="text-xs opacity-60 font-medium">{t('drawer.savingsRate')}</div>
              <div 
                className={`text-xl font-bold w-20 ${
                  calculated.savingsRate >= 30 
                    ? 'text-success' 
                    : calculated.savingsRate >= 15 
                    ? 'text-warning'
                    : 'text-error'
                }`}
              >
                {calculated.savingsRate.toFixed(1)}%
              </div>
            </div>
            <div className="flex-1">
              <progress 
                className={`progress w-full h-3 ${
                  calculated.savingsRate >= 30 
                    ? 'progress-success' 
                    : calculated.savingsRate >= 15 
                    ? 'progress-warning'
                    : 'progress-error'
                }`}
                value={Math.min(100, calculated.savingsRate)} 
                max="100"
              />
              <div className="flex justify-between text-xs opacity-60 mt-1">
                <span>0%</span>
                <span className="font-medium">15%</span>
                <span className="font-medium">30%</span>
                <span>100%</span>
              </div>
            </div>
            <div className="flex-shrink-0 text-right">
              <div className="text-xs opacity-60">{t('drawer.monthlyInvestment')}</div>
              <div className="text-lg font-bold text-success">€{calculated.totalInvestmentAmount.toLocaleString('en-US')}</div>
            </div>
          </div>
          <button 
            className="btn btn-sm btn-ghost" 
            onClick={() => setIsExpanded(!isExpanded)}
            aria-label={t('drawer.toggleAriaLabel')}
          >
            <svg 
              className={`w-5 h-5 transition-transform ${isExpanded ? '' : 'rotate-180'}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </button>
        </div>
        
        {/* Expanded content */}
        {isExpanded && (
          <div className="mt-3 pt-3 border-t border-base-300 flex-1 overflow-y-auto md:overflow-y-visible">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Financial Summary */}
              <div className="flex flex-col gap-4">
                <h3 className="text-base font-bold mb-3 mt-3 lg:mt-0 text-center">{t('drawer.financialSummary')}</h3>
                
                <div className="bg-base-200 rounded-lg p-4 w-full space-y-3">
                  {/* Monthly Income */}
                  <div className="bg-base-100 rounded-lg p-3">
                    <div className="text-xs opacity-60 mb-1">{t('drawer.monthlyIncome')}</div>
                    <div className="text-success text-xl font-bold">€{state.income}</div>
                  </div>
                  
                  {/* Minus arrow */}
                  <div className="flex items-center justify-center">
                    <div className="text-2xl opacity-40">−</div>
                  </div>
                  
                  {/* Total Expenses */}
                  <div className="bg-base-100 rounded-lg p-3">
                    <div className="text-xs opacity-60 mb-1">{t('drawer.totalExpenses')}</div>
                    <div className="text-error text-xl font-bold">€{calculated.totalExpenses}</div>
                  </div>
                  
                  {/* Equals divider */}
                  <div className="flex items-center gap-2">
                    <div className="flex-1 border-t-2 border-base-300"></div>
                    <div className="text-lg opacity-40">=</div>
                    <div className="flex-1 border-t-2 border-base-300"></div>
                  </div>
                  
                  {/* Monthly Surplus */}
                  <div className="bg-base-100 rounded-lg p-3">
                    <div className="text-xs opacity-60 mb-1">{t('drawer.monthlySurplus')}</div>
                    <div className={`text-xl font-bold ${calculated.surplus > 0 ? 'text-success' : 'text-error'}`}>
                      €{calculated.surplus}
                    </div>
                  </div>
                  
                  {/* Split arrow */}
                  <div className="flex items-center justify-center">
                    <div className="text-sm opacity-40">↓ {t('drawer.splitInto')}</div>
                  </div>
                  
                  {/* Investment & Buffer split */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-base-100 rounded-lg p-3">
                      <div className="text-xs opacity-60 mb-1">{t('drawer.totalInvestment')}</div>
                      <div className="text-success text-lg font-bold">€{calculated.totalInvestmentAmount}</div>
                    </div>
                    <div className="bg-base-100 rounded-lg p-3">
                      <div className="text-xs opacity-60 mb-1">{t('drawer.safetyBuffer')}</div>
                      <div className="text-lg font-bold">€{calculated.buffer}</div>
                    </div>
                  </div>
                </div>
                
                {/* Fixed height container for alerts to prevent layout shifts on mobile */}
                <div className="h-[140px] md:h-auto overflow-y-auto md:overflow-visible">
                  <Alerts calculated={calculated} totalExpenses={calculated.totalExpenses} />
                </div>
              </div>
              
              {/* Investment Allocation */}
              <div>
                <h3 className="text-base font-bold mb-3 mt-3 lg:mt-0 text-center">{t('drawer.investmentAllocation')}</h3>
                
                {/* Investment/Buffer Split */}
                <div className="mb-3 p-3 bg-base-200 rounded-lg">
                  <label className="label py-1">
                    <span className="label-text text-xs font-semibold">{t('drawer.investmentVsBuffer')}</span>
                    <span className="label-text-alt text-xs">
                      {state.investmentSplit}% / {bufferSplitPercent}%
                    </span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={state.investmentSplit}
                    onInput={(e) => onInvestmentSplitChange(parseInt((e.target as HTMLInputElement).value))}
                    className="range range-primary w-full range-sm"
                    style={{ touchAction: isExpanded ? 'pan-y' : 'none' }}
                  />
                  <div className="text-xs opacity-70 mt-1">{t('drawer.investmentSplitRecommended')}</div>
                </div>
                
                <InvestmentAllocation
                  allocations={state.allocations}
                  calculated={calculated}
                  onAllocationChange={onAllocationChange}
                />
              </div>
              
              {/* 10-Year Projection */}
              <div>
                <h3 className="text-base font-bold mb-3 mt-3 lg:mt-0 text-center">{t('drawer.projection10Year')}</h3>
                <div className="p-4 bg-base-200 rounded-lg text-sm">
                  <h4 className="font-bold text-sm mb-2">€{projection.monthlyAmount}{t('drawer.monthInvestment')}</h4>
                  <p className="text-xs opacity-70 mb-3">{t('drawer.projectionRates')}</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span>{t('drawer.totalInvested')}:</span>
                      <strong>€{projection.totalInvested.toLocaleString('en-US', { maximumFractionDigits: 0 })}</strong>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>{t('drawer.estimatedValue')}:</span>
                      <strong className="text-success">€{projection.estimatedValue.toLocaleString('en-US', { maximumFractionDigits: 0 })}</strong>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>{t('drawer.profit')}:</span>
                      <strong className="text-success">€{projection.profit.toLocaleString('en-US', { maximumFractionDigits: 0 })}</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Savings Rate Recommendations */}
            <div className="text-center pt-3 mt-3 border-t border-base-300">
              <p className="text-xs opacity-60">
                <span className="font-semibold">{t('drawer.savingsRate')}:</span> {t('drawer.savingsRateGuidelines')}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
