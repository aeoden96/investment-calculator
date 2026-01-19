# Budget Calculator Tests

Comprehensive unit tests for the budget calculator logic.

## Test Coverage

### 1. `useBudgetCalculations.test.ts`
Tests for all calculation logic:
- ✅ Basic calculations (expenses, surplus, investments, buffer)
- ✅ Savings rate calculations
- ✅ Investment allocation (ETF/BTC/ETH split)
- ✅ Allocation normalization
- ✅ Category totals (essential vs discretionary)
- ✅ Edge cases (zero income, negative surplus, boundary values)
- ✅ Monthly progress projections (12 months with compound growth)
- ✅ Buffer limit triggers
- ✅ 10-year investment projections
- ✅ Compound interest calculations

### 2. `useBudgetState.test.ts`
Tests for state management:
- ✅ Initial state loading
- ✅ LocalStorage persistence
- ✅ Income updates with validation
- ✅ Investment split updates (0-100% clamping)
- ✅ Expense category updates
- ✅ Allocation updates with auto-normalization
- ✅ Buffer limit updates
- ✅ Preset loading (current/moderate/aggressive)
- ✅ State immutability
- ✅ Error handling for corrupted localStorage

### 3. `config.test.ts`
Tests for configuration data:
- ✅ Expense category structure
- ✅ Essential vs discretionary grouping
- ✅ Value validation (max, step, actual values)
- ✅ Allocation categories (ETF/BTC/ETH)
- ✅ Allocation sum to 100%
- ✅ Preset configurations
- ✅ Progressive savings across presets
- ✅ Essential expenses consistency

## Running Tests

```bash
# Run all tests
yarn test

# Run tests in watch mode
yarn test --watch

# Run with UI
yarn test:ui

# Run with coverage
yarn test:coverage

# Run specific test file
yarn test useBudgetCalculations

# Run tests matching pattern
yarn test --grep "calculate"
```

## Test Structure

Each test file follows this pattern:
1. **Setup**: Mock data and helper functions
2. **Test Cases**: Organized by functionality
3. **Assertions**: Clear expectations with descriptive messages
4. **Edge Cases**: Boundary conditions and error scenarios

## Key Test Scenarios

### Budget Calculations
- Income: €2000/month
- Total Expenses: €1768/month
- Surplus: €232/month
- Investment (60%): €139/month
- Buffer (40%): €93/month
- Savings Rate: ~7%

### Allocation Tests
- ETF: 60% (lower risk, 7% annual return)
- BTC: 25% (high risk, 15% annual return)
- ETH: 15% (high risk, 12% annual return)

### Preset Tests
- **Current**: Baseline spending (~€1768/month)
- **Moderate**: Reduced discretionary (~€1445/month)
- **Aggressive**: Minimal discretionary (~€1180/month)

## Coverage Goals

Target: 90%+ coverage for:
- Calculation logic
- State management
- Edge cases

## Adding New Tests

When adding new features:
1. Add corresponding test cases
2. Test both happy path and edge cases
3. Verify state immutability
4. Check localStorage persistence
5. Validate input ranges
