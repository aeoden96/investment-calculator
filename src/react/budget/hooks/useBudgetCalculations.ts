import { useMemo } from 'react';
import type { BudgetState, CalculatedValues } from '../types';
import { expenseCategories } from '../config';

// Pure calculation function (no hooks) - can be tested directly
export function calculateBudgetValues(state: BudgetState): CalculatedValues {
  // Calculate totals
  const totalExpenses = Object.values(state.expenses).reduce((sum, val) => sum + val, 0);
  const surplus = state.income - totalExpenses;
  
  // Calculate investment/buffer split
  const investmentSplitPercent = Math.max(0, Math.min(100, state.investmentSplit));
  const totalInvestmentAmount = surplus > 0 ? Math.max(0, Math.floor(surplus * (investmentSplitPercent / 100))) : 0;
  const buffer = Math.max(0, surplus - totalInvestmentAmount);
  
  // Calculate allocation percentages with normalization
  let etfPercent = Math.max(0, Math.min(100, state.allocations.etf));
  let btcPercent = Math.max(0, Math.min(100, state.allocations.btc));
  let ethPercent = Math.max(0, Math.min(100, state.allocations.eth));
  
  const totalAllocation = etfPercent + btcPercent + ethPercent;
  
  // Normalize if not 100%
  if (totalAllocation !== 100 && totalAllocation > 0) {
    etfPercent = Math.round((etfPercent / totalAllocation) * 100);
    btcPercent = Math.round((btcPercent / totalAllocation) * 100);
    ethPercent = 100 - etfPercent - btcPercent;
  } else if (totalAllocation === 0 && totalInvestmentAmount > 0) {
    etfPercent = 33;
    btcPercent = 33;
    ethPercent = 34;
  }
  
  // Calculate individual allocations
  const etfAmount = totalInvestmentAmount > 0 
    ? Math.floor(totalInvestmentAmount * (etfPercent / 100))
    : 0;
  const btcAmount = totalInvestmentAmount > 0
    ? Math.floor(totalInvestmentAmount * (btcPercent / 100))
    : 0;
  const ethAmount = totalInvestmentAmount > 0
    ? totalInvestmentAmount - etfAmount - btcAmount
    : 0;
  
  // Calculate savings rate
  const savingsRate = state.income > 0 ? (totalInvestmentAmount / state.income * 100) : 0;
  
  // Calculate group totals
  const essentialTotal = expenseCategories
    .filter(cat => cat.group === 'essential')
    .reduce((sum, cat) => sum + (state.expenses[cat.id] || 0), 0);
  
  const discretionaryTotal = expenseCategories
    .filter(cat => cat.group === 'discretionary')
    .reduce((sum, cat) => sum + (state.expenses[cat.id] || 0), 0);
  
  return {
    totalExpenses,
    surplus,
    totalInvestmentAmount,
    buffer,
    savingsRate,
    etfAmount,
    btcAmount,
    ethAmount,
    essentialTotal,
    discretionaryTotal
  };
}

// Hook wrapper for React components
export function useBudgetCalculations(state: BudgetState): CalculatedValues {
  return useMemo(() => calculateBudgetValues(state), [state]);
}

export function calculateMonthlyProgress(
  state: BudgetState,
  calculated: CalculatedValues
) {
  const { income, investmentSplit, bufferLimit } = state;
  const totalExpenses = calculated.totalExpenses;
  const monthlySurplus = income - totalExpenses;
  
  // Get allocation percentages (normalized)
  let etfPercent = state.allocations.etf;
  let btcPercent = state.allocations.btc;
  let ethPercent = state.allocations.eth;
  const totalAllocation = etfPercent + btcPercent + ethPercent;
  
  if (totalAllocation !== 100 && totalAllocation > 0) {
    etfPercent = Math.round((etfPercent / totalAllocation) * 100);
    btcPercent = Math.round((btcPercent / totalAllocation) * 100);
    ethPercent = 100 - etfPercent - btcPercent;
  }
  
  // Initial monthly amounts
  let investmentSplitPercent = investmentSplit;
  const initialMonthlyInvestment = Math.max(0, Math.floor(monthlySurplus * (investmentSplitPercent / 100)));
  const monthlyEtf = Math.floor(initialMonthlyInvestment * (etfPercent / 100));
  const monthlyBtc = Math.floor(initialMonthlyInvestment * (btcPercent / 100));
  const monthlyEth = initialMonthlyInvestment - monthlyEtf - monthlyBtc;
  
  // Monthly returns
  const etfMonthlyRate = 0.07 / 12;
  const btcMonthlyRate = 0.15 / 12;
  const ethMonthlyRate = 0.12 / 12;
  
  // Generate month labels
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentMonth = new Date().getMonth();
  const labels = [];
  for (let i = 0; i < 12; i++) {
    labels.push(months[(currentMonth + i) % 12]);
  }
  
  // Calculate cumulative values
  let etfTotal = 0;
  let btcTotal = 0;
  let ethTotal = 0;
  let bufferTotal = 0;
  let totalInvested = 0;
  let bufferLimitReachedMonth = -1;
  let usingFullInvestment = false;
  
  const etfData = [];
  const btcData = [];
  const ethData = [];
  const bufferData = [];
  const totalData = [];
  const investedData = [];
  
  for (let month = 0; month < 12; month++) {
    // Check if buffer limit is reached
    if (bufferLimit > 0 && bufferTotal >= bufferLimit && !usingFullInvestment) {
      usingFullInvestment = true;
      bufferLimitReachedMonth = month;
      investmentSplitPercent = 100;
    }
    
    // Calculate monthly amounts based on current split
    const currentMonthlyInvestment = Math.max(0, Math.floor(monthlySurplus * (investmentSplitPercent / 100)));
    const currentMonthlyBuffer = monthlySurplus - currentMonthlyInvestment;
    
    // Recalculate allocation amounts if split changed
    let currentMonthlyEtf, currentMonthlyBtc, currentMonthlyEth;
    if (usingFullInvestment) {
      currentMonthlyEtf = Math.floor(currentMonthlyInvestment * (etfPercent / 100));
      currentMonthlyBtc = Math.floor(currentMonthlyInvestment * (btcPercent / 100));
      currentMonthlyEth = currentMonthlyInvestment - currentMonthlyEtf - currentMonthlyBtc;
    } else {
      currentMonthlyEtf = monthlyEtf;
      currentMonthlyBtc = monthlyBtc;
      currentMonthlyEth = monthlyEth;
    }
    
    // Add monthly amounts
    etfTotal += currentMonthlyEtf;
    btcTotal += currentMonthlyBtc;
    ethTotal += currentMonthlyEth;
    bufferTotal += currentMonthlyBuffer;
    totalInvested += currentMonthlyInvestment;
    
    // Apply growth to investments
    etfTotal *= (1 + etfMonthlyRate);
    btcTotal *= (1 + btcMonthlyRate);
    ethTotal *= (1 + ethMonthlyRate);
    
    const totalValue = etfTotal + btcTotal + ethTotal;
    
    etfData.push(Math.round(etfTotal));
    btcData.push(Math.round(btcTotal));
    ethData.push(Math.round(ethTotal));
    bufferData.push(Math.round(bufferTotal));
    totalData.push(Math.round(totalValue));
    investedData.push(totalInvested);
  }
  
  return {
    labels,
    datasets: [
      {
        label: 'ETF',
        data: etfData,
        backgroundColor: 'rgba(34, 197, 94, 0.15)',
        borderColor: 'rgb(34, 197, 94)',
        borderWidth: 2,
        fill: true,
        tension: 0.3,
        pointRadius: 0,
        pointHoverRadius: 4
      },
      {
        label: 'Bitcoin',
        data: btcData,
        backgroundColor: 'rgba(251, 191, 36, 0.15)',
        borderColor: 'rgb(251, 191, 36)',
        borderWidth: 2,
        fill: true,
        tension: 0.3,
        pointRadius: 0,
        pointHoverRadius: 4
      },
      {
        label: 'Ethereum',
        data: ethData,
        backgroundColor: 'rgba(168, 85, 247, 0.15)',
        borderColor: 'rgb(168, 85, 247)',
        borderWidth: 2,
        fill: true,
        tension: 0.3,
        pointRadius: 0,
        pointHoverRadius: 4
      },
      {
        label: 'Buffer',
        data: bufferData,
        backgroundColor: 'transparent',
        borderColor: 'rgb(239, 68, 68)',
        borderWidth: 2.5,
        fill: false,
        tension: 0.3,
        pointRadius: 0,
        pointHoverRadius: 5,
        pointBackgroundColor: 'rgb(239, 68, 68)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2
      },
      {
        label: 'Total Value',
        data: totalData,
        backgroundColor: 'transparent',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 3,
        borderDash: [8, 4],
        fill: false,
        tension: 0.3,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointBackgroundColor: 'rgb(59, 130, 246)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2
      },
      {
        label: 'Total Invested',
        data: investedData,
        backgroundColor: 'transparent',
        borderColor: 'rgb(107, 114, 128)',
        borderWidth: 2,
        borderDash: [4, 4],
        fill: false,
        tension: 0.3,
        pointRadius: 0,
        pointHoverRadius: 4,
        pointBackgroundColor: 'rgb(107, 114, 128)',
        pointBorderColor: '#fff',
        pointBorderWidth: 1
      }
    ],
    startingAmount: 0,
    endingAmount: totalData[11] || 0,
    totalInvested: totalInvested,
    growth: (totalData[11] || 0) - totalInvested,
    bufferLimitReachedMonth: bufferLimitReachedMonth,
    finalBuffer: bufferData[11] || 0
  };
}

export function calculate10YearProjection(calculated: CalculatedValues) {
  const months = 120;
  const { etfAmount, btcAmount, ethAmount, totalInvestmentAmount } = calculated;
  
  if (totalInvestmentAmount === 0) {
    return {
      monthlyAmount: 0,
      totalInvested: 0,
      estimatedValue: 0,
      profit: 0
    };
  }
  
  const etfMonthlyRate = 0.07 / 12;
  const btcMonthlyRate = 0.15 / 12;
  const ethMonthlyRate = 0.12 / 12;
  
  // Future value of annuity formula: FV = PMT * (((1 + r)^n - 1) / r) * (1 + r)
  const etfFuture = etfAmount > 0 
    ? etfAmount * ((Math.pow(1 + etfMonthlyRate, months) - 1) / etfMonthlyRate) * (1 + etfMonthlyRate)
    : 0;
  const btcFuture = btcAmount > 0
    ? btcAmount * ((Math.pow(1 + btcMonthlyRate, months) - 1) / btcMonthlyRate) * (1 + btcMonthlyRate)
    : 0;
  const ethFuture = ethAmount > 0
    ? ethAmount * ((Math.pow(1 + ethMonthlyRate, months) - 1) / ethMonthlyRate) * (1 + ethMonthlyRate)
    : 0;
  
  const totalFutureValue = etfFuture + btcFuture + ethFuture;
  const totalInvested = totalInvestmentAmount * months;
  const profit = totalFutureValue - totalInvested;
  
  return {
    monthlyAmount: totalInvestmentAmount,
    totalInvested,
    estimatedValue: totalFutureValue,
    profit
  };
}
