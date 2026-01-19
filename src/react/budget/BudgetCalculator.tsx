import { useState } from 'react';
import { I18nextProvider, useTranslation } from 'react-i18next';
import i18n from './i18n';
import { useBudgetState } from './hooks/useBudgetState';
import { useBudgetCalculations } from './hooks/useBudgetCalculations';
import { ExpenseCategories } from './components/ExpenseCategories';
import { CategoryBreakdown } from './components/CategoryBreakdown';
import { SavingsDrawer } from './components/SavingsDrawer';
import { RevolutImport } from './components/RevolutImport';
import { WelcomeScreen } from './components/WelcomeScreen';
import { LanguageSwitcher } from './components/LanguageSwitcher';
import { ThemeToggle } from '../../components/ThemeToggle';
import { ControlIsland } from '../../components/ControlIsland';

function BudgetCalculatorContent() {
  const { t } = useTranslation();
  const {
    state,
    updateIncome,
    updateInvestmentSplit,
    updateExpense,
    updateAllocation,
    loadPreset,
    applyImportedBaseline,
    resetToDefaults
  } = useBudgetState();
  
  const calculated = useBudgetCalculations(state);
  
  // Welcome screen state
  const [showWelcome, setShowWelcome] = useState(() => {
    if (typeof window === 'undefined') return false;
    return !localStorage.getItem('budgetCalculator_welcomeShown');
  });
  
  // Handler to dismiss welcome screen
  const handleWelcomeClose = () => {
    localStorage.setItem('budgetCalculator_welcomeShown', 'true');
    setShowWelcome(false);
  };
  
  return (
    <div className="min-h-screen p-4 md:p-8 pb-24 w-full overflow-x-hidden">
      {/* Welcome Screen */}
      {showWelcome && <WelcomeScreen onClose={handleWelcomeClose} />}
      
      {/* Fixed Control Island */}
      <ControlIsland>
        <LanguageSwitcher />
        <div className="w-px h-6 bg-base-300" />
        <ThemeToggle />
      </ControlIsland>
      
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="px-4 py-8 md:p-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            {t('title')}
          </h1>
          <p className="text-base opacity-70">{t('subtitle')}</p>
        </div>
        
        {/* Revolut Import */}
        <RevolutImport 
          onApplyImport={applyImportedBaseline}
          onReset={resetToDefaults}
          hasImportedData={state.isUsingImportedBaseline}
        />
        
        {/* Divider with optional text */}
        <div className="flex items-center gap-4 my-6">
          <div className="flex-1 border-t border-base-300"></div>
          <span className="text-sm opacity-60 italic">{t('divider')}</span>
          <div className="flex-1 border-t border-base-300"></div>
        </div>
        
        {/* Main Content */}
        <div className="mb-24 flex flex-col gap-4">
              {/* Top Row: Income and Presets */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Income Section */}
                <div className="card bg-base-200">
                  <div className="card-body p-5">
                    <h2 className="text-lg font-bold mb-4 border-b border-base-300 pb-2">
                      {t('income.title')}
                    </h2>
                    <div className="bg-base-100 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-3">
                        <span className="font-medium">{t('income.monthlySalary')}</span>
                        <span className="text-xl font-bold">€{state.income}</span>
                      </div>
                      <input
                        type="range"
                        min="1000"
                        max="5000"
                        step="100"
                        value={state.income}
                        onInput={(e) => updateIncome(parseInt((e.target as HTMLInputElement).value))}
                        className="range range-primary"
                        style={{ touchAction: 'none' }}
                      />
                    </div>
                  </div>
                </div>
                
                {/* Preset Buttons */}
                <div className="card bg-base-200 lg:col-span-2">
                  <div className="card-body p-5">
                    <h2 className="text-lg font-bold mb-4 border-b border-base-300 pb-2">
                      {t('presets.title')}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <button
                        className="btn btn-primary"
                        onClick={() => loadPreset('current')}
                      >
                        {t('presets.baseline')}
                      </button>
                      <button
                        className="btn btn-primary"
                        onClick={() => loadPreset('moderate')}
                      >
                        {t('presets.moderate')}
                      </button>
                      <button
                        className="btn btn-primary"
                        onClick={() => loadPreset('aggressive')}
                      >
                        {t('presets.aggressive')}
                      </button>
                    </div>
                    <p className="text-xs opacity-60 mt-3 text-center">
                      {t('presets.description')}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Expenses Section */}
              <div className="card bg-base-200">
                <div className="card-body p-5">
                  <h2 className="text-lg font-bold mb-4 border-b border-base-300 pb-2">
                    {t('expenses.title')}
                  </h2>
                  
                  <ExpenseCategories
                    expenses={state.expenses}
                    onExpenseChange={updateExpense}
                    importedData={state.importedData}
                    income={state.income}
                  />
                  
                  {/* Category Breakdown */}
                  <div className="mt-4">
                    <CategoryBreakdown
                      calculated={calculated}
                      income={state.income}
                    />
                  </div>
                </div>
              </div>
        </div>
      </div>
      
      {/* Fixed Bottom Savings Rate Drawer */}
      <SavingsDrawer
        state={state}
        calculated={calculated}
        onInvestmentSplitChange={updateInvestmentSplit}
        onAllocationChange={updateAllocation}
      />
    </div>
  );
}

// Wrap with I18nextProvider
export default function BudgetCalculator() {
  return (
    <I18nextProvider i18n={i18n}>
      <BudgetCalculatorContent />
    </I18nextProvider>
  );
}
