import { useTranslation } from 'react-i18next';
import { CheckCircle2, Target, Home, ShoppingCart, Car, Pill, UtensilsCrossed, Pizza, Smartphone, ShoppingBag, Gamepad2, BookOpen, PartyPopper, CreditCard, Lightbulb } from 'lucide-react';
import { expenseCategories } from '../config';
import type { ImportedSpendingData } from '../types';
import { formatCategoryStats } from '../utils/statsFormatter';
import { generateTip } from '../utils/tipGenerator';
import { getTranslatedCategoryName } from '../utils/getTranslatedCategory';

// Icon mappings for expense categories
const categoryIcons: Record<string, typeof Home> = {
  'rent': Home,
  'groceries': ShoppingCart,
  'utilities': Home,
  'transport': Car,
  'health': Pill,
  'food-delivery': UtensilsCrossed,
  'fast-food': Pizza,
  'subscriptions': Smartphone,
  'shopping': ShoppingBag,
  'gaming': Gamepad2,
  'books': BookOpen,
  'entertainment': PartyPopper,
  'cash': CreditCard
};

interface ExpenseCategoriesProps {
  expenses: Record<string, number>;
  onExpenseChange: (categoryId: string, value: number) => void;
  importedData?: ImportedSpendingData | null;
  income: number;
}

// Move CategoryCard outside to prevent recreation on each render
interface CategoryCardProps {
  cat: typeof expenseCategories[0];
  value: number;
  onExpenseChange: (categoryId: string, value: number) => void;
  importedData?: ImportedSpendingData | null;
  income: number;
}

function CategoryCard({ cat, value, onExpenseChange, importedData, income }: CategoryCardProps) {
  const { t } = useTranslation();
  const categoryData = importedData?.categoryBreakdown[cat.id];
  const baseline = categoryData ? Math.round(categoryData.monthlyAverage) : undefined;
  const stats = formatCategoryStats(
    cat.id, 
    categoryData, 
    importedData?.monthsInRange || 0, 
    income,
    t
  );
  
  // Generate dynamic tip based on spending
  const dynamicTip = generateTip(cat.id, value, income, t, baseline);
  
  const translatedName = getTranslatedCategoryName(cat.id, t);
  const IconComponent = categoryIcons[cat.id] || Home;
  
  return (
    <div className="bg-base-100 rounded-xl p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-center mb-2">
        <span className="font-semibold text-lg flex items-center gap-2">
          <IconComponent className="w-5 h-5" />
          {translatedName}
        </span>
        <span className="text-xl font-bold">€{value}</span>
      </div>
      
      {/* Baseline indicator when data is imported */}
      {baseline !== undefined && baseline > 0 && (
        <div className="text-xs text-info mb-2 flex items-center gap-1">
          <span className="font-semibold">{t('expenses.baseline')}: €{baseline}</span>
          <span className="opacity-70">{t('expenses.fromImportedData')}</span>
        </div>
      )}
      
      <div className="relative mt-2">
        <input
          type="range"
          min="0"
          max={cat.max}
          step={cat.step}
          value={value}
          onInput={(e) => onExpenseChange(cat.id, parseInt((e.target as HTMLInputElement).value))}
          className="range range-primary w-full"
          style={{ touchAction: 'none' }}
        />
      </div>
      
      {/* Statistics - shows imported data stats or generic helpful text */}
      {stats && (
        <div className="text-xs text-base-content/60 mt-2 p-2 bg-base-200 rounded leading-relaxed">
          {stats}
        </div>
      )}
      
      {/* Dynamic Tip - only shown when spending is too high */}
      {dynamicTip && (
        <div className="text-sm text-success mt-1 flex items-center gap-1">
          <Lightbulb className="w-4 h-4" />
          {dynamicTip}
        </div>
      )}
    </div>
  );
}

export function ExpenseCategories({ expenses, onExpenseChange, importedData, income }: ExpenseCategoriesProps) {
  const { t } = useTranslation();
  const essentialCategories = expenseCategories.filter(cat => cat.group === 'essential');
  const discretionaryCategories = expenseCategories.filter(cat => cat.group === 'discretionary');
  
  const essentialTotal = essentialCategories.reduce((sum, cat) => sum + (expenses[cat.id] || 0), 0);
  const discretionaryTotal = discretionaryCategories.reduce((sum, cat) => sum + (expenses[cat.id] || 0), 0);
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Essentials */}
      <div className="lg:p-4 md:p-2 p-1 lg:bg-success/5 rounded-xl space-y-4">
        <h3 className="text-lg font-bold text-success flex items-center justify-between">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            <span>{t('categories.essentials')}</span>
          </span>
          <span className="text-sm font-normal text-success/80">€{essentialTotal.toLocaleString('en-US')}</span>
        </h3>
        <div className="space-y-3">
          {essentialCategories.map(cat => (
            <CategoryCard 
              key={cat.id} 
              cat={cat} 
              value={expenses[cat.id] || 0}
              onExpenseChange={onExpenseChange}
              importedData={importedData}
              income={income}
            />
          ))}
        </div>
      </div>
      
      {/* Discretionary */}
      <div className="lg:p-4 md:p-2 p-1 lg:bg-warning/5 rounded-xl space-y-4">
        <h3 className="text-lg font-bold text-warning flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            <span>{t('categories.discretionary')}</span>
          </span>
          <span className="text-sm font-normal text-warning/80">€{discretionaryTotal.toLocaleString('en-US')}</span>
        </h3>
        <div className="space-y-3">
          {discretionaryCategories.map(cat => (
            <CategoryCard 
              key={cat.id} 
              cat={cat} 
              value={expenses[cat.id] || 0}
              onExpenseChange={onExpenseChange}
              importedData={importedData}
              income={income}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
