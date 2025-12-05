import type {
  AssetCategory,
  ExpenseCategory,
  LiabilityCategory,
  PaymentMethod,
  ReimbursementStatus,
  IncomeSource,
  GoalType,
} from '@/types';

// Asset category labels
export const ASSET_CATEGORY_LABELS: Record<AssetCategory, string> = {
  mutual_funds: 'Mutual Funds',
  stocks_india: 'Stocks - India',
  stocks_other: 'Stocks - Other',
  epf: 'EPF',
  ppf: 'PPF',
  fixed_deposits: 'Fixed Deposits',
  digital_assets: 'Digital Assets',
  gold: 'Gold',
  real_estate: 'Real Estate',
  liquid_cash: 'Liquid Cash / Bank',
  forex: 'Forex',
  esops_rsus: 'ESOPs / RSUs',
  p2p_lending: 'P2P Lending',
  owed: 'Owed (Money Lent)',
  debt: 'Debt',
};

// Asset liquidity classification
// Liquid: can be converted to cash quickly (days to weeks)
// Illiquid: locked-in, hard to convert, or takes significant time
export type AssetLiquidity = 'liquid' | 'illiquid';

export const ASSET_LIQUIDITY: Record<AssetCategory, AssetLiquidity> = {
  mutual_funds: 'liquid',      // Can redeem in 1-3 days
  stocks_india: 'liquid',      // Can sell on exchange
  stocks_other: 'liquid',      // Can sell on exchange
  liquid_cash: 'liquid',       // Already cash
  forex: 'liquid',             // Can convert
  digital_assets: 'liquid',    // Can sell on exchange
  fixed_deposits: 'liquid',    // Can break (with penalty)
  gold: 'liquid',              // Can sell or pledge
  real_estate: 'illiquid',     // Takes months to sell
  esops_rsus: 'illiquid',      // Vesting periods, lock-in
  epf: 'illiquid',             // Locked until retirement
  ppf: 'illiquid',             // 15-year lock-in
  p2p_lending: 'illiquid',     // Locked in loan terms
  owed: 'illiquid',            // Depends on when paid back
  debt: 'illiquid',            // Liability (not really applicable)
};

// Default critical status for expense categories (for emergency runway calculation)
// Critical = essential expenses that must be paid even during financial hardship
export const EXPENSE_CATEGORY_CRITICAL: Record<ExpenseCategory, boolean> = {
  food_dining: false,           // Discretionary - can cut back
  groceries: true,              // Essential - need to eat
  transport_travel: true,       // Essential - need to commute
  utilities_rent: true,         // Essential - keep a roof
  subscriptions: false,         // Discretionary - can cancel
  fitness_health: true,         // Essential - health is priority
  family_house_supplies: true,  // Essential - household necessities
  personal: false,              // Discretionary - can defer
  gifts: false,                 // Discretionary - can skip
  leisure: false,               // Discretionary - entertainment
  other: false,                 // Default to non-critical
};

// Expense category labels
export const EXPENSE_CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  food_dining: 'Food & Dining',
  groceries: 'Groceries',
  transport_travel: 'Transport / Travel',
  utilities_rent: 'Utilities & Rent',
  subscriptions: 'Subscriptions',
  fitness_health: 'Fitness and Health',
  family_house_supplies: 'Family & House Supplies',
  personal: 'Personal',
  gifts: 'Gifts',
  leisure: 'Leisure',
  other: 'Other',
};

// Expense category colors for visual distinction
export const EXPENSE_CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  food_dining: '#f97316',           // orange
  groceries: '#22c55e',             // green
  transport_travel: '#3b82f6',      // blue
  utilities_rent: '#8b5cf6',        // purple
  subscriptions: '#ec4899',         // pink
  fitness_health: '#14b8a6',        // teal
  family_house_supplies: '#f59e0b', // amber
  personal: '#6366f1',              // indigo
  gifts: '#ef4444',                 // red
  leisure: '#06b6d4',               // cyan
  other: '#64748b',                 // slate
};

// Liability category labels
export const LIABILITY_CATEGORY_LABELS: Record<LiabilityCategory, string> = {
  home_loan: 'Home Loan',
  car_loan: 'Car Loan',
  personal_loan: 'Personal Loan',
  credit_card: 'Credit Card',
  informal_loan: 'Informal Loan',
};

// Payment method labels
export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  credit_card: 'Credit Card',
  debit_card: 'Debit Card',
  upi: 'UPI',
  transfer: 'Transfer',
  cash: 'Cash',
  digital_wallet: 'Digital Wallet',
};

// Reimbursement status labels
export const REIMBURSEMENT_STATUS_LABELS: Record<ReimbursementStatus, string> = {
  none: 'None',
  pending: 'Pending',
  reimbursed: 'Reimbursed',
};

// Income source labels
export const INCOME_SOURCE_LABELS: Record<IncomeSource, string> = {
  salary: 'Salary',
  bonus: 'Bonus',
  dividend: 'Dividend',
  interest: 'Interest',
  other: 'Other',
};

// Goal type labels
export const GOAL_TYPE_LABELS: Record<GoalType, string> = {
  net_worth: 'Net Worth Target',
  savings: 'Savings Goal',
  purchase: 'Purchase Goal',
};

// Time range options for charts with auto-granularity
// 1M, 3M, 6M -> monthly | 1Y, 2Y -> quarterly | 3Y, 5Y, ALL -> yearly
export const TIME_RANGES = [
  { value: '1M', label: '1M', granularity: 'monthly' },
  { value: '3M', label: '3M', granularity: 'monthly' },
  { value: '6M', label: '6M', granularity: 'monthly' },
  { value: '1Y', label: '1Y', granularity: 'quarterly' },
  { value: '2Y', label: '2Y', granularity: 'quarterly' },
  { value: '3Y', label: '3Y', granularity: 'yearly' },
  { value: '5Y', label: '5Y', granularity: 'yearly' },
  { value: 'ALL', label: 'All', granularity: 'yearly' },
] as const;

export type TimeRangeValue = (typeof TIME_RANGES)[number]['value'];
export type TimeRangeGranularity = (typeof TIME_RANGES)[number]['granularity'];

// Person filter options
export const PERSON_FILTERS = [
  { value: 'self', label: 'Self' },
  { value: 'spouse', label: 'Spouse' },
  { value: 'all', label: 'Aggregate' },
] as const;

export type PersonFilter = (typeof PERSON_FILTERS)[number]['value'];

// Navigation items
export const NAV_ITEMS = [
  { path: '/', label: 'Home', icon: 'LayoutDashboard' },
  { path: '/wealth', label: 'Wealth', icon: 'Wallet' },
  { path: '/expenses', label: 'Expenses', icon: 'Receipt' },
  { path: '/goals', label: 'Goals', icon: 'Target' },
] as const;

// Chart colors for categories
export const CHART_COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
  '#8884d8',
  '#82ca9d',
  '#ffc658',
  '#ff7300',
  '#00C49F',
  '#FFBB28',
  '#FF8042',
];

// Preset colors for expense tags (10 distinct colors)
export const TAG_COLORS = [
  { value: '#3b82f6', label: 'Blue' },
  { value: '#22c55e', label: 'Green' },
  { value: '#f59e0b', label: 'Amber' },
  { value: '#ef4444', label: 'Red' },
  { value: '#8b5cf6', label: 'Purple' },
  { value: '#ec4899', label: 'Pink' },
  { value: '#06b6d4', label: 'Cyan' },
  { value: '#f97316', label: 'Orange' },
  { value: '#14b8a6', label: 'Teal' },
  { value: '#64748b', label: 'Slate' },
] as const;

export type TagColor = (typeof TAG_COLORS)[number]['value'];
