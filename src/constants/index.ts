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

// Time range options for charts
export const TIME_RANGES = [
  { value: '3M', label: '3M' },
  { value: '6M', label: '6M' },
  { value: '1Y', label: '1Y' },
  { value: '2Y', label: '2Y' },
  { value: '5Y', label: '5Y' },
  { value: 'ALL', label: 'All' },
] as const;

export type TimeRange = (typeof TIME_RANGES)[number]['value'];

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
