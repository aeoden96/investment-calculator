import type { BudgetState, CalculatedValues } from '../types';

interface DebugPanelProps {
  state: BudgetState;
  calculated: CalculatedValues;
}

export function DebugPanel({ state, calculated }: DebugPanelProps) {
  // Only show in development
  if (import.meta.env.PROD) return null;
  
  const clearStorage = () => {
    localStorage.removeItem('budgetDashboardState');
    window.location.reload();
  };
  
  return (
    <div className="fixed bottom-24 right-4 max-w-sm p-4 bg-gray-900 text-white text-xs rounded-lg shadow-xl z-50 max-h-96 overflow-auto">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold">Debug Info</h3>
        <button 
          onClick={clearStorage}
          className="btn btn-xs btn-error"
        >
          Clear Storage
        </button>
      </div>
      
      <div className="space-y-2">
        <div>
          <strong>Income:</strong> €{state.income}
        </div>
        <div>
          <strong>Total Expenses:</strong> €{calculated.totalExpenses}
        </div>
        <div>
          <strong>Surplus:</strong> €{calculated.surplus}
        </div>
        <div>
          <strong>Investment:</strong> €{calculated.totalInvestmentAmount} ({state.investmentSplit}%)
        </div>
        <div>
          <strong>Buffer:</strong> €{calculated.buffer}
        </div>
        <div>
          <strong>Savings Rate:</strong> {calculated.savingsRate.toFixed(2)}%
        </div>
        
        <details className="mt-2">
          <summary className="cursor-pointer font-bold">Expenses</summary>
          <div className="pl-2 mt-1">
            {Object.entries(state.expenses).map(([key, value]) => (
              <div key={key}>{key}: €{value}</div>
            ))}
          </div>
        </details>
        
        <details className="mt-2">
          <summary className="cursor-pointer font-bold">Allocations</summary>
          <div className="pl-2 mt-1">
            <div>ETF: {state.allocations.etf}% → €{calculated.etfAmount}</div>
            <div>BTC: {state.allocations.btc}% → €{calculated.btcAmount}</div>
            <div>ETH: {state.allocations.eth}% → €{calculated.ethAmount}</div>
          </div>
        </details>
      </div>
    </div>
  );
}
