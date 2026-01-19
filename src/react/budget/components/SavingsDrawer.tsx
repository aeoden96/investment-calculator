import { useState } from 'react';
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
  const [isExpanded, setIsExpanded] = useState(false);
  const projection = calculate10YearProjection(calculated);
  
  const bufferSplitPercent = 100 - state.investmentSplit;
  
  return (
    <div 
      className={`fixed bottom-0 left-0 right-0 z-50 bg-base-100 border-t border-base-300 transition-all duration-300 ${
        isExpanded ? 'md:max-h-[85vh] h-screen md:h-auto' : ''
      }`}
      style={{ 
        maxHeight: isExpanded ? undefined : '20vh',
        overflowY: 'auto'
      }}
    >
      <div className="max-w-7xl mx-auto px-4 py-3 h-full flex flex-col">
        {/* Mobile close button at top when expanded */}
        {isExpanded && (
          <div className="md:hidden flex justify-between items-center mb-3 pb-2 border-b border-base-300 flex-shrink-0">
            <h2 className="text-lg font-bold">Investment Details</h2>
            <button 
              className="btn btn-sm btn-circle btn-ghost" 
              onClick={() => setIsExpanded(false)}
              aria-label="Close drawer"
            >
              ✕
            </button>
          </div>
        )}
        
        <div className="flex items-center justify-between gap-4 flex-shrink-0">
          <div className="flex items-center gap-4 flex-1">
            <div className="flex-shrink-0">
              <div className="text-xs opacity-60 font-medium">Savings Rate</div>
              <div 
                className={`text-xl font-bold ${
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
              <div className="text-xs opacity-60">Monthly Investment</div>
              <div className="text-lg font-bold text-success">€{calculated.totalInvestmentAmount.toLocaleString('en-US')}</div>
            </div>
          </div>
          <button 
            className="btn btn-sm btn-ghost" 
            onClick={() => setIsExpanded(!isExpanded)}
            aria-label="Toggle savings rate drawer"
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
                <h3 className="text-base font-bold mb-3 text-center">Financial Summary</h3>
                
                <div className="stats stats-vertical bg-base-200 rounded-lg p-2 w-full">
                  <div className="stat py-2">
                    <div className="stat-title text-xs">Monthly Income</div>
                    <div className="stat-value text-success text-lg">€{state.income}</div>
                  </div>
                  <div className="stat py-2">
                    <div className="stat-title text-xs">Total Expenses</div>
                    <div className="stat-value text-error text-lg">€{calculated.totalExpenses}</div>
                  </div>
                  <div className="stat py-2">
                    <div className="stat-title text-xs">Monthly Surplus</div>
                    <div className={`stat-value text-lg ${calculated.surplus > 0 ? 'text-success' : 'text-error'}`}>
                      €{calculated.surplus}
                    </div>
                  </div>
                  <div className="stat py-2">
                    <div className="stat-title text-xs">Total Investment</div>
                    <div className="stat-value text-success text-lg">€{calculated.totalInvestmentAmount}</div>
                  </div>
                  <div className="stat py-2">
                    <div className="stat-title text-xs">Safety Buffer</div>
                    <div className="stat-value text-lg">€{calculated.buffer}</div>
                  </div>
                </div>
                
                <Alerts calculated={calculated} totalExpenses={calculated.totalExpenses} />
              </div>
              
              {/* Investment Allocation */}
              <div>
                <h3 className="text-base font-bold mb-3 text-center">Investment Allocation</h3>
                
                {/* Investment/Buffer Split */}
                <div className="mb-3 p-3 bg-base-200 rounded-lg">
                  <label className="label py-1">
                    <span className="label-text text-xs font-semibold">Investment vs Buffer</span>
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
                    style={{ touchAction: 'none' }}
                  />
                  <div className="text-xs opacity-70 mt-1">Recommended: 50-70% investment</div>
                </div>
                
                <InvestmentAllocation
                  allocations={state.allocations}
                  calculated={calculated}
                  onAllocationChange={onAllocationChange}
                />
              </div>
              
              {/* 10-Year Projection */}
              <div>
                <h3 className="text-base font-bold mb-3 text-center">10-Year Projection</h3>
                <div className="p-4 bg-base-200 rounded-lg text-sm">
                  <h4 className="font-bold text-sm mb-2">€{projection.monthlyAmount}/month investment</h4>
                  <p className="text-xs opacity-70 mb-3">ETF @ 7%, BTC @ 15%, ETH @ 12%</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span>Total Invested:</span>
                      <strong>€{projection.totalInvested.toLocaleString('en-US', { maximumFractionDigits: 0 })}</strong>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>Estimated Value:</span>
                      <strong className="text-success">€{projection.estimatedValue.toLocaleString('en-US', { maximumFractionDigits: 0 })}</strong>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>Profit:</span>
                      <strong className="text-success">€{projection.profit.toLocaleString('en-US', { maximumFractionDigits: 0 })}</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Savings Rate Recommendations */}
            <div className="text-center pt-3 mt-3 border-t border-base-300">
              <p className="text-xs opacity-60">
                <span className="font-medium">Recommended:</span> 15-20% • 
                <span className="font-medium">Ideal:</span> 30%+ • 
                <span className="font-medium">Excellent:</span> 50%+
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
